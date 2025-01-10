class ApiError extends Error {
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    data = null,
    stack = ''
  ) {
    super(message);
    if (typeof statusCode !== 'number') {
      throw new TypeError('statusCode must be a number');
    }
    if (!Array.isArray(errors)) {
      throw new TypeError('errors must be an array');
    }

    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = data;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
