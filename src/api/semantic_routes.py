"""
Semantic Dictionary Admin API
==============================
FastAPI routes for admins to create, read, and delete governed business
definitions in the Semantic Dictionary (Ontology Store).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from src.semantic.ontology import get_all_definitions, upsert_definition, delete_definition

router = APIRouter(prefix="/api/v1/semantic", tags=["Semantic Dictionary"])


def get_tenant_uuid(clerk_id: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, clerk_id))


class DefinitionRequest(BaseModel):
    tenant_id: str
    term: str
    definition: str
    owner: Optional[str] = None
    scope: Optional[str] = None


@router.get("/definitions")
def list_definitions(tenant_id: str):
    """List all governed definitions for a tenant."""
    uuid_tenant = get_tenant_uuid(tenant_id)
    definitions = get_all_definitions(uuid_tenant)
    return {"definitions": definitions, "count": len(definitions)}


@router.post("/definition")
def create_or_update_definition(request: DefinitionRequest):
    """Create or update a governed business definition."""
    uuid_tenant = get_tenant_uuid(request.tenant_id)
    try:
        result = upsert_definition(
            tenant_id=uuid_tenant,
            term=request.term,
            definition=request.definition,
            owner=request.owner,
            scope=request.scope
        )
        return {"status": "success", "definition": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/definition/{definition_id}")
def remove_definition(definition_id: str, tenant_id: str):
    """Delete a governed definition by its ID."""
    uuid_tenant = get_tenant_uuid(tenant_id)
    success = delete_definition(uuid_tenant, definition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Definition not found or could not be deleted.")
    return {"status": "deleted", "id": definition_id}
