/* Keep platform-specific DOM selectors here. No conversation responses are read. */
(() => {
  'use strict';
  globalThis.MCSAdapters = Object.freeze({
    'chatgpt.com': {
      name: 'ChatGPT',
      editors: ['#prompt-textarea[contenteditable="true"]', 'textarea#prompt-textarea'],
      sends: ['button[data-testid="send-button"]', 'button#composer-submit-button'],
      enterSends: true
    },
    'claude.ai': {
      name: 'Claude',
      editors: ['div.ProseMirror[contenteditable="true"]'],
      sends: ['button[aria-label="Send message"]', 'button[aria-label="Send Message"]', 'button[data-testid="send-button"]'],
      enterSends: true
    },
    'gemini.google.com': {
      name: 'Gemini',
      editors: ['rich-textarea .ql-editor[contenteditable="true"]', 'div.ql-editor[contenteditable="true"][role="textbox"]'],
      sends: ['button.send-button', 'button[data-test-id="send-button"]'],
      enterSends: true
    }
  });
})();
