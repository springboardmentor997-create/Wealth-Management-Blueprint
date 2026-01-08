from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from typing import Union
from enum import Enum

# Custom Error Types
class ErrorCode(str, Enum):
    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    FILE_OPERATION_ERROR = "FILE_OPERATION_ERROR"

class CustomHTTPException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: ErrorCode,
        headers: dict = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code

# Custom Exception Classes
class AuthenticationError(CustomHTTPException):
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(
            status_code=401,
            detail=detail,
            error_code=ErrorCode.AUTHENTICATION_REQUIRED
        )

class PermissionError(CustomHTTPException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=403,
            detail=detail,
            error_code=ErrorCode.INSUFFICIENT_PERMISSIONS
        )

class NotFoundError(CustomHTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=404,
            detail=detail,
            error_code=ErrorCode.RESOURCE_NOT_FOUND
        )

class ValidationError(CustomHTTPException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=422,
            detail=detail,
            error_code=ErrorCode.VALIDATION_ERROR
        )

class DuplicateResourceError(CustomHTTPException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=409,
            detail=detail,
            error_code=ErrorCode.DUPLICATE_RESOURCE
        )

class ExternalServiceError(CustomHTTPException):
    def __init__(self, detail: str = "External service unavailable"):
        super().__init__(
            status_code=503,
            detail=detail,
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR
        )

class DatabaseError(CustomHTTPException):
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code=ErrorCode.DATABASE_ERROR
        )

class FileOperationError(CustomHTTPException):
    def __init__(self, detail: str = "File operation failed"):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code=ErrorCode.FILE_OPERATION_ERROR
        )

# Error Response Schema
class ErrorResponse:
    def __init__(
        self,
        error_code: str,
        message: str,
        details: Union[str, dict] = None,
        timestamp: str = None
    ):
        from datetime import datetime
        self.error_code = error_code
        self.message = message
        self.details = details
        self.timestamp = timestamp or datetime.utcnow().isoformat()

    def to_dict(self):
        response = {
            "error_code": self.error_code,
            "message": self.message,
            "timestamp": self.timestamp
        }
        if self.details:
            response["details"] = self.details
        return response

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)