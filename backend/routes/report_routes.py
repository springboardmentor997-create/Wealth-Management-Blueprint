from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from core.database import get_session
from models.goal import Goal
from models.investment import Investment
from models.watchlist import Watchlist
from core.security import get_current_user
from models.user import User
import io, csv
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])


def _generate_investments_csv(investments: list[Investment]) -> io.StringIO:
    sio = io.StringIO()
    writer = csv.writer(sio)
    writer.writerow(["id", "symbol", "asset_type", "units", "avg_buy_price", "cost_basis", "current_value", "last_price", "created_at"])
    for inv in investments:
        writer.writerow([
            inv.id,
            inv.symbol,
            inv.asset_type,
            str(inv.units) if getattr(inv, "units", None) is not None else "",
            str(inv.avg_buy_price) if getattr(inv, "avg_buy_price", None) is not None else "",
            str(inv.cost_basis) if getattr(inv, "cost_basis", None) is not None else "",
            str(inv.current_value) if getattr(inv, "current_value", None) is not None else "",
            str(inv.last_price) if getattr(inv, "last_price", None) is not None else "",
            getattr(inv, "created_at").isoformat() if getattr(inv, "created_at", None) is not None else "",
        ])
    sio.seek(0)
    return sio


def _generate_goals_csv(goals: list[Goal]) -> io.StringIO:
    sio = io.StringIO()
    writer = csv.writer(sio)
    writer.writerow(["id", "goal_type", "target_amount", "target_date", "monthly_contribution", "status", "created_at", "updated_at"])
    for g in goals:
        writer.writerow([
            g.id,
            g.goal_type,
            str(g.target_amount) if getattr(g, "target_amount", None) is not None else "",
            getattr(g, "target_date", ""),
            str(g.monthly_contribution) if getattr(g, "monthly_contribution", None) is not None else "",
            g.status,
            getattr(g, "created_at").isoformat() if getattr(g, "created_at", None) is not None else "",
            getattr(g, "updated_at").isoformat() if getattr(g, "updated_at", None) is not None else "",
        ])
    sio.seek(0)
    return sio


def _generate_investments_pdf(investments: list[Investment]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=0.3*inch,
    )
    elements.append(Paragraph("Portfolio Report", title_style))
    
    data = [["ID", "Symbol", "Type", "Units", "Avg Price", "Cost Basis", "Current Value", "Last Price"]]
    for inv in investments:
        data.append([
            str(inv.id),
            inv.symbol,
            inv.asset_type,
            str(inv.units or ""),
            str(inv.avg_buy_price or ""),
            str(inv.cost_basis or ""),
            str(inv.current_value or ""),
            str(inv.last_price or ""),
        ])
    
    table = Table(data, colWidths=[0.6*inch, 0.8*inch, 0.7*inch, 0.7*inch, 0.75*inch, 0.8*inch, 0.9*inch, 0.8*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def _generate_goals_pdf(goals: list[Goal]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=0.3*inch,
    )
    elements.append(Paragraph("Goals Report", title_style))
    
    data = [["ID", "Type", "Target", "Target Date", "Monthly Contribution", "Status"]]
    for g in goals:
        data.append([
            str(g.id),
            g.goal_type,
            str(g.target_amount or ""),
            str(g.target_date or ""),
            str(g.monthly_contribution or ""),
            g.status,
        ])
    
    table = Table(data, colWidths=[0.6*inch, 0.9*inch, 0.9*inch, 1.0*inch, 1.2*inch, 0.8*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


@router.get("/portfolio/export")
def export_portfolio(format: str = Query("csv", pattern="^(csv|pdf)$"), current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    investments = session.exec(select(Investment).where(Investment.user_id == current_user.id)).all()
    if format == "csv":
        sio = _generate_investments_csv(investments)
        data = sio.getvalue().encode("utf-8")
        headers = {"Content-Disposition": "attachment; filename=portfolio.csv"}
        return StreamingResponse(iter([data]), media_type="text/csv", headers=headers)
    else:
        data = _generate_investments_pdf(investments)
        headers = {"Content-Disposition": "attachment; filename=portfolio.pdf"}
        return StreamingResponse(iter([data]), media_type="application/pdf", headers=headers)


@router.get("/goals/export")
def export_goals(format: str = Query("csv", pattern="^(csv|pdf)$"), current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    goals = session.exec(select(Goal).where(Goal.user_id == current_user.id)).all()
    if format == "csv":
        sio = _generate_goals_csv(goals)
        data = sio.getvalue().encode("utf-8")
        headers = {"Content-Disposition": "attachment; filename=goals.csv"}
        return StreamingResponse(iter([data]), media_type="text/csv", headers=headers)
    else:
        data = _generate_goals_pdf(goals)
        headers = {"Content-Disposition": "attachment; filename=goals.pdf"}
        return StreamingResponse(iter([data]), media_type="application/pdf", headers=headers)

# ===================== COMPREHENSIVE REPORTS WITH INSIGHTS =====================

def _get_report_data_internal(
    user: User,
    investments: list[Investment],
    goals: list[Goal],
    watchlist: list[Watchlist]
) -> dict:
    """Core logic to generate report data and insights"""
    
    # Portfolio Summary
    total_invested = sum(inv.quantity * inv.purchase_price for inv in investments)
    total_current = sum(inv.current_value or inv.quantity * inv.purchase_price for inv in investments)
    gain_loss = total_current - total_invested
    gain_loss_percent = (gain_loss / total_invested * 100) if total_invested > 0 else 0
    
    # Asset Allocation
    asset_allocation = {}
    for inv in investments:
        asset_type = inv.asset_type or "Stock"
        # Using current value for allocation if available, else cost
        val = inv.current_value if inv.current_value else (inv.quantity * inv.purchase_price)
        asset_allocation[asset_type] = asset_allocation.get(asset_type, 0) + float(val)

    # Convert to list for frontend
    allocation_list = [{"name": k, "value": round(v, 2)} for k, v in asset_allocation.items()]
    
    # Recommendations & Insights
    recommendations = []
    
    # Risk profile based
    if user.risk_profile == "aggressive":
        recommendations.append("Your aggressive risk profile suggests focusing on growth stocks and emerging markets.")
        recommendations.append("Consider maintaining 60% stocks, 20% crypto, 15% ETFs, and 5% bonds.")
    elif user.risk_profile == "moderate":
        recommendations.append("Your moderate risk profile suggests a balanced approach.")
        recommendations.append("Consider maintaining 40% stocks, 30% ETFs, 15% bonds, 10% crypto, and 5% cash.")
    else:
        recommendations.append("Your conservative risk profile suggests prioritizing capital preservation.")
        recommendations.append("Consider maintaining 20% stocks, 40% bonds, 25% ETFs, 5% crypto, and 10% cash.")
    
    # Watchlist insights
    if watchlist:
        gainers = sum(1 for w in watchlist if w.current_price > w.price_at_added)
        recommendations.append(f"Your watchlist has {gainers} out of {len(watchlist)} items in gains. Monitor closely for profit-taking opportunities.")
    
    # Goals insights
    if goals:
        active = sum(1 for g in goals if g.status == "active")
        recommendations.append(f"You have {active} active goal(s). Ensure regular contributions to stay on track.")
    
    # Diversification insights
    if len(asset_allocation) < 3:
        recommendations.append("Consider diversifying across more asset classes (Stocks, Bonds, ETFs, Crypto) for reduced risk.")
    else:
        recommendations.append(f"Great job! Your portfolio is well-diversified across {len(asset_allocation)} asset classes.")

    return {
        "summary": {
            "total_invested": round(total_invested, 2),
            "total_current": round(total_current, 2),
            "gain_loss": round(gain_loss, 2),
            "gain_loss_percent": round(gain_loss_percent, 2),
            "holdings_count": len(investments)
        },
        "asset_allocation": allocation_list,
        "recommendations": recommendations
    }

@router.get("/comprehensive/summary")
def get_comprehensive_summary(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get live data for the reports dashboard"""
    user = session.get(User, current_user.id)
    if not user:
        return {"error": "User not found"}
        
    investments = session.exec(select(Investment).where(Investment.user_id == current_user.id)).all()
    goals = session.exec(select(Goal).where(Goal.user_id == current_user.id)).all()
    try:
        watchlist = session.exec(select(Watchlist).where(Watchlist.user_id == current_user.id)).all()
    except:
        watchlist = []
        
    return _get_report_data_internal(user, investments, goals, watchlist)


def _generate_comprehensive_report_pdf(
    user: User,
    investments: list[Investment],
    goals: list[Goal],
    watchlist: list[Watchlist],
    session: Session
) -> bytes:
    """Generate comprehensive PDF report with insights and recommendations"""

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=6,
        alignment=1,
    )
    elements.append(Paragraph(f"📊 Wealth Manager Comprehensive Report", title_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 0.2*inch))
    
    # User Info Section
    elements.append(Paragraph("USER INFORMATION", styles['Heading2']))
    user_data = [
        ["User Email", user.email or "N/A"],
        ["Risk Profile", (user.risk_profile or "Not Set").capitalize()],
        ["Account Created", user.created_at.strftime('%Y-%m-%d') if user.created_at else "N/A"],
    ]
    table = Table(user_data, colWidths=[2*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1F2937')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Portfolio Summary
    elements.append(Paragraph("PORTFOLIO SUMMARY", styles['Heading2']))
    
    total_invested = sum(inv.quantity * inv.purchase_price for inv in investments)
    total_current = sum(inv.current_value or inv.quantity * inv.purchase_price for inv in investments)
    gain_loss = total_current - total_invested
    gain_loss_percent = (gain_loss / total_invested * 100) if total_invested > 0 else 0
    
    portfolio_data = [
        ["Total Invested", f"${total_invested:,.2f}"],
        ["Current Value", f"${total_current:,.2f}"],
        ["Gain/Loss", f"${gain_loss:,.2f} ({gain_loss_percent:.2f}%)"],
        ["Number of Holdings", str(len(investments))],
    ]
    table = Table(portfolio_data, colWidths=[2*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#DBEAFE')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1E40AF')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Holdings
    if investments:
        elements.append(Paragraph("CURRENT HOLDINGS", styles['Heading2']))
        holdings_data = [["Symbol", "Asset Type", "Quantity", "Avg Price", "Current Value"]]
        for inv in investments[:10]:  # Limit to first 10
            holdings_data.append([
                inv.symbol,
                inv.asset_type or "Stock",
                str(inv.quantity),
                f"${inv.purchase_price:.2f}",
                f"${(inv.quantity * inv.purchase_price):.2f}",
            ])
        table = Table(holdings_data, colWidths=[1*inch, 1.2*inch, 0.8*inch, 1*inch, 1.2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 0.2*inch))
    
    # Goals Summary
    if goals:
        elements.append(Paragraph("ACTIVE GOALS", styles['Heading2']))
        goals_data = [["Goal Type", "Target Amount", "Target Date", "Status"]]
        for goal in goals[:10]:
            goals_data.append([
                goal.goal_type or "N/A",
                f"${goal.target_amount:,.0f}" if goal.target_amount else "N/A",
                goal.target_date or "N/A",
                goal.status.capitalize(),
            ])
        table = Table(goals_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 0.2*inch))
    
    # Watchlist Summary
    if watchlist:
        elements.append(Paragraph("WATCHLIST MONITORING", styles['Heading2']))
        watchlist_data = [["Symbol", "Current Price", "Added Price", "Change %", "Sector"]]
        for item in watchlist[:10]:
            change_pct = ((item.current_price - item.price_at_added) / item.price_at_added * 100) if item.price_at_added > 0 else 0
            watchlist_data.append([
                item.symbol,
                f"${item.current_price:.2f}",
                f"${item.price_at_added:.2f}",
                f"{change_pct:+.2f}%",
                item.sector or "N/A",
            ])
        table = Table(watchlist_data, colWidths=[1*inch, 1.2*inch, 1.2*inch, 1*inch, 1.1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightyellow),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 0.2*inch))
    
    # Recommendations
    elements.append(PageBreak())
    elements.append(Paragraph("PERSONALIZED RECOMMENDATIONS", styles['Heading2']))
    
    recommendations = []
    
    # Risk profile based recommendations
    if user.risk_profile == "aggressive":
        recommendations.append("• Your aggressive risk profile suggests focusing on growth stocks and emerging markets.")
        recommendations.append("• Consider maintaining 60% stocks, 20% crypto, 15% ETFs, and 5% bonds.")
    elif user.risk_profile == "moderate":
        recommendations.append("• Your moderate risk profile suggests a balanced approach.")
        recommendations.append("• Consider maintaining 40% stocks, 30% ETFs, 15% bonds, 10% crypto, and 5% cash.")
    else:
        recommendations.append("• Your conservative risk profile suggests prioritizing capital preservation.")
        recommendations.append("• Consider maintaining 20% stocks, 40% bonds, 25% ETFs, 5% crypto, and 10% cash.")
    
    # Watchlist insights
    if watchlist:
        gainers = sum(1 for w in watchlist if w.current_price > w.price_at_added)
        recommendations.append(f"• Your watchlist has {gainers} out of {len(watchlist)} items in gains. Monitor closely for profit-taking opportunities.")
    
    # Goals insights
    if goals:
        active = sum(1 for g in goals if g.status == "active")
        recommendations.append(f"• You have {active} active goal(s). Ensure regular contributions to stay on track.")
    
    # Diversification insights
    asset_types = {}
    for inv in investments:
        asset_type = inv.asset_type or "Stock"
        asset_types[asset_type] = asset_types.get(asset_type, 0) + inv.quantity * inv.purchase_price
    
    if len(asset_types) < 3:
        recommendations.append("• Consider diversifying across more asset classes for reduced risk.")
    else:
        recommendations.append(f"• Your portfolio is well-diversified across {len(asset_types)} asset classes.")
    
    for rec in recommendations:
        elements.append(Paragraph(rec, styles['Normal']))
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Footer
    footer_text = "This report is generated automatically. For financial advice, consult a licensed advisor."
    elements.append(Paragraph(footer_text, styles['Normal']))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def _generate_comprehensive_report_csv(
    user: User,
    investments: list[Investment],
    goals: list[Goal],
    watchlist: list[Watchlist],
) -> io.StringIO:
    """Generate comprehensive CSV report"""
    sio = io.StringIO()
    writer = csv.writer(sio)
    
    # User Section
    writer.writerow(["WEALTH MANAGER COMPREHENSIVE REPORT"])
    writer.writerow([f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"])
    writer.writerow([])
    
    # User Info
    writer.writerow(["USER INFORMATION"])
    writer.writerow(["Email", user.email or "N/A"])
    writer.writerow(["Risk Profile", user.risk_profile or "Not Set"])
    writer.writerow(["Account Created", user.created_at.strftime('%Y-%m-%d') if user.created_at else "N/A"])
    writer.writerow([])
    
    # Portfolio Summary
    writer.writerow(["PORTFOLIO SUMMARY"])
    total_invested = sum(inv.quantity * inv.purchase_price for inv in investments)
    total_current = sum(inv.current_value or inv.quantity * inv.purchase_price for inv in investments)
    gain_loss = total_current - total_invested
    gain_loss_percent = (gain_loss / total_invested * 100) if total_invested > 0 else 0
    writer.writerow(["Total Invested", f"${total_invested:,.2f}"])
    writer.writerow(["Current Value", f"${total_current:,.2f}"])
    writer.writerow(["Gain/Loss", f"${gain_loss:,.2f} ({gain_loss_percent:.2f}%)"])
    writer.writerow(["Holdings Count", len(investments)])
    writer.writerow([])
    
    # Holdings
    if investments:
        writer.writerow(["CURRENT HOLDINGS"])
        writer.writerow(["Symbol", "Asset Type", "Quantity", "Avg Price", "Current Value"])
        for inv in investments:
            writer.writerow([
                inv.symbol,
                inv.asset_type or "Stock",
                inv.quantity,
                f"${inv.purchase_price:.2f}",
                f"${(inv.quantity * inv.purchase_price):.2f}",
            ])
        writer.writerow([])
    
    # Goals
    if goals:
        writer.writerow(["ACTIVE GOALS"])
        writer.writerow(["Goal Type", "Target Amount", "Target Date", "Status"])
        for goal in goals:
            writer.writerow([
                goal.goal_type or "N/A",
                f"${goal.target_amount:,.0f}" if goal.target_amount else "N/A",
                goal.target_date or "N/A",
                goal.status,
            ])
        writer.writerow([])
    
    # Watchlist
    if watchlist:
        writer.writerow(["WATCHLIST"])
        writer.writerow(["Symbol", "Current Price", "Added Price", "Change %", "Sector"])
        for item in watchlist:
            change_pct = ((item.current_price - item.price_at_added) / item.price_at_added * 100) if item.price_at_added > 0 else 0
            writer.writerow([
                item.symbol,
                f"${item.current_price:.2f}",
                f"${item.price_at_added:.2f}",
                f"{change_pct:+.2f}%",
                item.sector or "N/A",
            ])
    
    sio.seek(0)
    return sio


@router.get("/comprehensive/export")
def export_comprehensive_report(
    format: str = Query("pdf", pattern="^(csv|pdf)$"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Export comprehensive report with portfolio, goals, watchlist, and recommendations"""
    
    user = session.get(User, current_user.id)
    if not user:
        return {"error": "User not found"}
    
    investments = session.exec(select(Investment).where(Investment.user_id == current_user.id)).all()
    goals = session.exec(select(Goal).where(Goal.user_id == current_user.id)).all()
    
    try:
        watchlist = session.exec(select(Watchlist).where(Watchlist.user_id == current_user.id)).all()
    except:
        watchlist = []
    
    if format == "csv":
        sio = _generate_comprehensive_report_csv(user, investments, goals, watchlist)
        data = sio.getvalue().encode("utf-8")
        headers = {"Content-Disposition": "attachment; filename=wealth-manager-report.csv"}
        return StreamingResponse(iter([data]), media_type="text/csv", headers=headers)
    else:
        data = _generate_comprehensive_report_pdf(user, investments, goals, watchlist, session)
        headers = {"Content-Disposition": "attachment; filename=wealth-manager-report.pdf"}
        return StreamingResponse(iter([data]), media_type="application/pdf", headers=headers)