# Testing and release status

Release: **1.1.0 technical preview**. Local verification: **2026-09-30**.

## Performed

- Core JavaScript checks: all eleven levels; invalid levels; direct commands; last valid command; zero; case-insensitive commands; ignored fenced/indented code and block quotes; exact tracked protocol removal and preservation of unrelated text.
- Chromium tests against locally intercepted HTML fixtures for ChatGPT-style, Claude-style and Gemini-style contenteditable editors, plus the ChatGPT textarea fallback.
- Fixture checks cover native Send and Enter interception, input-event synchronization, zero-level submission, explicit preparation, deduplication, removal, slider updates, initial chat URL assignment, new-route defaults, ambiguous editor blocking and panel visibility at a 375-pixel viewport.
- Syntax/manifest checks, equality of the bundled protocol to the source, and ZIP/source equality.

These fixtures reproduce supported DOM contracts; they are not copies of the providers' full applications. Network requests to their fixture URLs are intercepted by the test runner and answered locally. No real messages are sent.

## Not yet performed

- Loading this extension in a normal installed Chrome profile and checking all three authenticated live applications.
- Confirmation that current provider frontend state accepts the inserted text exactly, including across languages, accounts and gradual UI rollouts.
- Backend delivery, model compliance, long-session behavior or measurements of learning outcomes.
- Chrome Web Store review. There is no store listing.

## Live acceptance checklist

Use your own account and non-sensitive test questions. For **each** platform:

1. Install the unpacked extension and reload the AI page. Check the panel appears without covering essential controls; collapse it if necessary.
2. Set 0.3 and send a simple text question using the mouse. Inspect the sent message: it must include exactly one protocol block with `MCS_LEVEL=03`.
3. Send another text question with Enter. Check exactly one new message was sent and the new message contains the same level.
4. Change to 0.8, then 0.0. Inspect each next message for `08`, then `00`. Zero must still send rules that remove earlier MCS participation requirements.
5. Send a direct `/mcsset04` command on its own line. Check the slider and transmitted protocol both show 0.4.
6. Check Shift+Enter adds a newline; IME composition does not accidentally send.
7. Use Prepare message twice, then Remove instructions. Check the user text is intact and there are no duplicate rules. Check multi-paragraph drafts separately: editor newline serialization can vary.
8. Confirm new-chat defaults and first-message URL assignment. Reload and confirm the documented 0.5 reset.
9. Test navigation back to a previously visited conversation in the same tab.
10. Record browser version, provider, UI language, date, passed checks and any failure. Do not record private conversation text in the repository.

An English `aria-label` is used by one Claude send-button selector; localized variants may need an explicit adapter update. A visible slider alone does not establish a successful integration. On mismatch, use the MD method while the adapter is repaired.

## Reproducing tests

Run the commands in README.md. For a managed environment with an existing browser install, `tests/browser.cjs` accepts `MCS_PLAYWRIGHT_MODULE`, `MCS_CHROMIUM_PATH` and `MCS_CHROMIUM_ARGS` (a JSON array). These configure the test runner only and are not used by the extension.

## v1.1.0 regression

The user reported successful live Gemini injection in the published v1.0.2 package but a level reset between messages. The old code keyed state by the full pathname. Local regressions demonstrate resets on account-prefixed new-chat transitions and per-response subroutes. v1.1.0 uses stable conversation IDs, preserves zero as well as nonzero values, and ignores unknown intermediate routes. Tests cover five consecutive Gemini fixture submissions with URL changes. This isolates a code defect; it does not establish that every reported live reset has the same cause. The fix still needs confirmation in the user's live Gemini session.
