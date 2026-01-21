from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import os
from datetime import datetime
import uuid

from models import User, KYCRequest
import schemas
from database import get_db
from dependencies import get_current_user, get_admin_user

router = APIRouter(
    prefix="/kyc",
    tags=["kyc"]
)

@router.post("/submit", response_model=schemas.KYCResponse)
async def submit_kyc(
    full_name: str = Form(...),
    dob: str = Form(...),
    document_type: str = Form(...),
    document_number: str = Form(...),
    address: str = Form(...),
    document_proof: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if KYC already exists
    existing_kyc = db.query(KYCRequest).filter(KYCRequest.user_id == current_user.id).first()
    if existing_kyc:
        # If rejected, allow re-submission (update). If pending/verified, block.
        if existing_kyc.status == "verified":
             raise HTTPException(status_code=400, detail="KYC already verified")
        elif existing_kyc.status == "pending":
             raise HTTPException(status_code=400, detail="KYC verification is already in progress")
        
        # If user is re-submitting after rejection (or update which we treat as re-submit), delete old request or update it.
        # Let's update it.
        kyc_request = existing_kyc
    else:
        kyc_request = KYCRequest(user_id=current_user.id)
        db.add(kyc_request)

    # Handle file upload
    file_path = kyc_request.document_proof_url
    if document_proof:
        upload_dir = "uploads/kyc_documents"
        os.makedirs(upload_dir, exist_ok=True)
        # Generate safe filename
        extension = os.path.splitext(document_proof.filename)[1]
        filename = f"{current_user.id}_{uuid.uuid4()}{extension}"
        file_path = f"{upload_dir}/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(document_proof.file, buffer)
        
        # Store relative path for frontend access (need to mount this dir if we want admin to see it)
        # Assuming '/static' mounts 'uploads'
        file_path = f"/static/kyc_documents/{filename}"

    kyc_request.full_name = full_name
    kyc_request.dob = dob
    kyc_request.document_type = document_type
    kyc_request.document_number = document_number
    kyc_request.address = address
    if file_path:
        kyc_request.document_proof_url = file_path
    
    kyc_request.status = "pending"
    kyc_request.submitted_at = datetime.utcnow()
    kyc_request.admin_comments = None # Clear previous rejection comments

    # Update User status as well
    current_user.kyc_status = "pending"

    # Notify Admins
    admins = db.query(User).filter(User.is_admin == "true").all()
    for admin in admins:
        notification = Notification(
            user_id=admin.id,
            title="New KYC Submission",
            message=f"User {current_user.name} ({current_user.email}) has submitted KYC documents for verification.",
            type="alert", # or "info"
            created_at=datetime.utcnow()
        )
        db.add(notification)

    db.commit()
    db.refresh(kyc_request)
    return kyc_request


@router.get("/status", response_model=schemas.KYCResponse)
def get_kyc_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kyc_request = db.query(KYCRequest).filter(KYCRequest.user_id == current_user.id).first()
    if not kyc_request:
        raise HTTPException(status_code=404, detail="KYC details not found")
    return kyc_request


@router.get("/pending", response_model=list[schemas.KYCResponse])
def get_pending_kyc_requests(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    return db.query(KYCRequest).filter(KYCRequest.status == "pending").all()


@router.put("/verify/{user_id}", response_model=schemas.KYCResponse)
def verify_kyc(
    user_id: str,
    update_data: schemas.KYCStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    kyc_request = db.query(models.KYCRequest).filter(models.KYCRequest.user_id == user_id).first()
    if not kyc_request:
        raise HTTPException(status_code=404, detail="KYC request not found")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.status not in ["verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    kyc_request.status = update_data.status
    kyc_request.admin_comments = update_data.admin_comments
    kyc_request.verified_at = datetime.utcnow()

    # Update User model status
    user.kyc_status = update_data.status

    db.commit()
    db.refresh(kyc_request)
    return kyc_request
