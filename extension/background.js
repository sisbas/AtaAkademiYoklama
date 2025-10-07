const TELEMETRY_NAMESPACE = 'AtaAkademiYoklama';

function logTelemetry(event) {
  const { level = 'info', message = '', error } = event;
  if (error && /message port closed/i.test(String(error.message || error))) {
    return; // Ignore noisy disconnect errors.
  }

  const payload = {
    namespace: TELEMETRY_NAMESPACE,
    level,
    message,
    context: event.context || {},
    timestamp: new Date().toISOString(),
  };

  if (error) {
    payload.error = {
      message: error.message || String(error),
      stack: error.stack,
    };
  }

  console[level === 'error' ? 'error' : 'log']('[Telemetry]', payload);
}

async function handleMessage(message, sender) {
  switch (message?.type) {
    case 'PING':
      return { pong: true, receivedAt: Date.now() };
    case 'SAVE_SETTINGS':
      await new Promise((resolve, reject) => {
        chrome.storage.local.set({ settings: message.payload }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      });
      return { ok: true };
    case 'GET_SETTINGS':
      return new Promise((resolve, reject) => {
        chrome.storage.local.get('settings', (items) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(items);
        });
      });
    default:
      throw new Error(`Unknown message type: ${message?.type}`);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((result) => {
      sendResponse({ success: true, result });
      logTelemetry({
        level: 'info',
        message: 'Handled runtime message',
        context: { type: message?.type, tabId: sender?.tab?.id },
      });
    })
    .catch((error) => {
      sendResponse({ success: false, error: error.message });
      logTelemetry({
        level: 'error',
        message: 'Failed to handle runtime message',
        context: { type: message?.type, tabId: sender?.tab?.id },
        error,
      });
    });

  return true;
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'content-long-task') {
    port.disconnect();
    return;
  }

  logTelemetry({
    level: 'info',
    message: 'Port connected',
    context: { name: port.name },
  });

  let isDisconnected = false;
  const timers = new Set();

  port.onDisconnect.addListener(() => {
    isDisconnected = true;
    for (const timer of timers) {
      clearTimeout(timer);
    }
    timers.clear();

    logTelemetry({
      level: 'info',
      message: 'Port disconnected',
      context: { name: port.name },
    });
  });

  port.onMessage.addListener(async (message) => {
    if (message?.type !== 'START_LONG_TASK') {
      return;
    }

    const taskId = message.taskId || crypto.randomUUID();

    const steps = Array.isArray(message.steps) && message.steps.length
      ? message.steps
      : ['initialising', 'processing', 'finalising'];

    try {
      for (let index = 0; index < steps.length; index += 1) {
        if (isDisconnected) {
          return;
        }

        const step = steps[index];
        port.postMessage({ type: 'LONG_TASK_PROGRESS', taskId, step, progress: (index / steps.length) * 100 });

        await new Promise((resolve) => {
          const timer = setTimeout(() => {
            timers.delete(timer);
            resolve();
          }, message.delay ?? 250);
          timers.add(timer);
        });
      }

      if (isDisconnected) {
        return;
      }

      port.postMessage({ type: 'LONG_TASK_COMPLETE', taskId, result: message.payload ?? null });
      logTelemetry({
        level: 'info',
        message: 'Completed long task',
        context: { taskId },
      });
    } catch (error) {
      if (isDisconnected) {
        return;
      }

      port.postMessage({ type: 'LONG_TASK_ERROR', taskId, error: error.message });
      logTelemetry({
        level: 'error',
        message: 'Long task failed',
        context: { taskId },
        error,
      });
    }
  });
});
