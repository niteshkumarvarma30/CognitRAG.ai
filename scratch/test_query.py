import os
from src.database.neo4j_client import neo4j_manager

doc_id = '6b43e130-c9a7-448c-ba1a-6d9d08f5198e'
tenant_id = 'f721d779-671a-5f4e-876c-97ad3d818b64'

try:
    with neo4j_manager.driver.session() as session:
        res = session.run("""
            MATCH (d:Document {id: $doc_id, tenantId: $tenant_id})
            OPTIONAL MATCH (e:Entity)-[:FOUND_IN]->(d)
            DETACH DELETE d
            WITH e
            WHERE e IS NOT NULL AND NOT (e)-[:FOUND_IN]->()
            DETACH DELETE e
        """, doc_id=doc_id, tenant_id=tenant_id)
        print("Success!")
except Exception as e:
    print(f"Error: {e}")
