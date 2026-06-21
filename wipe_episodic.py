from src.database.supabase_client import supabase_manager
db = supabase_manager.get_admin_client()
res = db.table('episodic_memory').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
print(f"Deleted {len(res.data)} rows from episodic_memory")
