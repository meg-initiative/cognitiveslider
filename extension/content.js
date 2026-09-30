/* CognitiveSlider 1.1.0 - source-only technical preview. */
(() => {
  'use strict';
  const adapter = globalThis.MCSAdapters[location.hostname];
  if (!adapter || document.getElementById('cognitive-slider-extension')) return;
  const core = globalThis.MCSCore;
  let currentLevel = 5, busy = false, bypass = false;
  let lastSuffix = '', lastEditor = null;
  const conversation = globalThis.MCSConversation.create(location.hostname, location.pathname);
  const host = document.createElement('div');
  host.id = 'cognitive-slider-extension';
  host.style.cssText = 'position:fixed;right:16px;top:72px;z-index:2147483647;max-width:calc(100vw - 32px);';
  const shadow = host.attachShadow({mode: 'open'});
  shadow.innerHTML = `
    <style>
      :host{all:initial;color-scheme:light dark;font-family:system-ui,sans-serif}
      *{box-sizing:border-box} details{width:268px;max-width:calc(100vw - 32px);color:#222;background:#fffdf6;border:1px solid #b6ad9b;border-radius:8px;box-shadow:0 3px 14px #0002;font:13px/1.45 system-ui,sans-serif}
      summary{cursor:pointer;padding:10px 12px;font-weight:700} .body{padding:0 12px 12px}
      label{display:block} input{width:100%;margin:9px 0;accent-color:#3e6246} output{float:right;font-variant-numeric:tabular-nums}
      p{margin:7px 0} button{font:inherit;padding:6px 9px;border:1px solid #a59d90;border-radius:4px;cursor:pointer;background:#eee9dd;color:#222}
      :focus-visible{outline:2px solid #267547;outline-offset:3px} .buttons{display:flex;gap:6px;flex-wrap:wrap}
      #status{font-size:12px;overflow-wrap:anywhere} .small{font-size:11px;color:#59544b}
      @media(prefers-color-scheme:dark){details{background:#24231f;color:#eee;border-color:#665f53}button{background:#38352c;color:#eee}.small{color:#c9c2b5}}
    </style>
    <details open><summary>CognitiveSlider <span id="summary-level">0.5</span></summary><div class="body">
    <label for="level">MCS level <output id="value">0.5</output></label>
    <input id="level" type="range" min="0" max="10" step="1" value="5" aria-describedby="meaning">
    <p id="meaning">Choose and justify before the solution.</p>
    <div class="buttons"><button id="prepare" type="button">Prepare message</button><button id="remove" type="button">Remove instructions</button></div>
    <p id="status" role="status" aria-live="polite">Instructions are added when you send.</p>
    <p class="small">0 = ordinary AI behavior. Text messages only. New chats and reloads start at 0.5.</p>
    </div></details>`;
  document.documentElement.append(host);
  const slider = shadow.getElementById('level');
  const status = shadow.getElementById('status');
  const meanings = ['No added MCS; ordinary AI behavior.', 'Answer with the principle.', 'Answer with an optional understanding check.', 'Clarify the goal or a constraint first.', 'Choose between approaches.', 'Choose and justify before the solution.', 'Continue from a framework and first step.', 'Try first; receive hints and feedback.', 'Contribute at each key step.', 'Propose the method and solution.', 'Build the method, solution and verification.'];
  function setLevel(n) {
    currentLevel = core.level(n); slider.value = String(n); conversation.set(n);
    shadow.getElementById('value').textContent = (n / 10).toFixed(1);
    shadow.getElementById('summary-level').textContent = (n / 10).toFixed(1);
    shadow.getElementById('meaning').textContent = meanings[n];
  }
  function visible(el) { return !!el && el.isConnected && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; }
  function editor() {
    const matches = [...new Set(adapter.editors.flatMap(s => [...document.querySelectorAll(s)]))].filter(visible);
    // Avoid choosing between a chat composer and a message-editing composer.
    return matches.length === 1 ? matches[0] : null;
  }
  function sendButton() {
    const matches = [...new Set(adapter.sends.flatMap(s => [...document.querySelectorAll(s)]))].filter(el => visible(el) && el.dataset.testid !== 'stop-button');
    return matches.length === 1 ? matches[0] : null;
  }
  function text(el) { return el instanceof HTMLTextAreaElement ? el.value : el.innerText.replace(/\r\n/g, '\n'); }
  function write(el, value) {
    el.focus();
    if (el instanceof HTMLTextAreaElement) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', {bubbles: true}));
    } else {
      // Use the browser editing operation so editor frameworks receive input.
      // Do not assign innerHTML/textContent: that can desynchronize editor state.
      const selection = window.getSelection(), range = document.createRange();
      range.selectNodeContents(el); selection.removeAllRanges(); selection.addRange(range);
      if (!document.execCommand('insertText', false, value)) return false;
    }
    return text(el) === value;
  }
  function refreshRoute() {
    if (!conversation.update(location.pathname)) return;
    lastSuffix = ''; lastEditor = null; setLevel(conversation.get());
  }
  function prepare() {
    refreshRoute();
    const el = editor();
    if (!el) { status.textContent = 'Composer not identified. Use the MD instructions in your AI settings.'; return null; }
    if (el.querySelector('img, [contenteditable="false"]')) { status.textContent = 'This draft contains embedded content. Use the MD instructions for this message.'; return null; }
    const original = text(el);
    const userText = core.base(original, lastEditor === el ? lastSuffix : '');
    if (!userText.trim()) { status.textContent = 'Write a text message first.'; return null; }
    const requested = core.command(userText);
    if (requested !== null) setLevel(requested);
    const addition = core.suffix(currentLevel), value = userText + addition;
    if (original !== value && !write(el, value)) {
      if (text(el).endsWith(addition)) { lastSuffix = addition; lastEditor = el; }
      status.textContent = 'Editor update could not be verified. Review the draft; nothing was sent by CognitiveSlider.';
      return null;
    }
    lastSuffix = addition; lastEditor = el;
    status.textContent = 'MCS ' + (currentLevel / 10).toFixed(1) + ' prepared. Instructions are visible in your draft.';
    return {el, value};
  }
  slider.addEventListener('input', () => {
    const selected = Number(slider.value); refreshRoute(); setLevel(selected);
    // Update an already prepared draft without appending a second protocol.
    if (lastEditor?.isConnected && text(lastEditor).includes(lastSuffix) && lastSuffix) prepare();
  });
  shadow.getElementById('prepare').addEventListener('click', prepare);
  shadow.getElementById('remove').addEventListener('click', () => {
    if (!lastEditor?.isConnected || !lastSuffix || !text(lastEditor).includes(lastSuffix)) {
      status.textContent = 'No unchanged extension instructions to remove.'; return;
    }
    if (write(lastEditor, core.base(text(lastEditor), lastSuffix))) {
      lastSuffix = ''; status.textContent = 'Instructions removed from the draft. Sending adds the current MCS level again.';
    }
  });
  function intercept(event) {
    if (bypass) return;
    refreshRoute();
    const ready = editor();
    // A reviewed/prepared draft can use the user's genuine platform event.
    if (!busy && ready && ready === lastEditor && lastSuffix === core.suffix(currentLevel) && text(ready).endsWith(lastSuffix)) {
      const requested = core.command(core.base(text(ready), lastSuffix));
      if (requested === null || requested === currentLevel) {
        conversation.sent();
        status.textContent = 'Prepared message passed to the platform.';
        return;
      }
    }
    event.preventDefault(); event.stopImmediatePropagation();
    if (busy) return;
    busy = true;
    const prepared = prepare();
    if (!prepared) { busy = false; return; }
    // Let React/ProseMirror/Quill commit the input before invoking the native send.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try {
        const button = sendButton();
        if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true' || !prepared.el.isConnected || text(prepared.el) !== prepared.value) {
          status.textContent = 'Prepared, not sent. Review the draft and use the platform Send button.'; return;
        }
        conversation.sent();
        bypass = true; button.click();
        status.textContent = 'MCS instructions passed to the platform Send button.';
      } finally { bypass = false; busy = false; }
    }));
  }
  window.addEventListener('click', event => {
    const button = sendButton();
    if (button && event.composedPath().includes(button)) intercept(event);
  }, true);
  window.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing || event.keyCode === 229 || !adapter.enterSends) return;
    const el = editor();
    if (el && event.composedPath().includes(el)) intercept(event);
  }, true);
  window.addEventListener('submit', event => {
    const el = editor();
    if (el && event.target.contains(el)) intercept(event);
  }, true);
  // SPA navigation doesn't necessarily dispatch popstate. No conversation scan.
  setInterval(refreshRoute, 800);
})();
