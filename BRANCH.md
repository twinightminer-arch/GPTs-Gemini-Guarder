# GPTDaddy 产品线（历史分支）

本分支是 **GPT's Gemini Guarder** 主项目下的 **GPTDaddy 历史路线分支**。

GPTDaddy 是面向官方 OpenAI Codex Windows 桌面应用的壁纸引擎伴侣程序：从 Wallpaper Engine 项目库发现并导入壁纸，通过已验证的 CDP 会话把视频/图片背景注入 Codex 主页面，并提供中文优先的可视化控制面板。2026-10-12 立项，从 0.1.0 演进到 0.2.8。

2026-11-15，GPTDaddy 与 GPT Salad 合并为新主项目 **GPT's Gemini Guarder**（见 `main` 分支）。此后 GPTDaddy 的功能演进在主项目继续，本分支保留其最终独立形态：

- `dist/`：历代安装包与便携包产物（0.2.1 / 0.2.2 / 0.2.3 Setup.exe 与 Portable.zip，0.1.0 早期 zip）
- `dist/runtime-v0.2.1/`：运行时产物（main.mjs、catalog-worker.mjs、gemini-window.exe、gemini.png、public 面板、守护脚本；`node.exe` 属 Node.js 官方发行物，不随仓库分发，请自备 Node >= 22）
- `src/`、`scripts/`、`test/`、`docs/`、`installer/`：0.2.8 时点的完整源码与工程文件

许可证 AGPL-3.0-or-later，见 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。
