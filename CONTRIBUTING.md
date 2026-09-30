# Contributing

Keep the core small: user-selected level, explicit rules, no automatic adaptation, telemetry or conversation storage.

1. Change the authoritative protocol in `protocol/cognitiveslider.md`, not the generated JavaScript.
2. Put platform-specific selectors in `extension/adapters.js`.
3. Add a fixture covering the changed editor or send path. Test the real platform separately with a harmless message in your own account.
4. Run `python3 scripts/build.py`, `node tests/core.test.cjs` and the browser fixture tests.
5. Check the installable ZIP matches the source. Include the rebuilt protocol and ZIP when changing extension files.
6. Document remaining limitations and the date/browser/platform of any live check. Do not commit account data, cookies, conversation exports or credentials.

A useful issue includes the platform, Chrome version, extension version, UI language, reproduction steps and whether the visible sent message included the protocol. Redact personal content.

Code and protocol contributions are distributed under the repository's MIT license.
