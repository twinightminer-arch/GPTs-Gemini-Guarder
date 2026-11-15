# GPT Salad 与 GPT Daddy 用户插件

已在本机注册插件市场 `gpt-salad-local`，并安装 `gpt-salad@gpt-salad-local`。在支持本地执行的 Codex 或 ChatGPT Work 会话中，可调用 `$gpt-salad`，例如：

- `$gpt-salad 翻译并解释 resilient`
- `$gpt-salad 收藏 resilient 的第二个释义`
- `$gpt-salad 导出我的生词本为 CSV`

插件使用当前会话的模型生成翻译，不要求 OpenAI API key。用户要求保存时，词条作为 UTF-8 JSON 文件写入本地词库；默认位置按当前账户推导为 `Documents/GPT Salad Vocabulary/entries`，也可以指定其他目录。JSON 可直接编辑，脚本支持列表、读取、更新、逐义收藏、归档和 CSV/JSON 导出。数据不放在插件安装缓存中。

插件目录：`plugins/gpt-salad`。离线管理脚本：`plugins/gpt-salad/scripts/vocab.py`。例如：

```powershell
python .\plugins\gpt-salad\scripts\vocab.py list
python .\plugins\gpt-salad\scripts\vocab.py export --format csv --output .\vocabulary.csv
```

当前版本只处理会话中提供的文本；它不会在 ChatGPT 原生右键菜单中添加“询问 ChatGPT”“Google 搜索”“复制”或收藏按钮。插件安装与原生选区菜单是两套机制。未连接 Obsidian、Notion、OneNote。ChatGPT 桌面端是否能执行本地脚本取决于该会话提供的本地工具；若没有，Skill 会输出可手动保存的 JSON，不会声称已写入文件。

## GPT Daddy

`gpt-daddy@gpt-salad-local` 也已安装，附带图标与管理 Skill。它是现有 GPTDaddy 壁纸伴随程序的插件入口；壁纸文件和配置继续保存在原来的 `LocalAppData/GPTDaddy`，插件安装不会迁移或清除这些数据。它会显示在本地市场与插件列表中。桌面应用可能需要刷新插件页面才能显示新条目。

GPT Daddy 插件负责在会话中检查和管理伴随程序。实际壁纸仍由已安装的 GPTDaddy 后台服务绘制；在 Codex 未开启 CDP 的进程上，安装插件本身无法恢复壁纸。
