const { getClasses } = require('../services/attendanceService');
const { ValidationError, toAppError, logError, buildErrorResponse } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const logger = createLogger('functions:classes');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Surrogate-Control': 'no-store',
  'Expires': '0'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const requestContext = {
    method: event.httpMethod,
    path: event.path,
    requestId: event.requestContext?.requestId
  };

  try {
    if (event.httpMethod !== 'GET') {
      throw new ValidationError('İstek yöntemi desteklenmiyor.', {
        statusCode: 405,
        details: { method: event.httpMethod },
        publicMessage: 'İstek yöntemi desteklenmiyor.'
      });
    }

    const classes = getClasses();

    logger.info('Sınıf listesi başarıyla gönderildi.', {
      count: classes.length
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        classes,
        generatedAt: new Date().toISOString()
      })
    };
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { ...requestContext, scope: 'classes.handler' });

    return buildErrorResponse(appError, headers, {
      requestId: requestContext.requestId
    });
  }
};
