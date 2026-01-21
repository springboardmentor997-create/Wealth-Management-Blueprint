from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging
from exceptions import CustomHTTPException, ErrorResponse, ErrorCode

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    
    @app.exception_handler(CustomHTTPException)
    async def custom_http_exception_handler(request: Request, exc: CustomHTTPException):
        logger.error(f"Custom HTTP Exception: {exc.error_code} - {exc.detail}")
        
        error_response = ErrorResponse(
            error_code=exc.error_code,
            message=exc.detail
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.to_dict()
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
        
        error_response = ErrorResponse(
            error_code="HTTP_ERROR",
            message=exc.detail or "An error occurred"
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.to_dict()
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Validation Error: {exc.errors()}")
        
        error_details = []
        for error in exc.errors():
            error_details.append({
                "field": " -> ".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })
        
        error_response = ErrorResponse(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Validation failed",
            details=error_details
        )
        
        return JSONResponse(
            status_code=422,
            content=error_response.to_dict()
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.error(f"Database Integrity Error: {str(exc)}")
        
        error_response = ErrorResponse(
            error_code=ErrorCode.DUPLICATE_RESOURCE,
            message="Resource already exists or violates database constraints"
        )
        
        return JSONResponse(
            status_code=409,
            content=error_response.to_dict()
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database Error: {str(exc)}")
        
        error_response = ErrorResponse(
            error_code=ErrorCode.DATABASE_ERROR,
            message="Database operation failed"
        )
        
        return JSONResponse(
            status_code=500,
            content=error_response.to_dict()
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
        
        error_response = ErrorResponse(
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred"
        )
        
        return JSONResponse(
            status_code=500,
            content=error_response.to_dict()
        )