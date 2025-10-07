# Troubleshooting

## "The message port closed before a response was received"

### What the error means
Chrome prints this message when a content script (usually injected by a browser extension) sends a request to its background service worker or extension page using `chrome.runtime.sendMessage`/`chrome.tabs.sendMessage`, but the other side closes before `sendResponse` is called. Because the promise returned by the messaging API is rejected, DevTools shows the error in the console.

The Ata Akademi Yoklama frontend (`public/index.html`) does not ship a `content.js` bundle or any Chrome extension messaging code, so the error is not originating from the application itself. It is produced by a third-party extension that is active on the page.

### Likely causes
* A browser extension injected a `content.js` file and attempted to contact its background service worker, but the worker terminated or never called `sendResponse`.
* The extension's message handler performs asynchronous work without returning `true` from the listener, so Chrome automatically closes the port before the async task resolves.
* The extension was disabled/uninstalled/reloaded while the message was in flight.

### How to fix it
* Temporarily disable extensions and reload the page to identify which one is responsible. Update or remove the misbehaving extension once it is known.
* If you maintain the extension, make sure the `chrome.runtime.onMessage` listener either calls `sendResponse` synchronously or returns `true` to keep the port open while asynchronous work completes:

  ```js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    doSomethingAsync(message)
      .then(result => sendResponse({ ok: true, result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));

    return true; // keeps the message port open until sendResponse is called
  });
  ```

With the extension fixed or disabled, reloading the Ata Akademi Yoklama page will open cleanly without the console error.
