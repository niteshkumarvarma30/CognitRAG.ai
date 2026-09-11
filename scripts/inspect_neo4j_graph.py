from src.database.neo4j_client import neo4j_manager

with neo4j_manager.driver.session() as session:
    for tid in ['b8e008d0-a681-501e-af59-9af5d1b4cb71', '4aedf36c-6bcb-490a-98cc-6293366dd891']:
        print(f"=== Tenant: {tid} ===")
        cypher = "MATCH (n {tenantId: '" + tid + "'})-[r]->(m) RETURN type(r) as rel, count(*) as cnt"
        res = session.run(cypher)
        for r in res:
            print(f"  {r['rel']}: {r['cnt']}")

        # Sample entities and facts
        sample_nodes = session.run("MATCH (n {tenantId: '" + tid + "'}) RETURN labels(n) as l, n.name as name, n.type as type LIMIT 5")
        for sn in sample_nodes:
            print(f"  Node: {sn['l']} | name: {sn['name']} | type: {sn['type']}")
