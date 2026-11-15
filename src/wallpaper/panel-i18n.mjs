/*
 * GPT's Gemini Guarder - panel language module.
 *
 * This module is intentionally SELF-CONTAINED: installPanelI18n() is stringified
 * and injected into the Codex page, so it must not reference anything outside
 * its own function body (no imports, no module-scope constants, no template
 * literals). It talks to the panel only through the open shadow root.
 *
 * Design goals:
 *  - Zero-latency switching: dictionaries live in memory; switching is one
 *    synchronous DOM pass. No rebuild, no network, no backend round-trip.
 *  - Non-invasive: existing panel markup and strings are untouched. The
 *    language settings block is created by this module at runtime, and all
 *    existing visible strings are translated by text-node rewriting.
 *  - Existing user settings are preserved; language preference lives in
 *    localStorage only and never touches GPTDaddy state.json.
 */
export function installPanelI18n() {
  var root = document.getElementById("gptdaddy-desktop-panel");
  if (!root || !root.shadowRoot) return;
  var shadow = root.shadowRoot;
  if (shadow.__guarderI18nInstalled) return;
  shadow.__guarderI18nInstalled = true;
  var htmlObserver = null;
  var poll = null;

  var LANGS = ["zh-CN", "zh-TW", "en", "ja", "ko"];
  var LABEL = {
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    "en": "English",
    "ja": "日本語",
    "ko": "한국어"
  };

  /* ---------- full strings (exact matches) ---------- */
  var KEYS = [
    "壁纸 · 划词翻译 · 本地生词本",
    "壁纸库", "生词本", "主题", "设置",
    "打开 GPTDaddy；可拖动", "打开 GPTDaddy", "GPTDaddy 控制面板", "关闭面板",
    "正在连接真实 Gemini 网页窗口…", "真实 Gemini 网页已连接", "嵌入状态下不可最小化",
    "正在读取已保存的主题设置…",
    "Wallpaper Engine 与本地壁纸库", "搜索标题或标签", "全部", "可应用视频", "本地导入", "其他",
    "仅收藏", "按名称", "按大小", "没有符合条件的壁纸。", "正在读取已缓存壁纸…",
    "收藏", "应用", "暂不可应用", "设为默认", "重命名", "删除", "壁纸名称",
    "正在应用壁纸…", "壁纸已应用", "已保存，等待 Codex 连接", "默认壁纸已保存并应用",
    "内部副本已删除", "视频已保存，正在后台检查编码和生成预览", "本地壁纸已导入，可在壁纸库应用",
    "我的生词本", "本地 JSON 文件是收藏的原件。选中文本后可用悬浮菜单保存。",
    "搜索词条", "刷新词条",
    "Notion 生词本地址", "打开 Notion 生词本", "Obsidian 生词本地址", "打开 Obsidian 生词本",
    "OneNote 生词本地址", "打开 OneNote 生词本", "粘贴你的 Notion 页面网址", "粘贴你的 OneNote 页面网址",
    "以上按钮只打开你配置的地址，不会自动同步词条。", "读取中…", "尚无词条",
    "取消收藏", "编辑笔记", "归档", "词条笔记",
    "地址需为 HTTPS，Obsidian 可用 obsidian://",
    "播放状态", "正在读取…", "图片壁纸已显示", "视频壁纸正在播放",
    "已加载，等待视频帧", "已连接，等待加载", "当前无法接入 Codex", "未选择", "壁纸功能已关闭",
    "继续播放", "暂停", "恢复原界面", "导入本地壁纸", "普通对话切换不会重置视频进度。",
    "画面与可读性", "字体颜色", "自动跟随 Codex", "输入框背景颜色", "使用 Codex 原色",
    "GPTDaddy 页面颜色", "GPTDaddy 页面颜色 HEX", "恢复默认",
    "内容背板不透明度", "背景遮罩", "背景模糊", "画面缩放", "壁纸音量",
    "拖动时立即预览，设置自动保存。", "设置已自动保存", "已暂停", "正在播放",
    "当前正常启动的 Codex 未开放可验证的 CDP 接口。", "控制通道未连接", "控制请求超时",
    "连接与恢复", "普通启动后自动恢复壁纸（仅对新启动的官方 Codex 正常退出并重开一次）",
    "设置保存在本机。关闭壁纸会移除背景层和控制面板，Codex 官方文件不变。启动加载页在安全连接建立前无法覆盖。",
    "自动恢复设置已保存",
    "语言设置", "跟随 Codex（ChatGPT）语言",
    "开启后，整个面板自动使用 Codex 当前界面语言；关闭后可在下方自定义。"
  ];

  var DICT = {
    "zh-TW": {
      "壁纸 · 划词翻译 · 本地生词本": "桌布 · 選詞翻譯 · 本機生字本",
      "壁纸库": "桌布庫", "生词本": "生字本", "主题": "主題", "设置": "設定",
      "打开 GPTDaddy；可拖动": "開啟 GPTDaddy；可拖曳", "打开 GPTDaddy": "開啟 GPTDaddy",
      "GPTDaddy 控制面板": "GPTDaddy 控制面板", "关闭面板": "關閉面板",
      "正在连接真实 Gemini 网页窗口…": "正在連線真實 Gemini 網頁視窗…",
      "真实 Gemini 网页已连接": "真實 Gemini 網頁已連線",
      "嵌入状态下不可最小化": "嵌入狀態下無法最小化",
      "正在读取已保存的主题设置…": "正在讀取已儲存的主題設定…",
      "Wallpaper Engine 与本地壁纸库": "Wallpaper Engine 與本機桌布庫",
      "搜索标题或标签": "搜尋標題或標籤", "全部": "全部", "可应用视频": "可套用影片",
      "本地导入": "本機匯入", "其他": "其他", "仅收藏": "僅收藏",
      "按名称": "依名稱", "按大小": "依大小",
      "没有符合条件的壁纸。": "沒有符合條件的桌布。", "正在读取已缓存壁纸…": "正在讀取已快取桌布…",
      "收藏": "收藏", "应用": "套用", "暂不可应用": "暫不可套用",
      "设为默认": "設為預設", "重命名": "重新命名", "删除": "刪除", "壁纸名称": "桌布名稱",
      "正在应用壁纸…": "正在套用桌布…", "壁纸已应用": "桌布已套用",
      "已保存，等待 Codex 连接": "已儲存，等待 Codex 連線",
      "默认壁纸已保存并应用": "預設桌布已儲存並套用", "内部副本已删除": "內部副本已刪除",
      "视频已保存，正在后台检查编码和生成预览": "影片已儲存，正在背景檢查編碼並產生預覽",
      "本地壁纸已导入，可在壁纸库应用": "本機桌布已匯入，可在桌布庫套用",
      "我的生词本": "我的生字本",
      "本地 JSON 文件是收藏的原件。选中文本后可用悬浮菜单保存。": "本機 JSON 檔案是收藏的原件。選取文字後可用懸浮選單儲存。",
      "搜索词条": "搜尋詞條", "刷新词条": "重新載入詞條",
      "Notion 生词本地址": "Notion 生字本位址", "打开 Notion 生词本": "開啟 Notion 生字本",
      "Obsidian 生词本地址": "Obsidian 生字本位址", "打开 Obsidian 生词本": "開啟 Obsidian 生字本",
      "OneNote 生词本地址": "OneNote 生字本位址", "打开 OneNote 生词本": "開啟 OneNote 生字本",
      "粘贴你的 Notion 页面网址": "貼上你的 Notion 頁面網址",
      "粘贴你的 OneNote 页面网址": "貼上你的 OneNote 頁面網址",
      "以上按钮只打开你配置的地址，不会自动同步词条。": "以上按鈕只會開啟你設定的位址，不會自動同步詞條。",
      "读取中…": "讀取中…", "尚无词条": "尚無詞條",
      "取消收藏": "取消收藏", "编辑笔记": "編輯筆記", "归档": "封存", "词条笔记": "詞條筆記",
      "地址需为 HTTPS，Obsidian 可用 obsidian://": "位址需為 HTTPS，Obsidian 可用 obsidian://",
      "播放状态": "播放狀態", "正在读取…": "正在讀取…",
      "图片壁纸已显示": "圖片桌布已顯示", "视频壁纸正在播放": "影片桌布播放中",
      "已加载，等待视频帧": "已載入，等待影片幀", "已连接，等待加载": "已連線，等待載入",
      "当前无法接入 Codex": "目前無法接入 Codex", "未选择": "未選擇", "壁纸功能已关闭": "桌布功能已關閉",
      "继续播放": "繼續播放", "暂停": "暫停", "恢复原界面": "還原原始介面",
      "导入本地壁纸": "匯入本機桌布", "普通对话切换不会重置视频进度。": "一般對話切換不會重設影片進度。",
      "画面与可读性": "畫面與可讀性", "字体颜色": "字型色彩", "自动跟随 Codex": "自動跟隨 Codex",
      "输入框背景颜色": "輸入框背景色彩", "使用 Codex 原色": "使用 Codex 原色",
      "GPTDaddy 页面颜色": "GPTDaddy 頁面色彩", "GPTDaddy 页面颜色 HEX": "GPTDaddy 頁面色彩 HEX",
      "恢复默认": "還原預設", "内容背板不透明度": "內容背板不透明度",
      "背景遮罩": "背景遮罩", "背景模糊": "背景模糊", "画面缩放": "畫面縮放", "壁纸音量": "壁紙音量",
      "拖动时立即预览，设置自动保存。": "拖曳時立即預覽，設定自動儲存。",
      "设置已自动保存": "設定已自動儲存", "已暂停": "已暫停", "正在播放": "播放中",
      "当前正常启动的 Codex 未开放可验证的 CDP 接口。": "目前正常啟動的 Codex 未開放可驗證的 CDP 介面。",
      "控制通道未连接": "控制通道未連線", "控制请求超时": "控制請求逾時",
      "连接与恢复": "連線與復原",
      "普通启动后自动恢复壁纸（仅对新启动的官方 Codex 正常退出并重开一次）": "一般啟動後自動恢復桌布（僅對新啟動的官方 Codex 正常結束並重開一次）",
      "设置保存在本机。关闭壁纸会移除背景层和控制面板，Codex 官方文件不变。启动加载页在安全连接建立前无法覆盖。": "設定儲存在本機。關閉桌布會移除背景層與控制面板，Codex 官方檔案不變。啟動載入頁在安全連線建立前無法覆蓋。",
      "自动恢复设置已保存": "自動恢復設定已儲存",
      "语言设置": "語言設定", "跟随 Codex（ChatGPT）语言": "跟隨 Codex（ChatGPT）語言",
      "开启后，整个面板自动使用 Codex 当前界面语言；关闭后可在下方自定义。": "開啟後，整個面板會自動使用 Codex 目前的介面語言；關閉後可在下方自訂。"
    },
    "en": {
      "壁纸 · 划词翻译 · 本地生词本": "Wallpaper · Text translation · Local vocabulary",
      "壁纸库": "Wallpapers", "生词本": "Vocabulary", "主题": "Theme", "设置": "Settings",
      "打开 GPTDaddy；可拖动": "Open GPTDaddy (draggable)", "打开 GPTDaddy": "Open GPTDaddy",
      "GPTDaddy 控制面板": "GPTDaddy control panel", "关闭面板": "Close panel",
      "正在连接真实 Gemini 网页窗口…": "Connecting to the real Gemini window…",
      "真实 Gemini 网页已连接": "Gemini window connected",
      "嵌入状态下不可最小化": "Minimizing is disabled while docked",
      "正在读取已保存的主题设置…": "Loading saved theme settings…",
      "Wallpaper Engine 与本地壁纸库": "Wallpaper Engine & Local Wallpapers",
      "搜索标题或标签": "Search title or tag", "全部": "All", "可应用视频": "Applicable videos",
      "本地导入": "Local imports", "其他": "Other", "仅收藏": "Favorites only",
      "按名称": "By name", "按大小": "By size",
      "没有符合条件的壁纸。": "No matching wallpapers.", "正在读取已缓存壁纸…": "Loading cached wallpapers…",
      "收藏": "Favorite", "应用": "Apply", "暂不可应用": "Not available",
      "设为默认": "Set as default", "重命名": "Rename", "删除": "Delete", "壁纸名称": "Wallpaper name",
      "正在应用壁纸…": "Applying wallpaper…", "壁纸已应用": "Wallpaper applied",
      "已保存，等待 Codex 连接": "Saved; waiting for Codex",
      "默认壁纸已保存并应用": "Default wallpaper saved and applied", "内部副本已删除": "Internal copy deleted",
      "视频已保存，正在后台检查编码和生成预览": "Video saved; checking codec and generating preview in the background",
      "本地壁纸已导入，可在壁纸库应用": "Local wallpaper imported; apply it from the library",
      "我的生词本": "My vocabulary",
      "本地 JSON 文件是收藏的原件。选中文本后可用悬浮菜单保存。": "The local JSON file is the original. Select text and use the floating menu to save it.",
      "搜索词条": "Search entries", "刷新词条": "Refresh entries",
      "Notion 生词本地址": "Notion notebook URL", "打开 Notion 生词本": "Open Notion notebook",
      "Obsidian 生词本地址": "Obsidian notebook URL", "打开 Obsidian 生词本": "Open Obsidian notebook",
      "OneNote 生词本地址": "OneNote notebook URL", "打开 OneNote 生词本": "Open OneNote notebook",
      "粘贴你的 Notion 页面网址": "Paste your Notion page URL",
      "粘贴你的 OneNote 页面网址": "Paste your OneNote page URL",
      "以上按钮只打开你配置的地址，不会自动同步词条。": "These buttons only open the addresses you configure; they do not sync entries.",
      "读取中…": "Loading…", "尚无词条": "No entries yet",
      "取消收藏": "Unfavorite", "编辑笔记": "Edit note", "归档": "Archive", "词条笔记": "Entry note",
      "地址需为 HTTPS，Obsidian 可用 obsidian://": "Address must be HTTPS (Obsidian may use obsidian://)",
      "播放状态": "Playback", "正在读取…": "Loading…",
      "图片壁纸已显示": "Image wallpaper displayed", "视频壁纸正在播放": "Video wallpaper playing",
      "已加载，等待视频帧": "Loaded; waiting for video frames", "已连接，等待加载": "Connected; waiting to load",
      "当前无法接入 Codex": "Cannot connect to Codex", "未选择": "None", "壁纸功能已关闭": "Wallpaper disabled",
      "继续播放": "Resume", "暂停": "Pause", "恢复原界面": "Restore original UI",
      "导入本地壁纸": "Import local wallpaper", "普通对话切换不会重置视频进度。": "Switching conversations does not reset video progress.",
      "画面与可读性": "Display & readability", "字体颜色": "Font color", "自动跟随 Codex": "Follow Codex automatically",
      "输入框背景颜色": "Input box background", "使用 Codex 原色": "Use Codex default",
      "GPTDaddy 页面颜色": "GPTDaddy page color", "GPTDaddy 页面颜色 HEX": "GPTDaddy page color (HEX)",
      "恢复默认": "Reset to default", "内容背板不透明度": "Content backdrop opacity",
      "背景遮罩": "Background scrim", "背景模糊": "Background blur", "画面缩放": "Zoom", "壁纸音量": "Wallpaper volume",
      "拖动时立即预览，设置自动保存。": "Preview while dragging; settings save automatically.",
      "设置已自动保存": "Settings saved", "已暂停": "Paused", "正在播放": "Playing",
      "当前正常启动的 Codex 未开放可验证的 CDP 接口。": "The running Codex instance has no verifiable CDP endpoint.",
      "控制通道未连接": "Control channel not connected", "控制请求超时": "Control request timed out",
      "连接与恢复": "Connection & recovery",
      "普通启动后自动恢复壁纸（仅对新启动的官方 Codex 正常退出并重开一次）": "Auto-restore wallpaper after a normal launch (applies to one clean restart of a newly launched official Codex)",
      "设置保存在本机。关闭壁纸会移除背景层和控制面板，Codex 官方文件不变。启动加载页在安全连接建立前无法覆盖。": "Settings are stored locally. Disabling the wallpaper removes the background and panel; official Codex files are untouched. The startup page cannot be covered before a secure connection is established.",
      "自动恢复设置已保存": "Auto-restore setting saved",
      "语言设置": "Language", "跟随 Codex（ChatGPT）语言": "Follow Codex (ChatGPT) language",
      "开启后，整个面板自动使用 Codex 当前界面语言；关闭后可在下方自定义。": "When on, the whole panel follows Codex's current UI language. Turn it off to choose a language below."
    },
    "ja": {
      "壁纸 · 划词翻译 · 本地生词本": "壁紙 · テキスト翻訳 · ローカル単語帳",
      "壁纸库": "壁紙ライブラリ", "生词本": "単語帳", "主题": "テーマ", "设置": "設定",
      "打开 GPTDaddy；可拖动": "GPTDaddy を開く（ドラッグ可）", "打开 GPTDaddy": "GPTDaddy を開く",
      "GPTDaddy 控制面板": "GPTDaddy コントロールパネル", "关闭面板": "パネルを閉じる",
      "正在连接真实 Gemini 网页窗口…": "実際の Gemini ウィンドウに接続中…",
      "真实 Gemini 网页已连接": "実際の Gemini ウィンドウに接続しました",
      "嵌入状态下不可最小化": "ドック中は最小化できません",
      "正在读取已保存的主题设置…": "保存済みのテーマ設定を読み込み中…",
      "Wallpaper Engine 与本地壁纸库": "Wallpaper Engine とローカル壁紙",
      "搜索标题或标签": "タイトルまたはタグを検索", "全部": "すべて", "可应用视频": "適用可能な動画",
      "本地导入": "ローカル読み込み", "其他": "その他", "仅收藏": "お気に入りのみ",
      "按名称": "名前順", "按大小": "サイズ順",
      "没有符合条件的壁纸。": "条件に合う壁紙がありません。", "正在读取已缓存壁纸…": "キャッシュ済み壁紙を読み込み中…",
      "收藏": "お気に入り", "应用": "適用", "暂不可应用": "適用できません",
      "设为默认": "既定に設定", "重命名": "名前を変更", "删除": "削除", "壁纸名称": "壁紙の名前",
      "正在应用壁纸…": "壁紙を適用中…", "壁纸已应用": "壁紙を適用しました",
      "已保存，等待 Codex 连接": "保存しました。Codex の接続を待機中",
      "默认壁纸已保存并应用": "既定の壁紙を保存して適用しました", "内部副本已删除": "内部コピーを削除しました",
      "视频已保存，正在后台检查编码和生成预览": "動画を保存しました。バックグラウンドでコーデック確認とプレビュー生成中",
      "本地壁纸已导入，可在壁纸库应用": "ローカル壁紙を読み込みました。ライブラリから適用できます",
      "我的生词本": "私の単語帳",
      "本地 JSON 文件是收藏的原件。选中文本后可用悬浮菜单保存。": "ローカル JSON が原本です。テキストを選択し、フローティングメニューから保存できます。",
      "搜索词条": "単語を検索", "刷新词条": "単語帳を更新",
      "Notion 生词本地址": "Notion 単語帳の URL", "打开 Notion 生词本": "Notion 単語帳を開く",
      "Obsidian 生词本地址": "Obsidian 単語帳の URL", "打开 Obsidian 生词本": "Obsidian 単語帳を開く",
      "OneNote 生词本地址": "OneNote 単語帳の URL", "打开 OneNote 生词本": "OneNote 単語帳を開く",
      "粘贴你的 Notion 页面网址": "Notion ページの URL を貼り付け",
      "粘贴你的 OneNote 页面网址": "OneNote ページの URL を貼り付け",
      "以上按钮只打开你配置的地址，不会自动同步词条。": "これらのボタンは設定したアドレスを開くだけで、単語は同期しません。",
      "读取中…": "読み込み中…", "尚无词条": "単語がありません",
      "取消收藏": "お気に入りを解除", "编辑笔记": "メモを編集", "归档": "アーカイブ", "词条笔记": "単語のメモ",
      "地址需为 HTTPS，Obsidian 可用 obsidian://": "アドレスは HTTPS 必須（Obsidian は obsidian:// 可）",
      "播放状态": "再生状態", "正在读取…": "読み込み中…",
      "图片壁纸已显示": "画像の壁紙を表示中", "视频壁纸正在播放": "動画の壁紙を再生中",
      "已加载，等待视频帧": "読み込み済み、動画フレームを待機中", "已连接，等待加载": "接続済み、読み込み待ち",
      "当前无法接入 Codex": "Codex に接続できません", "未选择": "未選択", "壁纸功能已关闭": "壁紙機能はオフです",
      "继续播放": "再生を再開", "暂停": "一時停止", "恢复原界面": "元の画面に戻す",
      "导入本地壁纸": "ローカル壁紙を読み込む", "普通对话切换不会重置视频进度。": "会話の切り替えで動画の再生位置はリセットされません。",
      "画面与可读性": "表示と読みやすさ", "字体颜色": "文字色", "自动跟随 Codex": "Codex に自動で追従",
      "输入框背景颜色": "入力欄の背景色", "使用 Codex 原色": "Codex の標準色を使う",
      "GPTDaddy 页面颜色": "GPTDaddy ページの色", "GPTDaddy 页面颜色 HEX": "GPTDaddy ページの色 (HEX)",
      "恢复默认": "既定に戻す", "内容背板不透明度": "コンテンツ背景の不透明度",
      "背景遮罩": "背景オーバーレイ", "背景模糊": "背景ぼかし", "画面缩放": "表示倍率", "壁纸音量": "壁紙の音量",
      "拖动时立即预览，设置自动保存。": "ドラッグ中に即時プレビュー、設定は自動保存されます。",
      "设置已自动保存": "設定を保存しました", "已暂停": "一時停止しました", "正在播放": "再生中",
      "当前正常启动的 Codex 未开放可验证的 CDP 接口。": "起動中の Codex で検証可能な CDP が開かれていません。",
      "控制通道未连接": "制御チャネルが未接続です", "控制请求超时": "制御リクエストがタイムアウト",
      "连接与恢复": "接続と復元",
      "普通启动后自动恢复壁纸（仅对新启动的官方 Codex 正常退出并重开一次）": "通常起動後に壁紙を自動復元（新しく起動した公式 Codex を一度だけ正常終了・再起動した場合）",
      "设置保存在本机。关闭壁纸会移除背景层和控制面板，Codex 官方文件不变。启动加载页在安全连接建立前无法覆盖。": "設定はローカルに保存されます。壁紙をオフにすると背景とパネルが消えますが、Codex の公式ファイルは変更されません。安全な接続が確立されるまで起動画面は上書きできません。",
      "自动恢复设置已保存": "自動復元の設定を保存しました",
      "语言设置": "言語設定", "跟随 Codex（ChatGPT）语言": "Codex（ChatGPT）の言語に従う",
      "开启后，整个面板自动使用 Codex 当前界面语言；关闭后可在下方自定义。": "オンにするとパネル全体が Codex の現在の表示言語に従います。オフにすると下で言語を選べます。"
    },
    "ko": {
      "壁纸 · 划词翻译 · 本地生词本": "배경화면 · 텍스트 번역 · 로컬 단어장",
      "壁纸库": "배경화면 라이브러리", "生词本": "단어장", "主题": "테마", "设置": "설정",
      "打开 GPTDaddy；可拖动": "GPTDaddy 열기 (드래그 가능)", "打开 GPTDaddy": "GPTDaddy 열기",
      "GPTDaddy 控制面板": "GPTDaddy 제어판", "关闭面板": "패널 닫기",
      "正在连接真实 Gemini 网页窗口…": "실제 Gemini 창에 연결 중…",
      "真实 Gemini 网页已连接": "실제 Gemini 창 연결됨",
      "嵌入状态下不可最小化": "도크 상태에서는 최소화할 수 없습니다",
      "正在读取已保存的主题设置…": "저장된 테마 설정 불러오는 중…",
      "Wallpaper Engine 与本地壁纸库": "Wallpaper Engine 및 로컬 배경화면",
      "搜索标题或标签": "제목 또는 태그 검색", "全部": "전체", "可应用视频": "적용 가능한 동영상",
      "本地导入": "로컬 가져오기", "其他": "기타", "仅收藏": "즐겨찾기만",
      "按名称": "이름순", "按大小": "크기순",
      "没有符合条件的壁纸。": "조건에 맞는 배경화면이 없습니다.", "正在读取已缓存壁纸…": "캐시된 배경화면 불러오는 중…",
      "收藏": "즐겨찾기", "应用": "적용", "暂不可应用": "적용할 수 없음",
      "设为默认": "기본값으로 설정", "重命名": "이름 변경", "删除": "삭제", "壁纸名称": "배경화면 이름",
      "正在应用壁纸…": "배경화면 적용 중…", "壁纸已应用": "배경화면 적용됨",
      "已保存，等待 Codex 连接": "저장됨, Codex 연결 대기 중",
      "默认壁纸已保存并应用": "기본 배경화면 저장 및 적용됨", "内部副本已删除": "내부 사본 삭제됨",
      "视频已保存，正在后台检查编码和生成预览": "동영상 저장됨, 백그라운드에서 코덱 확인 및 미리보기 생성 중",
      "本地壁纸已导入，可在壁纸库应用": "로컬 배경화면 가져옴, 라이브러리에서 적용 가능",
      "我的生词本": "내 단어장",
      "本地 JSON 文件是收藏的原件。选中文本后可用悬浮菜单保存。": "로컬 JSON 파일이 원본입니다. 텍스트를 선택한 뒤 플로팅 메뉴에서 저장하세요.",
      "搜索词条": "항목 검색", "刷新词条": "항목 새로고침",
      "Notion 生词本地址": "Notion 단어장 주소", "打开 Notion 生词本": "Notion 단어장 열기",
      "Obsidian 生词本地址": "Obsidian 단어장 주소", "打开 Obsidian 生词本": "Obsidian 단어장 열기",
      "OneNote 生词本地址": "OneNote 단어장 주소", "打开 OneNote 生词本": "OneNote 단어장 열기",
      "粘贴你的 Notion 页面网址": "Notion 페이지 URL 붙여넣기",
      "粘贴你的 OneNote 页面网址": "OneNote 페이지 URL 붙여넣기",
      "以上按钮只打开你配置的地址，不会自动同步词条。": "이 버튼은 설정한 주소만 열며 항목을 동기화하지 않습니다.",
      "读取中…": "불러오는 중…", "尚无词条": "항목이 없습니다",
      "取消收藏": "즐겨찾기 해제", "编辑笔记": "메모 편집", "归档": "보관", "词条笔记": "항목 메모",
      "地址需为 HTTPS，Obsidian 可用 obsidian://": "주소는 HTTPS여야 합니다 (Obsidian은 obsidian:// 가능)",
      "播放状态": "재생 상태", "正在读取…": "불러오는 중…",
      "图片壁纸已显示": "이미지 배경화면 표시됨", "视频壁纸正在播放": "동영상 배경화면 재생 중",
      "已加载，等待视频帧": "로드됨, 동영상 프레임 대기 중", "已连接，等待加载": "연결됨, 로드 대기 중",
      "当前无法接入 Codex": "Codex에 연결할 수 없음", "未选择": "선택 안 함", "壁纸功能已关闭": "배경화면 기능 꺼짐",
      "继续播放": "재생 계속", "暂停": "일시정지", "恢复原界面": "원래 화면 복원",
      "导入本地壁纸": "로컬 배경화면 가져오기", "普通对话切换不会重置视频进度。": "대화 전환 시 동영상 재생 위치는 초기화되지 않습니다.",
      "画面与可读性": "화면 및 가독성", "字体颜色": "글자 색", "自动跟随 Codex": "Codex 자동 따르기",
      "输入框背景颜色": "입력창 배경 색", "使用 Codex 原色": "Codex 기본 색 사용",
      "GPTDaddy 页面颜色": "GPTDaddy 페이지 색", "GPTDaddy 页面颜色 HEX": "GPTDaddy 페이지 색 (HEX)",
      "恢复默认": "기본값 복원", "内容背板不透明度": "콘텐츠 배경 불투명도",
      "背景遮罩": "배경 스크림", "背景模糊": "배경 흐림", "画面缩放": "화면 확대", "壁纸音量": "배경화면 볼륨",
      "拖动时立即预览，设置自动保存。": "드래그 시 즉시 미리보기, 설정은 자동 저장됩니다.",
      "设置已自动保存": "설정이 저장되었습니다", "已暂停": "일시정지됨", "正在播放": "재생 중",
      "当前正常启动的 Codex 未开放可验证的 CDP 接口。": "실행 중인 Codex에 검증 가능한 CDP가 없습니다.",
      "控制通道未连接": "제어 채널 연결 안 됨", "控制请求超时": "제어 요청 시간 초과",
      "连接与恢复": "연결 및 복구",
      "普通启动后自动恢复壁纸（仅对新启动的官方 Codex 正常退出并重开一次）": "일반 실행 후 배경화면 자동 복원 (새로 실행한 공식 Codex를 한 번 정상 종료 후 재시작한 경우)",
      "设置保存在本机。关闭壁纸会移除背景层和控制面板，Codex 官方文件不变。启动加载页在安全连接建立前无法覆盖。": "설정은 로컬에 저장됩니다. 배경화면을 끄면 배경과 패널이 제거되며 공식 Codex 파일은 변경되지 않습니다. 보안 연결 전에는 시작 화면을 덮을 수 없습니다.",
      "自动恢复设置已保存": "자동 복원 설정 저장됨",
      "语言设置": "언어 설정", "跟随 Codex（ChatGPT）语言": "Codex(ChatGPT) 언어 따르기",
      "开启后，整个面板自动使用 Codex 当前界面语言；关闭后可在下方自定义。": "켜면 패널 전체가 Codex의 현재 UI 언어를 따릅니다. 끄면 아래에서 직접 선택할 수 있습니다."
    }
  };

  /* ---------- fragments inside dynamically composed strings ---------- */
  var SEGMENTS = [
    "正在读取已保存的主题设置…",
    "仅删除 GPTDaddy 内部副本“", "？原始文件不会删除。",
    "本地导入 · ", "正在处理视频 · ", "编码不支持 · ", " 预览",
    "正在导入 ", "导入失败：", "保存失败：",
    "请先填写 ", " 生词本地址", "安全连接已建立；CDP 端口 ",
    "当前项目：", " 个窗口",
    "语言已切换：", "当前跟随：", "自定义语言："
  ];
  var SEG_DICT = {
    "zh-TW": {
      "仅删除 GPTDaddy 内部副本“": "僅刪除 GPTDaddy 內部副本「", "？原始文件不会删除。": "」？原始檔案不會刪除。",
      "本地导入 · ": "本機匯入 · ", "正在处理视频 · ": "正在處理影片 · ", "编码不支持 · ": "編碼不支援 · ",
      " 预览": " 預覽", "正在导入 ": "正在匯入 ", "导入失败：": "匯入失敗：", "保存失败：": "儲存失敗：",
      "请先填写 ": "請先填寫 ", " 生词本地址": " 生字本位址",
      "安全连接已建立；CDP 端口 ": "安全連線已建立；CDP 連接埠 ",
      "当前项目：": "目前項目：", " 个窗口": " 個視窗",
      "语言已切换：": "語言已切換：", "当前跟随：": "目前跟隨：", "自定义语言：": "自訂語言：",
      "。": "。", "：": "："
    },
    "en": {
      "仅删除 GPTDaddy 内部副本“": "Delete only the GPTDaddy internal copy: ", "？原始文件不会删除。": "? The original file is kept.",
      "本地导入 · ": "Local import · ", "正在处理视频 · ": "Processing video · ", "编码不支持 · ": "Unsupported codec · ",
      " 预览": " preview", "正在导入 ": "Importing ", "导入失败：": "Import failed: ", "保存失败：": "Save failed: ",
      "请先填写 ": "Please enter the ", " 生词本地址": " notebook address",
      "安全连接已建立；CDP 端口 ": "Secure connection established; CDP port ",
      "当前项目：": "Current: ", " 个窗口": " windows",
      "语言已切换：": "Language changed: ", "当前跟随：": "Following: ", "自定义语言：": "Custom language: ",
      "。": ".", "：": ": "
    },
    "ja": {
      "仅删除 GPTDaddy 内部副本“": "GPTDaddy 内部コピーのみ削除: 「", "？原始文件不会删除。": "」？元のファイルは削除されません。",
      "本地导入 · ": "ローカル読み込み · ", "正在处理视频 · ": "動画を処理中 · ", "编码不支持 · ": "非対応コーデック · ",
      " 预览": " プレビュー", "正在导入 ": "読み込み中 ", "导入失败：": "読み込み失敗: ", "保存失败：": "保存失敗: ",
      "请先填写 ": "入力してください: ", " 生词本地址": " 単語帳アドレス",
      "安全连接已建立；CDP 端口 ": "安全な接続を確立しました；CDP ポート ",
      "当前项目：": "現在の項目：", " 个窗口": " ウィンドウ",
      "语言已切换：": "言語を変更しました: ", "当前跟随：": "追従中: ", "自定义语言：": "言語を選択: ",
      "。": "。", "：": "："
    },
    "ko": {
      "仅删除 GPTDaddy 内部副本“": "GPTDaddy 내부 사본만 삭제: ", "？原始文件不会删除。": "? 원본 파일은 삭제되지 않습니다.",
      "本地导入 · ": "로컬 가져오기 · ", "正在处理视频 · ": "동영상 처리 중 · ", "编码不支持 · ": "지원하지 않는 코덱 · ",
      " 预览": " 미리보기", "正在导入 ": "가져오는 중 ", "导入失败：": "가져오기 실패: ", "保存失败：": "저장 실패: ",
      "请先填写 ": "입력하세요: ", " 生词本地址": " 단어장 주소",
      "安全连接已建立；CDP 端口 ": "보안 연결됨; CDP 포트 ",
      "当前项目：": "현재 항목: ", " 个窗口": " 개 창",
      "语言已切换：": "언어 변경됨: ", "当前跟随：": "따르는 언어: ", "自定义语言：": "사용자 지정 언어: ",
      "。": ".", "：": ": "
    }
  };

  /* ---------- reverse indexes (any language text -> Chinese key) ---------- */
  var EXTRA_DICT = {
    "zh-TW": {
      "GPT Salad 生词本": "GPT Salad 生字本",
      "外观": "外觀",
      "同步词条": "同步詞條",
      "三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。": "三個入口已連線你本機/雲端的目標；「同步詞條」會把本機詞庫按對應格式複製出來，本機 JSON 始終是原件，外部失敗不會刪除詞條。"
    },
    "en": {
      "GPT Salad 生词本": "GPT Salad Vocabulary",
      "外观": "Appearance",
      "同步词条": "Sync entries",
      "三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。": "All three destinations are connected to your local/cloud targets. Sync copies the local vocabulary in each format; the local JSON always stays the original, and an external failure never deletes local entries."
    },
    "ja": {
      "GPT Salad 生词本": "GPT Salad 単語帳",
      "外观": "外観",
      "同步词条": "単語を同期",
      "三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。": "3 つの連携先はローカル/クラウドのターゲットに接続済みです。「単語を同期」はローカル詞庫を各形式でコピーします。ローカル JSON が常に原本であり、外部の失敗でローカル項目が削除されることはありません。"
    },
    "ko": {
      "GPT Salad 生词本": "GPT Salad 단어장",
      "外观": "외형",
      "同步词条": "단어 동기화",
      "三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。": "세 연결 대상이 로컬/클라우드 목표에 연결되었습니다. '단어 동기화'는 로컬 단어장을 각 형식으로 복사하며, 로컬 JSON 이 항상 원본이고 외부 실패로 로컬 항목이 삭제되지 않습니다."
    }
  };
  for (var XL in EXTRA_DICT) {
    if (!DICT[XL]) DICT[XL] = {};
    for (var XK in EXTRA_DICT[XL]) {
      DICT[XL][XK] = EXTRA_DICT[XL][XK];
      if (KEYS.indexOf(XK) < 0) KEYS.push(XK);
    }
  }
  var EXACT = {};
  var FRAG = {};
  for (var i = 0; i < KEYS.length; i++) {
    var k = KEYS[i];
    EXACT[k] = k;
    for (var j = 0; j < LANGS.length; j++) {
      var dd = DICT[LANGS[j]];
      if (dd && dd[k]) EXACT[dd[k]] = k;
    }
  }
  for (var i2 = 0; i2 < SEGMENTS.length; i2++) {
    var k2 = SEGMENTS[i2];
    FRAG[k2] = k2;
    for (var j2 = 0; j2 < LANGS.length; j2++) {
      var sd = SEG_DICT[LANGS[j2]];
      if (sd && sd[k2]) FRAG[sd[k2]] = k2;
    }
  }
  function esc(s) { return s.replace(/[.*+?^$()|[\]\\{}]/g, function (m) { return "\\" + m; }); }
  var fragSources = Object.keys(FRAG).sort(function (a, b) { return b.length - a.length; });
  var FRAG_RE = new RegExp(fragSources.map(esc).join("|"), "g");

  /* ---------- persistent preference (localStorage only) ---------- */
  var K_FOLLOW = "gpt-guarder-language-follow";
  var K_LANG = "gpt-guarder-language";
  var follow;
  try { follow = localStorage.getItem(K_FOLLOW) !== "0"; } catch (e) { follow = true; }
  var lang = "zh-CN";
  try { lang = localStorage.getItem(K_LANG) || "zh-CN"; } catch (e) {}
  if (LANGS.indexOf(lang) < 0) lang = "zh-CN";

  function pick(k) {
    if (lang === "zh-CN") return k;
    var d = DICT[lang];
    if (d && d[k]) return d[k];
    var s = SEG_DICT[lang];
    if (s && s[k]) return s[k];
    return k;
  }
  function rewrite(text) {
    if (!text) return text;
    var trimmed = text.trim();
    var key = EXACT[trimmed];
    if (key) return text.replace(trimmed, pick(key));
    return text.replace(FRAG_RE, function (m) { return pick(FRAG[m]); });
  }

  /* ---------- detect Codex UI language (read-only, non-intrusive) ---------- */
  function fromTag(v) {
    if (!v) return null;
    var s = String(v).toLowerCase().replace(/_/g, "-");
    if (/^zh(-hans|-cn|-sg|-cmn|$)/.test(s)) return "zh-CN";
    if (/^zh(-hant|-tw|-hk|-mo)/.test(s)) return "zh-TW";
    if (/^ja(-|$)|^jp(-|$)/.test(s)) return "ja";
    if (/^ko(-|$)|^kr(-|$)/.test(s)) return "ko";
    if (/^en(-|$)/.test(s)) return "en";
    return null;
  }
  function detectCodexLanguage() {
    var hit = fromTag(document.documentElement.lang);
    if (hit) return hit;
    var candidates = [];
    try {
      for (var q = 0; q < localStorage.length; q++) {
        var name = localStorage.key(q);
        if (!name || !/(^|[-_])(lang|locale|language|i18n)/i.test(name)) continue;
        var val = localStorage.getItem(name);
        if (val && val.length < 40) candidates.push(val);
      }
    } catch (e) {}
    for (var c = 0; c < candidates.length; c++) {
      hit = fromTag(candidates[c]);
      if (hit) return hit;
    }
    var nav = navigator.languages || [navigator.language];
    for (var n = 0; n < nav.length; n++) {
      hit = fromTag(nav[n]);
      if (hit) return hit;
    }
    /* last resort: inspect visible Codex text only once */
    var bodyText = "";
    try { bodyText = (document.body.innerText || "").slice(0, 4000); } catch (e) {}
    function has(arr) { for (var x = 0; x < arr.length; x++) if (bodyText.indexOf(arr[x]) >= 0) return true; return false; }
    if (has(["新しいチャット", "設定", "送信", "検索"])) return "ja";
    if (has(["새 채팅", "설정", "검색", "전송"])) return "ko";
    if (has(["新增對話", "設定", "繁體", "對話"])) return "zh-TW";
    if (has(["新聊天", "新对话", "设置", "搜索", "发送"])) return "zh-CN";
    if (has(["New chat", "Settings", "Search", "Send message"])) return "en";
    return "zh-CN";
  }

  if (follow) lang = detectCodexLanguage();

  /* ---------- build the language settings block ---------- */
  var settingsView = shadow.querySelector('[data-view="settings"]');
  if (settingsView && !settingsView.querySelector("[data-guarder-lang-block]")) {
    var block = document.createElement("div");
    block.setAttribute("data-guarder-lang-block", "");
    block.style.cssText = "display:grid;gap:9px;margin-top:18px;padding-top:15px;border-top:1px solid var(--ui-border,#ffffff30)";
    var h = document.createElement("h2");
    h.style.cssText = "font-size:15px;margin:0";
    h.textContent = "语言设置";
    block.append(h);

    var line = document.createElement("label");
    line.className = "color-row";
    line.style.cssText = "display:flex;gap:9px;align-items:center;margin:0";
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.setAttribute("data-guarder-follow", "");
    cb.style.accentColor = "#ffbe66";
    var cbText = document.createElement("span");
    cbText.textContent = "跟随 Codex（ChatGPT）语言";
    line.append(cb, cbText);
    block.append(line);

    var desc = document.createElement("p");
    desc.style.cssText = "margin:0;color:var(--ui-muted,#b9c7d6)";
    desc.textContent = "开启后，整个面板自动使用 Codex 当前界面语言；关闭后可在下方自定义。";
    block.append(desc);

    var options = document.createElement("div");
    options.setAttribute("data-guarder-skip", "");
    options.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:2px";
    for (var oi = 0; oi < LANGS.length; oi++) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-guarder-pick", LANGS[oi]);
      b.textContent = LABEL[LANGS[oi]];
      b.style.cssText = "border:1px solid var(--ui-border,#ffffff30);border-radius:9px;padding:7px 11px;cursor:pointer;font:inherit;background:var(--ui-button,#254058);color:var(--ui-ink,#eff5fc)";
      options.append(b);
    }
    block.append(options);

    var detected = document.createElement("small");
    detected.setAttribute("data-guarder-detected", "");
    detected.style.cssText = "color:var(--ui-muted,#b9c7d6);min-height:16px";
    block.append(detected);
    settingsView.append(block);
  }

  /* CSS ::after text is not a text node: override it with a variable */
  var override = document.createElement("style");
  override.textContent = '.view[data-view="theme"]:not([data-ready])::after{content:var(--guarder-loading) !important}';
  shadow.append(override);

  /* ---------- synchronous, zero-latency DOM pass ---------- */
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var mo = new MutationObserver(function () {
    if (!shadow.isConnected) return;
    rewriteAll();
  });
  function rewriteAll() {
    mo.disconnect();
    try {
      var walker = document.createTreeWalker(shadow, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (var a = 0; a < nodes.length; a++) {
        var node = nodes[a];
        var pe = node.parentElement;
        if (pe && (pe.closest("[data-guarder-skip]") || pe.tagName === "STYLE" || pe.tagName === "SCRIPT")) continue;
        var out = rewrite(node.nodeValue);
        if (out !== node.nodeValue) node.nodeValue = out;
      }
      var els = shadow.querySelectorAll("[placeholder],[title],[aria-label],[alt]");
      for (var b = 0; b < els.length; b++) {
        var el = els[b];
        if (el.closest("[data-guarder-skip]")) continue;
        for (var c = 0; c < ATTRS.length; c++) {
          var attr = ATTRS[c];
          var val = el.getAttribute(attr);
          if (!val) continue;
          var next = rewrite(val);
          if (next !== val) el.setAttribute(attr, next);
        }
      }
    } finally {
      mo.observe(shadow, { subtree: true, childList: true, characterData: true });
    }
  }
  function showMessage(text) {
    var el = shadow.querySelector("[data-message]");
    if (el) el.textContent = rewrite(text);
  }
  function syncControls() {
    var box = shadow.querySelector("[data-guarder-follow]");
    if (box) box.checked = follow;
    var buttons = shadow.querySelectorAll("[data-guarder-pick]");
    for (var i3 = 0; i3 < buttons.length; i3++) {
      var btn = buttons[i3];
      var active = btn.getAttribute("data-guarder-pick") === lang;
      btn.disabled = follow;
      btn.style.opacity = follow ? ".45" : "1";
      btn.style.cursor = follow ? "default" : "pointer";
      btn.style.background = active
        ? "linear-gradient(120deg,#566fd4,#9967d5)"
        : "var(--ui-button,#254058)";
      btn.style.color = active ? "#fff" : "var(--ui-ink,#eff5fc)";
    }
    var hint = shadow.querySelector("[data-guarder-detected]");
    if (hint) hint.textContent = (follow ? "当前跟随：" : "自定义语言：") + LABEL[lang];
  }
  function applyLanguage() {
    root.style.setProperty("--guarder-loading", '"' + pick("正在读取已保存的主题设置…").replace(/"/g, '\\"') + '"');
    syncControls();
    rewriteAll();
  }

  /* ---------- events ---------- */
  var followBox = shadow.querySelector("[data-guarder-follow]");
  if (followBox) {
    followBox.addEventListener("change", function () {
      follow = followBox.checked;
      try { localStorage.setItem(K_FOLLOW, follow ? "1" : "0"); } catch (e) {}
      if (follow) lang = detectCodexLanguage();
      else {
        try { lang = localStorage.getItem(K_LANG) || "zh-CN"; } catch (e) { lang = "zh-CN"; }
        if (LANGS.indexOf(lang) < 0) lang = "zh-CN";
      }
      applyLanguage();
      showMessage("语言已切换：" + LABEL[lang]);
    });
  }
  var picks = shadow.querySelectorAll("[data-guarder-pick]");
  for (var pi = 0; pi < picks.length; pi++) {
    picks[pi].addEventListener("click", function (ev) {
      if (follow) return;
      lang = ev.currentTarget.getAttribute("data-guarder-pick");
      try { localStorage.setItem(K_LANG, lang); } catch (e) {}
      applyLanguage();
      showMessage("语言已切换：" + LABEL[lang]);
    });
  }

  applyLanguage();

  /* follow mode: react to Codex html[lang] changes and low-frequency checks */
  if (follow) {
    htmlObserver = new MutationObserver(function () {
      if (!follow) return;
      var next = detectCodexLanguage();
      if (next !== lang) { lang = next; applyLanguage(); }
    });
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    poll = setInterval(function () {
      if (!follow) { clearInterval(poll); return; }
      if (!shadow.isConnected) { clearInterval(poll); if (htmlObserver) htmlObserver.disconnect(); return; }
      var next = detectCodexLanguage();
      if (next !== lang) { lang = next; applyLanguage(); }
    }, 5000);
  }

  /* allow a clean re-install without accumulating observers or DOM blocks */
  shadow.__guarderI18nCleanup = function () {
    try { mo.disconnect(); } catch (e) {}
    if (htmlObserver) { try { htmlObserver.disconnect(); } catch (e) {} }
    if (poll) { try { clearInterval(poll); } catch (e) {} }
    var oldBlock = shadow.querySelector("[data-guarder-lang-block]");
    if (oldBlock) oldBlock.remove();
    var styles = shadow.querySelectorAll("style");
    for (var si = 0; si < styles.length; si++) {
      if (styles[si].textContent.indexOf("--guarder-loading") >= 0) styles[si].remove();
    }
    delete shadow.__guarderI18nInstalled;
    delete shadow.__guarderI18nCleanup;
  };
}

export const PANEL_I18N_LANGS = ["zh-CN", "zh-TW", "en", "ja", "ko"];
