# GPT Salad — Phase 1 原型

Windows 10/11、.NET 10 WPF。运行 `src/GptSalad.Desktop` 后，程序驻留系统托盘。选中文本并按 **Ctrl+Alt+T**，在鼠标旁显示捕获的文本和捕获方法。托盘菜单可打开面板或退出。

构建与运行：

```powershell
dotnet build .\src\GptSalad.Desktop\GptSalad.Desktop.csproj
dotnet run --project .\src\GptSalad.Desktop\GptSalad.Desktop.csproj
```

这是取词原型，尚无翻译、词库、同步、安装程序。浮动面板目前提供复制和关闭操作，未实现原生应用右键菜单扩展。

## 当前限制

- UI Automation 只处理当前焦点元素的 TextPattern 选区；不暴露 TextPattern 的应用走 Ctrl+C 回退。
- 回退暂时通过 OLE IDataObject 恢复剪贴板。尚未对所有格式、延迟渲染内容、剪贴板历史和并发剪贴板写入做完整验证，因此不能宣称完全无损。
- Ctrl+C 回退可能触发目标应用自身的复制副作用。高完整性场景应先禁用此回退，后续加入格式验证与恢复失败提示。
- 目前没有 OCR、应用专用适配器、权限提升窗口适配或多屏边界处理。

架构与验证记录见 [SPEC.md](SPEC.md)。
