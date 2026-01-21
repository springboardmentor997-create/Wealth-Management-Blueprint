from fastapi import APIRouter, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from fastapi.responses import StreamingResponse, Response # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]
from app.database import get_db
from app import models
from app.auth import get_current_user
from app.services.reports import generate_portfolio_report_pdf, generate_portfolio_report_csv
import io

router = APIRouter()

@router.get("/portfolio/pdf")
async def get_portfolio_pdf_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate and download portfolio report as PDF
    """
    try:
        pdf_buffer = generate_portfolio_report_pdf(current_user, db)
        return StreamingResponse(
            io.BytesIO(pdf_buffer),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=portfolio_report_{current_user.id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF report: {str(e)}"
        )

@router.get("/portfolio/csv")
async def get_portfolio_csv_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate and download portfolio report as CSV
    """
    try:
        csv_content = generate_portfolio_report_csv(current_user, db)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=portfolio_report_{current_user.id}.csv"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating CSV report: {str(e)}"
        )

@router.get("/goals/pdf")
async def get_goals_pdf_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate and download goals report as PDF
    """
    try:
        from app.services.reports import generate_goals_report_pdf
        pdf_buffer = generate_goals_report_pdf(current_user, db)
        return StreamingResponse(
            io.BytesIO(pdf_buffer),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=goals_report_{current_user.id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF report: {str(e)}"
        )

