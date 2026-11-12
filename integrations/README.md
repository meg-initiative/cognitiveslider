# Platform Integrations

All integrations below implement the authoritative **CognitiveSlider v1.1** protocol (`protocol/cognitiveslider.md`) without telemetry, external servers, or automatic level changes.

| Integration | File | How to use |
| --- | --- | --- |
| **MCP Server (`stdio`)** | `mcp/cognitive_slider_mcp.py` | Zero-dependency Python MCP server exposing the `cognitive_slider` prompt and `get_mcs_protocol` tool for Claude Desktop, Cursor, Windsurf, and MCP-compatible clients. |
| **Agent Skills (`SKILL.md`)** | `claude-skill/SKILL.md` | Portable `SKILL.md` format for Claude (Desktop, Web, Code) and compatible skill-based AI agents. |
| **AI Coding Agents (`AGENTS.md`)** | `coding-agents/AGENTS.md` | Copy as `AGENTS.md` (or `CLAUDE.md` / `.cursorrules`) into any repository to enforce MCS during coding sessions. |
| **Google Gemini / HuggingChat** | `protocol/cognitiveslider.md` | Create a new Gem at `gemini.google.com/gems/create` (or open System Prompt settings in HuggingChat) and paste the protocol into **Instructions**. |
| **Open WebUI (Ollama / Local APIs)** | `open-webui/cognitive_slider_filter.py` | Install as a Workspace Function (`Filter`) in Open WebUI. Provides a native `0–10` UI slider (`Valves`) and `/mcssetNN` command support. |
| **Ollama** | `ollama/Modelfile.mcs-05`, `ollama/Modelfile.mcs-08` | Create a local MCS-enabled model variant with `ollama create`. |
| **LM Studio** | `lm-studio/cognitive-slider-v1.1.preset.json` | Import into LM Studio system prompt presets (`MCS_LEVEL=05` default). |
