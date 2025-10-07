const setupGlobalErrorBoundary = require('./errorBoundary');
const { createLogger } = require('./utils/logger');

const logger = createLogger('bootstrap');

setupGlobalErrorBoundary();

logger.info('Ata Akademi Yoklama uygulaması başlatılıyor.');
