from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from io import BytesIO, StringIO  # <--- Added StringIO
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime

# Internal Imports
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.investment import Investment

router = APIRouter(prefix="/reports", tags=["Reports"])

# ---------------------------------------------------------
# 1. EXPORT CSV (✅ FIXED)
# ---------------------------------------------------------
@router.get("/export-csv")
def export_portfolio_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch Data
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    # Use StringIO for text-based CSV writing
    output = StringIO()
    writer = csv.writer(output)
    
    # Write Header
    writer.writerow(["Asset Name", "Category", "Units", "Invested Amount", "Current Value", "Gain/Loss"])
    
    # Write Rows
    for inv in investments:
        gain = inv.current_value - inv.amount_invested
        writer.writerow([
            inv.asset_name, 
            inv.category, 
            inv.units, 
            inv.amount_invested, 
            inv.current_value, 
            gain
        ])
    
    # Get the string content
    csv_content = output.getvalue()
    
    return Response(
        content=csv_content, 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=portfolio_export.csv"}
    )

# ---------------------------------------------------------
# 2. GENERATE PDF SUMMARY (No changes needed here)
# ---------------------------------------------------------
@router.get("/summary-pdf")
def generate_pdf_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    
    # Calculate Totals
    total_invested = sum(i.amount_invested for i in investments)
    total_value = sum(i.current_value for i in investments)
    
    # Create PDF in memory (BytesIO is correct here because PDF is binary)
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # --- HEADER ---
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "Wealth Management Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Generated for: {current_user.email}")
    c.drawString(50, height - 100, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    c.line(50, height - 110, width - 50, height - 110) # Horizontal Line
    
    # --- SUMMARY SECTION ---
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 150, "Financial Summary")
    
    c.setFont("Helvetica", 14)
    c.drawString(50, height - 180, f"Total Net Worth: Rs. {total_value:,.2f}")
    c.drawString(50, height - 200, f"Total Invested:   Rs. {total_invested:,.2f}")
    
    gain = total_value - total_invested
    color = (0, 0.5, 0) if gain >= 0 else (0.8, 0, 0) # Green or Red
    c.setFillColorRGB(*color)
    c.drawString(50, height - 220, f"Total Gain/Loss:  Rs. {gain:,.2f}")
    c.setFillColorRGB(0, 0, 0) # Reset to black
    
    # --- ASSET LIST ---
    y_position = height - 270
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position, "Holdings Breakdown:")
    y_position -= 30
    
    c.setFont("Courier", 10) # Monospace for alignment
    header = f"{'ASSET':<25} {'CATEGORY':<15} {'VALUE (Rs.)':>15}"
    c.drawString(50, y_position, header)
    y_position -= 20
    
    for inv in investments:
        if y_position < 50: # New Page if full
            c.showPage()
            y_position = height - 50
            
        line = f"{inv.asset_name[:20]:<25} {inv.category[:12]:<15} {inv.current_value:>15,.2f}"
        c.drawString(50, y_position, line)
        y_position -= 15

    c.save()
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(), 
        media_type="application/pdf", 
        headers={"Content-Disposition": "attachment; filename=wealth_report.pdf"}
    )