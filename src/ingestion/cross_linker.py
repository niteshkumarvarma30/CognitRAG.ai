import re
from typing import Dict, List, Any
from src.database.neo4j_client import neo4j_manager

# Regular expression patterns for cross-system entity detection
JIRA_PATTERN = re.compile(r'\b([A-Z]{2,10}-\d+)\b')
PR_PATTERN = re.compile(r'(?:PR\s*#?|pull/\s*|#)(\d{1,6})\b', re.IGNORECASE)
SLACK_CHANNEL_PATTERN = re.compile(r'#([a-zA-Z0-9_\-]{2,50})\b')
INCIDENT_PATTERN = re.compile(r'\b(INC-\d+)\b', re.IGNORECASE)

def extract_cross_system_references(text: str) -> Dict[str, List[str]]:
    """
    Extracts cross-system references from raw text:
    - Jira issue keys (e.g. BILL-902, ENG-404)
    - GitHub PR numbers (e.g. #1287, PR #1287)
    - Slack channels (e.g. #engineering, #incident-bridge)
    - Incident identifiers (e.g. INC-902)
    """
    if not text:
        return {"jira": [], "prs": [], "slack_channels": [], "incidents": []}
        
    jira_keys = list(set(JIRA_PATTERN.findall(text)))
    prs = list(set(PR_PATTERN.findall(text)))
    slack_channels = list(set(SLACK_CHANNEL_PATTERN.findall(text)))
    incidents = list(set(INCIDENT_PATTERN.findall(text)))
    
    return {
        "jira": jira_keys,
        "prs": prs,
        "slack_channels": slack_channels,
        "incidents": incidents
    }

def link_cross_system_entities(text: str, tenant_id: str, document_id: str = None) -> Dict[str, Any]:
    """
    Scans text for cross-system references and deterministically links them in the Neo4j Knowledge Graph.
    For example: PR #1287 referencing BILL-902 in #engineering creates:
    (:PullRequest {number: 1287})-[:RESOLVES]->(:JiraIssue {key: 'BILL-902'})
    (:SlackChannel {name: 'engineering'})-[:DISCUSSES]->(:JiraIssue {key: 'BILL-902'})
    """
    refs = extract_cross_system_references(text)
    jira_keys = refs["jira"]
    prs = refs["prs"]
    channels = refs["slack_channels"]
    incidents = refs["incidents"]
    
    links_created = 0
    
    if not (jira_keys or prs or channels or incidents):
        return {"links_created": 0, "references": refs}
        
    try:
        with neo4j_manager.driver.session() as session:
            # 1. Link PRs to Jira Issues (e.g. PR #1287 -> BILL-902)
            for pr in prs:
                for jira in jira_keys:
                    session.run("""
                        MERGE (p:PullRequest {number: $pr_num, tenantId: $tenant_id})
                        MERGE (j:JiraIssue {key: $jira_key, tenantId: $tenant_id})
                        MERGE (p)-[r:RESOLVES]->(j)
                        RETURN count(r)
                    """, pr_num=pr, jira_key=jira, tenant_id=tenant_id)
                    links_created += 1

            # 2. Link Slack Channels to Jira Issues (e.g. #engineering -> BILL-902)
            for ch in channels:
                for jira in jira_keys:
                    session.run("""
                        MERGE (s:SlackChannel {name: $channel_name, tenantId: $tenant_id})
                        MERGE (j:JiraIssue {key: $jira_key, tenantId: $tenant_id})
                        MERGE (s)-[r:DISCUSSES]->(j)
                        RETURN count(r)
                    """, channel_name=ch, jira_key=jira, tenant_id=tenant_id)
                    links_created += 1

            # 3. Link Incidents to Jira / PRs (e.g. INC-902 -> BILL-902)
            for inc in incidents:
                for jira in jira_keys:
                    session.run("""
                        MERGE (i:Incident {id: $incident_id, tenantId: $tenant_id})
                        MERGE (j:JiraIssue {key: $jira_key, tenantId: $tenant_id})
                        MERGE (i)-[r:TRACKED_BY]->(j)
                        RETURN count(r)
                    """, incident_id=inc.upper(), jira_key=jira, tenant_id=tenant_id)
                    links_created += 1

                for pr in prs:
                    session.run("""
                        MERGE (i:Incident {id: $incident_id, tenantId: $tenant_id})
                        MERGE (p:PullRequest {number: $pr_num, tenantId: $tenant_id})
                        MERGE (p)-[r:FIXES]->(i)
                        RETURN count(r)
                    """, incident_id=inc.upper(), pr_num=pr, tenant_id=tenant_id)
                    links_created += 1

    except Exception as e:
        print(f"Warning: Cross-system entity linking encountered non-fatal error: {e}")

    return {"links_created": links_created, "references": refs}
