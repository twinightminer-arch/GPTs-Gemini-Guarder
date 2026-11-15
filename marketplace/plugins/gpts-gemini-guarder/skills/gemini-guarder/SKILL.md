---
name: gemini-guarder
description: Use the real Gemini webpage inside the Guarder floating panel, translate selected text in Codex, manage local vocabulary, and inspect wallpaper controls.
---

# GPT's Gemini Guarder

Use the active Codex conversation for translation; do not call paid APIs or reuse private session credentials. When the user requests a word, show pronunciation if confident, part of speech, distinct meanings, examples with Chinese translations, and collocations. For phrases and sentences, provide natural translation and context; for sentences include brief grammar analysis.

The Codex desktop companion adds a selected-text menu when the verified main page has a loopback CDP connection. Clicking 划词翻译 submits a visible prompt in the active conversation; clicking 加入生词本 stores the original text locally. Do not claim a click succeeded without observing the result. The menu does not run in ChatGPT Chat, other apps, or a Codex process without verified CDP.

Vocabulary entries are plain UTF-8 JSON under the user's Documents/GPT Salad Vocabulary/entries. Do not place them in the plugin cache or the wallpaper directory. The bundled Python script can list, edit with revision checking, favorite individual meanings, archive, and export CSV/JSON. Use a UTF-8 input file for Chinese text. Never erase notes on un-favorite. Ask before permanent deletion.

The existing GPTDaddy companion controls wallpaper and stores its own configuration under LocalAppData/GPTDaddy. Preserve those settings and imported media. Check daemon health and verified Codex CDP status before reporting wallpaper state. A Codex restart requires user approval because it interrupts the active conversation.

The Guarder panel's Gemini tab docks the user's existing Chrome Gemini web-app window inside the panel through Win32 parenting. The Theme tab contains the former Home controls. Switching tabs or closing the panel should restore the Gemini window. This uses the user's existing browser sign-in, not a Gemini API key. Report successful embedding only after checking the rendered window, not merely the control status.

The three destination buttons open user-configured Notion, Obsidian, and OneNote addresses. They do not synchronize. Say so clearly.
