from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.database.supabase_client import supabase_manager
from src.api.routes import get_tenant_uuid

router = APIRouter()

class Preference(BaseModel):
    key: str
    value: str

@router.get("/api/v1/memory/{tenant_id}/{user_id}/facts")
def get_user_facts(tenant_id: str, user_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        response = db.table("user_facts").select("id, fact").eq("tenant_id", uuid_tenant).eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/v1/memory/{tenant_id}/{user_id}/facts/{fact_id}")
def delete_user_fact(tenant_id: str, user_id: str, fact_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        db.table("user_facts").delete().eq("tenant_id", uuid_tenant).eq("user_id", user_id).eq("id", fact_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/v1/memory/{tenant_id}/{user_id}/preferences")
def get_user_preferences(tenant_id: str, user_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        response = db.table("preference_memory").select("pref_key, pref_value").eq("tenant_id", uuid_tenant).eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/memory/{tenant_id}/{user_id}/preferences")
def add_user_preference(tenant_id: str, user_id: str, pref: Preference):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        db.table("preference_memory").upsert({
            "tenant_id": uuid_tenant,
            "user_id": user_id,
            "pref_key": pref.key,
            "pref_value": pref.value
        }).execute()
        
        # Clear the memory cache so the new preference applies immediately
        from src.retrieval.nodes import memory_cache
        mem_key = memory_cache.generate_key(uuid_tenant, user_id)
        memory_cache.delete(mem_key)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/v1/memory/{tenant_id}/{user_id}/preferences/{pref_key}")
def delete_user_preference(tenant_id: str, user_id: str, pref_key: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        db.table("preference_memory").delete().eq("tenant_id", uuid_tenant).eq("user_id", user_id).eq("pref_key", pref_key).execute()
        
        from src.retrieval.nodes import memory_cache
        mem_key = memory_cache.generate_key(uuid_tenant, user_id)
        memory_cache.delete(mem_key)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
