---
name: gpt-daddy
description: Inspect and manage the user's installed GPTDaddy Codex wallpaper companion, including its status, saved wallpaper data, and controlled recovery.
---

# GPT Daddy

This plugin is the Codex entry point for the user's existing GPTDaddy Windows companion. The wallpaper renderer remains the installed companion program; do not claim the plugin alone draws the wallpaper.

Discover the installed program under the current user's LocalAppData/Programs/GPTDaddy and saved data under LocalAppData/GPTDaddy. Check the exact path before running any script. Do not print API tokens from state.json. Use the companion's documented health endpoint and doctor command for status. Preserve all imports, wallpaper selections, colors, and settings.

If the user asks to recover a missing wallpaper, first verify the official Codex process, daemon health, and whether its verified loopback CDP target is available. A Codex restart can interrupt the conversation; ask before restarting. Never force-stop without explicit authorization. After a recovery attempt, re-check the wallpaper lifecycle state and report actual results.

The companion's source project may be in a different directory or missing. Use the installed program when possible; never hardcode a prior conversation workspace as the runtime source.
