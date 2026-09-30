# Architecture

## One protocol, two delivery methods

`protocol/cognitiveslider.md` is authoritative. `scripts/build.py` writes a JavaScript string containing those exact UTF-8 bytes into `extension/protocol.js`. At runtime, `core.js` replaces the first-line default with the selected two-digit level and wraps the rules in visible delimiters.

The MD can be pasted into provider instructions. The extension appends an equivalent text block to a normal user message; it has user-message priority, not system priority.

## Files

- `manifest.json`: Manifest V3; three explicit HTTPS domains; isolated content scripts at document idle; no service worker.
- `protocol.js`: generated protocol string; no network fetch.
- `core.js`: level validation, suffix generation, direct command parsing and exact tracked block removal.
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

The browser editing operation uses `document.execCommand('insertText')`, a legacy editor API. It is deliberately isolated in `write()` so maintainers can replace it with a provider-specific method when required. Direct `innerHTML` mutation is avoided because it can bypass controlled editor state. Fixture verification is necessary but does not prove compatibility with provider frameworks.

## Level lifecycle

Default 05. Levels are kept per pathname in the current tab's memory. New unvisited paths default to 05. A send from the new-chat path can carry its chosen level into the newly assigned chat path. Reloads discard state. No cross-tab synchronization, audits or persistent counters exist.

URL patterns and the first-send transition are adapter maintenance concerns. An SPA can navigate in ways this generic path heuristic does not recognize; include those in live acceptance testing.

## Extension points

Keep core protocol logic separate from platform adapters. Supporting another platform requires explicit selectors, manifest scope, tests and an actual live check. Do not generalize by matching every contenteditable element or every button containing the word "send".

