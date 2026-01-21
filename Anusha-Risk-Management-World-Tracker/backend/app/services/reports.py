from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import csv
import io
from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app.models import User, Investment, Goal, Transaction

def generate_portfolio_report_pdf(user: User, db: Session) -> bytes:
    """
    Generate a PDF report of the user's portfolio
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0ea5e9'),
        spaceAfter=30,
    )
    
    # Title
    story.append(Paragraph("Portfolio Report", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Paragraph(f"User: {user.name}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Get investments
    investments = db.query(Investment).filter(Investment.user_id == user.id).all()
    
    if investments:
        # Portfolio Summary
        total_cost = sum(float(inv.cost_basis) for inv in investments)
        total_value = sum(float(inv.current_value) if inv.current_value else float(inv.cost_basis) for inv in investments)
        total_gain = total_value - total_cost
        gain_percent = (total_gain / total_cost * 100) if total_cost > 0 else 0
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Cost Basis', f'${total_cost:,.2f}'],
            ['Total Current Value', f'${total_value:,.2f}'],
            ['Total Gain/Loss', f'${total_gain:,.2f}'],
            ['Gain/Loss %', f'{gain_percent:.2f}%'],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        story.append(Paragraph("Portfolio Summary", styles['Heading2']))
        story.append(summary_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Investments Table
        inv_data = [['Symbol', 'Type', 'Units', 'Cost Basis', 'Current Value', 'Gain/Loss']]
        
        for inv in investments:
            current_val = float(inv.current_value) if inv.current_value else float(inv.cost_basis)
            gain = current_val - float(inv.cost_basis)
            inv_data.append([
                inv.symbol,
                inv.asset_type.value,
                f'{float(inv.units):,.6f}',
                f'${float(inv.cost_basis):,.2f}',
                f'${current_val:,.2f}',
                f'${gain:,.2f}'
            ])
        
        inv_table = Table(inv_data, colWidths=[1*inch, 1*inch, 1*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        inv_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        story.append(Paragraph("Investments", styles['Heading2']))
        story.append(inv_table)
    else:
        story.append(Paragraph("No investments found.", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.read()

def generate_portfolio_report_csv(user: User, db: Session) -> str:
    """
    Generate a CSV report of the user's portfolio
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Portfolio Report'])
    writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow(['User:', user.name])
    writer.writerow([])
    
    # Get investments
    investments = db.query(Investment).filter(Investment.user_id == user.id).all()
    
    if investments:
        # Summary
        total_cost = sum(float(inv.cost_basis) for inv in investments)
        total_value = sum(float(inv.current_value) if inv.current_value else float(inv.cost_basis) for inv in investments)
        total_gain = total_value - total_cost
        
        writer.writerow(['Portfolio Summary'])
        writer.writerow(['Total Cost Basis', f'${total_cost:,.2f}'])
        writer.writerow(['Total Current Value', f'${total_value:,.2f}'])
        writer.writerow(['Total Gain/Loss', f'${total_gain:,.2f}'])
        writer.writerow([])
        
        # Investments
        writer.writerow(['Investments'])
        writer.writerow(['Symbol', 'Type', 'Units', 'Cost Basis', 'Current Value', 'Gain/Loss'])
        
        for inv in investments:
            current_val = float(inv.current_value) if inv.current_value else float(inv.cost_basis)
            gain = current_val - float(inv.cost_basis)
            writer.writerow([
                inv.symbol,
                inv.asset_type.value,
                f'{float(inv.units):,.6f}',
                f'${float(inv.cost_basis):,.2f}',
                f'${current_val:,.2f}',
                f'${gain:,.2f}'
            ])
    
    return output.getvalue()

def generate_goals_report_pdf(user: User, db: Session) -> bytes:
    """
    Generate a PDF report of the user's goals
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0ea5e9'),
        spaceAfter=30,
    )
    
    # Title
    story.append(Paragraph("Goals Report", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Paragraph(f"User: {user.name}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Get goals
    goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    
    if goals:
        goals_data = [['Type', 'Target Amount', 'Target Date', 'Monthly Contribution', 'Status']]
        
        for goal in goals:
            goals_data.append([
                goal.goal_type.value,
                f'${float(goal.target_amount):,.2f}',
                goal.target_date.strftime('%Y-%m-%d'),
                f'${float(goal.monthly_contribution):,.2f}',
                goal.status.value
            ])
        
        goals_table = Table(goals_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch, 1*inch])
        goals_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        story.append(goals_table)
    else:
        story.append(Paragraph("No goals found.", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.read()

