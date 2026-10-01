# Architecture

## One protocol, two delivery methods

`protocol/cognitiveslider.md` is authoritative. `scripts/build.py` writes a JavaScript string containing those exact UTF-8 bytes into `extension/protocol.js`. At runtime, `core.js` replaces the first-line default with the selected two-digit level and wraps the rules in visible delimiters, preceded by a blank line and a 32-hyphen separator.

The MD can be pasted into provider instructions. The extension appends an equivalent text block to a normal user message; it has user-message priority, not system priority.

## Files

- `manifest.json`: Manifest V3; three explicit HTTPS domains; isolated content scripts at document idle; no service worker.
- `protocol.js`: generated protocol string; no network fetch.
- `core.js`: level validation, suffix generation, direct command parsing and exact tracked block removal.
- `conversation.js`: stable conversation identity, account scoping and transient numeric level state.
- `adapters.js`: separate platform selectors; no broad generic Send-label fallback.
- `content.js`: isolated panel in a shadow root, composer operations, send interception and ephemeral numeric state.

## Send sequence

A draft already prepared and still matching the selected level can pass through the user's genuine send event without another edit. Otherwise:

1. Capture a recognized Send click, plain Enter in the recognized composer, or associated form submit.
2. Stop the original event and guard against duplicate actions while preparing.
3. Read the draft; remove only the exact instruction block previously inserted by this instance if it remains unchanged and uniquely identifiable.
4. Apply the last direct `/mcssetNN` command, if any. Reject values outside 00–10 as controls. Ignore Markdown fences, indented code and block-quoted commands.
5. Append the protocol with the current value, including at zero so earlier nonzero instructions are superseded.
6. Update the textarea through its native setter/input event, or the rich editor through the browser's editing operation. Verify the resulting visible text matches the intended text exactly.
7. After two animation frames, verify the draft is unchanged and the Send button is available; invoke it once with interception temporarily bypassed.

The final step confirms only that the platform Send button was invoked. It does not confirm backend delivery or model compliance. Attachment-only messages, embedded noneditable editor objects and alternative sending mechanisms are outside this preview's supported scope.

The browser editing operation uses `document.execCommand('insertText')` and `insertLineBreak`, legacy editor APIs. Explicit line breaks preserve the blank lines in the protocol and separator. Rich editors may represent indentation spaces as nonbreaking spaces; text comparison treats these as equivalent spaces. It is deliberately isolated in `write()` so maintainers can replace it with a provider-specific method when required. Direct `innerHTML` mutation is avoided because it can bypass controlled editor state. Fixture verification is necessary but does not prove compatibility with provider frameworks.

## Level lifecycle

Default 05. Levels are kept per stable conversation ID and account scope in the current tab's memory. The tracker ignores trailing slashes and message/response subroutes. Gemini account prefixes such as `/u/0` are separated from the conversation ID. Unrecognized intermediate routes do not reset the active setting.

A new conversation starts at 05. A Send action from a new-chat page transfers the selected level to the newly assigned conversation ID. Moving to another existing conversation restores that conversation's known level or defaults to 05. Reloads still discard memory; no persistent storage or new permissions are introduced.

## Extension points

Keep core protocol logic separate from platform adapters. Supporting another platform requires explicit selectors, manifest scope, tests and an actual live check. Do not generalize by matching every contenteditable element or every button containing the word "send".

