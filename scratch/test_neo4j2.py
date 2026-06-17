from src.database.neo4j_client import neo4j_manager
session = neo4j_manager.get_session()
try:
    res = session.run("MATCH (n:Entity) WHERE n.tenantId='user_3FGB3zjJhpqdecshUi0ZFu1DUp1' RETURN n.name LIMIT 10")
    print("Entities:", [r[0] for r in res])
finally:
    session.close()
