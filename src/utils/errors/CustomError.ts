class CustomError extends Error {
  private statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  getStatusCode() {
    return this.statusCode;
  }
}

export default CustomError;
