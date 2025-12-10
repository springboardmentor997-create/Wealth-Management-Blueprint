# main.py
from fastapi import FastAPI
from .config import settings  # Import the singleton instance

app = FastAPI(
    title=settings.APP_NAME
)

# Use settings to configure CORS dynamically
if settings.CORS_ENABLED:
    from fastapi.middleware.cors import CORSMiddleware
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ... (Rest of your database setup using settings.DATABASE_URI)
# ...

# To start the server using the configured port:
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=settings.APP_PORT)
