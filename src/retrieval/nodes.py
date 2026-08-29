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
    print("--- ROUTING QUERY VIA SARVAM-105B ---")
    question = state["question"]
    try:
        res = groq_instructor.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_model=RouteDecision,
            messages=[
                {"role": "system", "content": "Classify the intent of the user query. ONLY return 'greeting' or 'faq' for pure small talk (like 'hello', 'who are you'). Return 'conversational' if the user asks about the conversation history itself. Return 'personal' for questions about user preferences. Return 'followup' for queries needing previous chat context. Return 'agent_query' for complex multi-step questions that require calculating metrics, combining data from multiple sources, comparing entities, or answering questions that mention business KPIs like revenue, churn, growth rate, etc. CRITICAL: Any query asking 'What are', 'How to', 'What is the default', or anything about configurations, options, variables, parameters, or technical terms MUST ALWAYS be classified as 'technical_query'. When in doubt between technical_query and agent_query, default to 'technical_query'. Also extract technical entities and determine if memory or graph search is needed."},
                {"role": "user", "content": question}
            ]
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
    return {"route": route, "need_memory": need_memory, "need_graph": need_graph, "query_entities": query_entities}

@traceable(name="retrieve_context")
def retrieve(state):
    print("--- HYBRID RETRIEVAL (BM25 + Vector + RRF) ---")
    question = state["question"]
    tenant_id = state["tenant_id"]
    
    user_id = state.get("user_id", "default_user")
    query_embedding = state.get("query_embedding", [])
    
    # 1. Retrieve Candidate Chunks
    docs, high_conf = hybrid_retriever(tenant_id, user_id, question, query_embedding, top_k=10)
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
                filtered_chunks.append(documents[index])
                
        return filtered_chunks
    except Exception as e:
        print(f"Jina Reranker failed: {e}")
        return documents[:5] # Fallback to top 5 without threshold

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
        print("Signals passed! Calling openai/gpt-oss-120b to confirm graph traversal...")
        # Call the exact same LLM (openai/gpt-oss-120b) to make the final determination
        try:
            class GraphDecisionModel(BaseModel):
                needs_traversal: bool = Field(description="True if traversing the graph for these entities will help answer the user query.")
            
            decision = groq_instructor.chat.completions.create(
                model="openai/gpt-oss-120b",
                response_model=GraphDecisionModel,
                messages=[
                    {"role": "system", "content": "You are a precise routing agent. Determine if traversing a knowledge graph for the given entities is necessary to answer the query."},
                    {"role": "user", "content": f"Query: {question}\\nCandidate Entities: {candidate_entities}"}
                ],
                temperature=0.0
            )
            need_graph = decision.needs_traversal
            print(f"openai/gpt-oss-120b concluded need_graph = {need_graph}")
        except Exception as e:
            print(f"openai/gpt-oss-120b decision failed: {e}")
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
            res = session.run("""
                MATCH (n:Entity {tenantId: $tenant_id})-[r:RELATION]-(m:Entity {tenantId: $tenant_id})
                WHERE n.name IN $entities
                RETURN n.name AS source, r.type AS rel_type, m.name AS target
                LIMIT 15
            """, tenant_id=tenant_id, entities=candidate_entities)
            
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
    
    return {"documents": final_context}


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
        "You are a highly precise, expert SaaS financial support assistant. "
        "Answer the user's question using ONLY the provided Context, Relevant User Facts, Rolling Context, and Recent Chat History. "
        "CRITICAL RULES FOR FACTUAL QUERIES: "
        "1. Be as concise as possible. Do NOT add unnecessary fluff, background information, or conversational filler. "
        "2. If the user asks for a number, date, or specific value, output ONLY that exact value if possible. "
        "3. NEVER hallucinate. If the exact answer cannot be mathematically derived from the context, say exactly 'I don't know.' "
        "4. Do NOT say 'According to the context...' Just answer directly. "
        "If the user asks about the conversation itself, answer using the Recent Chat History."
    )

    # Inject governed definitions BEFORE any other context (highest priority)
    if semantic_definitions:
        system_prompt += semantic_definitions

    if preferences:
        system_prompt += f"\n\nCRITICAL USER PREFERENCES YOU MUST FOLLOW:\n{preferences}"
        
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
    
    import time
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                temperature=0.0,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"{context_block}\n\nQuestion: {question}"}
                ]
            )
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                sleep_time = 2 ** attempt * 5
                print(f"NVIDIA API rate limit hit in generator. Retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                raise e
    
    # Phase 3: Build Audit Trail
    audit_trail = []
    if isinstance(state.get("documents"), list):
        for doc in state.get("documents", [])[:5]:
            audit_trail.append({
                "type": "vector_chunk",
                "content": doc.get("content", "")[:200] + "...",
                "parent_id": doc.get("parent_id", "")
            })
    if state.get("graph_context"):
        for line in state["graph_context"].split("\n")[:5]:
            if line.strip():
                audit_trail.append({"type": "graph_relationship", "content": line})
    if semantic_definitions:
        audit_trail.append({"type": "semantic_definition", "content": semantic_definitions.strip()})

    return {
        "generation": response.choices[0].message.content,
        "system_prompt": system_prompt,
        "context_block": context_block,
        "audit_trail": audit_trail
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
        decision = groq_instructor.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_model=MemoryExtraction,
            messages=[
                {"role": "system", "content": "Extract highly specific, discrete facts about the user's setup, and ALSO extract any explicit rules or preferences they want the assistant to follow (like 'always reply in Spanish' or 'use bullet points'). If there are no new facts or preferences, return empty lists/dicts."},
                {"role": "user", "content": interaction}
            ]
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
            q_str = """
            MATCH (e:Entity)
            WHERE e.tenantId = $t_id AND ANY(word IN $words WHERE toLower(e.name) CONTAINS word)
            MERGE (u:User {id: $u_id, tenantId: $t_id})
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
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            new_summary = response.choices[0].message.content
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
    try:
        decision = groq_instructor.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_model=RewrittenQuery,
            messages=[
                {"role": "system", "content": "You are a search query rewriter. Your ONLY job is to output a new reformulated search query based on the user's input to make it better for a vector database search. DO NOT provide explanations, do NOT converse. Just output the new query."},
                {"role": "user", "content": question}
            ]
        )
        new_q = decision.new_query
    except Exception as e:
        print("Rewrite failed, using original.")
        new_q = question
        
    print(f"New query: {new_q} (Rewrite #{rewrite_count})")
    return {"question": new_q, "rewrite_count": rewrite_count}

def generate_cached(state):
    print("--- GENERATING CACHED RESPONSE ---")
    return {"generation": state.get("generation", "Error: No cached generation found.")}

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
            
        decision = groq_instructor.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_model=RewrittenQuery,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Chat History:\n{history_str}\n\nLatest Query: {question}"}
            ]
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
        decision = groq_instructor.chat.completions.create(
            model="openai/gpt-oss-120b",
            response_model=SupervisorDecision,
            messages=[{"role": "user", "content": system_prompt}]
        )
        next_agent = decision.next_agent
        print(f"Supervisor decided: {next_agent} (Reason: {decision.reasoning})")
    except Exception as e:
        print("Supervisor error, defaulting to FINISH:", e)
        next_agent = "FINISH"
        
    return {"next_agent": next_agent}

@traceable(name="vector_agent_node")
@with_exponential_backoff(max_retries=4, base_delay=2.0)
def vector_agent_node(state):
    print("--- VECTOR AGENT ---")
    groq_rate_limiter.consume(3000) # Estimate tokens
    
    question = state["question"]
    tenant_id = state["tenant_id"]
    user_id = state.get("user_id", "default_user")
    
    # The Vector Agent uses hybrid_retriever internally
    try:
        from src.retrieval.hybrid import hybrid_retriever
        chunks = hybrid_retriever(tenant_id, question, top_k=3, user_id=user_id)
        docs_text = "\n\n".join([f"Source: {c['filename']}\n{c['content']}" for c in chunks])
        
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are the Vector Agent. Answer based ONLY on the provided chunks."},
                {"role": "user", "content": f"Context:\n{docs_text}\n\nQuestion: {question}"}
            ]
        )
        ans = response.choices[0].message.content
    except Exception as e:
        ans = f"Vector Agent Error: {e}"
        
    worker_responses = state.get("worker_responses", {})
    worker_responses["vector_agent"] = ans
    return {"worker_responses": worker_responses}

@traceable(name="graph_agent_node")
def graph_agent_node(state):
    print("--- GRAPH AGENT ---")
    question = state["question"]
    # Mocking graph lookup for speed, normally calls neo4j
    ans = "Graph Agent analyzed relationships and found relevant dependencies."
    
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

from src.utils.rate_limiter import groq_rate_limiter, with_exponential_backoff

@traceable(name="synthesizer_node")
@with_exponential_backoff(max_retries=4, base_delay=2.0)
def synthesizer_node(state):
    print("--- SYNTHESIZER NODE ---")
    question = state["question"]
    worker_responses = state.get("worker_responses", {})
    
    context = ""
    for worker, resp in worker_responses.items():
        context += f"### {worker} said:\n{resp}\n\n"
        
    try:
        # Phase 2.4: Use Nemotron (NVIDIA) strictly for deep synthesis
        response = litellm_completion(
            model="openai/gpt-oss-120b", # NVIDIA API format for llama
            messages=[
                {"role": "system", "content": "You are the Final Synthesizer. Combine the agent responses to perfectly answer the user's question. Think deeply and step-by-step."},
                {"role": "user", "content": f"Agent Context:\n{context}\n\nQuestion: {question}"}
            ]
        )
        ans = response.choices[0].message.content
    except Exception as e:
        ans = f"Synthesizer Error: {e}"
        
    return {"generation": ans}
