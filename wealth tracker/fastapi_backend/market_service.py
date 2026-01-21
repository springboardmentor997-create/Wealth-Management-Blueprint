import requests
import yfinance as yf
from datetime import datetime
from sqlalchemy.orm import Session
from models import Investment

class MarketDataService:
    @staticmethod
    def get_stock_price(symbol: str) -> float:
        """Get current stock price using yfinance"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d")
            if not data.empty:
                return float(data['Close'].iloc[-1])
        except:
            pass
        return 0.0

    @staticmethod
    def get_portfolio_history(investments: list, period: str = "6mo") -> list:
        """
        Calculate historical portfolio value based on current holdings.
        Returns list of dicts: [{'date': 'Jan', 'value': 1000}, ...]
        """
        import pandas as pd
        
        if not investments:
            return []
            
        symbols = [inv.symbol for inv in investments]
        symbol_map = {inv.symbol: inv.units for inv in investments}
        
        try:
            history_data = {}
            # Fetch data for each symbol - sequential but safer for small portfolios than dealing with yf.download multi-index complexity in one go for now
            # Optimization: could use yf.download(tickers, ...) but handling single vs multiple results is annoying.
            
            # Actually, let's try yf.download for speed
            if not symbols:
                return []
                
            # Use Tickers object for better reliability
            tickers = yf.Tickers(" ".join(symbols))
            
            # We need a common date index.
            # Let's get history for the first one to establish index, then loop?
            # Or just yf.download
            
            df = yf.download(symbols, period=period, progress=False, group_by='ticker')
            
            # Prepare a series for total value
            total_series = None
            
            if len(symbols) == 1:
                # df is simple dataframe
                close_prices = df['Close']
                # Fill NaNs
                close_prices = close_prices.fillna(method='ffill').fillna(method='bfill')
                total_series = close_prices * symbol_map[symbols[0]]
            else:
                for symbol in symbols:
                    try:
                        # Access multi-index
                        if symbol in df.columns.levels[0]:
                            s_data = df[symbol]['Close']
                        else:
                            # Fallback if download failed for one
                            continue
                            
                        s_data = s_data.fillna(method='ffill').fillna(method='bfill')
                        val_series = s_data * symbol_map[symbol]
                        
                        if total_series is None:
                            total_series = val_series
                        else:
                            total_series = total_series.add(val_series, fill_value=0)
                    except Exception:
                        continue

            if total_series is None or total_series.empty:
                # Fallback: Create synthetic history based on cost basis if market data fails
                # This ensures the chart isn't empty even if tickers are invalid (e.g. 'bsnl', 'tyata')
                total_cost = sum((float(inv.cost_basis) if inv.cost_basis else float(inv.units) * float(inv.avg_buy_price)) for inv in investments)
                
                # Determine date params based on period
                days = 180 # default 6mo
                if period == '1mo': days = 30
                elif period == '1y': days = 365
                elif period == 'all': days = 1825 # 5y
                elif period == 'ytd': days = (datetime.now() - datetime(datetime.now().year, 1, 1)).days

                end_date = datetime.now()
                start_date = end_date - pd.Timedelta(days=days)
                dates = pd.date_range(start=start_date, end=end_date, periods=min(days, 30))
                
                result = []
                for date in dates:
                    result.append({
                        "name": date.strftime("%b %d"),
                        "value": round(float(total_cost), 2)
                    })
                return result

            # Format for frontend: specific aggregation (e.g. monthly/weekly points) to reduce noise?
            # Or just return all daily points. Frontend Recharts can handle it.
            # But let's resample to reduce payload size if it's huge. 6mo is ~126 trading days. JSON is fine.
            
            result = []
            for date, value in total_series.items():
                if pd.notna(value):
                    result.append({
                        "name": date.strftime("%b %d"), # Format: Jan 01
                        "value": round(float(value), 2)
                    })
            
            return result

        except Exception as e:
            print(f"Error calculating portfolio history: {e}")
            return []
    
    @staticmethod
    def update_portfolio_prices(db: Session):
        """Update all investment prices"""
        investments = db.query(Investment).all()
        for investment in investments:
            try:
                current_price = MarketDataService.get_stock_price(investment.symbol)
                if current_price > 0:
                    investment.last_price = current_price
                    investment.current_value = investment.units * current_price
                    investment.last_price_at = datetime.utcnow()
            except Exception as e:
                print(f"Error updating {investment.symbol}: {e}")
        
        db.commit()
        return True