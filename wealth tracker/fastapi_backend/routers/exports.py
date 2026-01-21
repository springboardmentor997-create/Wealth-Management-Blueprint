from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import csv
import io
from datetime import datetime

from database import get_db
from models import User, Goal, Investment, Transaction
from auth import get_current_user

router = APIRouter(prefix="/api/exports", tags=["exports"])

class ReportGenerator:
    @staticmethod
    def generate_portfolio_pdf(user: User, goals: list, investments: list, transactions: list) -> bytes:
        """Generate PDF portfolio report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph(f"Portfolio Report - {user.name}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # User Info
        user_info = Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal'])
        story.append(user_info)
        story.append(Spacer(1, 12))
        
        # Goals Summary
        goals_title = Paragraph("Financial Goals", styles['Heading2'])
        story.append(goals_title)
        
        if goals:
            goals_data = [['Goal', 'Type', 'Target', 'Current', 'Progress']]
            for goal in goals:
                progress = f"{(goal.current_amount / goal.target_amount * 100):.1f}%"
                goals_data.append([
                    goal.title,
                    goal.goal_type,
                    f"${goal.target_amount:,.2f}",
                    f"${goal.current_amount:,.2f}",
                    progress
                ])
            
            goals_table = Table(goals_data)
            goals_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(goals_table)
        else:
            story.append(Paragraph("No goals found", styles['Normal']))
        
        story.append(Spacer(1, 12))
        
        # Investments Summary
        investments_title = Paragraph("Investments", styles['Heading2'])
        story.append(investments_title)
        
        if investments:
            inv_data = [['Symbol', 'Type', 'Units', 'Avg Price', 'Current Value']]
            for inv in investments:
                inv_data.append([
                    inv.symbol,
                    inv.asset_type,
                    f"{inv.units:.2f}",
                    f"${inv.avg_buy_price:.2f}",
                    f"${inv.current_value or 0:.2f}"
                ])
            
            inv_table = Table(inv_data)
            inv_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(inv_table)
        else:
            story.append(Paragraph("No investments found", styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def generate_portfolio_csv(goals: list, investments: list, transactions: list) -> str:
        """Generate CSV portfolio report"""
        
        output = io.StringIO()
        
        # Goals section
        output.write("FINANCIAL GOALS\n")
        output.write("Title,Type,Target Amount,Current Amount,Monthly Contribution,Target Date,Status\n")
        
        for goal in goals:
            writer = csv.writer(output)
            writer.writerow([
                goal.title,
                goal.goal_type,
                goal.target_amount,
                goal.current_amount,
                goal.monthly_contribution,
                goal.target_date,
                goal.status
            ])
        
        output.write("\n\nINVESTMENTS\n")
        output.write("Symbol,Asset Type,Units,Average Buy Price,Current Value\n")
        
        for inv in investments:
            writer = csv.writer(output)
            writer.writerow([
                inv.symbol,
                inv.asset_type,
                inv.units,
                inv.avg_buy_price,
                inv.current_value or 0
            ])
        
        output.write("\n\nTRANSACTIONS\n")
        output.write("Symbol,Type,Quantity,Price,Executed At\n")
        
        for txn in transactions[-50:]:  # Last 50 transactions
            writer = csv.writer(output)
            writer.writerow([
                txn.symbol,
                txn.type,
                txn.quantity,
                txn.price,
                txn.executed_at
            ])
        
        return output.getvalue()

@router.get("/portfolio/pdf")
async def export_portfolio_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export portfolio as PDF"""
    
    try:
        # Fetch user data
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
        transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).limit(50).all()
        
        # Generate PDF
        pdf_content = ReportGenerator.generate_portfolio_pdf(current_user, goals, investments, transactions)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=portfolio_report_{datetime.now().strftime('%Y%m%d')}.pdf"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.get("/portfolio/csv")
async def export_portfolio_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export portfolio as CSV"""
    
    try:
        # Fetch user data
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
        transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).limit(50).all()
        
        # Generate CSV
        csv_content = ReportGenerator.generate_portfolio_csv(goals, investments, transactions)
        
        # Return as streaming response
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=portfolio_report_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV generation failed: {str(e)}")

@router.get("/goals/csv")
async def export_goals_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export goals as CSV"""
    
    try:
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Title', 'Type', 'Target Amount', 'Current Amount', 
            'Monthly Contribution', 'Target Date', 'Status', 'Progress %'
        ])
        
        # Data
        for goal in goals:
            progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
            writer.writerow([
                goal.title,
                goal.goal_type,
                goal.target_amount,
                goal.current_amount,
                goal.monthly_contribution,
                goal.target_date,
                goal.status,
                f"{progress:.2f}%"
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.StringIO(output.getvalue()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=goals_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Goals CSV export failed: {str(e)}")