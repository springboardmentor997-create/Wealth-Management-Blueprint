from pydantic import BaseSettings, Field
from datetime import timedelta
from typing import ClassVar

class Settings(BaseSettings):
    """
    Application settings class.
    Pydantic's BaseSettings automatically loads environment variables.
    e.g., APP_PORT will load the value of the environment variable APP_PORT.
    """

    # ----------------------------------------------------
    # Core Application Settings
    # ----------------------------------------------------
    APP_NAME: str = "Wealth Manager API"
    APP_PORT: int = 8000
    
    # Enable/Disable CORS for security
    CORS_ENABLED: bool = True
    # In production, change "*" to your frontend domain (e.g., "https://www.yourdomain.com")
    ALLOWED_ORIGINS: ClassVar[list[str]] = ["*"] 

    # ----------------------------------------------------
    # Database Settings (MongoDB or SQL)
    # ----------------------------------------------------
    # Use the URI for MongoDB or a standard SQL connection string
    # Replace the placeholder with your actual connection string
    # Pydantic will look for an environment variable named DATABASE_URI
    DATABASE_URI: str = Field(
        # Default MongoDB connection for local development
        default="mongodb://localhost:27017/wealth_manager_db" 
    )

    # ----------------------------------------------------
    # JWT (JSON Web Token) Authentication Settings
    # ----------------------------------------------------
    # IMPORTANT: Change this to a long, complex, randomly generated string!
    JWT_SECRET_KEY: str = Field(
        default="YOUR_SUPER_SECRET_KEY_12345_CHANGE_THIS_NOW" 
    )
    
    JWT_ALGORITHM: str = "HS256"
    
    # Token expiration time (e.g., 60 minutes for access tokens)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    @property
    def ACCESS_TOKEN_EXPIRE_DELTA(self) -> timedelta:
        """Calculates the timedelta object for token expiration."""
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    class Config:
        # Load environment variables from a .env file located in the same directory
        env_file = ".env"
        # Environment variables are case-insensitive
        case_sensitive = False

# Create a singleton instance for easy import across the application
settings = Settings()
