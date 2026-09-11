import uuid
from src.database.supabase_client import supabase_manager
from src.database.neo4j_client import neo4j_manager

ws1_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, 'ws_1'))
clerk_user_id = 'user_3FGB3zjJhpqdecshUi0ZFu1DUp1'
user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, clerk_user_id))

print(f"Source ws_1 UUID: {ws1_uuid}")
print(f"Target User UUID: {user_uuid}")

# Check Neo4j
try:
    with neo4j_manager.driver.session() as session:
        cypher = "MATCH (n) WHERE n.tenant_id = $tenant RETURN count(n) as cnt"
        res_ws1 = session.run(cypher, tenant=ws1_uuid).single()
        res_user = session.run(cypher, tenant=user_uuid).single()
        print(f"Neo4j nodes for ws_1: {res_ws1['cnt']}")
        print(f"Neo4j nodes for user: {res_user['cnt']}")
except Exception as e:
    print(f"Neo4j check error: {e}")
