
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

from ..database import get_db
from ..models import User, Investment, Transaction
from ..schemas import ReportFileResponse, ReportFileCreate
from ..auth import get_current_user
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
    # In a real app, we would query a Reports table
    # For now, we returns a sample list to demonstrate UI
    
    # Check if we have any files in directory
    files = []
    if UPLOAD_DIR.exists():
        for filename in os.listdir(UPLOAD_DIR):
            file_path = UPLOAD_DIR / filename
            if file_path.is_file():
                stat = file_path.stat()
                files.append(ReportFileResponse(
                    id=file_path.stem,
                    name=filename,
                    type=file_path.suffix.strip('.'),
                    size=stat.st_size,
                    status="ready",
                    uploaded_at=datetime.fromtimestamp(stat.st_ctime)
                ))
    
    # If no files, create a sample report so the user has something to see (and it actually exists)
    if not files:
        sample_filename = "Sample_Portfolio_Report.pdf"
        sample_path = UPLOAD_DIR / sample_filename
        
        # Only create if it doesn't strictly exist (double check)
        if not sample_path.exists():
            # Mock data for sample report
            dummy_user = {"name": "Demo User", "email": "demo@wealthtrack.com"}
            dummy_inv = [
                {"symbol": "AAPL", "asset_type": "Stock", "units": 10, "avg_buy_price": 150.0, "current_value": 1550.0},
                {"symbol": "BTC", "asset_type": "Crypto", "units": 0.5, "avg_buy_price": 30000.0, "current_value": 32000.0}
            ]
            dummy_trans = []
            
            # Generate PDF
            try:
                pdf_buffer = ReportGenerator.generate_portfolio_pdf(dummy_user, dummy_inv, dummy_trans)
                with open(sample_path, "wb") as f:
                    f.write(pdf_buffer.getvalue())
                
                # Add to files list
                stat = sample_path.stat()
                files.append(ReportFileResponse(
                    id=sample_path.stem,
                    name=sample_filename,
                    type="pdf",
                    size=stat.st_size,
                    status="ready",
                    uploaded_at=datetime.fromtimestamp(stat.st_ctime)
                ))
            except Exception as e:
                print(f"Failed to generate sample report: {e}")
                # If generation fails, we just return empty list
                pass
        
    return files

@router.post("/upload", response_model=ReportFileResponse)
async def upload_report(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new report file"""
    # Basic validation
    if file_type not in ["pdf", "csv"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    stored_filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / stored_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return ReportFileResponse(
        id=file_id,
        filename=file.filename,
        file_type=file_type,
        created_at=datetime.utcnow(),
        url=f"/api/reports/download/{file_id}"
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
            "units": trans.units,
            "price": trans.price,
            "date": trans.date.strftime("%Y-%m-%d")
        } for trans in transactions
    ]
    
    user_data = {
        "name": current_user.name,
        "email": current_user.email
    }
    
    # Generate PDF
    pdf_buffer = ReportGenerator.generate_portfolio_pdf(user_data, inv_data, trans_data)
    pdf_buffer.seek(0)
    
    filename = f"portfolio_report_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/download/{filename}")
async def download_report(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Download a report file"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(
        file_path, 
        filename=filename,
        background=None  # Can use background tasks here for cleanup if needed
    )

@router.delete("/{filename}")
async def delete_report(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a report file"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        os.remove(file_path)
        return {"message": "Report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
