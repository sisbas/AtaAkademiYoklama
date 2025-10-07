const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const DEFAULT_LEVEL = process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : 'info';
const LOG_FORMAT = process.env.LOG_FORMAT ? process.env.LOG_FORMAT.toLowerCase() : undefined;
const isProduction = process.env.NODE_ENV === 'production';

function parseLevel(level) {
  if (!level) {
    return LEVELS.info;
  }

  const normalised = level.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(LEVELS, normalised)) {
    return LEVELS[normalised];
  }

  return LEVELS.info;
}

const activeLevel = parseLevel(DEFAULT_LEVEL);
const useJsonFormat = LOG_FORMAT === 'json' || isProduction;

function sanitiseMeta(meta) {
  if (!meta) {
    return undefined;
  }

  if (typeof meta !== 'object') {
    return { value: meta };
  }

  if (meta instanceof Error) {
    return {
      name: meta.name,
      message: meta.message,
      stack: meta.stack
    };
  }

  return JSON.parse(JSON.stringify(meta, (_, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }
    return value;
  }));
}

function baseLog(level, scope, message, meta, baseContext = {}) {
  const levelPriority = LEVELS[level];
  if (levelPriority > activeLevel) {
    return;
  }

  const timestamp = new Date().toISOString();
  const context = sanitiseMeta({ ...baseContext, ...meta });

  if (useJsonFormat) {
    const payload = {
      timestamp,
      level,
      scope,
      message,
      ...context
    };
    console.log(JSON.stringify(payload));
    return;
  }

  const parts = [`[${timestamp}]`, level.toUpperCase()];
  if (scope) {
    parts.push(`[${scope}]`);
  }
  parts.push(message);

  if (context && Object.keys(context).length > 0) {
    parts.push(JSON.stringify(context));
  }

  const line = parts.join(' ');

  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

function createLogger(scope, baseContext = {}) {
  const scoped = scope || baseContext.scope || 'app';
  const context = { ...baseContext };
  if (scope) {
    context.scope = scope;
  }

  const log = (level, message, meta) => baseLog(level, scoped, message, meta, context);

  return {
    error: (message, meta) => log('error', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    info: (message, meta) => log('info', message, meta),
    debug: (message, meta) => log('debug', message, meta),
    trace: (message, meta) => log('trace', message, meta),
    child: (childScope, childContext = {}) => {
      const nextScope = childScope ? `${scoped}:${childScope}` : scoped;
      return createLogger(nextScope, { ...context, ...childContext });
    }
  };
}

const logger = createLogger('app');

module.exports = {
  createLogger,
  logger
};
