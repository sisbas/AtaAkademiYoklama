const RETRYABLE_ERROR = /The message port closed before a response was received/i;
const DEFAULT_RETRY_DELAY = 200;
const MAX_RETRIES = 1;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendMessageSafely(message, { retries = MAX_RETRIES, retryDelay = DEFAULT_RETRY_DELAY } = {}) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      if (!response) {
        return { success: false, error: 'EMPTY_RESPONSE' };
      }
      return response;
    } catch (error) {
      if (RETRYABLE_ERROR.test(String(error?.message || error))) {
        if (attempt < retries) {
          await delay(retryDelay);
          attempt += 1;
          continue;
        }

        console.debug('[Content] Message port closed; falling back silently.', {
          message,
        });
        return { success: false, error: 'PORT_CLOSED' };
      }

      console.error('[Content] Unhandled sendMessage error', error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  return { success: false, error: 'UNKNOWN' };
}

class LongTaskChannel {
  constructor() {
    this.port = null;
    this.pendingTasks = new Map();
    this.reconnectTimer = null;
    this.connect();
    this.setupUnloadHandler();
  }

  setupUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      if (this.port) {
        try {
          this.port.disconnect();
        } catch (error) {
          if (!RETRYABLE_ERROR.test(String(error?.message || error))) {
            console.debug('[Content] Port disconnect on unload failed', error);
          }
        }
      }
    });
  }

  connect() {
    if (this.port) {
      return;
    }

    try {
      const port = chrome.runtime.connect({ name: 'content-long-task' });
      this.port = port;

      port.onMessage.addListener((message) => this.handleMessage(message));
      port.onDisconnect.addListener(() => {
        this.port = null;
        for (const [, resolver] of this.pendingTasks) {
          resolver.reject(new Error('Port disconnected'));
        }
        this.pendingTasks.clear();
        this.scheduleReconnect();
      });
    } catch (error) {
      this.port = null;
      if (!RETRYABLE_ERROR.test(String(error?.message || error))) {
        console.error('[Content] Failed to connect to background port', error);
      }
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 500);
  }

  ensurePort() {
    if (!this.port) {
      this.connect();
    }
    return this.port;
  }

  startTask(payload, { onProgress } = {}) {
    const port = this.ensurePort();
    if (!port) {
      return Promise.reject(new Error('Port not available'));
    }

    const taskId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const remove = () => {
        this.pendingTasks.delete(taskId);
      };

      this.pendingTasks.set(taskId, { resolve, reject, remove, onProgress });

      try {
        port.postMessage({
          type: 'START_LONG_TASK',
          taskId,
          steps: payload?.steps,
          delay: payload?.delay,
          payload: payload?.data,
        });
      } catch (error) {
        remove();
        if (RETRYABLE_ERROR.test(String(error?.message || error))) {
          console.debug('[Content] Failed to post long task message; port closed.');
          reject(new Error('Port closed before task start'));
          return;
        }
        reject(error);
      }
    });
  }

  handleMessage(message) {
    if (!message?.taskId) {
      return;
    }

    const entry = this.pendingTasks.get(message.taskId);
    if (!entry) {
      return;
    }

    if (message.type === 'LONG_TASK_PROGRESS') {
      if (typeof entry.onProgress === 'function') {
        entry.onProgress(message);
      }
      return;
    }

    entry.remove();

    if (message.type === 'LONG_TASK_COMPLETE') {
      entry.resolve({ success: true, result: message.result });
    } else if (message.type === 'LONG_TASK_ERROR') {
      entry.reject(new Error(message.error || 'Unknown long task error'));
    }
  }

  runTask(payload, { onProgress } = {}) {
    return this.startTask(payload, { onProgress });
  }
}

const longTaskChannel = new LongTaskChannel();

async function pingBackground() {
  return sendMessageSafely({ type: 'PING' });
}

async function saveSettings(settings) {
  return sendMessageSafely({ type: 'SAVE_SETTINGS', payload: settings });
}

async function loadSettings() {
  return sendMessageSafely({ type: 'GET_SETTINGS' });
}

async function runLongOperation(payload, { onProgress } = {}) {
  try {
    return await longTaskChannel.runTask(payload, { onProgress });
  } catch (error) {
    const message = String(error?.message || error);
    if (RETRYABLE_ERROR.test(message) || message === 'Port disconnected' || message === 'Port not available') {
      console.debug('[Content] Long task cancelled silently.');
      return { success: false, error: 'PORT_CLOSED' };
    }
    throw error;
  }
}

window.AtaAkademiYoklamaExtension = {
  pingBackground,
  saveSettings,
  loadSettings,
  runLongOperation,
};
