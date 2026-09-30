# Privacy

CognitiveSlider has no backend, telemetry, analytics, API keys, remote code or advertising.

The extension runs only on `chatgpt.com`, `claude.ai` and `gemini.google.com`. It reads and modifies the active text composer to append the MCS instructions. It does not scan conversation history or read model responses. It reads the current URL path to associate the numeric level with the current conversation.

Numeric levels and conversation-path keys are held in the tab's memory. The extension does not use cookies, localStorage, IndexedDB or Chrome persistent storage. Reloading discards these settings. Draft text and the last inserted instruction block are referenced transiently during editing and submission; they are not logged or written to a database.

The extension makes no network requests itself. When it activates the provider's Send button, the provider sends the user message, including the added instructions, using its normal service. The provider's own storage and privacy terms still apply.

The manifest requests no separate permissions beyond its three declared content-script match domains. Such content scripts can access the page DOM on those domains; the implementation intentionally limits its reads to the composer and controls. Review the source to verify this behavior.

Disable or remove the extension at `chrome://extensions`. This stops future extension activity; it cannot erase already submitted messages from the provider's history.
