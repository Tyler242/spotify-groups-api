export interface ErrorResult {
    message: string;
    code: HttpStatusCode;
}

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401, // unathenticated
    FORBIDDEN = 403, // lacking necessary permissions
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    REQUEST_TIMEOUT = 408,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
}

export function internalServerError() {
    const error: ErrorResult = {
        message: "Internal Server Error",
        code: HttpStatusCode.INTERNAL_SERVER_ERROR
    }
    return error;
}