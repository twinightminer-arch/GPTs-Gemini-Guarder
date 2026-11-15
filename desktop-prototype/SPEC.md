# GPT Salad 技术规格与阶段记录

## 产品边界

本地词库是权威数据源；任何 ChatGPT、Codex、Obsidian、Notion、OneNote 连接都是可选能力。桌面应用无需登录任何平台即可浏览、编辑、导出词库。默认翻译流程使用用户可见的现有会话，不调用收费 API，也不读取会话凭据。

## 目录与模块规划

本项目位于独立的 `outputs/gpt-salad`，未修改已有 Photoshop 项目。后续建议在正式仓库采用 `src/GptSalad.Desktop`、`src/GptSalad.Core`、`src/GptSalad.Storage`、`src/GptSalad.Sync.*`、`mcp/`、`skills/`、`tests/`。当前只有 Desktop 原型。

Photoshop Skill 可借鉴的模式：明确列出实际可用命令、验证每次操作的结果、区分桥接连接状态、保护本地密钥、如实标注未实现能力。其 COM/UXP 通道与 Photoshop 专有代码不应复制到取词模块。将来的 MCP 服务使用显式配对的本机 IPC，按最小权限暴露词库操作；不共享 ChatGPT 认证态。

## 取词链

全局快捷键 → 获取焦点 UIA 元素 → TextPattern.GetSelection → 若为空，临时 Ctrl+C → 尝试恢复原始 OLE 剪贴板对象 → 浮动面板。后续按应用增加适配器和可配置回退策略。必须记录捕获来源和错误，避免把无选区误报为成功。

## 翻译契约（待实现）

会话辅助流程应由用户可见的动作将文本交给 ChatGPT/Codex，再由明确的导入动作返回结构化结果。暂不假设外部程序可以调用桌面会话。响应 JSON 顶层：`schemaVersion`、`entryType`、`sourceText`、`sourceLanguage`、`targetLanguage`、`meanings[]`、`sentenceAnalysis`。每个 meaning 用稳定 UUID，包含释义、词性、例句及译文、搭配和语境。导入前严格校验结构，原文不匹配时拒绝覆盖。

## 本地数据与同步（待实现）

SQLite 开启 WAL、外键与事务。核心表：entry、meaning、example、tag、entry_tag、sync_destination、sync_job、sync_log。entry/meaning 均使用 UUID；收藏、取消收藏、归档、永久删除为不同操作，取消收藏不删除笔记。可读的 JSON/Markdown 导出是必需功能。同步作业按目的地独立排队，使用 entry UUID + 版本号构成幂等键；先写本地事务再投递；远端写入前检测版本冲突，不自动覆盖用户改动。凭据保存于 Windows Credential Manager。

Obsidian 使用用户指定 Vault 与目录，原子写文件、frontmatter UUID 与冲突检查；Notion 用官方 API 和 OAuth；OneNote 用 Microsoft Graph 和 OAuth。任何远端失败只影响该目的地队列。

## 本次环境检查与测试

2026-11-15：.NET SDK 10.0.400；Python 3.10.11；Node.js 24.18.0；Codex CLI 0.167.0-alpha.4.1。检测到 ChatGPT 进程。未检测到 Edge、Word 或 PDF 阅读器进程。

执行 `dotnet build --no-restore`：成功，0 警告，0 错误。尚未在 ChatGPT Desktop、Codex、Edge、Word、PDF 阅读器逐一进行真实选区捕获测试。进程存在不等于可用性验证，故目前这些应用的实际兼容性均为“未验证”。推测支持 TextPattern 的编辑控件可直接取词；浏览器/PDF 等控件可能需要 Ctrl+C 回退，此推测不计入通过率。

## 近期验收门槛

1. 在五个指定应用分别选中已知文本，记录 UIA/回退路径、捕获内容与失败原因。
2. 验证文本、图片、HTML、自定义格式剪贴板的恢复，包括延迟渲染和其他程序同时写入情况。
3. 处理高 DPI、多显示器、热键冲突、空选区和管理员权限窗口。
4. 完成 SQLite 词库与导出后，才将系统称为可独立使用的生词本。
