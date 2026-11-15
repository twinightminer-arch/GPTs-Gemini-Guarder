export function uiToSetting(key, ui) {
  const value = Math.max(0, Math.min(100, Number(ui)));
  if (key === 'opacity' || key === 'scrimOpacity') return value / 100;
  if (key === 'blurPx') return value;
  if (key === 'zoom') return 50 + value * 1.5;
  return value;
}

export function settingToUi(key, setting) {
  const value = Number(setting);
  const ui = key === 'opacity' || key === 'scrimOpacity' ? value * 100
    : key === 'zoom' ? (value - 50) / 1.5 : value;
  return Math.max(0, Math.min(100, Math.round(ui)));
}

function installInappPanel(iconUrl) {
  const ROOT_ID = 'gptdaddy-desktop-panel';
  const existing = document.getElementById(ROOT_ID);
  if (existing) return true;
  if (!document.body) return false;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  const shadow = root.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style data-guarder-skip>
      :host { all: initial; }
      * { box-sizing: border-box; }
      button, input, select { font: inherit; }
      .launcher { position: fixed; right: 22px; bottom: 24px; z-index: 2147483000; pointer-events: auto; width: 48px; height: 48px; border: 0; border-radius: 0; background: transparent; box-shadow: none; padding: 0; cursor: grab; user-select: none; touch-action: none; }
      .launcher img { display: block; width: 48px; height: 48px; object-fit: contain; pointer-events: none; }
      .launcher:active { cursor: grabbing; }
      .panel { position: fixed; right: 22px; bottom: 90px; z-index: 2147483001; pointer-events: auto; width: min(480px, calc(100vw - 32px)); height: min(690px, calc(100vh - 112px)); display: flex; flex-direction: column; border: 1px solid #ffffff40; border-radius: 24px; overflow: hidden; color: #eff5fc; background: #47bee6f5; box-shadow: 0 24px 75px #0008; backdrop-filter: blur(24px); font: 13px/1.5 'Segoe UI Variable','Microsoft YaHei UI',system-ui,sans-serif; }
      .panel[hidden], .view[hidden] { display: none; }
      .head { padding: 19px 20px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ffffff20; background:linear-gradient(125deg,#4567d750,#9f67c440,transparent); }
      .head strong { font-size: 17px; letter-spacing: .01em; }
      .head small { display: block; color: #aab9c9; font-size: 11px; }
      .icon { border: 0; color: #dfeafa; background: transparent; padding: 5px 8px; cursor: pointer; }
      .tabs { display: grid; grid-template-columns: repeat(5,1fr); gap: 4px; padding: 9px; border-bottom: 1px solid #ffffff20; }
      .tabs button { border: 0; border-radius: 9px; background: transparent; color: #adc0d2; padding: 8px 2px; cursor: pointer; }
      .tabs button.active { color: #fff; border:0; border-radius:10px; background:linear-gradient(120deg,#566fd4,#9967d5); box-shadow:0 4px 14px #352a7644; }
      .body { flex:1; min-height: 0; overflow: auto; padding: 20px; }
      .body:has(.view[data-view="home"]:not([hidden])) { padding:0; overflow:hidden; }
      .view[data-view="home"] { height:100%; }
      .vocab-item { padding:12px; border:1px solid #ffffff25; border-radius:12px; margin:7px 0; background:#ffffff12; overflow-wrap:anywhere; }
      .destinations { display:grid;gap:8px;margin:14px 0; }
      .destinations label { display:grid;gap:4px; }
      .destinations input { width:100%;border:1px solid #ffffff35;border-radius:8px;padding:8px;background:#ffffff16;color:inherit; }
      .destinations button { border:0;border-radius:9px;padding:9px;background:#ffffff25;color:inherit;cursor:pointer; }
      .vocab-title { display:flex;align-items:center;gap:9px; }
      .vocab-logo { width:28px;height:28px;border-radius:8px;flex:0 0 auto;box-shadow:0 2px 8px rgba(0,0,0,.18); }
      .dest-status { margin-left:8px;font-size:12px;font-weight:600;color:#0a7d43; }
      .destinations button[data-sync-destination] { background:#ffffff40; }
      .gemini-slot { position:relative; min-height:0; height:100%; background:#f8f9fd; color:#273044; display:grid;place-items:center;text-align:center;padding:0; }
      .gemini-min-block { position:absolute;top:0;right:118px;width:48px;height:44px;z-index:2;display:grid;place-items:center;background:#292448;color:#77728b;cursor:default;user-select:none; }
      .gemini-slot strong { display:block;font-size:20px; }
      .gemini-slot small { display:block;margin-top:8px;color:#687084; }
      .view h2 { font-size: 15px; margin: 0 0 10px; }
      .view p { color: #b9c7d6; margin: 0 0 12px; }
      .status { border-radius: 12px; padding: 13px; margin-bottom: 14px; background: #20354b; }
      .status strong { display: block; font-size: 14px; }
      .status small { color: #aebed0; }
      .actions { display: flex; gap: 7px; flex-wrap: wrap; }
      .actions button, .save, .card button { border: 1px solid #ffffff30; border-radius: 9px; background: #254058; color: #fff; padding: 8px 10px; cursor: pointer; }
      .actions button.danger { border-color: #ff9ba5; }
      button:disabled { opacity: .45; cursor: default; }
      .filters { display: grid; grid-template-columns: 1fr 100px; gap: 7px; margin-bottom: 10px; }
      .filters input, .filters select { min-width: 0; border: 1px solid #ffffff30; border-radius: 8px; color: #eef5fc; background: #182a3d; padding: 8px; }
      .filters option, .filter-row option { color: #eff5fc; background: #17283e; }
      .filter-row { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; color: #bed0e0; }
      .list { display: grid; gap: 8px; }
      .card { border: 1px solid #ffffff20; border-radius: 11px; background: #182a3d; padding: 10px; }
      .card.active { border-color: #3b95d6; }
      .card-top { display: flex; gap: 8px; align-items: start; justify-content: space-between; }
      .card-title { font-weight: 650; overflow-wrap: anywhere; }
      .card small { color: #a9bed2; display: block; margin: 4px 0 9px; }
      .card button { padding: 5px 8px; }
      .card .star { border: 0; background: transparent; color: #ffd178; font-size: 19px; line-height: 1; }
      .card-preview { width: 100%; max-height: 100px; object-fit: cover; border-radius: 7px; margin: 7px 0; }
      .control { display: block; margin: 12px 0 16px; color: #c4d3e1; }
      .control output { float: right; color: #fff; }
      .control input { display: block; width: 100%; accent-color: #ffbe66; margin-top: 8px; }
      .color-row { display: flex; gap: 12px; align-items: center; margin: 12px 0; color: #c4d3e1; }
      .color-row input[type="color"] { width: 50px; height: 36px; padding: 2px; border: 1px solid #ffffff30; border-radius: 8px; background: #182a3d; }
      .color-row input[type="checkbox"] { accent-color: #ffbe66; }
      .message { min-height: 20px; color: #ffce88; margin-top: 12px; }
      .panel { background: var(--ui-bg, #47bee6); color: var(--ui-ink, #eff5fc); border-color: var(--ui-border, #ffffff30); }
      .head, .tabs { border-color: var(--ui-border, #ffffff30); }
      .head small, .tabs button, .view p, .control, .color-row, .filter-row, .status small, .card small { color: var(--ui-muted, #b9c7d6); }
      .tabs button.active, .control output { color: var(--ui-ink, #eff5fc); }
      .status, .card, .filters input, .filters select, .color-row input[type="color"] { background: var(--ui-card, #182a3d); color: var(--ui-ink, #eff5fc); border-color: var(--ui-border, #ffffff30); }
      .actions button, .save, .card button { background: var(--ui-button, #254058); color: var(--ui-ink, #eff5fc); border-color: var(--ui-border, #ffffff30); }
      .color-row input[type="text"] { width: 90px; padding: 6px; background: var(--ui-card, #182a3d); color: var(--ui-ink, #eff5fc); border: 1px solid var(--ui-border, #ffffff30); border-radius: 7px; }
      .color-row button { background: var(--ui-button, #254058); color: var(--ui-ink, #eff5fc); border: 1px solid var(--ui-border, #ffffff30); border-radius: 7px; padding: 6px; cursor: pointer; }
      .panel[data-ui-light] .icon, .panel[data-ui-light] .card .star, .panel[data-ui-light] .message { color: #8c4b00; }
      .card.active { background: color-mix(in srgb, var(--ui-bg, #47bee6) 42%, var(--ui-card, #182a3d)) !important; box-shadow: inset 4px 0 0 #ffd166, 0 3px 16px #10283b25; }
      .card .current-badge { display: inline-block; margin: 0 0 8px; padding: 3px 8px; border-radius: 999px; background: #1970a5; color: #fff; font-size: 11px; font-weight: 700; }
      .card .apply-button:disabled { background: #b5bdc7 !important; color: #56616d !important; border-color: #9fa8b2 !important; opacity: 1; cursor: not-allowed; }
      .view[data-view="theme"]:not([data-ready]) > :not(h2) { display: none; }
      .view[data-view="theme"]:not([data-ready])::after { content: '正在读取已保存的主题设置…'; color: var(--ui-muted, #b9c7d6); }
    </style>
    <button class="launcher" title="打开 GPTDaddy；可拖动" aria-label="打开 GPTDaddy"><img alt="" src="${iconUrl}"></button>
    <section class="panel" aria-label="GPTDaddy 控制面板" hidden>
      <div class="head"><div><strong>GPT's Gemini Guarder</strong><small>壁纸 · 划词翻译 · 本地生词本</small></div><button class="icon" data-action="close" title="关闭面板">✕</button></div>
      <nav class="tabs"><button data-tab="home" class="active">Gemini</button><button data-tab="library">壁纸库</button><button data-tab="vocabulary">生词本</button><button data-tab="theme">主题</button><button data-tab="settings">设置</button></nav>
      <div class="body">
        <div class="view" data-view="home"><div class="gemini-slot"><div><img src="${iconUrl}" width="44" height="44" alt=""><strong>Gemini</strong><small data-gemini-status>正在连接真实 Gemini 网页窗口…</small></div><div class="gemini-min-block" title="嵌入状态下不可最小化">－</div></div></div>
        <div class="view" data-view="library" hidden><h2>Wallpaper Engine 与本地壁纸库</h2><div class="filters"><input type="search" data-search placeholder="搜索标题或标签"><select data-category><option value="all">全部</option><option value="native-video">可应用视频</option><option value="import">本地导入</option><option value="other">其他</option></select></div><div class="filter-row"><label><input type="checkbox" data-favorites-only> 仅收藏</label><select data-sort><option value="title">按名称</option><option value="size">按大小</option></select></div><div class="list" data-list></div></div>
        <div class="view" data-view="vocabulary" hidden><h2 class="vocab-title"><img class="vocab-logo" alt="GPT Salad" data-guarder-skip src="data:image/png;base64,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">GPT Salad 生词本</h2><p>本地 JSON 文件是收藏的原件。选中文本后可用悬浮菜单保存。</p><input data-vocab-search type="search" placeholder="搜索词条" style="width:100%;padding:9px;border-radius:9px;margin-bottom:9px"><button class="save" data-vocab-refresh>刷新词条</button><div data-vocab-list></div><div class="destinations"><label>Notion 生词本地址<span class="dest-status" data-dest-status="notion" data-guarder-skip>✓ Notion</span><input data-destination="notion" data-default="https://app.notion.com/p/419379783d4f819b8351f9cf25410c6f?pvs=204" value="https://app.notion.com/p/419379783d4f819b8351f9cf25410c6f?pvs=204" placeholder="粘贴你的 Notion 页面网址"></label><button data-open-destination="notion">打开 Notion 生词本</button><button data-sync-destination="notion" type="button">同步词条</button><label>Obsidian 生词本地址<span class="dest-status" data-dest-status="obsidian" data-guarder-skip>✓ Obsidian</span><input data-destination="obsidian" data-default="obsidian://open?vault=Obsidian%20Vault&file=GPT%20Salad%20%E7%94%9F%E8%AF%8D%E6%9C%AC" value="obsidian://open?vault=Obsidian%20Vault&file=GPT%20Salad%20%E7%94%9F%E8%AF%8D%E6%9C%AC" placeholder="obsidian://open?..."></label><button data-open-destination="obsidian">打开 Obsidian 生词本</button><button data-sync-destination="obsidian" type="button">同步词条</button><label>OneNote 生词本地址<span class="dest-status" data-dest-status="onenote" data-guarder-skip>✓ OneNote</span><input data-destination="onenote" data-default="onenote:///C:/Users/李忠浩/Documents/OneNote 笔记本/我的笔记本/快速笔记.one" value="onenote:///C:/Users/李忠浩/Documents/OneNote 笔记本/我的笔记本/快速笔记.one" placeholder="粘贴你的 OneNote 页面网址"></label><button data-open-destination="onenote">打开 OneNote 生词本</button><button data-sync-destination="onenote" type="button">同步词条</button></div><p>三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。</p></div>
        <div class="view" data-view="theme" hidden><h2>播放状态</h2><div class="status"><strong data-status>正在读取…</strong><small data-detail></small></div><div class="actions"><button data-action="resume">继续播放</button><button data-action="pause">暂停</button><button data-action="remove" class="danger">恢复原界面</button><button data-action="import" type="button">导入本地壁纸</button><input data-import-file type="file" accept=".png,.jpg,.jpeg,.webp,.bmp,.gif,.mp4,.webm,.mov,.m4v,.mkv" hidden></div><p>普通对话切换不会重置视频进度。</p><h2>画面与可读性</h2><div class="color-row"><label for="gptdaddy-font-color">字体颜色</label><input id="gptdaddy-font-color" data-font-color type="color" value="#18334f"><label><input data-font-auto type="checkbox" checked> 自动跟随 Codex</label></div><div class="color-row"><label for="gptdaddy-composer-color">输入框背景颜色</label><input id="gptdaddy-composer-color" data-composer-color type="color" value="#ffffff"><label><input data-composer-auto type="checkbox"> 使用 Codex 原色</label></div><label class="control">内容背板不透明度 <output data-output="opacity"></output><input data-setting="opacity" type="range" min="0" max="100"></label><label class="control">背景遮罩 <output data-output="scrimOpacity"></output><input data-setting="scrimOpacity" type="range" min="0" max="100"></label><label class="control">背景模糊 <output data-output="blurPx"></output><input data-setting="blurPx" type="range" min="0" max="100"></label><label class="control">画面缩放 <output data-output="zoom"></output><input data-setting="zoom" type="range" min="0" max="100"></label><small>拖动时立即预览，设置自动保存。</small></div>
        <div class="view" data-view="settings" hidden><h2>连接与恢复</h2><p data-connection>正在读取…</p><label class="color-row"><input data-native-restart type="checkbox"> 普通启动后自动恢复壁纸（仅对新启动的官方 Codex 正常退出并重开一次）</label><p>设置保存在本机。关闭壁纸会移除背景层和控制面板，Codex 官方文件不变。启动加载页在安全连接建立前无法覆盖。</p><h2>外观</h2><div class="color-row"><label for="gptdaddy-page-color">GPTDaddy 页面颜色</label><input id="gptdaddy-page-color" data-page-color type="color" value="#47bee6"><input data-page-hex type="text" value="#47bee6" maxlength="7" aria-label="GPTDaddy 页面颜色 HEX"><button data-action="reset-page-color" type="button">恢复默认</button></div></div>
        <div class="message" role="status" data-message></div>
      </div>
    </section>`;

  const $ = (selector) => shadow.querySelector(selector);
  const panel = $('.panel');
  const launcher = $('.launcher');
  let geminiDocked = false;
  let geminiBusy = false;
  function geminiGeometry() {
    const rect=$('.gemini-slot').getBoundingClientRect();
    return {parentWidth:Math.round(window.innerWidth),x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)};
  }
  async function dockGemini() {
    if(geminiBusy || panel.hidden || $('[data-view="home"]').hidden)return;
    geminiBusy=true;
    try {
      if (geminiDocked) {
        await request('geminiMove', geminiGeometry());
        await request('geminiShow');
      } else {
        await request('geminiDock', geminiGeometry());
        await request('geminiShow');
      }
      geminiDocked=true;
      $('[data-gemini-status]').textContent='真实 Gemini 网页已连接';
    } catch(error) {
      geminiDocked=false;
      $('[data-gemini-status]').textContent=error.message;
    } finally {
      geminiBusy=false;
      if (geminiDocked && (panel.hidden || $('[data-view="home"]').hidden)) void hideGemini();
    }
  }
  async function hideGemini() {
    if (!geminiDocked || geminiBusy) return;
    geminiBusy=true;
    try { await request('geminiHide'); }
    catch(error) { message(error.message); }
    finally {
      geminiBusy=false;
      if (!panel.hidden && !$('[data-view="home"]').hidden) void dockGemini();
    }
  }
  async function detachGemini() {
    if(!geminiDocked || geminiBusy)return;
    geminiBusy=true;
    try {await request('geminiDetach');geminiDocked=false}
    catch(error){message(error.message)}
    finally{
      geminiBusy=false;
      if (!geminiDocked && !panel.hidden && !$('[data-view="home"]').hidden) void dockGemini();
    }
  }
  const pending = new Map();
  let nextId = 1;
  let status = null;
  let catalog = [];
  let catalogLoaded = false;
  let catalogRevision = null;
  let refreshGeneration = 0;
  let themeDirty = false;
  let themeSaveTimer = null;
  let themeSaveBusy = false;
  let themeSaveVersion = 0;
  let favorites;
  try { favorites = new Set(JSON.parse(localStorage.getItem('gptdaddy-favorites') || '[]')); }
  catch { favorites = new Set(); }

  window.__gptDaddyControlResponse = (id, value, error) => {
    const item = pending.get(id);
    if (!item) return;
    pending.delete(id);
    clearTimeout(item.timer);
    if (error) item.reject(new Error(error)); else item.resolve(value);
  };
  function request(action, payload = {}, timeoutMs = 30000) {
    if (typeof window.__gptDaddyDesktopControl !== 'function') return Promise.reject(new Error('控制通道未连接'));
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${action} 控制请求超时`)); }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      try { window.__gptDaddyDesktopControl(JSON.stringify({ id, action, payload })); }
      catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
    });
  }
  window.__gptDaddyPanelRequest = request;
  function message(value) { $('[data-message]').textContent = value; }
  function previewPageColor(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return false;
    const rgb = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
    const bright = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > 155;
    panel.style.setProperty('--ui-bg', color);
    panel.style.setProperty('--ui-ink', bright ? '#182a3d' : '#eff5fc');
    panel.style.setProperty('--ui-muted', bright ? '#34495e' : '#b9c7d6');
    panel.style.setProperty('--ui-card', bright ? '#ffffff' : '#182a3d');
    panel.style.setProperty('--ui-button', bright ? '#e2ebf3' : '#254058');
    panel.style.setProperty('--ui-border', bright ? '#42566a66' : '#ffffff30');
    panel.toggleAttribute('data-ui-light', bright);
    return true;
  }
  function renderStatus() {
    if (!status) return;
    const { lifecycle, wallpaper } = status;
    const imageActive = lifecycle.imageReady;
    $('[data-status]').textContent = imageActive ? '图片壁纸已显示' : lifecycle.playbackHealthy ? '视频壁纸正在播放' : lifecycle.active ? '已加载，等待视频帧' : lifecycle.cdpAvailable ? '已连接，等待加载' : '当前无法接入 Codex';
    $('[data-detail]').textContent = wallpaper.enabled ? `当前项目：${wallpaper.id || '未选择'} · ${lifecycle.connectedTargets} 个窗口` : '壁纸功能已关闭';
    $('[data-connection]').textContent = lifecycle.cdpAvailable ? `安全连接已建立；CDP 端口 ${lifecycle.cdpPort}。` : '当前正常启动的 Codex 未开放可验证的 CDP 接口。';
    $('[data-native-restart]').checked = Boolean(status.nativeRestart?.enabled);
    if (!themeDirty) {
      for (const key of ['opacity', 'scrimOpacity', 'blurPx', 'zoom']) {
        const input = $(`[data-setting="${key}"]`);
        const ui = settingToUi(key, wallpaper[key]);
        input.value = String(ui);
        $('[data-output="' + key + '"]').textContent = ui + (key === 'blurPx' ? ' px' : ' %');
      }
      $('[data-font-auto]').checked = !wallpaper.fontColor;
      $('[data-font-color]').disabled = !wallpaper.fontColor;
      if (wallpaper.fontColor) $('[data-font-color]').value = wallpaper.fontColor;
      $('[data-composer-auto]').checked = !wallpaper.composerBackgroundColor;
      $('[data-composer-color]').disabled = !wallpaper.composerBackgroundColor;
      if (wallpaper.composerBackgroundColor) $('[data-composer-color]').value = wallpaper.composerBackgroundColor;
      const pageColor = status.ui?.pageColor || '#47bee6';
      $('[data-page-color]').value = pageColor;
      $('[data-page-hex]').value = pageColor;
      previewPageColor(pageColor);
    }
    $('[data-view="theme"]').setAttribute('data-ready', '');
    if (!$('[data-view="library"]').hidden) renderCatalog();
  }
  function renderCatalog() {
    const list = $('[data-list]');
    const query = $('[data-search]').value.trim().toLocaleLowerCase();
    const category = $('[data-category]').value;
    const onlyFavorites = $('[data-favorites-only]').checked;
    const sort = $('[data-sort]').value;
    const items = catalog.filter((item) => {
      if (category === 'native-video' && item.capability !== 'native-video') return false;
      if (category === 'import' && item.source !== 'import') return false;
      if (category === 'other' && !item.fallback && ['native-video', 'native-image'].includes(item.capability)) return false;
      if (onlyFavorites && !favorites.has(item.id)) return false;
      return `${item.title} ${(item.tags || []).join(' ')}`.toLocaleLowerCase().includes(query);
    }).sort((a, b) => sort === 'size' ? (b.bytes || 0) - (a.bytes || 0) : a.title.localeCompare(b.title));
    list.replaceChildren();
    window.__gptdaddyCatalogItems = items;
    let previewCount = 0;
    for (const item of items.slice(0, 300)) {
      const card = document.createElement('div');
      const isCurrent = Boolean(status?.wallpaper?.enabled && String(status.wallpaper.id) === String(item.id));
      card.className = 'card' + (isCurrent ? ' active' : '');
      const top = document.createElement('div'); top.className = 'card-top';
      const title = document.createElement('div'); title.className = 'card-title'; title.textContent = item.title;
      const star = document.createElement('button'); star.className = 'star'; star.textContent = favorites.has(item.id) ? '★' : '☆'; star.title = '收藏';
      star.addEventListener('click', () => { if (favorites.has(item.id)) favorites.delete(item.id); else favorites.add(item.id); localStorage.setItem('gptdaddy-favorites', JSON.stringify([...favorites])); renderCatalog(); });
      top.append(title, star);
      const detail = document.createElement('small'); detail.textContent = `${item.source === 'import' ? '本地导入 · ' : ''}${item.status === 'processing' ? '正在处理视频 · ' : item.status === 'unsupported-codec' ? '编码不支持 · ' : ''}${item.capability} · ${((item.bytes || 0) / 1048576).toFixed(1)} MB`;
      const playable = ['native-video', 'native-image'].includes(item.capability) && !item.missing;
      const apply = document.createElement('button'); apply.className = 'apply-button'; apply.textContent = isCurrent ? '使用中' : playable ? '应用' : '暂不可应用'; apply.disabled = isCurrent || !playable;
      apply.addEventListener('click', async () => {
        if (isCurrent) return;
        apply.disabled = true; message('正在应用壁纸…');
        try { status = await request('apply', { id: item.id }); renderStatus(); message('壁纸已受理，正在后台加载'); }
        catch (error) { message(error.message); apply.disabled = false; }
      });
      card.append(top, detail);
      if (isCurrent) { const badge = document.createElement('span'); badge.className = 'current-badge'; badge.textContent = '正在使用'; card.append(badge); }
      card.append(apply);
      if (item.source === 'import') {
        if (previewCount++ < 8) {
          const preview = document.createElement('img'); preview.className = 'card-preview'; preview.alt = `${item.title} 预览`;
          card.insertBefore(preview, apply);
          void request('preview', { id: item.id }).then((url) => { if (url && card.isConnected) preview.src = url; else preview.remove(); }).catch(() => preview.remove());
        }
        const controls = document.createElement('div'); controls.className = 'actions';
        const make = (label, handler) => { const button = document.createElement('button'); button.textContent = label; button.addEventListener('click', handler); controls.append(button); };
        make('设为默认', async () => { try { status = await request('setDefault', { id: item.id }); renderStatus(); message('默认壁纸已保存并应用'); } catch (error) { message(error.message); } });
        make('重命名', async () => { const title = window.prompt('壁纸名称', item.title); if (title === null) return; try { status = await request('renameImport', { id: item.id, title }); await refresh(); } catch (error) { message(error.message); } });
        make('删除', async () => { if (!window.confirm(`仅删除 GPTDaddy 内部副本“${item.title}”？原始文件不会删除。`)) return; try { status = await request('deleteImport', { id: item.id }); catalogRevision = null; await refresh(); message('内部副本已删除'); } catch (error) { message(error.message); } });
        card.append(controls);
      }
      list.append(card);
    }
    if (!items.length) list.textContent = catalogLoaded ? '没有符合条件的壁纸。' : '正在读取已缓存壁纸…';
  }
  async function refresh() {
    const generation = ++refreshGeneration;
    const nextStatus = await request('status');
    if (generation !== refreshGeneration) return;
    status = nextStatus;
    renderStatus();
    if ($('[data-message]').textContent === '壁纸已受理，正在后台加载' && nextStatus.lifecycle.active) message('壁纸已应用');
    if ($('[data-message]').textContent === '控制请求超时') message('');
    if (catalogLoaded && catalogRevision === nextStatus.catalog?.revision) return;
    if (!$('[data-view="library"]').hidden) {
      const nextCatalog = await request('list');
      if (generation !== refreshGeneration) return;
      catalog = nextCatalog;
      catalogLoaded = true;
      catalogRevision = nextStatus.catalog?.revision;
      renderCatalog();
    }
  }
  shadow.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    shadow.querySelectorAll('[data-tab]').forEach((tab) => tab.classList.toggle('active', tab === button));
    shadow.querySelectorAll('[data-view]').forEach((view) => { view.hidden = view.dataset.view !== button.dataset.tab; });
    if (button.dataset.tab === 'vocabulary') void refreshVocabulary();
    if (button.dataset.tab === 'library' || button.dataset.tab === 'theme') void refresh().catch(error => message(error.message));
    if (button.dataset.tab === 'home') void dockGemini(); else void hideGemini();
  }));
  const geminiResize=new ResizeObserver(()=>{if(geminiDocked)void dockGemini()});
  geminiResize.observe($('.gemini-slot'));
  async function refreshVocabulary() {
    const list = $('[data-vocab-list]');
    list.textContent = '读取中…';
    try {
      const entries = await request('vocabList');
      list.replaceChildren();
      if (!entries.length) { list.textContent = '尚无词条'; return; }
      const query=$('[data-vocab-search]').value.trim().toLowerCase();
      for (const entry of entries.filter(x=>!x.archived && x.source_text.toLowerCase().includes(query)).slice(0,100)) {
        const row=document.createElement('div');row.className='vocab-item';
        const title=document.createElement('strong');title.textContent=entry.source_text;row.append(title);
        const controls=document.createElement('div');controls.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:8px';
        for(const [label,changes] of [[entry.favorite?'取消收藏':'收藏',{favorite:!entry.favorite}],['编辑笔记',null],['归档',{archived:true}]]){
          const b=document.createElement('button');b.textContent=label;b.className='save';b.style.padding='5px 8px';
          b.addEventListener('click',async()=>{
            let patch=changes;
            if(label==='编辑笔记'){const value=window.prompt('词条笔记',entry.notes||'');if(value===null)return;patch={notes:value}}
            try{await request('vocabUpdate',{id:entry.id,revision:entry.revision,changes:patch});await refreshVocabulary()}catch(error){message(error.message)}
          });controls.append(b);
        }
        row.append(controls);
        list.append(row);
      }
    } catch(error) {list.textContent=error.message}
  }
  $('[data-vocab-refresh]').addEventListener('click',()=>void refreshVocabulary());
  $('[data-vocab-search]').addEventListener('input',()=>void refreshVocabulary());
  shadow.querySelectorAll('[data-destination]').forEach(input=>{
    const key='gpt-guarder-destination-'+input.dataset.destination;
    input.value=localStorage.getItem(key)||input.dataset.default||'';
    input.addEventListener('change',()=>localStorage.setItem(key,input.value.trim()));
  });
  shadow.querySelectorAll('[data-open-destination]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.openDestination;
    const value=shadow.querySelector('[data-destination="'+name+'"]').value.trim();
    if (!value) {message('请先填写 '+name+' 生词本地址');return}
    if (!(value.startsWith('https://') || (name==='obsidian' && value.startsWith('obsidian://')))) {message('地址需为 HTTPS，Obsidian 可用 obsidian://');return}
    window.open(value,'_blank','noopener');
  }));
  for (const selector of ['[data-search]', '[data-category]', '[data-favorites-only]', '[data-sort]']) $(selector).addEventListener('input', renderCatalog);
  function currentThemeSettings() {
    const settings = {};
    for (const key of ['opacity', 'scrimOpacity', 'blurPx', 'zoom']) settings[key] = uiToSetting(key, $(`[data-setting="${key}"]`).value);
    settings.fontColor = $('[data-font-auto]').checked ? null : $('[data-font-color]').value;
    settings.composerBackgroundColor = $('[data-composer-auto]').checked ? null : $('[data-composer-color]').value;
    return settings;
  }
  function previewTheme() {
    const settings = currentThemeSettings();
    void window.__gptDaddyWallpaperControllerV1?.configure(settings);
    previewPageColor($('[data-page-hex]').value);
  }
  async function saveTheme() {
    if (themeSaveBusy) return;
    themeSaveBusy = true;
    try {
      do {
        const version = themeSaveVersion;
        const settings = currentThemeSettings();
        const pageColor = $('[data-page-hex]').value;
        status = await request('settings', settings);
        if (/^#[0-9a-fA-F]{6}$/.test(pageColor)) status = await request('ui', { pageColor });
        if (version === themeSaveVersion) { themeDirty = false; message('设置已自动保存'); }
      } while (themeDirty);
    } catch (error) { message(`保存失败：${error.message}`); }
    finally { themeSaveBusy = false; }
  }
  function queueThemeSave() {
    themeDirty = true;
    themeSaveVersion++;
    previewTheme();
    clearTimeout(themeSaveTimer);
    themeSaveTimer = setTimeout(() => void saveTheme(), 300);
  }
  shadow.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('input', () => {
    $('[data-output="' + input.dataset.setting + '"]').textContent = input.value + (input.dataset.setting === 'blurPx' ? ' px' : ' %');
    queueThemeSave();
  }));
  $('[data-font-auto]').addEventListener('change', () => { $('[data-font-color]').disabled = $('[data-font-auto]').checked; queueThemeSave(); });
  $('[data-font-color]').addEventListener('input', queueThemeSave);
  $('[data-composer-auto]').addEventListener('change', () => { $('[data-composer-color]').disabled = $('[data-composer-auto]').checked; queueThemeSave(); });
  $('[data-composer-color]').addEventListener('input', queueThemeSave);
  $('[data-page-color]').addEventListener('input', event => { $('[data-page-hex]').value = event.target.value; queueThemeSave(); });
  $('[data-page-hex]').addEventListener('input', event => { if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) { $('[data-page-color]').value = event.target.value; queueThemeSave(); } });
  $('[data-native-restart]').addEventListener('change', async (event) => {
    try { status = await request('nativeRestart', { enabled: event.target.checked }); renderStatus(); message('自动恢复设置已保存'); }
    catch (error) { await refresh().catch(() => {}); message(error.message); }
  });
  async function importFile(file) {
    if (!file) return;
    let uploadId = null;
    try {
      const started = await request('importBegin', { name: file.name });
      uploadId = started.uploadId;
      for (let offset = 0; offset < file.size; offset += 48 * 1024) {
        const bytes = new Uint8Array(await file.slice(offset, offset + 48 * 1024).arrayBuffer());
        const base64 = btoa(String.fromCharCode(...bytes));
        await request('importChunk', { uploadId, base64 });
        if (offset % (2 * 1024 * 1024) < 48 * 1024) message(`正在导入 ${file.name}：${Math.round(Math.min(100, (offset + bytes.length) / file.size * 100))}%`);
      }
      const result = await request('importFinish', { uploadId });
      uploadId = null;
      catalogRevision = null;
      await refresh();
      message(result.item.status === 'processing' ? '视频已保存，正在后台检查编码和生成预览' : '本地壁纸已导入，可在壁纸库应用');
    } catch (error) {
      if (uploadId) await request('importCancel', { uploadId }).catch(() => {});
      message(`导入失败：${error.message}`);
    }
  }
  $('[data-import-file]').addEventListener('change', (event) => { void importFile(event.target.files?.[0]); event.target.value = ''; });
  panel.addEventListener('dragover', (event) => { if (event.dataTransfer?.types?.includes('Files')) event.preventDefault(); });
  panel.addEventListener('drop', (event) => { if (event.dataTransfer?.files?.length) { event.preventDefault(); void importFile(event.dataTransfer.files[0]); } });
  const refreshTimer = setInterval(() => { if (!panel.hidden && (!$('[data-view="theme"]').hidden || !$('[data-view="library"]').hidden)) void refresh().catch(error => message(error.message)); }, 15000);
  shadow.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async () => {
    const action = button.dataset.action;
    if (action === 'close') { panel.hidden = true; void hideGemini(); return; }
    if (action === 'import') { $('[data-import-file]').click(); return; }
    if (action === 'reset-page-color') { $('[data-page-color]').value = '#47bee6'; $('[data-page-hex]').value = '#47bee6'; queueThemeSave(); return; }
    try {
      status = await request(action);
      if (action !== 'remove') { renderStatus(); message(action === 'pause' ? '已暂停' : '正在播放'); }
    } catch (error) { message(error.message); }
  }));

  let drag = null;
  launcher.addEventListener('pointerdown', (event) => { drag = { x: event.clientX, y: event.clientY, left: launcher.getBoundingClientRect().left, top: launcher.getBoundingClientRect().top, moved: false }; launcher.setPointerCapture(event.pointerId); });
  launcher.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) < 5 && !drag.moved) return;
    drag.moved = true;
    launcher.style.right = 'auto'; launcher.style.bottom = 'auto';
    launcher.style.left = Math.max(0, Math.min(window.innerWidth - launcher.offsetWidth, drag.left + dx)) + 'px';
    launcher.style.top = Math.max(0, Math.min(window.innerHeight - launcher.offsetHeight, drag.top + dy)) + 'px';
  });
  launcher.addEventListener('pointerup', () => {
    if (!drag?.moved) {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) {
        // Keep the Gemini launcher visible below the panel instead of leaving it
        // at a dragged position where the panel can cover it.
        launcher.style.removeProperty('left');
        launcher.style.removeProperty('top');
        launcher.style.removeProperty('right');
        launcher.style.removeProperty('bottom');
        if (!$('[data-view="home"]').hidden) void dockGemini(); else void refresh().catch(error => message(error.message));
      } else void hideGemini();
    }
    drag = null;
  });

  document.body.append(root);
  const observer = new MutationObserver(() => { if (!root.isConnected && document.body) document.body.append(root); });
  observer.observe(document.documentElement, { childList: true });
  window.__gptDaddyRemovePanel = async () => {
    while (geminiBusy) await new Promise(resolve => setTimeout(resolve, 100));
    await detachGemini();
    geminiResize.disconnect();
    observer.disconnect();
    clearInterval(refreshTimer);
    clearTimeout(themeSaveTimer);
    for (const item of pending.values()) clearTimeout(item.timer);
    pending.clear();
    root.remove();
    delete window.__gptDaddyControlResponse;
    delete window.__gptDaddyPanelRequest;
    delete window.__gptDaddyRemovePanel;
  };
  return true;
}

export function buildInappPanelScript() {
  const iconPath = join(dirname(fileURLToPath(import.meta.url)), 'gemini.png');
  const iconUrl = 'data:image/png;base64,' + readFileSync(iconPath).toString('base64');
  return `(() => { const uiToSetting = ${uiToSetting.toString()}; const settingToUi = ${settingToUi.toString()}; const __panelResult = (${installInappPanel.toString()})(${JSON.stringify(iconUrl)}); (${installPanelI18n.toString()})(); (${installPanelUpgrade.toString()})(); (${installPanelLibraryUpgrade.toString()})(); return __panelResult; })()`;
}
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installPanelI18n } from './panel-i18n.mjs';
import { installPanelUpgrade } from './panel-upgrade.mjs';
import { installPanelLibraryUpgrade } from './panel-library.mjs';

