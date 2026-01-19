from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import csv
from datetime import datetime
from typing import List, Dict, Any

class ReportGenerator:
    @staticmethod
    def generate_portfolio_pdf(user_data: Dict, investments: List[Dict], transactions: List[Dict]) -> BytesIO:
        """Generate PDF portfolio report"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], alignment=1)
        story.append(Paragraph("Portfolio Report", title_style))
        story.append(Spacer(1, 12))
        
        # User Info
        story.append(Paragraph(f"<b>User:</b> {user_data.get('name', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Email:</b> {user_data.get('email', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Report Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Portfolio Summary
        if investments:
            story.append(Paragraph("<b>Portfolio Holdings</b>", styles['Heading2']))
            
            # Create table data
            table_data = [['Symbol', 'Asset Type', 'Units', 'Avg Price', 'Current Value']]
            total_value = 0
            
            for inv in investments:
                current_val = inv.get('current_value', 0) or 0
                total_value += current_val
                table_data.append([
                    inv.get('symbol', ''),
                    inv.get('asset_type', ''),
                    str(inv.get('units', 0)),
                    f"${inv.get('avg_buy_price', 0):.2f}",
                    f"${current_val:.2f}"
                ])
            
            # Add total row
            table_data.append(['', '', '', 'Total:', f"${total_value:.2f}"])
            
            # Create table
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 12))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def generate_goals_csv(goals: List[Dict]) -> BytesIO:
        """Generate CSV goals report"""
        buffer = BytesIO()
        
        # Convert to text mode for CSV writer
        import io
        text_buffer = io.StringIO()
        
        fieldnames = ['Goal Type', 'Target Amount', 'Target Date', 'Monthly Contribution', 'Status', 'Created At']
        writer = csv.DictWriter(text_buffer, fieldnames=fieldnames)
        
        writer.writeheader()
        for goal in goals:
            writer.writerow({
                'Goal Type': goal.get('goal_type', ''),
                'Target Amount': goal.get('target_amount', 0),
                'Target Date': goal.get('target_date', ''),
                'Monthly Contribution': goal.get('monthly_contribution', 0),
                'Status': goal.get('status', ''),
                'Created At': goal.get('created_at', '')
            })
        
        # Convert back to bytes
        buffer.write(text_buffer.getvalue().encode('utf-8'))
        buffer.seek(0)
        return buffer