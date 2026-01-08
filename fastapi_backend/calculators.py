class FinancialCalculators:
    @staticmethod
    def sip_calculator(monthly_investment: float, annual_return: float, years: int):
        """Calculate SIP returns"""
        monthly_rate = annual_return / 12 / 100
        months = years * 12
        
        if monthly_rate == 0:
            future_value = monthly_investment * months
        else:
            future_value = monthly_investment * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
        
        total_investment = monthly_investment * months
        returns = future_value - total_investment
        
        return {
            "future_value": round(future_value, 2),
            "total_investment": round(total_investment, 2),
            "returns": round(returns, 2),
            "return_percentage": round((returns / total_investment) * 100, 2)
        }
    
    @staticmethod
    def retirement_calculator(current_age: int, retirement_age: int, monthly_savings: float, annual_return: float, current_corpus: float = 0):
        """Calculate retirement corpus"""
        years_to_retirement = retirement_age - current_age
        
        # Future value of current corpus
        future_current_corpus = current_corpus * ((1 + annual_return / 100) ** years_to_retirement)
        
        # Future value of monthly savings
        sip_result = FinancialCalculators.sip_calculator(monthly_savings, annual_return, years_to_retirement)
        
        total_corpus = future_current_corpus + sip_result["future_value"]
        
        return {
            "total_corpus": round(total_corpus, 2),
            "current_corpus_future_value": round(future_current_corpus, 2),
            "savings_future_value": round(sip_result["future_value"], 2),
            "years_to_retirement": years_to_retirement
        }
    
    @staticmethod
    def loan_emi_calculator(principal: float, annual_rate: float, tenure_years: int):
        """Calculate loan EMI"""
        monthly_rate = annual_rate / 12 / 100
        months = tenure_years * 12
        
        if monthly_rate == 0:
            emi = principal / months
        else:
            emi = principal * monthly_rate * ((1 + monthly_rate) ** months) / (((1 + monthly_rate) ** months) - 1)
        
        total_payment = emi * months
        total_interest = total_payment - principal
        
        return {
            "emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "principal": round(principal, 2)
        }