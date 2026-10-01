# CognitiveSlider

Choose how much you participate in building an AI answer.

CognitiveSlider applies the MCS interaction protocol at a level you choose: **0.0** adds no MCS requirements; **1.0** asks you to build the method, solution and verification with AI support. Intermediate levels define different participation rules. The level does not change automatically.

[Read the open letter](https://cognitiveslider.org/) · [Implementation page](https://cognitiveslider.org/implementation/)

## Two ways to use it

| Browser slider | AI instructions |
| --- | --- |
| Install a local Chrome extension. Move the slider, then send a text message. | Copy the Markdown protocol into your AI's personal instructions. |
| Platform adapters for ChatGPT, Claude and Gemini. | Plain English instructions, independent of a browser integration. |
| Adds the protocol and current level to each supported text submission. | The platform includes your saved instructions wherever its settings apply. |
| [Download the extension ZIP](releases/cognitiveslider-extension-v1.2.0.zip) | [Read or download the MD](protocol/cognitiveslider.md) |

**Status: technical preview.** The protocol and extension are inspectable source code. Automated tests cover local editor fixtures; authenticated live sessions on the three providers have not been tested. Platform changes may require adapter updates. AI compliance is not deterministic and is not certified by the slider.

## Install the slider in Chrome

1. Download [`cognitiveslider-extension-v1.2.0.zip`](releases/cognitiveslider-extension-v1.2.0.zip). On GitHub's file page, use **Download raw file** if necessary.
2. Extract it into a folder you will keep.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Select **Load unpacked**, then select the extracted folder containing `manifest.json`.
6. Open or reload ChatGPT, Claude or Gemini. A CognitiveSlider panel appears near the upper-right corner. Click its heading to collapse or expand it.
7. Choose a level and write a message. Use the site's Send button or Enter. Shift+Enter remains available for a new line.

No store installation, API key, paid extension account or build step is needed. The extension uses your existing AI account. It does not change the AI provider's subscription or limits.

The panel starts at **0.5**. Settings exist only in the current tab's memory. Reloading resets them. A new conversation starts at 0.5; the first send carries the chosen setting when the platform assigns that conversation its URL. A previously visited conversation can recover its level while that tab remains open.

**Prepare message** inserts the instructions without sending, so you can inspect them. **Remove instructions** removes an unchanged block inserted into the current draft by this extension instance. Sending again adds the current level again. To stop added MCS friction, set the level to zero. To stop all extension activity, disable it in `chrome://extensions`.

The instructions are visible text in the submitted message, separated from your text by a blank line and a horizontal text divider. They consume input context/tokens and become part of the conversation stored by the AI platform. The extension does not insert an actual system prompt or modify the provider's internal settings.

## Use the Markdown instructions

Open [`protocol/cognitiveslider.md`](protocol/cognitiveslider.md), copy the whole text, and paste it into the AI's personal/custom instructions. Change the first line to set the starting level:

```text
MCS_LEVEL=05
```

Use integers `00` through `10`; the displayed slider value is that integer divided by ten. A new conversation uses the saved default. Within a conversation, put a command alone on a line:

```text
/mcsset00
/mcsset03
/mcsset10
```

These mean level 0.0, 0.3 and 1.0. All eleven values are available. The last direct valid command wins; commands inside code blocks or block quotes are not treated as controls by the extension. A message containing an unquoted command alone on a line is treated as an intentional control, so quote examples you do not want applied. Only the user changes the level.

Instructions are in English. The final rule tells the AI to answer in the language of the user's question unless another language is requested. No model-language superiority claim is needed for this common protocol.

At zero, the AI follows ordinary behavior without added MCS participation requirements. Provider rules still apply. The protocol explicitly says not to delay emergency help for MCS.

## What is included

- `extension/`: Chrome Manifest V3 extension, ready to load unpacked.
- `protocol/`: authoritative Markdown protocol and the level definitions.
- `releases/`: installable extension ZIP built from the supplied source.
- `scripts/build.py`: regenerates the embedded protocol and ZIP using Python 3.
- `tests/`: core tests and browser fixture tests.
- `docs/`: architecture, privacy, maintenance and future work.

There is no PHP website generator in this repository. The MD file is the source of truth. The extension bundles the same text and replaces only `MCS_LEVEL` for the selected level.

## Scope and limitations

- Ordinary **text** messages are the target. Voice, dictation auto-submit, rich embedded objects, message editing, regeneration, scheduled/agent actions and attachment-only submissions are not supported.
- There must be one identifiable editor and one identifiable Send button. The integration does not guess among multiple composers.
- On a recognized send action, the extension first stops that action, updates the editor, verifies its visible text, then invokes the platform Send button after the editor has had time to update. If verification fails, it does not issue that send. Review the draft if an error appears.
- If a platform changes its selectors or sends through another mechanism, automatic interception may not happen. Seeing the slider is not proof a message contained the protocol. Inspect the sent message during acceptance testing.
- The extension does not read or evaluate AI answers. A selected setting is an instruction, not evidence the AI followed it.
- Repeating instructions improves availability of the rules; it does not guarantee obedience or unlimited context memory.
- The MD and the slider are alternative controls. If used together, keep the protocol versions consistent; the extension's current value applies, with a direct command taking precedence.

## Development

No dependencies are required for the extension itself. All executable code is bundled locally; there are no remote scripts.

```sh
python3 scripts/build.py
node tests/core.test.cjs
node tests/conversation.test.cjs
```

For optional local browser fixture tests:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.cjs
```

Browser tests intercept their fixture URLs locally; they do not sign in or send messages to real AI accounts. See [testing](docs/TESTING.md) for the live acceptance checklist and test limitations.

To add another platform, add an explicit hostname/editor/send adapter, narrow the manifest matches, and add fixture and live acceptance checks. Contributions for Mistral, DeepSeek and other projects are welcome. See [contributing](CONTRIBUTING.md).

## License

MIT. Copyright (c) 2026 Adrian (Adi) Stan.

The source and protocol are open to independent inspection and reuse. Inspection by a person or AI is useful but is not a guarantee of safety or correctness. This project is independent of OpenAI, Anthropic and Google.
