const NETWORK_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ECONNRESET',
  'EHOSTUNREACH'
]);

class AppError extends Error {
  constructor(message, {
    category = 'InternalError',
    statusCode = 500,
    details,
    cause,
    publicMessage
  } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.category = category;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;
    this.publicMessage = publicMessage || message || 'Beklenmeyen bir hata oluştu.';
    this.timestamp = new Date().toISOString();

    if (cause && !this.stack && cause.stack) {
      this.stack = cause.stack;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends AppError {
  constructor(message, { details, cause, publicMessage, statusCode } = {}) {
    super(message, {
      category: 'ValidationError',
      statusCode: statusCode || 400,
      details,
      cause,
      publicMessage: publicMessage || message
    });
  }
}

class NetworkError extends AppError {
  constructor(message, { details, cause, publicMessage, statusCode } = {}) {
    super(message, {
      category: 'NetworkError',
      statusCode: statusCode || 503,
      details,
      cause,
      publicMessage: publicMessage || 'Servise ulaşılamıyor. Lütfen daha sonra tekrar deneyin.'
    });
  }
}

class InternalError extends AppError {
  constructor(message, { details, cause, publicMessage, statusCode } = {}) {
    super(message, {
      category: 'InternalError',
      statusCode: statusCode || 500,
      details,
      cause,
      publicMessage: publicMessage || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
}

function isNetworkReason(error) {
  if (!error) {
    return false;
  }

  if (error instanceof NetworkError) {
    return true;
  }

  if (error.code && NETWORK_ERROR_CODES.has(error.code)) {
    return true;
  }

  const message = (error.message || '').toString().toUpperCase();
  return [...NETWORK_ERROR_CODES].some(code => message.includes(code));
}

function looksLikeValidationError(error) {
  if (!error) {
    return false;
  }

  if (error instanceof ValidationError) {
    return true;
  }

  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return true;
  }

  if (error.name && error.name.toLowerCase().includes('validation')) {
    return true;
  }

  return error instanceof SyntaxError;
}

function toAppError(error, fallbackMessage = 'Beklenmeyen bir hata oluştu.') {
  if (error instanceof AppError) {
    return error;
  }

  if (!error) {
    return new InternalError(fallbackMessage);
  }

  if (looksLikeValidationError(error)) {
    const message = error.message || 'Geçersiz istek.';
    return new ValidationError(message, { cause: error });
  }

  if (isNetworkReason(error)) {
    const message = error.message || 'Servise ulaşılamıyor.';
    return new NetworkError(message, { cause: error });
  }

  return new InternalError(error.message || fallbackMessage, { cause: error });
}

function logError(error, context = {}) {
  const logMethod = error.category === 'ValidationError' ? console.warn : console.error;
  const payload = {
    ...context,
    name: error.name,
    category: error.category,
    message: error.message,
    publicMessage: error.publicMessage,
    details: error.details,
    timestamp: error.timestamp
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = error.stack;
    if (error.cause && error.cause !== error) {
      payload.cause = {
        name: error.cause.name,
        message: error.cause.message,
        stack: error.cause.stack
      };
    }
  }

  logMethod(`[${error.category}] ${error.message}`, payload);
}

function buildErrorResponse(error, headers = {}, extraPayload = {}) {
  const payload = {
    error: error.publicMessage,
    category: error.category,
    ...extraPayload
  };

  if (error.category === 'ValidationError' && error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.debug = {
      message: error.message,
      stack: error.stack
    };
  }

  return {
    statusCode: error.statusCode,
    headers,
    body: JSON.stringify(payload)
  };
}

module.exports = {
  AppError,
  ValidationError,
  NetworkError,
  InternalError,
  toAppError,
  logError,
  buildErrorResponse,
  isNetworkReason
};
