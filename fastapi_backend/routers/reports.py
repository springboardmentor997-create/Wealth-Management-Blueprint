
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import os
import shutil
from pathlib import Path
from io import BytesIO

from database import get_db
from models import User, Investment, Transaction, Report
from schemas import ReportFileResponse, ReportFileCreate
from auth import get_current_user
from report_generator import ReportGenerator

router = APIRouter(prefix="/api/reports", tags=["reports"])

# Configure upload directory
UPLOAD_DIR = Path("uploads/reports")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/", response_model=List[ReportFileResponse])
async def get_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all reports for the current user"""
    # Query database for user's reports
    db_reports = db.query(Report).filter(Report.user_id == current_user.id).all()
    
    files = []
    for report in db_reports:
        # Verify file exists on disk, if not, maybe skip or mark as missing
        file_path = UPLOAD_DIR / report.file_path
        status = "ready"
        size = report.size
        
        if not file_path.exists():
            status = "error"
            
        files.append(ReportFileResponse(
            id=report.id,
            name=report.name,
            type=report.type,
            size=size,
            status=status,
            uploaded_at=report.created_at
        ))
        
    return files

@router.post("/upload", response_model=ReportFileResponse)
async def upload_report(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new report file"""
    if file_type not in ["pdf", "csv"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    stored_filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / stored_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # Save to Database
    new_report = Report(
        id=file_id,
        user_id=current_user.id,
        name=file.filename,
        file_path=stored_filename,
        type=file_type,
        size=file_size,
        created_at=datetime.utcnow()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
        
    return ReportFileResponse(
        id=new_report.id,
        name=new_report.name,
        type=new_report.type,
        size=new_report.size,
        status="ready",
        uploaded_at=new_report.created_at
    )

@router.get("/generate/portfolio")
async def generate_portfolio_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and download portfolio PDF report"""
    # Fetch data
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    
    # Convert to dicts for generator
    inv_data = [
        {
            "symbol": inv.symbol,
            "asset_type": inv.asset_type,
            "units": inv.units,
            "avg_buy_price": inv.avg_buy_price,
            "current_value": inv.current_value
        } for inv in investments
    ]
    
    trans_data = [
        {
            "type": trans.type,
            "symbol": trans.symbol,
            "units": trans.quantity,  # Transaction uses 'quantity', not 'units'
            "price": trans.price,
            "date": (trans.executed_at or trans.created_at).strftime("%Y-%m-%d") if (trans.executed_at or trans.created_at) else "N/A"
        } for trans in transactions
    ]
    
    user_data = {
        "name": current_user.name,
        "email": current_user.email
    }
    
    # Generate PDF
    pdf_buffer = ReportGenerator.generate_portfolio_pdf(user_data, inv_data, trans_data)
    
    # Save to disk as a tracked report
    file_id = str(uuid.uuid4())
    filename = f"Portfolio_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    stored_filename = f"{file_id}.pdf"
    file_path = UPLOAD_DIR / stored_filename
    
    with open(file_path, "wb") as f:
        f.write(pdf_buffer.getvalue())
    file_size = os.path.getsize(file_path)
    
    # Save to DB
    new_report = Report(
        id=file_id,
        user_id=current_user.id,
        name=filename,
        file_path=stored_filename,
        type="pdf",
        size=file_size,
        created_at=datetime.utcnow()
    )
    db.add(new_report)
    db.commit()

    # Reset buffer position for streaming
    pdf_buffer.seek(0)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/download/{report_id}")
async def download_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a specific report"""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    file_path = UPLOAD_DIR / report.file_path
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(
        path=file_path,
        filename=report.name,
        media_type=f"application/{report.type}"
    )

@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a report"""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Delete from disk
    file_path = UPLOAD_DIR / report.file_path
    if file_path.exists():
        os.remove(file_path)
        
    # Delete from DB
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}
