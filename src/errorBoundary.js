const { toAppError, logError } = require('./utils/errors');

function setupGlobalErrorBoundary() {
  if (setupGlobalErrorBoundary.isInstalled) {
    return;
  }

  const handleUnhandled = (error, origin) => {
    const appError = toAppError(error, 'Beklenmeyen sistem hatası.');
    logError(appError, { origin });
  };

  process.on('uncaughtException', error => {
    handleUnhandled(error, 'uncaughtException');
  });

  process.on('unhandledRejection', reason => {
    const error = reason instanceof Error
      ? reason
      : new Error(typeof reason === 'string' ? reason : 'Unhandled rejection');
    handleUnhandled(error, 'unhandledRejection');
  });

  setupGlobalErrorBoundary.isInstalled = true;
}

setupGlobalErrorBoundary.isInstalled = false;

module.exports = setupGlobalErrorBoundary;
