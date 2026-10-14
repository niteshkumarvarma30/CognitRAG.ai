// CognitRAG v2 — Neo4j Schema
// Confidence-Tiered Graph Edges (§3.3 of spec)

// ============================================================
// CONSTRAINTS
// ============================================================

// Tenant uniqueness
CREATE CONSTRAINT tenant_id_unique IF NOT EXISTS FOR (t:Tenant) REQUIRE t.id IS UNIQUE;

// Document uniqueness
CREATE CONSTRAINT document_id_unique IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE;

// Chunk uniqueness (for claim-level citation)
CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE;

// ============================================================
// INDEXES
// ============================================================

CREATE INDEX entity_tenant_id_index IF NOT EXISTS FOR (e:Entity) ON (e.tenantId);
CREATE INDEX document_tenant_id_index IF NOT EXISTS FOR (d:Document) ON (d.tenantId);
CREATE INDEX chunk_tenant_id_index IF NOT EXISTS FOR (c:Chunk) ON (c.tenantId);

// Index for filtering edges by derivation tier
CREATE INDEX relation_derivation_index IF NOT EXISTS FOR ()-[r:RELATION]-() ON (r.derivation);

// Index for source chunk lookups (citation audit trail)
CREATE INDEX relation_source_chunk_index IF NOT EXISTS FOR ()-[r:RELATION]-() ON (r.source_chunk_id);

// ============================================================
// RELATIONSHIP SCHEMA
// Every relationship MUST carry these properties:
//
// derivation: "structured" | "extracted"
//   - "structured" = came from a native API relation
//     (GitHub PR→Issue, Jira ticket ref, Slack thread→channel)
//     confidence is always 1.0, no LLM involved
//   - "extracted" = LLM-inferred from unstructured text
//     confidence is 0.0-1.0 from extraction model score
//
// confidence: float 0.0-1.0
// source_chunk_id: UUID (links to document_chunks.id in Supabase)
// language_tag: "en" | "hi-latn" | "mixed"
//
// Example write:
// MERGE (s)-[r:RELATION {
//   type: $rel_type,
//   derivation: "extracted",
//   confidence: 0.82,
//   source_chunk_id: "uuid-of-chunk",
//   language_tag: "hi-latn"
// }]->(t)
// ============================================================
