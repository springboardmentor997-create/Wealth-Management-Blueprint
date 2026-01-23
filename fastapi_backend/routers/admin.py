from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import csv
from io import StringIO, BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from database import get_db
from models import User, Goal, Investment, Transaction, KYCRequest
from schemas import User as UserSchema, AdminUserUpdate, CreditUpdate, AdminDashboardData, AdminUserView
from dependencies import get_admin_user
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/users/{user_id}/credits")
async def update_user_credits(
    user_id: str,
    credit_data: CreditUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # action is guaranteed to be "add" or "deduct" by Pydantic
    if credit_data.action == "add":
        user.credits = (user.credits or 0) + credit_data.amount
    elif credit_data.action == "deduct":
        if (user.credits or 0) < credit_data.amount:
            raise HTTPException(status_code=400, detail="Insufficient credits")
        user.credits = (user.credits or 0) - credit_data.amount
        
    db.commit()
    db.refresh(user)
    return {"message": f"Credits {credit_data.action}ed successfully", "new_balance": user.credits}

@router.get("/export")
async def export_data(
    format: str = Query(..., regex="^(csv|pdf)$"),
    type: str = Query(..., regex="^(users|investments)$"),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if type == "users":
        data = db.query(User).all()
        headers = ["ID", "Name", "Email", "Risk Profile", "KYC Status", "Credits", "Password Hash"]
        rows = [[u.id, u.name, u.email, u.risk_profile, u.kyc_status, str(u.credits or 0), u.password] for u in data]
    else:
        data = db.query(Investment).all()
        headers = ["ID", "User ID", "Symbol", "Type", "Units", "Value"]
        rows = [[i.id, i.user_id, i.symbol, i.asset_type, str(i.units), str(i.current_value)] for i in data]

    if format == "csv":
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        writer.writerows(rows)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={type}_export.csv"}
        )
    else:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph(f"{type.capitalize()} Report", styles['Title']))
        
        table_data = [headers] + rows
        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        
        doc.build(elements)
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={type}_export.pdf"}
        )

@router.get("/dashboard", response_model=AdminDashboardData)
async def get_admin_dashboard(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_goals = db.query(Goal).count()
    total_investments = db.query(Investment).count()
    total_transactions = db.query(Transaction).count()
    
    total_goals_completed = db.query(Goal).filter(Goal.status == 'completed').count()
    total_portfolio_value = db.query(func.sum(Investment.current_value)).scalar() or 0.0

    # Gather activities
    # 1. New Users
    all_users = db.query(User).order_by(User.created_at.desc()).all()
    recent_users = all_users[:10]

    user_activities = [
        {
            "id": f"user-{u.id}", 
            "user_id": str(u.id), 
            "user_name": u.name or "Unknown", 
            "action": "User Registered", 
            "category": "auth",
            "details": f"Email: {u.email}", 
            "timestamp": u.created_at
        }
        for u in recent_users
    ]

    # Calculate User Growth (Group by Month)
    user_growth_map = {}
    for u in all_users:
        if u.created_at:
            month_key = u.created_at.strftime("%b %Y") # e.g., "Jan 2024"
            # Sort key for correct ordering
            sort_key = u.created_at.strftime("%Y-%m")
            if sort_key not in user_growth_map:
                user_growth_map[sort_key] = {"month": month_key, "users": 0}
            user_growth_map[sort_key]["users"] += 1
    
    # Sort by date and convert to list
    sorted_months = sorted(user_growth_map.keys())
    user_growth_data = [user_growth_map[k] for k in sorted_months]
    # Accumulate users over time for a "growth" line
    running_total = 0
    for data in user_growth_data:
        running_total += data["users"]
        data["users"] = running_total # Show cumulative users

    # 2. New Goals
    # Fetch recent goals efficiently
    recent_goals = db.query(Goal).order_by(Goal.created_at.desc()).limit(15).all()

    goal_activities = []
    for g in recent_goals:
        user_name = "Unknown"
        if g.user:
            user_name = g.user.name
        elif g.user_id:
             u = db.query(User).filter(User.id == g.user_id).first()
             if u: user_name = u.name

        goal_activities.append({
            "id": f"goal-{g.id}", 
            "user_id": str(g.user_id), 
            "user_name": user_name, 
            "action": "Goal Created", 
            "category": "goal",
            "details": g.title, 
            "timestamp": g.created_at
        })

    # Calculate Goal Performance (Active vs Completed by Month)
    # Re-query all goals for stats calculation (or optimize in future)
    all_goals = db.query(Goal).all()
    goal_perf_map = {}
    for g in all_goals:
        if g.created_at:
            month_key = g.created_at.strftime("%b %Y")
            sort_key = g.created_at.strftime("%Y-%m")
            
            if sort_key not in goal_perf_map:
                goal_perf_map[sort_key] = {"month": month_key, "active": 0, "completed": 0}
            
            status = "completed" if (g.status and g.status.lower() == "completed") else "active"
            goal_perf_map[sort_key][status] += 1
            
    sorted_goal_months = sorted(goal_perf_map.keys())
    goal_performance_data = [goal_perf_map[k] for k in sorted_goal_months]

    # 3. New Transactions
    recent_txns = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(10).all()
    txn_activities = []
    for t in recent_txns:
        user_name = "Unknown"
        if t.user:
            user_name = t.user.name
        elif t.user_id:
             u = db.query(User).filter(User.id == t.user_id).first()
             if u: user_name = u.name

        txn_activities.append({
            "id": f"txn-{t.id}", 
            "user_id": str(t.user_id), 
            "user_name": user_name, 
            "action": "Transaction", 
            "category": "portfolio",
            "details": f"{t.type.upper()} {t.symbol} ({t.quantity})", 
            "timestamp": t.created_at
        })

    # 4. New Investments (Directly added)
    recent_invs = db.query(Investment).order_by(Investment.created_at.desc()).limit(10).all()
    inv_activities = []
    for inv in recent_invs:
        user_name = "Unknown"
        if inv.user:
            user_name = inv.user.name
        elif inv.user_id:
             u = db.query(User).filter(User.id == inv.user_id).first()
             if u: user_name = u.name

        inv_activities.append({
            "id": f"inv-{inv.id}", 
            "user_id": str(inv.user_id), 
            "user_name": user_name, 
            "action": "Investment Added", 
            "category": "portfolio",
            "details": f"{inv.symbol} ({inv.units})", 
            "timestamp": inv.created_at
        })
    
    # 5. KYC Activities
    recent_kyc = db.query(KYCRequest).order_by(KYCRequest.submitted_at.desc()).limit(15).all()
    kyc_activities = []
    for k in recent_kyc:
         user_name = "Unknown"
         if k.user:
             user_name = k.user.name
         elif k.user_id:
             u = db.query(User).filter(User.id == k.user_id).first()
             if u: user_name = u.name
         
         status_label = k.status
         if status_label == 'pending':
             action = "KYC Submitted"
         else:
             action = f"KYC {status_label.title()}"

         kyc_activities.append({
            "id": f"kyc-{k.id}", 
            "user_id": str(k.user_id), 
            "user_name": user_name, 
            "action": action, 
            "category": "auth",
            "details": f"{k.document_type}", 
            "timestamp": k.submitted_at,
            "document_url": k.document_proof_url
        })

    # 6. Combine and Sort
    all_activities = user_activities + goal_activities + txn_activities + inv_activities + kyc_activities
    # Filter out None timestamps if any
    all_activities = [a for a in all_activities if a['timestamp'] is not None]
    all_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Return top 20
    final_activities = all_activities[:20]

    return AdminDashboardData(
        total_users=total_users,
        total_goals=total_goals,
        total_investments=total_investments,
        total_transactions=total_transactions,
        total_goals_completed=total_goals_completed,
        total_portfolio_value=total_portfolio_value,
        recent_activities=final_activities,
        user_growth=user_growth_data,
        goal_performance=goal_performance_data
    )

@router.get("/users", response_model=List[AdminUserView])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        # Manually convert to avoid Pydantic validation issues
        result = []
        for user in users:
            result.append(AdminUserView(
                id=user.id,
                name=user.name,
                email=user.email,
                risk_profile=user.risk_profile or "moderate",
                kyc_status=user.kyc_status or "unverified",
                is_admin=user.is_admin or "false",
                profile_picture=user.profile_picture,
                credits=user.credits or 0.0,
                login_count=user.login_count or 0,
                last_login=user.last_login,
                created_at=user.created_at or datetime.utcnow(),
                password=user.password or ""
            ))
        return result
    except Exception as e:
        import traceback
        print(f"Error in get_all_users: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_data: AdminUserUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = user_data.dict(exclude_unset=True)
    
    # Sync KYC Request status if kyc_status is updated
    if 'kyc_status' in update_dict:
        kyc_req = db.query(KYCRequest).filter(KYCRequest.user_id == user_id).first()
        if kyc_req:
            kyc_req.status = update_dict['kyc_status']
            if update_dict['kyc_status'] == 'verified':
                kyc_req.verified_at = datetime.utcnow()
    
    for key, value in update_dict.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}