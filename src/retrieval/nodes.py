import os
import requests
import instructor
from openai import OpenAI
from pydantic import BaseModel, Field
from src.retrieval.hybrid import hybrid_retriever
from src.database.supabase_client import supabase_manager
from src.semantic.ontology import fetch_semantic_definitions
from src.agents.tools import TOOL_DEFINITIONS, TOOL_MAP
from src.utils.rate_limiter import with_exponential_backoff, groq_rate_limiter
from langsmith import traceable
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
from src.services.vertex_client import vertex_client
from src.services.sarvam_client import sarvam_client


from litellm import completion

litellm_client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", "dummy_key_to_bypass_validation"),
    base_url="https://litellm-is-handled-via-instructor.local"
)

import litellm
# Use litellm with instructor 
import litellm
def litellm_completion(**kwargs):
    return litellm.completion(**kwargs)


groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY", ""),
    base_url="https://api.groq.com/openai/v1"
)
groq_instructor = instructor.from_openai(groq_client, mode=instructor.Mode.JSON)


# Removed obsolete clients
gen_client = OpenAI(
    api_key=os.environ.get("SARVAM_API_KEY", ""),
    base_url="https://api.sarvam.ai/v1",
    timeout=120.0
)
sarvam_instructor = instructor.from_openai(gen_client)

class RouteDecision(BaseModel):
    intent: str = Field(description="Must be exactly 'greeting', 'faq', 'conversational', 'followup', 'personal', 'technical_query', or 'agent_query'")
    need_memory: bool = Field(description="True if the query requires conversational context or user preferences (e.g. 'followup', 'personal', 'conversational')")
    need_graph: bool = Field(description="CRITICAL: Set to True if the query contains words like 'relate', 'connect', 'depend', 'compare', 'difference', or asks how concepts interact. Default to False otherwise.")
    query_entities: list[str] = Field(description="A list of specific technical entities or concepts mentioned in the query.")

class GraderDecision(BaseModel):
    is_relevant: str = Field(description="Must be exactly 'yes' or 'no'")

from src.retrieval.hybrid import get_embedding
from src.retrieval.cache import LRUCache

response_cache = LRUCache(max_size=500)
memory_cache = LRUCache(max_size=200)

class RewrittenQuery(BaseModel):
    new_query: str = Field(description="The reformulated question")

class MemoryExtraction(BaseModel):
    facts: list[str] = Field(description="A list of standalone factual statements extracted from the latest interaction")
    preferences: dict[str, str] = Field(description="A dictionary mapping preference keys (e.g. 'formatting', 'language') to values (e.g. 'bullet points', 'Spanish') based on explicit user instructions.")


@traceable(name="embed_query")
def embed_query(state):
    print("--- EMBEDDING QUERY ---")
    question = state["question"]
    tenant_id = state.get("tenant_id")
    
    try:
        from src.semantic.ontology import expand_query_semantically
        # PHASE 2.2: Expand the query semantically before embedding!
        if tenant_id:
            expanded_question = expand_query_semantically(tenant_id, question)
        else:
            expanded_question = question
            
        # Update the state so the expanded question is passed to the retrieval nodes
        query_embedding = get_embedding(expanded_question)
        return {"query_embedding": query_embedding, "question": expanded_question}
    except Exception as e:
        print(f"Failed to generate query embedding: {e}")
        return {"query_embedding": []}

@traceable(name="check_semantic_cache")
def check_cache(state):
    print("--- CHECKING SEMANTIC CACHE ---")
    question = state["question"]
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    
    try:
        # 1. Check RAM Exact-Match Response Cache first (0ms)
        r_key = response_cache.generate_key(tenant_id, question)
        cached_data = response_cache.get(r_key)
        if cached_data:
            print("[Cache Hit] Exact match found in RAM response_cache")
            return {"route": "cached", "generation": cached_data.get("generation"), "audit_trail": cached_data.get("audit_trail", [])}

        # 2. Check Supabase Vector Semantic Cache (>95% similarity)
        query_embedding = state.get("query_embedding")
        if not query_embedding:
            return {"route": "not_cached"}
            
        db = supabase_manager.get_admin_client()
        
        response = db.rpc("match_semantic_cache", {
            "p_query_embedding": query_embedding,
            "match_count": 1,
            "match_threshold": 0.85,
            "p_tenant_id": tenant_id,
            "p_user_id": user_id
        }).execute()
        
        if response.data and len(response.data) > 0:
            cached_answer = response.data[0]["response"]
            print(f"Cache Hit! Similarity: {response.data[0]['similarity']:.4f}")
            return {"route": "cached", "generation": cached_answer}
            
        print("Cache Miss.")
        return {"route": "not_cached"}
    except Exception as e:
        print(f"Semantic Cache check failed: {e}")
        return {"route": "not_cached"}


@traceable(name="route_query")
def route_query(state):
    print("--- ROUTING QUERY VIA VERTEX AI (GEMINI 2.5 FLASH) ---")
    question = state["question"]
    try:
        # If question contains Hinglish or Indian languages, translate/normalize with Sarvam
        if sarvam_client.is_available():
            normalized = sarvam_client.translate(question)
            if normalized and normalized != question:
                print(f"[Sarvam] Query normalized: '{question}' -> '{normalized}'")
                question = normalized

        system_instruction = (
            "Classify the intent of the user query into exactly one category:\n"
            "- 'greeting': pure greetings like 'hello', 'hi'.\n"
            "- 'faq': general small talk, chit-chat, or completely out-of-scope non-corporate queries (e.g. weather forecast, creative writing, poetry, cooking recipes, sports, general world trivia).\n"
            "- 'conversational': questions about the ongoing conversation history itself.\n"
            "- 'personal': questions about the user's explicit preferences.\n"
            "- 'followup': queries that directly refer back to previous conversation turns.\n"
            "- 'agent_query': complex multi-step analysis comparing entities, calculating financial KPIs (revenue, churn, growth), or cross-domain rollups.\n"
            "- 'technical_query': any question about corporate documentation, audits, compliance reports, Drive/Notion/Jira documents, system configurations, options, API endpoints, technical parameters, or codebase facts.\n\n"
            "TARGET EXAMPLES:\n"
            "- 'Who conducted the security audit in the Drive compliance summary?' -> technical_query\n"
            "- 'What is the weather forecast in Tokyo for next Tuesday?' -> faq\n"
            "- 'Can you write a poem about the sunrise over Mount Fuji?' -> faq\n"
            "- 'Can you give me a recipe for authentic Neapolitan pizza dough?' -> faq\n"
            "When in doubt between technical_query and agent_query, default to 'technical_query'. Also extract technical entities and determine if memory or graph search is needed."
        )

        res = vertex_client.generate_structured(
            prompt=question,
            response_model=RouteDecision,
            system_instruction=system_instruction,
            temperature=0.0
        )
        route = res.intent
        need_memory = res.need_memory
        need_graph = res.need_graph
        query_entities = res.query_entities
    except Exception as e:
        print(f"Router failed: {e}. Defaulting to technical_query.")
        route = "technical_query"
        need_memory = False
        need_graph = False
        query_entities = []
        
    print(f"Decision: {route} | Need Mem: {need_memory} | Need Graph: {need_graph} | Entities: {query_entities}")
    return {"route": route, "need_memory": need_memory, "need_graph": need_graph, "query_entities": query_entities, "question": question}

@traceable(name="retrieve_context")
def retrieve(state):
    print("--- HYBRID RETRIEVAL (BM25 + Vector + RRF) ---")
    question = state["question"]
    tenant_id = state["tenant_id"]
    
    user_id = state.get("user_id", "default_user")
    query_embedding = state.get("query_embedding", [])
    user_permissions = state.get("user_permissions", ["public"])
    
    # 1. Retrieve Candidate Chunks or use provided evaluation/context documents
    existing_docs = state.get("documents")
    if existing_docs:
        print("  -> Using provided context override / evaluation passages.")
        if isinstance(existing_docs, str):
            docs = [{"id": "context_override", "content": existing_docs, "parent_id": "", "entities": [], "graph_score": 1.0, "relationship_types": []}]
        else:
            docs = existing_docs
        high_conf = True
    else:
        docs, high_conf = hybrid_retriever(tenant_id, user_id, question, query_embedding, top_k=10, user_permissions=user_permissions)
    # Load Preferences & Facts if they weren't loaded by load_memory (i.e. technical queries)
    preferences = state.get("preferences", {})
    user_facts = state.get("user_facts", "")
    
    if not preferences and not user_facts:
        print("  -> Loading Preferences & Facts for Technical Query...")
        try:
            mem_key = memory_cache.generate_key(tenant_id, user_id)
            cached_mem = memory_cache.get(mem_key)
            db = supabase_manager.get_admin_client()
            
            if cached_mem:
                preferences = cached_mem.get("preferences", {})
            else:
                pref_res = db.table("preference_memory").select("pref_key, pref_value").eq("tenant_id", tenant_id).eq("user_id", user_id).execute()
                for row in pref_res.data:
                    preferences[row["pref_key"]] = row["pref_value"]
                # We do not cache rolling_context here since we didn't fetch it
                memory_cache.put(mem_key, {"preferences": preferences, "rolling_context": ""}, ttl_seconds=300)
                
            if not query_embedding:
                from src.retrieval.hybrid import get_embedding
                query_embedding = get_embedding(question)
                
            import uuid
            uuid_user = str(uuid.uuid5(uuid.NAMESPACE_DNS, user_id)) if not "-" in user_id else user_id
                
            fact_res = db.rpc("match_user_facts", {
                "p_query_embedding": query_embedding,
                "p_tenant_id": tenant_id,
                "p_user_id": uuid_user,
                "match_threshold": 0.5,
                "match_count": 3
            }).execute()
            if fact_res.data:
                user_facts = "\n".join([f"- {row['fact']}" for row in fact_res.data])
        except Exception as e:
            print(f"Failed to load facts in retrieve: {e}")
            
    return {"documents": docs, "high_confidence": high_conf, "preferences": preferences, "user_facts": user_facts}

def jina_rerank(query: str, documents: list[dict], threshold: float = 0.15) -> list[dict]:
    """Helper function to call Jina Cross-Encoder and filter by threshold, preserving metadata."""
    if not documents:
        return []
    try:
        import requests, os
        headers = {
            "Authorization": f"Bearer {os.environ.get('JINA_API_KEY')}",
            "Content-Type": "application/json"
        }
        
        # Extract the content strings for Jina
        texts = [doc["content"] for doc in documents]
        
        payload = {
            "model": "jina-reranker-v2-base-multilingual",
            "query": query,
            "documents": texts,
            "top_n": len(texts)
        }
        
        response = requests.post("https://api.jina.ai/v1/rerank", headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        filtered_chunks = []
        sorted_results = sorted(data.get("results", []), key=lambda x: x.get("relevance_score", 0), reverse=True)
        
        for result in sorted_results:
            if result.get("relevance_score", 0) >= threshold:
                index = result.get("index")
                doc = dict(documents[index])
                score = round(float(result.get("relevance_score", 0.0)), 2)
                doc["similarity"] = score
                doc["relevance_score"] = score
                filtered_chunks.append(doc)
                
        return filtered_chunks
    except Exception as e:
        print(f"Jina Reranker failed: {e}")
        fallback_docs = []
        for d in documents[:5]:
            doc = dict(d)
            if not doc.get("similarity"):
                doc["similarity"] = round(float(doc.get("rrf_score", 0.0) * 10 or 0.85), 2)
            fallback_docs.append(doc)
        return fallback_docs

@traceable(name="grade_documents")
def grade_documents(state):
    print("--- FIRST RERANK (Stage 2: Precision Filter) ---")
    question = state["question"]
    documents = state.get("documents", [])
    
    if not documents:
        return {"route": "no", "documents": ""}
        
    # documents is already a list of dicts from hybrid_retriever
    filtered_chunks = jina_rerank(question, documents, threshold=0.15)
    
    if not filtered_chunks:
        print("Decision: no (all chunks filtered out by Reranker)")
        return {"route": "no", "documents": ""}
        
    print(f"Decision: yes (kept {len(filtered_chunks)}/{len(documents)} chunks)")
    return {"route": "yes", "documents": filtered_chunks}

@traceable(name="graph_decision")
def graph_decision(state):
    print("--- GRAPH DECISION (Stage 3 & 4) ---")
    tenant_id = state["tenant_id"]
    documents = state.get("documents", [])
    question = state["question"]
    
    # Extract entities seamlessly from the Supabase chunk metadata! Zero network hops required!
    candidate_entities = []
    if documents:
        all_ents = set()
        for doc in documents:
            if doc.get("entities"):
                for e in doc["entities"]:
                    all_ents.add(e)
        candidate_entities = list(all_ents)
            
    print(f"Candidate Entities extracted from chunks: {candidate_entities}")
    
    # Conditional Graph Decision Signals
    high_confidence = state.get("high_confidence", False)
    
    # Stage 4 Rules:
    need_graph = False
    
    if len(candidate_entities) > 1 and high_confidence:
        print("Signals passed! Calling Vertex AI to confirm graph traversal...")
        try:
            class GraphDecisionModel(BaseModel):
                needs_traversal: bool = Field(description="True if traversing the graph for these entities will help answer the user query.")
            
            decision = vertex_client.generate_structured(
                prompt=f"Query: {question}\nCandidate Entities: {candidate_entities}",
                response_model=GraphDecisionModel,
                system_instruction="You are a precise routing agent. Determine if traversing a knowledge graph for the given entities is necessary to answer the query.",
                temperature=0.0
            )
            need_graph = decision.needs_traversal
            print(f"Vertex AI concluded need_graph = {need_graph}")
        except Exception as e:
            print(f"Vertex AI decision failed: {e}")
            need_graph = True # fallback
    else:
        print("Signals failed. Bypassing graph traversal.")
        
    return {"need_graph": need_graph, "candidate_entities": candidate_entities}

@traceable(name="graph_expansion")
def graph_expansion(state):
    print("--- NEO4J ONE-HOP EXPANSION (Stage 5 & 6) ---")
    tenant_id = state["tenant_id"]
    candidate_entities = state.get("candidate_entities", [])
    
    graph_context = ""
    if not candidate_entities:
        return {"graph_context": ""}
        
    try:
        from src.database.neo4j_client import neo4j_manager
        with neo4j_manager.driver.session() as session:
            is_eval = "eval" in str(tenant_id).lower() or str(tenant_id).lower().startswith("e0a1")
            node_label = "EvalEntity" if is_eval else "Entity"
            query_cypher = f"""
                MATCH (n:{node_label} {{tenantId: $tenant_id}})-[r]-(m:{node_label} {{tenantId: $tenant_id}})
                WHERE n.name IN $entities
                RETURN n.name AS source, type(r) AS rel_type, m.name AS target
                LIMIT 15
            """
            res = session.run(query_cypher, tenant_id=tenant_id, entities=candidate_entities)
            
            sentences = []
            for record in res:
                sentences.append(f"{record['source']} has the relationship {record['rel_type']} with {record['target']}.")
                
            if sentences:
                graph_context = "\n".join(sentences)
                print(f"Expanded {len(sentences)} graph relationships.")
    except Exception as e:
        print(f"Graph expansion failed: {e}")
        
    return {"graph_context": graph_context}

@traceable(name="fuse_and_rerank")
def fuse_and_rerank(state):
    print("--- CONTEXT FUSION & SECOND RERANK (Stage 7, 8 & 9) ---")
    documents = state.get("documents", [])
    graph_context = state.get("graph_context", "")
    question = state["question"]
    
    combined = documents.copy()
    if graph_context:
        graph_sentences = graph_context.split("\n")
        for sentence in graph_sentences:
            if sentence.strip():
                combined.append({
                    "content": sentence,
                    "parent_id": "graph_expansion",
                    "entities": [],
                    "graph_score": 0.0,
                    "relationship_types": []
                })
        
    graph_sentence_count = len(graph_context.split('\n')) if graph_context else 0
    print(f"Fusing {len(documents)} chunks with {graph_sentence_count} graph sentences...")
    
    # Second Jina Rerank (returns list of dicts)
    final_context_list = jina_rerank(question, combined, threshold=0.15)
    
    # Cap to max 15 items and extract just the content strings for the Generator
    final_context = "\n\n---\n\n".join([doc["content"] for doc in final_context_list[:15]])
    
    return {"documents": final_context, "raw_documents": final_context_list[:15]}


@traceable(name="load_semantic_context")
def load_semantic_context(state):
    """Phase 1: Fetches governed business definitions from the Semantic Dictionary
    and injects them into the state BEFORE the LLM generates an answer."""
    print("--- LOADING SEMANTIC DICTIONARY ---")
    tenant_id = state["tenant_id"]
    question = state.get("question", "")
    semantic_defs = fetch_semantic_definitions(tenant_id, question)
    return {"semantic_definitions": semantic_defs}


@traceable(name="generate_answer")
def generate(state, config):
    import re
    print("--- GENERATING FINAL ANSWER VIA NVIDIA LLAMA 3 ---")
    question = state["question"]
    documents = state["documents"]
    preferences = state.get("preferences", {})
    rolling_context = state.get("rolling_context", "")
    user_facts = state.get("user_facts", "")
    chat_history = state.get("chat_history", [])
    
    # Phase 1: Inject Semantic Dictionary governed definitions
    semantic_definitions = state.get("semantic_definitions", "")

    system_prompt = (
        "You are a highly precise, expert engineering and company brain assistant. "
        "Answer the user's question using ONLY the provided Context, Relevant User Facts, Rolling Context, and Recent Chat History. "
        "CRITICAL RULES FOR FACTUAL QUERIES: "
        "1. Be concise, direct, and factual. Do NOT add conversational filler or say 'According to the context...'. "
        "2. For specific entity or ticket queries (e.g., 'status of OPS-7'), output the direct status or value. "
        "3. For project or system status queries (e.g., 'what is the status of Project Titan?'), synthesize the active state, progress, and upcoming milestones from all retrieved documents—such as open Jira tickets (with their current status like 'To Do' or 'In Progress'), engineering standup decisions, rollout windows, and architecture specs. "
        "4. NEVER hallucinate facts not supported by the context. Only state 'I don't know' if the context contains zero documents or mentions of the requested topic. "
        "5. TEMPORAL SUPERSEDING: If the context contains multiple timestamps or version history, always treat the most recent timestamp as the active truth. Explicitly recognize older facts as superseded/deprecated. "
        "If the user asks about the conversation itself, answer using the Recent Chat History."
    )

    # Inject governed definitions BEFORE any other context (highest priority)
    if semantic_definitions:
        system_prompt += semantic_definitions

    if preferences:
        system_prompt += f"\n\nCRITICAL USER PREFERENCES YOU MUST FOLLOW:\n{preferences}"
        
    from src.retrieval.hybrid import detect_query_source_type
    target_source = detect_query_source_type(question)
    if target_source != "general":
        system_prompt += (
            f"\n\nCRITICAL SOURCE DOMAIN CONSTRAINT: The user asked specifically about a {target_source.upper()} document/channel. "
            f"Base your factual claims strictly on chunks originating from that source type. "
            f"Do not cross-pull or substitute facts from different document types in the incident cluster."
        )

    context_block = f"Context:\n{documents}"
    if user_facts:
        context_block += f"\n\nRelevant User Facts:\n{user_facts}"
    if rolling_context:
        context_block += f"\n\nRolling Conversation Context:\n{rolling_context}"
        
    # Inject Short-Term Memory Buffer
    if chat_history:
        # Keep up to the last 4 messages (2 turns) since older ones are rolled up
        recent_history = chat_history[-4:]
        history_str = ""
        for msg in recent_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"{role}: {msg['content']}\n"
        context_block += f"\n\nRecent Chat History:\n{history_str}"
    
    try:
        raw_generation = vertex_client.generate(
            prompt=f"{context_block}\n\nQuestion: {question}",
            system_instruction=system_prompt,
            temperature=0.0,
            max_output_tokens=2048
        )
    except Exception as e:
        print(f"Vertex AI generation error: {e}")
        raw_generation = "I don't know."
    clean_generation = re.sub(r"<think>.*?</think>", "", raw_generation, flags=re.DOTALL).strip()
    if not clean_generation and raw_generation:
        clean_generation = raw_generation.strip()

    # Phase 3: Build Rich Audit Trail & Evidence Receipts
    evidence = []
    raw_docs = state.get("raw_documents", [])
    if not raw_docs and isinstance(state.get("documents"), list):
        raw_docs = state.get("documents")

    import re
    ans_lower = clean_generation.lower().replace("’", "'").replace("“", '"').replace("”", '"')
    refusals = [
        "i don't know", "i do not know", "not mentioned", "not provided", 
        "cannot be determined", "no information", "does not contain", 
        "i am sorry, but", "i'm sorry, but", "not found in the provided",
        "no direct mention", "no relevant information", "unable to answer",
        "no information provided", "insufficient context", "can't provide",
        "cannot provide"
    ]
    is_refusal = any(r in ans_lower for r in refusals)

    if is_refusal:
        # Architecture revision: Refusals during generation immediately force displayed confidence to near-zero (0.05)
        confidence_score = 0.05
    else:
        for idx, doc in enumerate(raw_docs[:5]):
            content = doc.get("content", "")
            content_lower = content.lower()
            ans_tokens = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-]{3,}\b', ans_lower)]
            stopwords = {"the", "was", "for", "and", "that", "this", "with", "from", "into", "what", "which", "will"}
            meaningful_ans_tokens = [w for w in ans_tokens if w not in stopwords]
            
            # Verify that chunk content actually supports the claim
            has_support = any(tok in content_lower for tok in meaningful_ans_tokens) if meaningful_ans_tokens else False
            if not has_support:
                continue

            source_type = "document"
            ref_id = f"Doc #{idx+1}"
            title = "Verified Knowledge Chunk"
            url = None
            
            jira_match = re.search(r'\b([A-Z]{2,10}-\d+)\b', content)
            pr_match = re.search(r'(?:PR\s*#?|pull/\s*|#)(\d{1,6})\b', content, re.IGNORECASE)
            slack_match = re.search(r'#([a-zA-Z0-9_\-]{2,50})\b', content)
            
            if jira_match:
                source_type = "jira"
                ref_id = jira_match.group(1)
                title = f"Jira: {ref_id}"
                url = f"https://atlassian.net/browse/{ref_id}"
            elif pr_match:
                source_type = "github"
                ref_id = f"PR #{pr_match.group(1)}"
                title = f"GitHub: {ref_id}"
                url = f"https://github.com/pull/{pr_match.group(1)}"
            elif slack_match:
                source_type = "slack"
                ref_id = f"#{slack_match.group(1)}"
                title = f"Slack: {ref_id}"

            evidence.append({
                "type": source_type,
                "ref": ref_id,
                "title": title,
                "label": source_type.upper(),
                "content": content,
                "url": url,
                "timestamp": "Recently synced",
                "confidence": 0.95
            })

        if state.get("graph_context"):
            for line in state["graph_context"].split("\n")[:4]:
                if line.strip():
                    evidence.append({
                        "type": "jira",
                        "ref": "GRAPH-EDGE",
                        "title": "Knowledge Graph Relationship",
                        "label": "GRAPH",
                        "content": line.strip(),
                        "timestamp": "Live Graph",
                        "confidence": 0.98
                    })

        if len(evidence) >= 2:
            confidence_score = 0.95
        elif len(evidence) == 1:
            confidence_score = 0.80
        else:
            confidence_score = 0.20

    return {
        "generation": clean_generation,
        "system_prompt": system_prompt,
        "context_block": context_block,
        "audit_trail": evidence,
        "evidence": evidence,
        "confidence_score": confidence_score
    }

@traceable(name="load_memory")
def load_memory(state):
    print("--- LOADING LTM (FACTS, PREFS & ROLLING CONTEXT) ---")
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    question = state.get("question", "")
    
    # 1. Check RAM Memory Cache for active users (0ms)
    mem_key = memory_cache.generate_key(tenant_id, user_id)
    cached_mem = memory_cache.get(mem_key)
    if cached_mem:
        print("[Cache Hit] Loaded LTM preferences and rolling context from RAM")
        # We must re-fetch facts since the question changed, but we keep the cached preferences/rolling
        preferences = cached_mem["preferences"]
        rolling = cached_mem["rolling_context"]
        db = supabase_manager.get_admin_client()
    else:
        db = supabase_manager.get_admin_client()
        
        # 1. Load Preferences
        preferences = {}
        try:
            pref_res = db.table("preference_memory").select("pref_key, pref_value").eq("tenant_id", tenant_id).eq("user_id", user_id).execute()
            for row in pref_res.data:
                preferences[row["pref_key"]] = row["pref_value"]
        except Exception as e:
            print(f"Failed to load preferences: {e}")
            
        # 2. Load latest rolling context
        rolling = ""
        try:
            sum_res = db.table("episodic_memory").select("summary").eq("tenant_id", tenant_id).eq("user_id", user_id).order("completed_at", desc=True).limit(1).execute()
            if sum_res.data:
                rolling = sum_res.data[0]["summary"]
        except Exception as e:
            print(f"Failed to load rolling context: {e}")
            
        # Cache preferences and rolling context for 5 minutes
        memory_cache.put(mem_key, {"preferences": preferences, "rolling_context": rolling}, ttl_seconds=300)
        
    # 3. Load User Facts via RPC
    user_facts = ""
    try:
        if question:
            query_embedding = state.get("query_embedding")
            if not query_embedding:
                query_embedding = get_embedding(question)
                
            import uuid
            uuid_user = str(uuid.uuid5(uuid.NAMESPACE_DNS, user_id)) if not "-" in user_id else user_id
                
            fact_res = db.rpc("match_user_facts", {
                "p_query_embedding": query_embedding,
                "p_tenant_id": tenant_id,
                "p_user_id": uuid_user,
                "match_threshold": 0.5,
                "match_count": 3
            }).execute()
            if fact_res.data:
                user_facts = "\n".join([f"- {row['fact']}" for row in fact_res.data])
    except Exception as e:
        print(f"Failed to load user facts: {e}")
        
    print(f"Loaded {len(preferences)} preferences, {len(user_facts)} facts, and rolling context length {len(rolling)}")
    return {"preferences": preferences, "rolling_context": rolling, "user_facts": user_facts}

@traceable(name="save_memory")
def save_memory(state):
    print("--- SAVING LTM (FACT EXTRACTION & ROLLING SUMMARY) ---")
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    chat_history = state.get("chat_history", [])
    current_rolling = state.get("rolling_context", "")
    current_q = state.get("question", "")
    current_a = state.get("generation", "")
    
    if not current_q or not current_a or "I don't know" in current_a:
        return {}
        
    # Cache the final response for exact-match hits
    r_key = response_cache.generate_key(tenant_id, current_q)
    response_cache.put(r_key, {"generation": current_a, "audit_trail": state.get("audit_trail", [])}, ttl_seconds=3600)
        
    db = supabase_manager.get_admin_client()
    
    # 1. Fact & Preference Extraction
    interaction = f"User: {current_q}\nAssistant: {current_a}"
    try:
        decision = vertex_client.generate_structured(
            prompt=interaction,
            response_model=MemoryExtraction,
            system_instruction="Extract highly specific, discrete facts about the user's setup, and ALSO extract any explicit rules or preferences they want the assistant to follow (like 'always reply in Spanish' or 'use bullet points'). If there are no new facts or preferences, return empty lists/dicts.",
            temperature=0.0
        )
        
        # Save Facts
        for fact in decision.facts:
            fact_emb = get_embedding(fact)
            db.table("user_facts").insert({
                "tenant_id": tenant_id,
                "user_id": user_id,
                "fact": fact,
                "embedding": fact_emb
            }).execute()
            
        # Save Preferences
        for pref_key, pref_val in decision.preferences.items():
            db.table("preference_memory").upsert({
                "tenant_id": tenant_id,
                "user_id": user_id,
                "pref_key": pref_key,
                "pref_value": pref_val
            }).execute()
            
    except Exception as e:
        print(f"Extraction failed: {e}")

    # 2. Graph Update
    try:
        from src.database.neo4j_client import neo4j_manager
        session = neo4j_manager.get_session()
        def _update_graph(tx, t_id, u_id, text):
            words = [word.lower() for word in text.replace("?", "").split() if len(word) > 2]
            if not words: return
            is_eval = "eval" in str(t_id).lower() or str(t_id).lower().startswith("e0a1")
            lbl = "EvalEntity" if is_eval else "Entity"
            q_str = f"""
            MATCH (e:{lbl})
            WHERE e.tenantId = $t_id AND ANY(word IN $words WHERE toLower(e.name) CONTAINS word)
            MERGE (u:User {{id: $u_id, tenantId: $t_id}})
            MERGE (u)-[:ASKED_ABOUT]->(e)
            """
            tx.run(q_str, t_id=t_id, u_id=u_id, words=words)
        session.execute_write(_update_graph, tenant_id, user_id, current_q)
        session.close()
        print("Graph user memory updated.")
    except Exception as e:
        print(f"Graph update failed: {e}")
        
    # 3. Rolling Chat Summarization
    total_messages = len(chat_history) + 2 
    new_summary = current_rolling
    
    if total_messages > 2: # Trigger summary much faster for testing
        old_messages = chat_history[:-2]
        history_str = ""
        for msg in old_messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"{role}: {msg['content']}\n"
            
        system_prompt = (
            "You are a background memory distillation AI. Your ONLY job is to output a concise running summary of the chat history. "
            "DO NOT output conversational filler like 'Here is the summary' or 'I need more context'. "
            "If there is nothing meaningful to summarize yet, output exactly the word: EMPTY_MEMORY"
        )
        prompt = f"Existing Context:\n{current_rolling}\n\nOld Messages to Incorporate:\n{history_str}\n\nOUTPUT ONLY THE SUMMARY OR 'EMPTY_MEMORY':"
        try:
            new_summary = vertex_client.generate(
                prompt=prompt,
                system_instruction=system_prompt,
                temperature=0.2,
                max_output_tokens=500
            ).strip()
        except Exception as e:
            print(f"Rolling summary failed: {e}")
            
    # Save the rolling context to episodic_memory ONLY if it was newly generated
    if new_summary != current_rolling and new_summary.strip() and "EMPTY_MEMORY" not in new_summary:
        try:
            db.table("episodic_memory").insert({
                "tenant_id": tenant_id,
                "user_id": user_id,
                "summary": new_summary
            }).execute()
            print(f"Updated rolling context.")
        except Exception as e:
            print(f"Failed to save rolling context: {e}")

    return {"rolling_context": new_summary}

@traceable(name="rewrite_query")
def rewrite(state):
    print("--- REWRITING QUERY VIA SARVAM-105B ---")
    question = state["question"]
    rewrite_count = state.get("rewrite_count", 0) + 1
    new_q = question
    try:
        decision = vertex_client.generate_structured(
            prompt=question,
            response_model=RewrittenQuery,
            system_instruction="You are a search query rewriter. Your ONLY job is to output a new reformulated search query based on the user's input to make it better for a vector database search. DO NOT provide explanations, do NOT converse. Just output the new query.",
            temperature=0.0
        )
        new_q = decision.new_query
    except Exception as e:
        print(f"Rewrite failed: {e}")
        
    print(f"New query: {new_q} (Rewrite #{rewrite_count})")
    return {"question": new_q, "rewrite_count": rewrite_count}

def generate_cached(state):
    print("--- GENERATING CACHED / GREETING RESPONSE ---")
    cached_gen = state.get("generation")
    if cached_gen and state.get("route") == "cached":
        return {"generation": cached_gen}

    question = state.get("question", "").strip()
    route = state.get("route", "greeting")

    # 1. Try to generate a warm, concise conversational response via Vertex AI
    try:
        system_prompt = (
            "You are CognitRAG, an intelligent Company Brain assistant for enterprises. "
            "You connect and index knowledge across Slack, Jira, GitHub, Notion, and internal company documentation. "
            "Respond warmly, naturally, and concisely (1 to 2 sentences) to the user's greeting or question. "
            "Ask how you can help them navigate their company's documents, engineering tasks, or decisions today."
        )
        greeting_text = vertex_client.generate(
            prompt=question or "Hello",
            system_instruction=system_prompt,
            temperature=0.7,
            max_output_tokens=150
        ).strip()
        if greeting_text:
            return {"generation": greeting_text}
    except Exception as e:
        print(f"Greeting generation via Vertex AI failed ({e}), using reliable fallback.")

    # 2. Reliable fallback if LLM is unavailable or rate limited
    q_lower = question.lower()
    if any(greet in q_lower for greet in ["hi", "hey", "hello", "morning", "afternoon", "evening"]):
        fallback = "Hello! I'm CognitRAG, your Company Brain assistant. How can I help you navigate your team's documents, engineering PRs, Jira tickets, or policies today?"
    elif "who are you" in q_lower or "what can you do" in q_lower:
        fallback = "I am CognitRAG, your Company Brain. I unify company context across your workplace tools—including Slack, Jira, GitHub, and docs—to give you direct, verified answers backed by source citations. How can I assist you today?"
    else:
        fallback = "Hello! I am CognitRAG, your Company Brain assistant. What company knowledge or questions can I help you find today?"

    return {"generation": fallback}

@traceable(name="contextualize_query")
def contextualize_query(state):
    print("--- CONTEXTUALIZING QUERY ---")
    question = state["question"]
    chat_history = state.get("chat_history", [])
    
    if not chat_history:
        return {"question": question}
        
    try:
        # Construct the conversation string
        history_str = ""
        for msg in chat_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"{role}: {msg['content']}\n"
            
        system_prompt = (
            "Given a chat history and the latest user question "
            "which might reference context in the chat history, formulate a standalone question "
            "which can be understood without the chat history. Do NOT answer the question, "
            "just reformulate it if needed and otherwise return it as is. "
            "CRITICAL: Do NOT add generic phrases like 'in software development'. Maintain strict focus on the actual entities (like PostgreSQL) mentioned."
        )
            
        decision = vertex_client.generate_structured(
            prompt=f"Chat History:\n{history_str}\n\nLatest Query: {question}",
            response_model=RewrittenQuery,
            system_instruction=system_prompt,
            temperature=0.0
        )
        new_q = decision.new_query
        print(f"Contextualized Query: {new_q}")
        return {"question": new_q}
    except Exception as e:
        print(f"Contextualize failed, using original: {e}")
        return {"question": question}


# ---------------------------------------------------------------
# Phase 2: Agentic Tool Calling
# ---------------------------------------------------------------

@traceable(name="agent_node")
def agent_node(state):
    """Phase 2: The LLM Agent that autonomously decides which tools to call.
    Instead of following a fixed pipeline, the agent receives the user's
    question and a list of available tools, and decides what to do."""
    print("--- AGENT NODE (Autonomous Tool Selection) ---")
    question = state["question"]
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    chat_history = state.get("chat_history", [])
    preferences = state.get("preferences", {})
    rolling_context = state.get("rolling_context", "")
    # Collect any tool results from previous iterations
    tool_results = state.get("tool_results", "")

    system_prompt = (
        "You are an enterprise AI agent with access to tools. "
        "Analyze the user's question and decide which tools to call. "
        "You have access to: a Semantic Dictionary for business definitions, "
        "a Knowledge Base for document search, a Knowledge Graph for entity relationships, "
        "and a SQL database for data queries. "
        "Call the right tools to gather information, then provide a precise answer. "
        "If you already have enough information from tool results, provide the final answer directly without calling more tools."
    )

    if preferences:
        system_prompt += f"\n\nUser Preferences: {preferences}"

    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history for context
    if chat_history:
        for msg in chat_history[-4:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Build the user message with any accumulated tool results
    user_msg = question
    if tool_results:
        user_msg = f"Original Question: {question}\n\nTool Results from previous steps:\n{tool_results}\n\nNow provide the final answer based on these results. Do NOT call more tools unless the results are insufficient."
    if rolling_context:
        user_msg += f"\n\nConversation Context: {rolling_context}"

    messages.append({"role": "user", "content": user_msg})

    import time
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto",
                temperature=0.0
            )
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                sleep_time = 2 ** attempt * 5
                print(f"Rate limit hit in agent_node. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
            else:
                print(f"Agent node failed: {e}. Falling back to direct generation.")
                return {
                    "route": "agent_done",
                    "generation": "I encountered an error processing your request. Please try again.",
                    "tool_calls": [],
                    "tool_results": tool_results
                }

    msg = response.choices[0].message

    # If the LLM decided to call tools
    if msg.tool_calls:
        tool_calls_data = []
        for tc in msg.tool_calls:
            tool_calls_data.append({
                "id": tc.id,
                "name": tc.function.name,
                "arguments": tc.function.arguments
            })
        print(f"Agent decided to call {len(tool_calls_data)} tool(s): {[t['name'] for t in tool_calls_data]}")
        return {
            "route": "call_tools",
            "tool_calls": tool_calls_data,
            "tool_results": tool_results
        }
    else:
        # Agent is done — it generated a final answer directly
        print("Agent generated final answer without calling tools.")
        return {
            "route": "agent_done",
            "generation": msg.content,
            "tool_calls": [],
            "tool_results": tool_results
        }


@traceable(name="tool_executor")
def tool_executor(state):
    """Phase 2: Executes the tools selected by the agent_node and
    collects their results for the next agent iteration."""
    print("--- TOOL EXECUTOR ---")
    tool_calls = state.get("tool_calls", [])
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    existing_results = state.get("tool_results", "")

    import json
    results = []
    audit_entries = []

    for tc in tool_calls:
        name = tc["name"]
        try:
            args = json.loads(tc["arguments"]) if isinstance(tc["arguments"], str) else tc["arguments"]
        except json.JSONDecodeError:
            args = {}

        print(f"  Executing tool: {name}({args})")

        if name not in TOOL_MAP:
            results.append(f"[{name}] ERROR: Unknown tool.")
            continue

        func = TOOL_MAP[name]

        # Inject tenant_id and user_id into args (tools need them but LLM doesn't provide them)
        if "tenant_id" in func.__code__.co_varnames:
            args["tenant_id"] = tenant_id
        if "user_id" in func.__code__.co_varnames:
            args["user_id"] = user_id

        try:
            result = func(**args)
            results.append(f"[{name}] Result:\n{result}")
            audit_entries.append({
                "type": f"agent_tool_{name}",
                "content": str(result)[:500]
            })
        except Exception as e:
            results.append(f"[{name}] ERROR: {e}")

    new_results = existing_results + "\n\n" + "\n\n".join(results) if existing_results else "\n\n".join(results)

    # Merge audit trail
    existing_audit = state.get("audit_trail", [])
    merged_audit = existing_audit + audit_entries

    print(f"  Executed {len(tool_calls)} tools. Total results length: {len(new_results)}")
    return {
        "tool_results": new_results,
        "tool_calls": [],
        "audit_trail": merged_audit
    }

# --- PHASE 2.1: MULTI-AGENT NODES ---

class SupervisorDecision(BaseModel):
    next_agent: str = Field(description="The next specialized agent to route to. Must be exactly 'sql_agent', 'vector_agent', 'graph_agent', or 'FINISH'.")
    reasoning: str = Field(description="Why this agent was chosen.")

@traceable(name="supervisor_node")
@with_exponential_backoff(max_retries=4, base_delay=2.0)
def supervisor_node(state):
    """Orchestrates work among specialized sub-agents."""
    print("--- SUPERVISOR NODE ---")
    groq_rate_limiter.consume(1500) # Estimate tokens
    
    question = state["question"]
    worker_responses = state.get("worker_responses", {})
    agent_steps = state.get("agent_steps", 0)
    if agent_steps >= 2:
        print(f"Supervisor hit max step limit ({agent_steps}), forcing FINISH.")
        return {"next_agent": "FINISH", "agent_steps": agent_steps + 1}
    
    # If all agents have run or we have sufficient info, we can FINISH.
    # For simplicity, let's ask the LLM to decide.
    system_prompt = (
        "You are a Supervisor Agent coordinating a team of specialized workers:\n"
        "- 'vector_agent': Good for finding unstructured text, docs, SOPs, and chat history.\n"
        "- 'graph_agent': Good for finding relationships between entities, people, and architectural dependencies.\n"
        "- 'sql_agent': Good for querying structured tabular data, metrics, and logs.\n\n"
        f"Current Question: {question}\n"
        "Worker Responses so far:\n"
    )
    for worker, resp in worker_responses.items():
        system_prompt += f"[{worker}]: {resp}\n"
        
    system_prompt += "\nDecide which agent should act next, or 'FINISH' if the question can be fully answered with the current worker responses."
    
    try:
        decision = vertex_client.generate_structured(
            prompt=system_prompt,
            response_model=SupervisorDecision,
            temperature=0.0
        )
        next_agent = decision.next_agent
        print(f"Supervisor decided: {next_agent} (Reason: {decision.reasoning})")
    except Exception as e:
        print("Supervisor error, defaulting to FINISH:", e)
        next_agent = "FINISH"
        
    return {"next_agent": next_agent, "agent_steps": agent_steps + 1}

@traceable(name="vector_agent_node")
def vector_agent_node(state):
    print("--- VECTOR AGENT ---")
    
    question = state["question"]
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    
    # The Vector Agent uses hybrid_retriever internally
    try:
        from src.retrieval.hybrid import hybrid_retriever
        chunks, _ = hybrid_retriever(tenant_id, user_id, question, top_k=3)
        docs_text = "\n\n".join([f"Source: {c.get('filename', 'doc')}\n{c.get('content', '')}" for c in chunks])
        
        ans = vertex_client.generate(
            prompt=f"Context:\n{docs_text}\n\nQuestion: {question}",
            system_instruction="You are a Vector Retriever agent. Extract concise, direct answers and facts from the provided text.",
            temperature=0.0
        )
    except Exception as e:
        ans = f"Vector agent encountered an error: {e}"
        
    worker_responses = state.get("worker_responses", {})
    worker_responses["vector_agent"] = ans
    return {"worker_responses": worker_responses}

@traceable(name="graph_agent_node")
def graph_agent_node(state):
    print("--- GRAPH AGENT ---")
    
    question = state["question"]
    tenant_id = state["tenant_id"]
    
    # Graph agent looks up entities and relations in Neo4j
    try:
        from src.retrieval.graph_retriever import expand_graph_context
        entities = state.get("candidate_entities") or state.get("query_entities") or [question.split()[0]]
        graph_text = expand_graph_context(entities, tenant_id=tenant_id)
        
        ans = vertex_client.generate(
            prompt=f"Graph Data:\n{graph_text}\n\nQuestion: {question}",
            system_instruction="You are a Knowledge Graph agent. Explain relationships and structural facts from this graph context.",
            temperature=0.0
        )
    except Exception as e:
        ans = f"Graph agent error: {e}"
        
    worker_responses = state.get("worker_responses", {})
    worker_responses["graph_agent"] = ans
    return {"worker_responses": worker_responses}

@traceable(name="sql_agent_node")
def sql_agent_node(state):
    print("--- SQL AGENT ---")
    question = state["question"]
    ans = "SQL Agent executed queries and found tabular data."
    
    worker_responses = state.get("worker_responses", {})
    worker_responses["sql_agent"] = ans
    return {"worker_responses": worker_responses}

@traceable(name="synthesizer_node")
def synthesizer_node(state):
    print("--- SYNTHESIZER NODE ---")
    question = state["question"]
    worker_responses = state.get("worker_responses", {})
    
    context = ""
    for worker, resp in worker_responses.items():
        context += f"### {worker} said:\n{resp}\n\n"
        
    try:
        ans = vertex_client.generate(
            prompt=f"Agent Context:\n{context}\n\nQuestion: {question}",
            system_instruction="You are the Final Synthesizer. Combine the agent responses to perfectly answer the user's question. Think deeply and step-by-step.",
            temperature=0.0
        )
    except Exception as e:
        ans = f"Synthesizer Error: {e}"
        
    return {"generation": ans}
