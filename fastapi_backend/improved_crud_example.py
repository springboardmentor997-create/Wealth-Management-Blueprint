from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

# --- 1. Pydantic Models ---
# Always define these clearly for Swagger to pick them up.

class ItemBase(BaseModel):
    name: str = Field(..., example="Apple", description="Name of the item")
    description: Optional[str] = Field(None, example="A red fruit", description="Description")
    price: float = Field(..., gt=0, example=1.99, description="Price must be greater than 0")

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, example="Green Apple")
    description: Optional[str] = Field(None)
    price: Optional[float] = Field(None, gt=0)

class ItemResponse(ItemBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

# --- 2. Database Dependency (Mock) ---
# In real app, import get_db from database.py
def get_db():
    try:
        yield "db_session" 
    finally:
        pass

# --- 3. Router Definition ---
router = APIRouter(prefix="/api/items", tags=["Items"])

# --- 4. CRUD Operations ---

# GET (Read) - Uses valid Pydantic model in response_model
@router.get("/", response_model=List[ItemResponse])
async def get_items(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    """
    Get all items with pagination.
    Query parameters 'skip' and 'limit' will be shown in Swagger.
    """
    # ... logic to fetch from DB ...
    return []

# POST (Create) - Uses ItemCreate for body
@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: ItemCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new item.
    The 'item' parameter is a Pydantic model, so it appears as the Request Body in Swagger.
    """
    # ... logic to add to DB ...
    return {"id": uuid.uuid4(), **item.dict()}

# PUT (Update) - Mixes Path param (item_id) and Body (item)
@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: uuid.UUID, 
    item: ItemUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an item.
    - item_id: Path parameter
    - item: Request Body (Pydantic model)
    """
    # ... logic to update DB ...
    return {"id": item_id, **item.dict(exclude_unset=True), "name": "Updated", "price": 10.0}

# DELETE (Delete) - Uses status code 204 for no content
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: uuid.UUID, 
    db: Session = Depends(get_db)
):
    """
    Delete an item by ID.
    Only takes a path parameter.
    """
    # ... logic to delete from DB ...
    return None
