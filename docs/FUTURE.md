# Future development - not implemented in v1.0

The current release only asks the AI to apply the user-selected MCS interaction rules. The following are possible independent additions, not working commands in this release.

| Proposed command | Purpose |
| --- | --- |
| `/mcsaudit` | Display aggregate session statistics at that moment. |
| `/mcsstatuson` / `/mcsstatusoff` | Enable/disable automatic statistics display. |
| `/mcsauditon` / `/mcsauditoff` | Enable/disable parameter recording. |
| `/mcsstateon` / `/mcsstateoff` | Enable/disable local per-conversation retention in the extension. |

## Parameter audit

Count covered user messages, level changes and the distribution of covered messages by level. Preserve accumulated counts across audit off/on transitions; never reconstruct unrecorded intervals as if they were observed. Distinguish audited messages from total observed messages. Proposed defaults: audit on, automatic display off. Show statistics on request or when automatic display is enabled, with manual copy rather than an export subsystem.

Record parameters without retaining conversation content in the audit. A parameter log shows which configuration was applied. It does not certify model compliance, measure cognitive progress, or establish employee effort or intelligence.

## Retention and display

Display and recording are separate controls. Hiding statistics does not disable counting. Disabling retention does not automatically delete prior saved data; deletion needs explicit semantics.

A Markdown instruction cannot itself create deterministic external storage. Any AI-maintained counters depend on available context and may be inaccurate. An extension can maintain observed-event counters in JavaScript, but displaying those counters inside a provider conversation requires a separate explicit integration.

## Other platforms and projects

Add adapters for Mistral, DeepSeek and other interfaces. Reuse the protocol and common logic in educational software or professional applications while maintaining each platform integration separately.

## CognitiveSlider Expert

A separate edition could implement the more complete MCS 2.0 mechanism from MEG, including sensitivity thresholds, processing-effort and semantic-complexity criteria, calibration and parameter records. It must explicitly separate measurable inputs from estimates and respect the limits of each platform's exposed data.

None of these additions authorizes automatic changes to the user's selected MCS level in the core edition.
