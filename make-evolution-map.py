from pathlib import Path
from html import escape

OUT = Path(__file__).parent / "docs" / "evolution-map.svg"
W, H = 1200, 1990
parts = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1990" viewBox="0 0 1200 1990" role="img" aria-label="GPTDaddy 与 GPT Salad 汇合为 GPT's Gemini Guarder 的版本演进图">
<defs>
  <linearGradient id="bg" x2="1" y2="1"><stop stop-color="#eef6ff"/><stop offset="1" stop-color="#f9f4ff"/></linearGradient>
  <linearGradient id="guard" x2="1" y2="1"><stop stop-color="#dcecff"/><stop offset="1" stop-color="#e8ddff"/></linearGradient>
  <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#637999"/></marker>
</defs>
<rect width="1200" height="1990" rx="30" fill="url(#bg)"/>
<style>
  text {font-family:Segoe UI,Microsoft YaHei,Noto Sans CJK SC,sans-serif;fill:#18324b}
  .h {font-size:30px;font-weight:750}.sub {font-size:18px;fill:#456077}
  .track {font-size:23px;font-weight:750}.ver {font-size:20px;font-weight:750}
  .desc {font-size:16px}.who {font-size:15px;fill:#526a83}
  .merge {font-size:28px;font-weight:800}.foot {font-size:16px;fill:#506785}
</style>
<text class="h" x="32" y="49">从两条独立产品线，到一个合并插件</text>
<text class="sub" x="32" y="78">时间：台北时间 UTC+8 · 版本节点来自 Git 标签、提交与项目记录</text>
<rect x="24" y="105" width="1152" height="176" rx="20" fill="#f3f8ff" stroke="#b9d5ef" stroke-width="2"/>
<text class="track" x="45" y="140">前史 · WorkBuddy 对桌面环境的修复</text>
<rect x="45" y="159" width="529" height="98" rx="14" fill="#fff" stroke="#a8c5e4"/>
<text class="ver" x="62" y="186">2026-09-30 · Codex 无窗口危机</text>
<text class="desc" x="62" y="212">定位 cua_node 根因</text>
<text class="who" x="62" y="238">WorkBuddy · Hunyuan 系列*</text>
<rect x="626" y="159" width="529" height="98" rx="14" fill="#fff" stroke="#a8c5e4"/>
<text class="ver" x="643" y="186">2026-10-09 · 修复工具与技能</text>
<text class="desc" x="643" y="212">制作 GUI exe；turning 技能上线</text>
<text class="who" x="643" y="238">WorkBuddy · Hunyuan 系列*</text>
<path d="M 579 208 H 616" fill="none" stroke="#637999" stroke-width="2" marker-end="url(#arrow)"/>
<g transform="translate(0 205)">
<rect x="24" y="105" width="557" height="909" rx="20" fill="#fff" stroke="#b9d5ef" stroke-width="2"/>
<rect x="619" y="105" width="557" height="909" rx="20" fill="#fff" stroke="#d7c9f0" stroke-width="2"/>
<rect x="45" y="117" width="36" height="36" rx="9" fill="#1b2c43"/>
<path d="M 63 124 Q 65 133 72 135 Q 65 137 63 146 Q 61 137 54 135 Q 61 133 63 124 Z" fill="#fff"/>
<text class="track" x="91" y="141">GPTDaddy · 壁纸与 Codex 界面</text>
<text class="track" x="640" y="141">GPT Salad · 划词与本地生词本</text>
''']

def text(x, y, value, klass):
    parts.append(f'<text class="{klass}" x="{x}" y="{y}">{escape(value)}</text>')

def box(x, y, w, h, version, description, agent, accent):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#f8fbff" stroke="{accent}" stroke-width="1.5"/>')
    parts.append(f'<rect x="{x}" y="{y}" width="6" height="{h}" rx="3" fill="{accent}"/>')
    text(x + 18, y + 25, version, "ver")
    text(x + 18, y + 48, description, "desc")
    text(x + 18, y + 69, agent, "who")

daddy = [
    ("0.1.0 · 10-12 23:31", "首个预览：CDP 壁纸与本机控制", "Codex · OpenAI GPT 系列*"),
    ("0.2.1 · 10-14 22:13", "安全安装 / 激活 / 权限弹窗可读性", "Codex · OpenAI GPT 系列*"),
    ("0.2.2 · 10-15 23:44", "输入框配色联动 / 对比度修复", "Codex · OpenAI GPT 系列*"),
    ("0.2.3 · 10-17 21:39", "去除对话底部渐变遮罩", "Codex · OpenAI GPT 系列*"),
    ("0.2.4 · 10-18 00:22", "更新后守护恢复 / 安全窗口关闭", "Codex · OpenAI GPT 系列*"),
    ("0.2.5 · 10-29 20:28", "重启保活 / 面板重建 / 模型标签配色", "Codex · OpenAI GPT 系列*"),
    ("0.2.6 · 11-11 13:10", "新版界面适配 / 电池供电启动", "Codex · OpenAI GPT 系列*"),
    ("0.2.7 · 11-11 13:47", "插件页顶栏 / 弹窗表面适配", "Codex + WorkBuddy · GPT / Hunyuan 系列*"),
    ("0.2.8 · 11-11 14:03", "实机热载入 / 浮动划词工具栏识别", "Codex + WorkBuddy · GPT / Hunyuan 系列*"),
]
for i, row in enumerate(daddy):
    y = 158 + i * 92
    box(44, y, 516, 81, *row, "#6e9dcf")
    if i:
        parts.append(f'<path d="M 302 {y-10} V {y-2}" fill="none" stroke="#637999" stroke-width="2" marker-end="url(#arrow)"/>')

box(640, 699, 515, 90, "原型 · 11-15 约 00:43", "WPF 选词读取 / 翻译 / 本地 JSON 词库", "Codex · OpenAI GPT 系列*", "#ad86d5")
box(640, 815, 515, 90, "插件包 · 11-15 约 00:48", "gpt-salad + 同批 gpt-daddy 插件包", "Codex · OpenAI GPT 系列*", "#ad86d5")
parts.append('<path d="M 897 790 V 807" fill="none" stroke="#637999" stroke-width="2" marker-end="url(#arrow)"/>')
text(654, 201, "这条产品线在 11 月 15 日凌晨诞生，", "sub")
text(654, 232, "在合并前只有原型与初版插件包。", "sub")
text(654, 275, "独立能力：", "ver")
for i, line in enumerate(["• 选中文字触发翻译", "• 用户自有的本地词条文件", "• 可编辑、收藏、导出词条", "• 外部同步失败不删除本地数据"]):
    text(655, 314 + i * 36, line, "desc")

parts.append('<path d="M 302 987 V 1037 H 570 V 1063" fill="none" stroke="#637999" stroke-width="3" marker-end="url(#arrow)"/>')
parts.append('<path d="M 897 907 V 1037 H 630 V 1063" fill="none" stroke="#637999" stroke-width="3" marker-end="url(#arrow)"/>')
parts.append('<rect x="194" y="1071" width="812" height="95" rx="22" fill="url(#guard)" stroke="#8b91d5" stroke-width="3"/>')
text(244, 1110, "GPTDaddy  +  GPT Salad  =", "merge")
text(244, 1146, "GPT's Gemini Guarder", "merge")
parts.append('<path d="M 600 1168 V 1195" fill="none" stroke="#637999" stroke-width="3" marker-end="url(#arrow)"/>')

guard = [
    ("本地插件包 0.2.0 · 11-15 约 02:25", "合并壁纸、划词、词库与 Gemini 面板", "决策：主人；实现：Codex · OpenAI GPT 系列*"),
    ("Daddy 能力续建 · 11-15 白天", "壁纸库预览 / 音量 / Gemini dock 修复", "WorkBuddy · Hunyuan 系列*"),
    ("合并后增强 · 11-15 白天至晚间", "五语言 / Salad 品牌 / 图标与渲染修复", "Codex · GPT 系列*；WorkBuddy · Hunyuan 系列*"),
    ("仓库发布 0.1.0 · 11-15 22:13", "main 汇入两条产品线；历史分支归档", "WorkBuddy · Hunyuan 系列*；主人验收"),
    ("名称定稿 · 11-15 22:24", "仓库名称统一为 GPT's Gemini Guarder", "WorkBuddy · Hunyuan 系列*；主人决策"),
]
for i, row in enumerate(guard):
    y = 1204 + i * 104
    box(194, y, 812, 91, *row, "#8b91d5")
    if i:
        parts.append(f'<path d="M 600 {y-13} V {y-3}" fill="none" stroke="#637999" stroke-width="2" marker-end="url(#arrow)"/>')

parts.append('</g>')
parts.append('</svg>')
OUT.write_text("\n".join(parts), encoding="utf-8")
print(OUT)
