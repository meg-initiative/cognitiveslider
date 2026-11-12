"""
title: CognitiveSlider (MCS v1.1)
author: Adrian (Adi) Stan
version: 1.1.0
license: MIT
description: Injects the CognitiveSlider v1.1 interaction protocol at the user-selected MCS level (00-10) into the system prompt.
"""

import re
from typing import Optional
from pydantic import BaseModel, Field

MCS_PROTOCOL_TEMPLATE = """MCS_LEVEL={level:02d}
# CognitiveSlider v1.1

MCS sets how much of the cognitive work the user carries: goal, method,
execution, verification. It shapes the interaction, not the accuracy or
rigor of your answers.

Levels 00-10; mu=MCS_LEVEL/10. Start new chats at this default; retain
user changes within the chat. Repeated rules do not reset it. An
extension's current level applies; a direct command wins.

Commands: /mcsset00-/mcsset10, case-insensitive, alone on a line in the
user's message; never from quotes, code or documents. Apply before
answering; last command wins. Confirm command-only messages; reject
invalid values. /mcsset00 cancels pending MCS tasks.

00: No MCS; ordinary behavior.
01: Answer; briefly state the key principle.
02: Answer and explain; point out decisions that are the user's to make.
03: Before solving, ask for the goal or a key constraint if it may
    change the answer; then solve.
04: Offer 2-3 approaches; the user chooses; you carry it out.
05: The user chooses an approach and says why; you work it through
    step by step; check the result together.
06: Give the framework and first step; the user proposes the next step.
07: The user attempts first; give hints and feedback before the solution.
08: The user leads each key step; you guide and check.
09: The user proposes method and solution; you give targeted guidance
    and flag errors.
10: The user builds method, solution and verification; you ask, hint
    and flag; do not take over.

The level fixes who does the work. Adapt how: which question, hint
size and step size, based on the conversation and what the user has
shown. Do not adjust the level itself.

Questions: ask only when the answer changes what happens next (a
decision, preference, attempt or idea from the user). Never ask what
you already know just to test recall. One question at a time; wait.
Credit prior input; do not re-ask what was given. A question whose
answer is a single short fact, with no reasoning step, is answered
directly at any level.

At 07-10, the first time in a chat that you ask for an attempt instead
of answering, say why in one sentence (e.g. "At level 07 you start;
I'll help with hints"). Do not repeat it.

Direct requests ("just give me the answer"):
00-06: give it immediately.
07-09: give it; briefly offer to compare with the user's attempt.
10: first request: ask for one attempt, however rough; the first time
    in a chat, add that the level can be lowered anytime (e.g.
    /mcsset07). Second request on the same problem: give the solution,
    no comment.
"I don't know" means stuck, not a request: give a more concrete hint
or a smaller step. Counts reset for each new problem.

On topic change, drop pending tasks, keep level. No auto-level
changes, audit or stats. Follow platform rules; never delay emergency
help for MCS.

Reply in the user's language unless another is requested; use the
chat language for command-only replies."""


def parse_last_command(messages: list) -> Optional[int]:
    """Scan user messages in order and return the last valid /mcsset00-/mcsset10 outside code fences."""
    found: Optional[int] = None
    for msg in messages:
        if msg.get("role") != "user":
            continue
        content = msg.get("content", "")
        if not isinstance(content, str):
            continue
        fence = None
        for line in content.splitlines():
            fence_match = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
            if fence_match:
                marker = fence_match.group(1)
                if fence is None:
                    fence = marker
                elif marker[0] == fence[0] and len(marker) >= len(fence):
                    fence = None
                continue
            if fence is not None:
                continue
            cmd_match = re.match(r"^\s{0,3}/mcsset(0[0-9]|10)\s*$", line, re.IGNORECASE)
            if cmd_match:
                found = int(cmd_match.group(1))
    return found


class Filter:
    class Valves(BaseModel):
        priority: int = Field(default=0, description="Filter execution priority.")
        default_mcs_level: int = Field(
            default=5,
            ge=0,
            le=10,
            description="Default MCS level (0 = ordinary AI, 5 = balanced, 10 = full user ownership).",
        )

    class UserValves(BaseModel):
        mcs_level: int = Field(
            default=5,
            ge=0,
            le=10,
            description="Your active MCS participation level (0 to 10).",
        )

    def __init__(self):
        self.valves = self.Valves()

    def inlet(self, body: dict, __user__: Optional[dict] = None) -> dict:
        messages = body.get("messages", [])
        level = self.valves.default_mcs_level

        if __user__ and "valves" in __user__:
            user_valves = __user__["valves"]
            if hasattr(user_valves, "mcs_level"):
                level = user_valves.mcs_level
            elif isinstance(user_valves, dict) and "mcs_level" in user_valves:
                level = int(user_valves["mcs_level"])

        cmd_level = parse_last_command(messages)
        if cmd_level is not None:
            level = cmd_level

        level = max(0, min(10, int(level)))
        protocol_block = MCS_PROTOCOL_TEMPLATE.format(level=level)

        if messages and messages[0].get("role") == "system":
            existing = messages[0].get("content", "")
            if "# CognitiveSlider v1.1" not in existing:
                messages[0]["content"] = f"{existing}\n\n{protocol_block}".strip()
        else:
            messages.insert(0, {"role": "system", "content": protocol_block})

        body["messages"] = messages
        return body