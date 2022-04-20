export enum ERROR_TYPES {
  'API',
}

export class ApiError extends Error {
  statusCode: number;
  statusMessage: string;
  type: ERROR_TYPES;

  originalError?: Error;

  constructor(statusCode: number, message: string, originalError?: Error) {
    super(message);

    this.statusCode = statusCode;
    this.statusMessage = message;
    this.type = ERROR_TYPES.API;

    if (originalError && originalError instanceof Error) {
      this.originalError = originalError;
      this.stack = originalError.stack;
    }
  }
}

/**
 *
 * @param statusCode - HTTP status code error. Defaults to 500
 * @param message - Short description of the error. Defaults to 'Internal Server Error'
 * @param originalError - Original error
 * @returns
 */
export function makeApiError(
  statusCode = 500,
  message = 'Internal Server Error',
  originalError = undefined
) {
  return new ApiError(statusCode, message, originalError);
}

export type JSON_API_ERROR = {
  // JSON:API specifies that staus property be an "HTTP status code applicable
  // to this problem, expressed as a string value", but we represent it as a
  // number because our makeApiError function takes a number as the statusCode
  status: number;
  title: string;
};

/**
 *
 * @param err
 * @returns Returns an error object according to JSON:API specification
 */
export function parseApiError(err: any): JSON_API_ERROR {
  return {
    // JSON:API specifies that this http status be represented as a string
    // but we represent it as a number
    status: err instanceof ApiError ? err.statusCode : 500,
    title: err.message,
  };
}
