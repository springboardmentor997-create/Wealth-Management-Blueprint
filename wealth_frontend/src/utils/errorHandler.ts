// Error types and interfaces
export interface ApiError {
  error_code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface NetworkError {
  type: 'NETWORK_ERROR';
  message: string;
  status?: number;
}

export interface ValidationError {
  type: 'VALIDATION_ERROR';
  message: string;
  fields?: Array<{
    field: string;
    message: string;
    type: string;
  }>;
}

export interface ServerError {
  type: 'SERVER_ERROR';
  message: string;
  status: number;
}

export type AppError = ApiError | NetworkError | ValidationError | ServerError;

// Error handling utilities
export class ErrorHandler {
  static handleApiError(error: any): AppError {
    // Network errors (no response)
    if (!error.response) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        status: 0
      };
    }

    const { status, data } = error.response;

    // Server returned an error response
    if (data && data.error_code) {
      return data as ApiError;
    }

    // Handle different HTTP status codes
    switch (status) {
      case 400:
        return {
          type: 'VALIDATION_ERROR',
          message: data?.message || 'Invalid request. Please check your input.',
        };
      case 401:
        return {
          type: 'SERVER_ERROR',
          message: 'Authentication required. Please log in.',
          status
        };
      case 403:
        return {
          type: 'SERVER_ERROR',
          message: 'You don\'t have permission to perform this action.',
          status
        };
      case 404:
        return {
          type: 'SERVER_ERROR',
          message: 'The requested resource was not found.',
          status
        };
      case 409:
        return {
          type: 'SERVER_ERROR',
          message: 'This resource already exists.',
          status
        };
      case 422:
        return {
          type: 'VALIDATION_ERROR',
          message: 'Validation failed. Please check your input.',
          fields: data?.details
        };
      case 500:
        return {
          type: 'SERVER_ERROR',
          message: 'Internal server error. Please try again later.',
          status
        };
      case 503:
        return {
          type: 'SERVER_ERROR',
          message: 'Service temporarily unavailable. Please try again later.',
          status
        };
      default:
        return {
          type: 'SERVER_ERROR',
          message: data?.message || 'An unexpected error occurred.',
          status
        };
    }
  }

  static getErrorMessage(error: AppError): string {
    if ('error_code' in error) {
      return error.message;
    }
    return error.message;
  }

  static getErrorTitle(error: AppError): string {
    if ('error_code' in error) {
      switch (error.error_code) {
        case 'AUTHENTICATION_REQUIRED':
          return 'Authentication Required';
        case 'INSUFFICIENT_PERMISSIONS':
          return 'Access Denied';
        case 'RESOURCE_NOT_FOUND':
          return 'Not Found';
        case 'VALIDATION_ERROR':
          return 'Validation Error';
        case 'DUPLICATE_RESOURCE':
          return 'Already Exists';
        case 'EXTERNAL_SERVICE_ERROR':
          return 'Service Unavailable';
        case 'DATABASE_ERROR':
          return 'Database Error';
        case 'FILE_OPERATION_ERROR':
          return 'File Error';
        default:
          return 'Error';
      }
    }

    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'VALIDATION_ERROR':
        return 'Validation Error';
      case 'SERVER_ERROR':
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  static isRetryable(error: AppError): boolean {
    if ('error_code' in error) {
      return ['EXTERNAL_SERVICE_ERROR', 'DATABASE_ERROR'].includes(error.error_code);
    }

    if (error.type === 'NETWORK_ERROR') return true;
    if (error.type === 'SERVER_ERROR' && 'status' in error) {
      return [500, 502, 503, 504].includes(error.status);
    }

    return false;
  }
}

// Error logging
export class ErrorLogger {
  static logError(error: AppError, context?: string) {
    const logData = {
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Application Error:', logData);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: logData });
    }
  }
}