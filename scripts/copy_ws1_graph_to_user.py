from src.database.neo4j_client import neo4j_manager

src_tenant = "b8e008d0-a681-501e-af59-9af5d1b4cb71"
dst_tenant = "f721d779-671a-5f4e-876c-97ad3d818b64"

with neo4j_manager.driver.session() as session:
    # 1. Fetch all nodes for src_tenant
    print(f"Fetching nodes for {src_tenant}...")
    nodes_res = session.run(
        "MATCH (n {tenantId: $src}) RETURN elementId(n) as elem_id, labels(n) as labels, properties(n) as props",
        src=src_tenant
    ).data()
    print(f"Found {len(nodes_res)} nodes.")

    # 2. Check how many nodes dst_tenant currently has
    dst_count = session.run("MATCH (n {tenantId: $dst}) RETURN count(n) as cnt", dst=dst_tenant).single()["cnt"]
    print(f"Destination tenant currently has {dst_count} nodes.")

    # Map old elem_id -> new elem_id
    id_map = {}

    # Copy nodes if not already copied
    if dst_count == 0:
        for item in nodes_res:
            old_elem_id = item["elem_id"]
            labels = item["labels"]
            props = dict(item["props"])
            props["tenantId"] = dst_tenant
            
            # Primary label
            label_str = ":".join(labels) if labels else "Entity"
            cypher = f"CREATE (n:{label_str} $props) RETURN elementId(n) as new_id"
            new_id = session.run(cypher, props=props).single()["new_id"]
            id_map[old_elem_id] = new_id
        print(f"Created {len(id_map)} nodes for destination tenant.")

        # 3. Fetch relationships between src nodes
        rel_res = session.run("""
            MATCH (n {tenantId: $src})-[r]->(m {tenantId: $src})
            RETURN elementId(n) as src_id, type(r) as rel_type, properties(r) as rel_props, elementId(m) as dst_id
        """, src=src_tenant).data()
        print(f"Found {len(rel_res)} relationships in source.")

        created_rels = 0
        for r in rel_res:
            s_old = r["src_id"]
            d_old = r["dst_id"]
            rel_type = r["rel_type"]
            rel_props = dict(r["rel_props"])
            rel_props["tenantId"] = dst_tenant

            if s_old in id_map and d_old in id_map:
                s_new = id_map[s_old]
                d_new = id_map[d_old]
                cypher_rel = f"""
                    MATCH (a), (b)
                    WHERE elementId(a) = $s_new AND elementId(b) = $d_new
                    CREATE (a)-[r:{rel_type} $props]->(b)
                """
                session.run(cypher_rel, s_new=s_new, d_new=d_new, props=rel_props)
                created_rels += 1

        print(f"Created {created_rels} relationships for destination tenant.")

    final_dst_count = session.run("MATCH (n {tenantId: $dst}) RETURN count(n) as cnt", dst=dst_tenant).single()["cnt"]
    final_rel_count = session.run("MATCH (n {tenantId: $dst})-[r]->(m {tenantId: $dst}) RETURN count(r) as cnt", dst=dst_tenant).single()["cnt"]
    print(f"Final destination status: {final_dst_count} nodes, {final_rel_count} relationships.")
