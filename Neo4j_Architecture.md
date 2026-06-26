# Neo4j Architecture - Knowledge Graph Engine

CognitRAG uses **Neo4j** as its powerful graph database to map the logical relationships between concepts, people, and objects. While Supabase handles the "what" (semantic meaning), Neo4j handles the "how" (logical structure).

## 1. Graph Extraction Pipeline (Ingestion)

When a document (e.g., Notion page or PDF) is chunked, the text is passed through the `extract_graph_from_chunk()` function before it is stored.

1. **LLM Entity Recognition**: The text chunk is fed to an LLM (typically Gemini or Groq) with a strict JSON schema prompt. 
2. **Relationship Mapping**: The LLM acts as an NLP processor, extracting distinct "Entities" (e.g., "John", "Engineering Team", "Project X") and identifying the specific relationships between them (e.g., "MANAGES", "BELONGS_TO").
3. **Graph Storage**: The extracted nodes and edges are instantly merged into Neo4j using the `neo4j_manager`.
   - **Nodes** are stored with the label `(:Entity)` and properties for `name` and `type`.
   - **Edges** are stored with the label `[:RELATION]` and properties for `type`.
   - **Crucially**, every single node and edge is tagged with a `tenantId`. This guarantees complete multi-tenant isolation, ensuring users never query graphs that belong to other workspaces.

## 2. Multi-Hop Graph Search (Retrieval)

When a user asks a question, the retrieval pipeline performs a **Graph Search** in parallel with the vector search. This is where Neo4j shines, easily capable of multi-hop queries that would be impossible for a standard SQL or Vector DB.

1. **Entity Triggering**: 
   - The user's prompt is parsed for specific keywords (length > 2) or explicit entities (extracted by the Query Planning node).
2. **Cypher Query Execution**: 
   - The backend runs dynamic Cypher queries against Neo4j to find any relationships tied to those entities.
   ```cypher
   MATCH (e1:Entity)-[r:RELATION]->(e2:Entity)
   WHERE e1.tenantId = $tenant_id
   AND ANY(word IN $words WHERE toLower(e1.name) CONTAINS word OR toLower(e2.name) CONTAINS word)
   RETURN e1.name + ' has the following relationship: ' + r.type + ' with ' + e2.name AS content
   ```
3. **Logical Reconstruction**:
   - The raw graph relationships are formatted into plaintext statements (e.g., *"Nitesh has the following relationship: CREATED with CognitRAG"*).
   - This provides the final Answer LLM with hard, structural logic to complement the fuzzy semantic vectors.

## 3. Episodic & User Memory

Beyond document data, Neo4j is actively used to track the *user's personal interactions* over time.
- If a user asks a lot of questions about "AWS", the agent logs a relationship: `(User {id: $u_id})-[r]->(e:Entity {name: 'AWS'})`.
- During the graph search, Neo4j executes a second query to pull this specific history:
  ```cypher
  MATCH (u:User {id: $u_id, tenantId: $tenant_id})-[r]->(e:Entity)
  WHERE ANY(word IN $words WHERE toLower(e.name) CONTAINS word)
  RETURN 'User has previously interacted with the topic: ' + e.name AS content
  ```
- This allows the AI to provide highly personalized answers based on past conversations, utilizing the graph to quickly bridge the gap between "what the user asked" and "what the user cares about."
