from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any
from src.middleware.auth import get_current_user
from src.billing.stripe_client import create_checkout_session, create_customer_portal
from src.billing.metering import get_current_usage

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

@router.get("/usage")
async def get_usage(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    """Returns the current workspace usage metrics against plan limits."""
    # In a real app, resolve tenant_id from user_id's active workspace
    tenant_id = "ws_mock_id" 
    usage = get_current_usage(tenant_id)
    return usage

@router.post("/checkout")
async def create_checkout(request: Request, user_id: str = Depends(get_current_user)):
    """Creates a Stripe checkout session for upgrading."""
    data = await request.json()
    plan_id = data.get("price_id")
    if not plan_id:
        raise HTTPException(status_code=400, detail="price_id is required")
        
    tenant_id = "ws_mock_id"
    success_url = f"{request.base_url}dashboard/billing?success=true"
    cancel_url = f"{request.base_url}dashboard/billing?canceled=true"
    
    session = create_checkout_session(tenant_id, plan_id, success_url, cancel_url)
    if "error" in session:
        raise HTTPException(status_code=500, detail=session["error"])
        
    return {"url": session["url"]}

@router.post("/portal")
async def create_portal(request: Request, user_id: str = Depends(get_current_user)):
    """Creates a Stripe customer portal session."""
    tenant_id = "ws_mock_id"
    usage = get_current_usage(tenant_id)
    customer_id = usage.get("stripe_customer_id")
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="No active subscription found")
        
    return_url = f"{request.base_url}dashboard/billing"
    session = create_customer_portal(tenant_id, customer_id, return_url)
    
    if "error" in session:
        raise HTTPException(status_code=500, detail=session["error"])
        
    return {"url": session["url"]}
