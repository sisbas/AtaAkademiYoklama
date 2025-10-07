const db = require('./db');
const { createLogger } = require('./utils/logger');

const logger = createLogger('db-health');

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function checkDatabaseHealth(options = {}) {
  const {
    retries = DEFAULT_RETRY_COUNT,
    delayMs = DEFAULT_RETRY_DELAY_MS
  } = options;

  if (!db.hasDatabase) {
    logger.warn('DATABASE_URL tanımlı olmadığından veritabanı bağlantısı yapılamıyor.');
    return {
      healthy: false,
      attempts: 0,
      error: {
        message: 'Veritabanı yapılandırması bulunamadı.'
      }
    };
  }

  let attempt = 0;
  const collectedErrors = [];

  while (attempt <= retries) {
    try {
      await db.ensureDatabase();
      await db.query('SELECT 1');

      if (attempt > 0) {
        logger.info('Veritabanı sağlık kontrolü başarılı şekilde tamamlandı.', {
          attempts: attempt + 1
        });
      }

      return {
        healthy: true,
        attempts: attempt + 1,
        error: null
      };
    } catch (error) {
      const payload = {
        attempt: attempt + 1,
        error: {
          message: error?.message,
          code: error?.code
        }
      };
      collectedErrors.push(payload.error);

      logger.error('Veritabanı sağlık kontrolü sırasında hata oluştu.', payload);

      if (attempt >= retries) {
        return {
          healthy: false,
          attempts: attempt + 1,
          error: payload.error,
          errors: collectedErrors
        };
      }

      attempt += 1;

      try {
        await sleep(delayMs);
      } catch (waitError) {
        logger.warn('Sağlık kontrolü bekleme süresi tamamlanmadan sonlandı.', {
          error: {
            message: waitError?.message
          }
        });
      }
    }
  }

  return {
    healthy: false,
    attempts: attempt,
    error: {
      message: 'Veritabanı sağlık kontrolü tamamlanamadı.'
    },
    errors: collectedErrors
  };
}

async function waitForHealthyDatabase(options = {}) {
  const {
    retries = DEFAULT_RETRY_COUNT,
    delayMs = DEFAULT_RETRY_DELAY_MS
  } = options;

  let attempt = 0;

  while (attempt <= retries) {
    try {
      const result = await checkDatabaseHealth({ retries: 0 });
      if (result.healthy) {
        return result;
      }
    } catch (error) {
      logger.error('Veritabanı sağlık kontrolü beklemesi başarısız oldu.', {
        attempt: attempt + 1,
        error: {
          message: error?.message,
          code: error?.code
        }
      });
    }

    attempt += 1;

    if (attempt > retries) {
      break;
    }

    try {
      await sleep(delayMs);
    } catch (waitError) {
      logger.warn('Veritabanı bekleme süresi sırasında hata oluştu.', {
        error: {
          message: waitError?.message
        }
      });
    }
  }

  throw new Error('Veritabanı sağlık kontrolü belirtilen süre içinde başarıyla tamamlanamadı.');
}

module.exports = {
  checkDatabaseHealth,
  waitForHealthyDatabase
};
