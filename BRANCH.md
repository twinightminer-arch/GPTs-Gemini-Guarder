# GPT Salad 产品线（历史分支）

本分支是 **GPT's Gemini Guard** 主项目下的 **GPT Salad 历史路线分支**。

GPT Salad 是一个划词翻译 + 本地生词本工具：在 Codex 桌面端选中文本后弹出「划词翻译 / 加入生词本 / 复制 / 搜索」菜单，词条保存为用户自有的 UTF-8 JSON 文件（`Documents/GPT Salad Vocabulary/entries`），不依赖任何平台同步。2026-11-15 深夜诞生，当晚即与 GPTDaddy 合并为新主项目 **GPT's Gemini Guard**（见 `main` 分支），是这条产品线最短命也最关键的一夜。

本分支保留它的两个形态：

- `desktop-prototype/`：WPF (.NET 10) 桌面原型 —— 产品规格见 `SPEC.md`，含源码与 Debug 构建产物
- `plugin/`：agent 插件包 —— `gpt-salad` 生词本插件（含 `vocab.py` 词库脚本与图标）与同批打包的 `gpt-daddy` 壁纸插件

合并后，生词本能力以「GPT Salad 生词本」栏目继续活在主项目的悬浮面板中，并接入了 Notion / Obsidian / OneNote 三个外部入口。
