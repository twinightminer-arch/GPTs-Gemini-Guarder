// 壁纸库升级模块 v2：左侧预览窗口 + 主题页音量滑条。
// 该函数会被 toString() 序列化进注入脚本，必须完全自包含。
// app:// 是 secure context，页面无法加载 http://127.0.0.1 子资源，
// 因此预览图改走 daemon 的 preview 控制通道（data URL），按需加载并缓存。
export function installPanelLibraryUpgrade() {
  var root = document.getElementById('gptdaddy-desktop-panel');
  if (!root || !root.shadowRoot) return;
  var shadow = root.shadowRoot;
  var VER = 2;
  var upgrading = shadow.__guarderLibraryInstalled === true;
  if (upgrading && shadow.__guarderLibraryVersion === VER) return;
  shadow.__guarderLibraryInstalled = true;
  shadow.__guarderLibraryVersion = VER;

  var K_VOL = 'gptdaddy-volume';
  var VOL_LABEL = {
    'zh-CN': '壁纸音量', 'zh-TW': '壁紙音量', 'en': 'Wallpaper volume',
    'ja': '壁紙の音量', 'ko': '배경화면 볼륨'
  };
  window.__gptdaddyPreviewData = window.__gptdaddyPreviewData || {};

  if (!upgrading) {
    var css = document.createElement('style');
    css.textContent = [
      '.card{display:flex;gap:10px;align-items:flex-start}',
      '.card-body{flex:1;min-width:0}',
      '.card-thumb{position:relative;width:120px;height:76px;flex:0 0 120px;border-radius:7px;overflow:hidden;background:#0b1520;border:1px solid #ffffff20}',
      '.card-thumb img,.card-thumb video{width:100%;height:100%;object-fit:cover;display:block}',
      '.card-thumb .thumb-play{position:absolute;inset:0;border:0;background:rgba(0,0,0,.42);color:#fff;font-size:22px;cursor:pointer}',
      '.card-thumb .thumb-empty{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#8fa5bb;font-size:11px;text-align:center;padding:4px;box-sizing:border-box}',
      '.card .card-preview{display:none}'
    ].join('\n');
    shadow.append(css);
  }

  // Share the panel's request dispatcher so panel rebuilds cannot strand preview callbacks.
  var queue = [];
  var inflight = 0;
  function drain() {
    while (inflight < 3 && queue.length) {
      var job = queue.shift();
      inflight += 1;
      runPreview(job.id, function (data) {
        inflight -= 1;
        try { job.cb(data); } catch (e) {}
        drain();
      });
    }
  }
  function runPreview(id, cb) {
    var request = window.__gptDaddyPanelRequest;
    if (typeof request !== 'function') { cb(null); return; }
    request('preview', { id: id }, 12000).then(function (data) {
      if (data) window.__gptdaddyPreviewData[id] = data;
      cb(data || null);
    }).catch(function () { cb(null); });
  }
  function requestPreview(id, cb) {
    var cached = window.__gptdaddyPreviewData[id];
    if (cached) { cb(cached); return; }
    queue.push({ id: id, cb: cb });
    drain();
  }

  function volumeValue() {
    var saved = localStorage.getItem(K_VOL);
    if (saved === null) return 0;
    var n = Number(saved);
    return isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : 0;
  }

  function applyVolumeToWallpaper(vol) {
    try {
      if (window.__gptDaddyWallpaperControllerV1) {
        window.__gptDaddyWallpaperControllerV1.configure({ volume: vol, muted: vol <= 0 });
      }
    } catch (e) {}
    try {
      var host = document.getElementById('gptdaddy-wallpaper-host');
      var hs = host && host.shadowRoot;
      if (hs) {
        var vids = hs.querySelectorAll('video');
        for (var i = 0; i < vids.length; i++) {
          vids[i].volume = vol;
          vids[i].muted = vol <= 0;
        }
      }
    } catch (e) {}
  }

  function emptyThumb(box, text) {
    var old = box.querySelector('.thumb-empty');
    if (old) return;
    var d = document.createElement('div');
    d.className = 'thumb-empty';
    d.textContent = text;
    box.append(d);
  }

  function decorate(card, map) {
    if (!card) return;
    var thumb = card.__guarderThumb;
    if (!thumb) {
      var body = document.createElement('div');
      body.className = 'card-body';
      while (card.firstChild) body.append(card.firstChild);
      thumb = document.createElement('div');
      thumb.className = 'card-thumb';
      card.append(thumb, body);
      card.__guarderThumb = thumb;
    }
    if (thumb.__guarderDecorated) return;
    thumb.__guarderDecorated = true;
    while (thumb.firstChild) thumb.firstChild.remove();

    var titleEl = card.querySelector('.card-title');
    var item = titleEl ? map.get(String(titleEl.textContent).trim()) : null;
    var playableVideo = item && item.capability === 'native-video' && item.mediaUrl;

    if (item && item.hasPreview) {
      var img = document.createElement('img');
      img.alt = item.title + ' preview';
      requestPreview(item.id, function (data) {
        if (!data) { img.remove(); emptyThumb(thumb, '无预览'); return; }
        img.src = data;
      });
      thumb.append(img);
    } else if (!playableVideo) {
      emptyThumb(thumb, '无预览');
    }

    if (playableVideo) {
      var play = document.createElement('button');
      play.type = 'button';
      play.className = 'thumb-play';
      play.title = '点击播放（应用到背景）';
      play.textContent = '▶';
      play.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (typeof window.__gptDaddyDesktopControl !== 'function') return;
        var playing = play.dataset.playing === '1';
        var others = shadow.querySelectorAll('.thumb-play');
        for (var k = 0; k < others.length; k++) {
          if (others[k] !== play && others[k].dataset.playing === '1') {
            others[k].dataset.playing = '0';
            others[k].textContent = '▶';
          }
        }
        try {
          window.__gptDaddyDesktopControl(JSON.stringify({
            id: 620000000 + Math.floor(Math.random() * 300000000),
            action: playing ? 'pause' : 'apply',
            payload: playing ? {} : { id: item.id }
          }));
        } catch (e) {}
        play.dataset.playing = playing ? '0' : '1';
        play.textContent = playing ? '▶' : '❚❚';
        play.title = playing ? '点击播放（应用到背景）' : '点击暂停';
      });
      thumb.append(play);
    }
  }

  function decorateAll() {
    var list = window.__gptdaddyCatalogItems || [];
    var map = new Map();
    for (var i = 0; i < list.length; i++) map.set(String(list[i].title), list[i]);
    var cards = shadow.querySelectorAll('.card');
    for (var j = 0; j < cards.length; j++) decorate(cards[j], map);
  }

  // 主题页：音量滑条
  var theme = shadow.querySelector('[data-view="theme"]');
  var zoom = theme && theme.querySelector('[data-setting="zoom"]');
  if (zoom && !shadow.querySelector('[data-setting="volume"]')) {
    var lang = localStorage.getItem('gpt-guarder-language') || 'zh-CN';
    var label = document.createElement('label');
    label.className = 'control';
    label.setAttribute('data-guarder-skip', '');
    var name = document.createElement('span');
    name.textContent = (VOL_LABEL[lang] || VOL_LABEL['zh-CN']) + ' ';
    var out = document.createElement('output');
    out.setAttribute('data-output', 'volume');
    var input = document.createElement('input');
    input.setAttribute('data-setting', 'volume');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    label.append(name, out, input);
    var zoomLabel = zoom.closest('label') || zoom.parentElement;
    if (zoomLabel && zoomLabel.after) zoomLabel.after(label);
    else theme.append(label);

    var saved = localStorage.getItem(K_VOL);
    var ui = saved === null ? 0 : Math.max(0, Math.min(100, Number(saved) || 0));
    input.value = String(ui);
    out.textContent = ui + ' %';
    var saveTimer = null;
    input.addEventListener('input', function () {
      var value = Number(input.value);
      out.textContent = value + ' %';
      localStorage.setItem(K_VOL, String(value));
      var vol = Math.max(0, Math.min(1, value / 100));
      applyVolumeToWallpaper(vol);
      var videos = shadow.querySelectorAll('.card-thumb video');
      for (var k = 0; k < videos.length; k++) {
        videos[k].volume = vol;
        videos[k].muted = vol <= 0;
      }
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        if (typeof window.__gptDaddyDesktopControl !== 'function') return;
        try {
          window.__gptDaddyDesktopControl(JSON.stringify({
            id: 600000000 + Math.floor(Math.random() * 300000000),
            action: 'settings', payload: { volume: vol, muted: vol <= 0 }
          }));
        } catch (e) {}
      }, 300);
    });
    window.addEventListener('storage', function (ev) {
      if (ev.key !== 'gpt-guarder-language') return;
      name.textContent = (VOL_LABEL[ev.newValue] || VOL_LABEL['zh-CN']) + ' ';
    });
  }

  if (!shadow.__guarderLibraryObserver) {
    var listNode = shadow.querySelector('[data-list]');
    if (listNode) {
      var observer = new MutationObserver(function () { decorateAll(); });
      observer.observe(listNode, { childList: true, subtree: false });
      shadow.__guarderLibraryObserver = observer;
    }
  }
  decorateAll();
  setTimeout(decorateAll, 1500);
  setTimeout(decorateAll, 5000);
  applyVolumeToWallpaper(volumeValue());
  setTimeout(function () { applyVolumeToWallpaper(volumeValue()); }, 1500);
  setTimeout(function () { applyVolumeToWallpaper(volumeValue()); }, 5000);
}
