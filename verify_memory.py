import asyncio
from src.retrieval.graph import crag_app
from src.database.supabase_client import supabase_manager

def test_memory():
    tenant_id = "619f50ab-df74-4057-9305-05a70fdc2474" # Postgres test tenant
    user_id = "test_user_123"
    
    # 1. Insert a preference into Supabase directly
    db = supabase_manager.get_tenant_client(tenant_id)
    try:
        db.table("preference_memory").upsert({
            "tenant_id": tenant_id,
            "user_id": user_id,
            "pref_key": "format",
            "pref_value": "ALWAYS answer in exactly 3 bullet points, using pirate speak. DO NOT SAY ANYTHING ELSE."
        }, on_conflict="tenant_id,user_id,pref_key").execute()
        print("Successfully injected preference into Long Term Memory.")
    except Exception as e:
        print(f"Failed to insert preference. Did you run the SQL script? Error: {e}")
        return

    # 2. Invoke the graph
    print("\nInvoking LangGraph with memory load/save nodes...")
    initial_state = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "question": "What is the default value of the transform_null_equals option?",
        "generation": "",
        "documents": "",
        "route": "",
        "chat_history": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Ahoy matey!"},
            {"role": "user", "content": "What is the default value of the transform_null_equals option?"}
        ],
        "preferences": {},
        "summary": ""
    }
    
    final_state = crag_app.invoke(initial_state)
    
    print("\n--- Final Answer ---")
    print(final_state["generation"])
    print("\n--- Final Summary (Episodic Memory) ---")
    print(final_state.get("summary", "No summary generated"))

if __name__ == "__main__":
    test_memory()
