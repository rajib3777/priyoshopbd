"""
Custom exception handler for structured error responses.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    """
    Returns structured JSON errors:
    {
        "success": false,
        "error": {
            "code": "validation_error",
            "message": "...",
            "details": {...}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'error': {
                'code': _get_error_code(response.status_code),
                'message': _get_error_message(response.data),
                'details': response.data if isinstance(response.data, dict) else {'non_field_errors': response.data},
            }
        }
        response.data = error_data
    else:
        # Unhandled exception
        logger.exception(f'Unhandled exception in {context.get("view", "unknown")}', exc_info=exc)
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 'server_error',
                    'message': 'An unexpected error occurred. Please try again.',
                    'details': {},
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _get_error_code(status_code):
    codes = {
        400: 'bad_request',
        401: 'unauthorized',
        403: 'forbidden',
        404: 'not_found',
        405: 'method_not_allowed',
        409: 'conflict',
        422: 'validation_error',
        429: 'rate_limit_exceeded',
        500: 'server_error',
    }
    return codes.get(status_code, 'error')


def _get_error_message(data):
    if isinstance(data, dict):
        if 'detail' in data:
            detail = data['detail']
            return str(detail) if not isinstance(detail, list) else detail[0]
        # Collect first field error
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f"{key}: {value[0]}"
            elif isinstance(value, str):
                return value
    elif isinstance(data, list) and data:
        return str(data[0])
    return 'An error occurred'
