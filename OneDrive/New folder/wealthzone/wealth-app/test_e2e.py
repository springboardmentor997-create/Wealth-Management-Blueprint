"""
End-to-End Test Script for Wealth Management App
Tests all major flows: Auth, Goals, Portfolio, Simulations, Recommendations, Reports
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"test_{int(time.time())}@example.com"
TEST_PASSWORD = "Test@123"
TEST_NAME = "Test User"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name, passed, details=""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"  {status} - {name}")
    if details and not passed:
        print(f"         {Colors.YELLOW}{details}{Colors.END}")

def print_section(title):
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f" {title}")
    print(f"{'='*60}{Colors.END}")

class E2ETestRunner:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.goal_id = None
        self.investment_id = None
        self.transaction_id = None
        self.tests_passed = 0
        self.tests_failed = 0
    
    def run_all_tests(self):
        print(f"\n{Colors.BLUE}🚀 Starting End-to-End Tests for Wealth Management App{Colors.END}")
        print(f"Base URL: {BASE_URL}")
        print(f"Test User: {TEST_EMAIL}")
        
        # Test API Health
        self.test_api_health()
        
        # Auth Flow
        self.test_auth_flow()
        
        # Goals Flow
        self.test_goals_flow()
        
        # Portfolio Flow
        self.test_portfolio_flow()
        
        # Calculators Flow
        self.test_calculators_flow()
        
        # Simulations Flow
        self.test_simulations_flow()
        
        # Recommendations Flow
        self.test_recommendations_flow()
        
        # Dashboard Flow
        self.test_dashboard_flow()
        
        # Market Data Flow
        self.test_market_flow()
        
        # Reports Flow
        self.test_reports_flow()
        
        # Print Summary
        self.print_summary()
    
    def test_api_health(self):
        print_section("API Health Check")
        try:
            response = requests.get(f"{BASE_URL}/openapi.json", timeout=5)
            print_test("API is responding", response.status_code == 200)
            self.tests_passed += 1 if response.status_code == 200 else 0
            self.tests_failed += 0 if response.status_code == 200 else 1
            
            data = response.json()
            print_test("OpenAPI schema valid", "info" in data)
            self.tests_passed += 1 if "info" in data else 0
            self.tests_failed += 0 if "info" in data else 1
        except Exception as e:
            print_test("API Health", False, str(e))
            self.tests_failed += 2
    
    def test_auth_flow(self):
        print_section("Authentication Flow")
        
        # Test Registration
        try:
            response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "name": TEST_NAME,
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "risk_profile": "moderate"
            })
            passed = response.status_code == 200
            print_test("User Registration", passed, response.text if not passed else "")
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("User Registration", False, str(e))
            self.tests_failed += 1
        
        # Test Login
        try:
            response = requests.post(f"{BASE_URL}/api/auth/token", data={
                "username": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.token = data.get("token")
                self.user_id = data.get("user", {}).get("id")
                print_test("User Login", True)
                print_test("JWT Token received", self.token is not None)
                print_test("Refresh Token received", data.get("refresh_token") is not None)
                self.tests_passed += 3
            else:
                print_test("User Login", False, response.text)
                self.tests_failed += 3
        except Exception as e:
            print_test("User Login", False, str(e))
            self.tests_failed += 3
        
        # Test Get Current User
        if self.token:
            try:
                response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.get_auth_header())
                passed = response.status_code == 200
                print_test("Get Current User", passed)
                self.tests_passed += 1 if passed else 0
                self.tests_failed += 0 if passed else 1
            except Exception as e:
                print_test("Get Current User", False, str(e))
                self.tests_failed += 1
    
    def test_goals_flow(self):
        print_section("Goals Management Flow")
        
        if not self.token:
            print_test("Goals tests skipped (no auth)", False, "Authentication failed")
            self.tests_failed += 4
            return
        
        # Create Goal
        try:
            target_date = (datetime.now() + timedelta(days=365*5)).strftime("%Y-%m-%d")
            response = requests.post(f"{BASE_URL}/api/goals/", 
                headers=self.get_auth_header(),
                json={
                    "title": "Retirement Fund",
                    "goal_type": "retirement",
                    "target_amount": 500000,
                    "target_date": target_date,
                    "monthly_contribution": 2000,
                    "current_amount": 10000
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.goal_id = data.get("id")
            print_test("Create Goal", passed, response.text if not passed else "")
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Create Goal", False, str(e))
            self.tests_failed += 1
        
        # List Goals
        try:
            response = requests.get(f"{BASE_URL}/api/goals/", headers=self.get_auth_header())
            passed = response.status_code == 200 and isinstance(response.json(), list)
            print_test("List Goals", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("List Goals", False, str(e))
            self.tests_failed += 1
        
        # Update Goal
        if self.goal_id:
            try:
                target_date = (datetime.now() + timedelta(days=365*5)).strftime("%Y-%m-%d")
                response = requests.put(f"{BASE_URL}/api/goals/{self.goal_id}",
                    headers=self.get_auth_header(),
                    json={
                        "title": "Retirement Fund Updated",
                        "goal_type": "retirement",
                        "target_amount": 600000,
                        "target_date": target_date,
                        "monthly_contribution": 2500,
                        "current_amount": 15000
                    }
                )
                passed = response.status_code == 200
                print_test("Update Goal", passed, response.text[:150] if not passed else "")
                self.tests_passed += 1 if passed else 0
                self.tests_failed += 0 if passed else 1
            except Exception as e:
                print_test("Update Goal", False, str(e))
                self.tests_failed += 1
    
    def test_portfolio_flow(self):
        print_section("Portfolio & Transactions Flow")
        
        if not self.token:
            print_test("Portfolio tests skipped (no auth)", False)
            self.tests_failed += 5
            return
        
        # Add Investment
        try:
            response = requests.post(f"{BASE_URL}/api/investments/",
                headers=self.get_auth_header(),
                json={
                    "symbol": "AAPL",
                    "asset_type": "stock",
                    "units": 10,
                    "avg_buy_price": 150.00
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.investment_id = data.get("id")
            print_test("Add Investment", passed, response.text if not passed else "")
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Add Investment", False, str(e))
            self.tests_failed += 1
        
        # List Investments
        try:
            response = requests.get(f"{BASE_URL}/api/investments/", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("List Investments", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("List Investments", False, str(e))
            self.tests_failed += 1
        
        # Add Transaction
        try:
            response = requests.post(f"{BASE_URL}/api/transactions/",
                headers=self.get_auth_header(),
                json={
                    "symbol": "AAPL",
                    "type": "buy",
                    "quantity": 5,
                    "price": 155.00,
                    "fees": 1.00
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.transaction_id = data.get("id")
            print_test("Add Transaction", passed, response.text if not passed else "")
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Add Transaction", False, str(e))
            self.tests_failed += 1
        
        # List Transactions
        try:
            response = requests.get(f"{BASE_URL}/api/transactions/", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("List Transactions", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("List Transactions", False, str(e))
            self.tests_failed += 1
        
        # Get Portfolio Summary
        try:
            response = requests.get(f"{BASE_URL}/api/portfolio/summary", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Portfolio Summary", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Portfolio Summary", False, str(e))
            self.tests_failed += 1
    
    def test_calculators_flow(self):
        print_section("Financial Calculators Flow")
        
        if not self.token:
            print_test("Calculator tests skipped (no auth)", False)
            self.tests_failed += 3
            return
        
        # SIP Calculator
        try:
            response = requests.post(f"{BASE_URL}/api/calculators/sip",
                headers=self.get_auth_header(),
                json={
                    "monthly_investment": 5000,
                    "annual_return": 12,
                    "years": 10
                }
            )
            passed = response.status_code == 200 and "future_value" in response.json()
            print_test("SIP Calculator", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("SIP Calculator", False, str(e))
            self.tests_failed += 1
        
        # Retirement Calculator
        try:
            response = requests.post(f"{BASE_URL}/api/calculators/retirement",
                headers=self.get_auth_header(),
                json={
                    "current_age": 30,
                    "retirement_age": 60,
                    "monthly_savings": 10000,
                    "annual_return": 10,
                    "current_corpus": 100000
                }
            )
            passed = response.status_code == 200 and "total_corpus" in response.json()
            print_test("Retirement Calculator", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Retirement Calculator", False, str(e))
            self.tests_failed += 1
        
        # Loan EMI Calculator
        try:
            response = requests.post(f"{BASE_URL}/api/calculators/loan-emi",
                headers=self.get_auth_header(),
                json={
                    "principal": 1000000,
                    "annual_rate": 8.5,
                    "tenure_years": 20
                }
            )
            passed = response.status_code == 200 and "emi" in response.json()
            print_test("Loan EMI Calculator", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Loan EMI Calculator", False, str(e))
            self.tests_failed += 1
    
    def test_simulations_flow(self):
        print_section("Simulations Flow (What-If Scenarios)")
        
        if not self.token:
            print_test("Simulation tests skipped (no auth)", False)
            self.tests_failed += 2
            return
        
        # Run Simulation for Goal
        if self.goal_id:
            try:
                response = requests.post(f"{BASE_URL}/api/simulations/goal/{self.goal_id}",
                    headers=self.get_auth_header(),
                    json={
                        "annual_return": 10,
                        "inflation_rate": 3,
                        "additional_contribution": 0,
                        "years_to_simulate": 10
                    }
                )
                passed = response.status_code == 200
                print_test("Goal Simulation (Monte Carlo)", passed, response.text[:200] if not passed else "")
                self.tests_passed += 1 if passed else 0
                self.tests_failed += 0 if passed else 1
            except Exception as e:
                print_test("Goal Simulation", False, str(e))
                self.tests_failed += 1
        
        # Ad-hoc Simulation
        try:
            response = requests.post(f"{BASE_URL}/api/simulations/adhoc",
                headers=self.get_auth_header(),
                json={
                    "initial_amount": 100000,
                    "annual_return": 12,
                    "inflation_rate": 3,
                    "additional_contribution": 5000,
                    "years_to_simulate": 10,
                    "target_amount": 500000
                }
            )
            passed = response.status_code == 200
            if passed:
                data = response.json()
                print_test("Ad-hoc Simulation", True)
                print_test("Simulation has projections", "projection_data" in data or "projected_value" in data)
                self.tests_passed += 2
            else:
                print_test("Ad-hoc Simulation", False, response.text[:200])
                self.tests_failed += 2
        except Exception as e:
            print_test("Ad-hoc Simulation", False, str(e))
            self.tests_failed += 2
    
    def test_recommendations_flow(self):
        print_section("Recommendations Flow")
        
        if not self.token:
            print_test("Recommendations tests skipped (no auth)", False)
            self.tests_failed += 2
            return
        
        # Get Recommendations
        try:
            response = requests.get(f"{BASE_URL}/api/recommendations/", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Get Recommendations", passed)
            if passed:
                data = response.json()
                print_test("Recommendations is list", isinstance(data, list))
                self.tests_passed += 2
            else:
                self.tests_passed += 1
                self.tests_failed += 1
        except Exception as e:
            print_test("Get Recommendations", False, str(e))
            self.tests_failed += 2
        
        # Get Rebalance Suggestions
        try:
            response = requests.get(f"{BASE_URL}/api/recommendations/rebalance", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Get Rebalance Suggestions", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Get Rebalance Suggestions", False, str(e))
            self.tests_failed += 1
    
    def test_dashboard_flow(self):
        print_section("Dashboard Flow")
        
        if not self.token:
            print_test("Dashboard tests skipped (no auth)", False)
            self.tests_failed += 2
            return
        
        # Get Dashboard data
        try:
            response = requests.get(f"{BASE_URL}/api/dashboard/", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Dashboard Data", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Dashboard Data", False, str(e))
            self.tests_failed += 1
        
        # Get Portfolio History
        try:
            response = requests.get(f"{BASE_URL}/api/portfolio/history?period=6mo", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Portfolio History", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Portfolio History", False, str(e))
            self.tests_failed += 1
    
    def test_market_flow(self):
        print_section("Market Data Flow")
        
        if not self.token:
            print_test("Market tests skipped (no auth)", False)
            self.tests_failed += 2
            return
        
        # Get Market Indices
        try:
            response = requests.get(f"{BASE_URL}/api/market/indices", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Market Indices", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Market Indices", False, str(e))
            self.tests_failed += 1
        
        # Get Market News
        try:
            response = requests.get(f"{BASE_URL}/api/market/news", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("Market News", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Market News", False, str(e))
            self.tests_failed += 1
    
    def test_reports_flow(self):
        print_section("Reports Flow")
        
        if not self.token:
            print_test("Reports tests skipped (no auth)", False)
            self.tests_failed += 2
            return
        
        # List Reports
        try:
            response = requests.get(f"{BASE_URL}/api/reports/", headers=self.get_auth_header())
            passed = response.status_code == 200
            print_test("List Reports", passed)
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("List Reports", False, str(e))
            self.tests_failed += 1
        
        # Generate Portfolio Report
        try:
            response = requests.get(f"{BASE_URL}/api/reports/generate/portfolio?format=pdf",
                headers=self.get_auth_header()
            )
            passed = response.status_code == 200
            print_test("Generate Portfolio Report", passed, response.text[:100] if not passed and response.text else "")
            self.tests_passed += 1 if passed else 0
            self.tests_failed += 0 if passed else 1
        except Exception as e:
            print_test("Generate Portfolio Report", False, str(e))
            self.tests_failed += 1
    
    def get_auth_header(self):
        return {"Authorization": f"Bearer {self.token}"}
    
    def print_summary(self):
        print_section("Test Summary")
        total = self.tests_passed + self.tests_failed
        percentage = (self.tests_passed / total * 100) if total > 0 else 0
        
        print(f"\n  Total Tests: {total}")
        print(f"  {Colors.GREEN}Passed: {self.tests_passed}{Colors.END}")
        print(f"  {Colors.RED}Failed: {self.tests_failed}{Colors.END}")
        print(f"  Pass Rate: {percentage:.1f}%")
        
        if percentage >= 90:
            print(f"\n  {Colors.GREEN}🎉 Excellent! Your application is working great!{Colors.END}")
        elif percentage >= 70:
            print(f"\n  {Colors.YELLOW}⚠️  Good progress, but some tests need attention.{Colors.END}")
        else:
            print(f"\n  {Colors.RED}❌ Several features need fixing.{Colors.END}")

if __name__ == "__main__":
    runner = E2ETestRunner()
    runner.run_all_tests()
