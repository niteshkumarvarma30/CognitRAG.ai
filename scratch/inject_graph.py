from src.database.neo4j_client import neo4j_manager

session = neo4j_manager.get_session()
tenant_id = 'f721d779-671a-5f4e-876c-97ad3d818b64'
try:
    # First ensure the Tenant node exists
    session.run("MERGE (t:Tenant {id: $tenant_id})", tenant_id=tenant_id)
    
    # Merge Entity 1
    session.run("""
        MERGE (e:Entity {name: $name, tenantId: $tenant_id})
        ON CREATE SET e.type = $type
        WITH e
        MATCH (t:Tenant {id: $tenant_id})
        MERGE (e)-[:BELONGS_TO]->(t)
    """, name="Customized Options", type="Concept", tenant_id=tenant_id)

    # Merge Entity 2
    session.run("""
        MERGE (e:Entity {name: $name, tenantId: $tenant_id})
        ON CREATE SET e.type = $type
        WITH e
        MATCH (t:Tenant {id: $tenant_id})
        MERGE (e)-[:BELONGS_TO]->(t)
    """, name="custom_variable_classes", type="Configuration Variable", tenant_id=tenant_id)

    # Merge Relationship
    session.run("""
        MATCH (s:Entity {name: $source, tenantId: $tenant_id})
        MATCH (t:Entity {name: $target, tenantId: $tenant_id})
        MERGE (s)-[r:RELATION {type: $rel_type}]->(t)
    """, source="Customized Options", target="custom_variable_classes", rel_type="HAS_VARIABLE", tenant_id=tenant_id)

    print("Successfully injected Graph relationship for Customized Options!")
finally:
    session.close()
