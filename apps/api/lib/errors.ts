export enum ERROR_TYPES {
  'API',
}

export class ApiError extends Error {
  statusCode: number;
  type: ERROR_TYPES;

  originalError?: Error;

  constructor(statusCode: number, message: string, originalError?: Error) {
    super(message);

    this.statusCode = statusCode;
    this.type = ERROR_TYPES.API;

    if (originalError) {
      this.originalError = originalError;
      this.stack = originalError?.stack;
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
