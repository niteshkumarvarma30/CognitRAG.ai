from src.database.neo4j_client import neo4j_manager
session = neo4j_manager.get_session()
try:
    res = session.run("MATCH (n:Entity) WHERE n.tenantId='11111111-1111-1111-1111-111111111111' AND toLower(n.name) CONTAINS 'custom' RETURN n.name LIMIT 10")
    print("Entities:", [r[0] for r in res])
    res = session.run("MATCH (n:Entity) WHERE n.tenantId='11111111-1111-1111-1111-111111111111' AND toLower(n.name) CONTAINS 'option' RETURN n.name LIMIT 10")
    print("Options:", [r[0] for r in res])
finally:
    session.close()
