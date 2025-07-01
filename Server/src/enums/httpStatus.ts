export const HTTP_STATUS = {
    //  2xx: Success
    OK: 200, // Request Succeeded
    CREATED: 201, // Resource created successfully
    NO_CONTENT: 204, // Request succeeded, but no content to return 


    // 4xx: Client Errors
    BAD_REQUEST: 400,  // Invalid request
    UNAUTHORIZED: 401, // Authentication required
    FORBIDDEN: 403, // No permission to access the resource
    NOT_FOUND: 404,  // Resource not found
    METHOD_NOT_ALLOWED: 405,  // HTTP method not allowed
    CONFLICT: 409,  // Resource conflict (e.g., duplicate entry)
    GONE: 410,  // Resource no longer available
    TOO_MANY_REQUESTS: 429,  // Rate limiting exceeded

    // 5xx: Server Errors
    INTERNAL_SERVER_ERROR: 500, // Generic server error
    NOT_IMPLEMENTED: 501, // Feature not implemented
    BAD_GATEWAY: 502, // Invalid response from an upstream server
    SERVICE_UNAVAILABLE: 504 // Upstream server failed to respond in time

}