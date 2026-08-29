import os
import sys
import uuid
from dotenv import load_dotenv

# Ensure we can import from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../frontend/app/.env.local'))

from src.ingestion.pipeline import run_ingestion_pipeline
from src.database.neo4j_client import neo4j_manager
from src.database.supabase_client import supabase_manager

def seed_database():
    # Supabase requires strictly valid UUIDs
    tenant_id = str(uuid.uuid4())
    
    print(f"Creating synthetic enterprise data for tenant: {tenant_id}...")

    # 1. Notion: Product Requirements Document
    notion_doc_id = str(uuid.uuid4())
    notion_content = [
        "Product Requirements Document (PRD): Q3 Stripe Billing Integration. "
        "The goal of this initiative is to migrate our primary payment gateway from Braintree to Stripe. "
        "Engineering needs to implement the new Stripe Elements UI on the frontend, and the backend "
        "FastAPI server must handle webhooks for 'subscription_created' and 'invoice.paid' events. "
        "The staging environment is deployed on AWS EC2, and production will be on AWS ECS. "
        "Target launch date is October 15th."
    ]

    # 2. Slack: The Incident
    slack_doc_id = str(uuid.uuid4())
    slack_content = [
        "Slack Channel: #engineering-alerts. "
        "Message from Sarah (Lead Engineer): 'Hey team, the Stripe integration is failing in the staging environment. "
        "The API is returning a 401 Unauthorized error when the frontend tries to create a checkout session. "
        "Can someone look into the environment variables? I think we might be using the wrong keys.'"
    ]

    # 3. Jira: The Ticket
    jira_doc_id = str(uuid.uuid4())
    jira_content = [
        "Jira Ticket: BILL-101. "
        "Title: Fix 401 Unauthorized error in Stripe Staging. "
        "Assignee: John Doe. Priority: High. Status: In Progress. "
        "Description: Following Sarah's report in Slack, the staging environment is currently throwing a 401 error. "
        "It appears the staging EC2 instance is accidentally using production Stripe keys (sk_live_) instead of "
        "the test keys (sk_test_). Needs immediate fix to unblock QA testing."
    ]

    # 4. GitHub: The Fix
    github_doc_id = str(uuid.uuid4())
    github_content = [
        "GitHub Pull Request: #45. "
        "Title: Fix: Updated Stripe staging API keys in AWS Secrets Manager (Resolves BILL-101). "
        "Author: John Doe. "
        "Description: This PR fixes the bug reported in BILL-101. I updated the `config.yml` file to pull the "
        "`sk_test_` keys from AWS Secrets Manager for the staging environment instead of the hardcoded `sk_live_` keys. "
        "Tested locally and verified the checkout session now successfully generates without the 401 error."
    ]

    # Insert document metadata so the pipeline doesn't abort thinking they were deleted

    admin_db = supabase_manager.get_admin_client()
    try:
        admin_db.table("tenants").insert({"id": tenant_id, "name": "Synthetic Test Company"}).execute()
    except Exception as e:
        print(f"Tenant insert warn: {e}")

    for doc_id, title in [

        (notion_doc_id, "Q3 Stripe Billing Integration PRD"),
        (slack_doc_id, "Slack: #engineering-alerts"),
        (jira_doc_id, "Jira: BILL-101"),
        (github_doc_id, "GitHub: PR #45")
    ]:
        try:
            admin_db.table("documents").insert({
                "id": doc_id,
                "tenant_id": tenant_id,
                
                "filename": f"{title}.txt",
                
                "status": "processing"
            }).execute()
        except Exception as e:
            print(f"Warn: {e}")

    # Run the ingestion pipeline for each platform's data
    print("\n--- Ingesting Notion PRD ---")
    run_ingestion_pipeline(tenant_id, notion_doc_id, notion_content)
    
    print("\n--- Ingesting Slack Message ---")
    run_ingestion_pipeline(tenant_id, slack_doc_id, slack_content)
    
    print("\n--- Ingesting Jira Ticket ---")
    run_ingestion_pipeline(tenant_id, jira_doc_id, jira_content)
    
    print("\n--- Ingesting GitHub PR ---")
    run_ingestion_pipeline(tenant_id, github_doc_id, github_content)
    
    print("\n[SUCCESS] Synthetic data successfully seeded into Supabase (Vectors) and Neo4j (Graph)!")

if __name__ == "__main__":
    seed_database()
