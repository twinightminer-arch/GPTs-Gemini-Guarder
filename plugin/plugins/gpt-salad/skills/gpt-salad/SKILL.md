---
name: gpt-salad
description: Translate words, phrases, or sentences from the current ChatGPT or Codex conversation and manage a local personal vocabulary collection when the user asks to save, favorite, search, edit, or export entries.
---

# GPT Salad

Translate text supplied in the current conversation using the active model. Do not call paid translation APIs or claim to read text selected elsewhere on the desktop.

For a word, give pronunciation when confident, part of speech, distinct contextual meanings, an independent example and Chinese translation for each meaning, and useful collocations. For a phrase, give contextual meanings and examples. For a sentence, give a natural translation, brief grammar analysis, and important vocabulary. State uncertainty rather than inventing a pronunciation or usage.

Keep each meaning independently identifiable. When the user asks to save a translation, create one entry JSON object with `id` (UUID), `entry_type` (word, phrase, sentence, or question), `source_text`, `source_language`, `target_language`, `meanings` (each with UUID `id`), `notes`, `tags`, `favorite`, `created_at`, and `updated_at`. Give examples their own text and translation fields. Save only at the user's request, or when they explicitly ask to favorite a meaning or entry. Favoriting a meaning sets its own `favorite` state and must preserve all notes.

Use the bundled `scripts/vocab.py` for durable writes, lookup, and export when local execution is available. The script stores plain UTF-8 JSON files outside the plugin at the user-selected vocabulary directory, or the default `Documents/GPT Salad Vocabulary` derived from the current home directory. For add/update, write UTF-8 JSON to a temporary file and pass `--input`; avoid shell pipelines that can corrupt Chinese text on Windows. After a write, read it back and report the saved ID and path. Do not overwrite an existing entry without an explicit edit request and a matching revision check. Distinguish un-favorite, archive, and delete. Never delete user notes as a side effect of un-favorite. Ask before permanent deletion.

If local file tools are unavailable in the host, provide the complete structured JSON to the user for manual saving and explain that persistence did not occur. Never claim a save or sync succeeded without checking it. Obsidian, Notion, and OneNote synchronization is not implemented in this plugin version.
