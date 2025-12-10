from sqlalchemy import Column, Integer, String, Enum, DateTime
from datetime import datetime
from app.core.database import Base # Import Base from the file we just created
from werkzeug.security import generate_password_hash, check_password_hash

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    
    risk_profile = Column(Enum('conservative', 'moderate', 'aggressive', name='risk_profile_enum'), nullable=False, default='moderate')
    kyc_status = Column(Enum('unverified', 'verified', name='kyc_status_enum'), default='unverified')
    created_at = Column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)