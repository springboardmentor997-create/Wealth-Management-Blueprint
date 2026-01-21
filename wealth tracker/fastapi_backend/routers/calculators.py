from fastapi import APIRouter, Depends
from calculators import FinancialCalculators
from pydantic import BaseModel

router = APIRouter(prefix="/api/calculators", tags=["calculators"])

class SIPRequest(BaseModel):
    monthly_investment: float
    annual_return: float
    years: int

class RetirementRequest(BaseModel):
    current_age: int
    retirement_age: int
    monthly_savings: float
    annual_return: float
    current_corpus: float = 0

class LoanRequest(BaseModel):
    principal: float
    annual_rate: float
    tenure_years: int

@router.post("/sip")
async def calculate_sip(request: SIPRequest):
    """Calculate SIP returns"""
    return FinancialCalculators.sip_calculator(
        request.monthly_investment,
        request.annual_return,
        request.years
    )

@router.post("/retirement")
async def calculate_retirement(request: RetirementRequest):
    """Calculate retirement corpus"""
    return FinancialCalculators.retirement_calculator(
        request.current_age,
        request.retirement_age,
        request.monthly_savings,
        request.annual_return,
        request.current_corpus
    )

@router.post("/loan-emi")
async def calculate_loan_emi(request: LoanRequest):
    """Calculate loan EMI"""
    return FinancialCalculators.loan_emi_calculator(
        request.principal,
        request.annual_rate,
        request.tenure_years
    )