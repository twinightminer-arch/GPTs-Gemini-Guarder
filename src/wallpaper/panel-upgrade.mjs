
export const PANEL_UPGRADE_VERSION = "2026-11-15-v1";

export function installPanelUpgrade() {
  var root = document.getElementById("gptdaddy-desktop-panel");
  if (!root || !root.shadowRoot) return;
  var shadow = root.shadowRoot;
  if (shadow.__guarderUpgradeCleanup) { try { shadow.__guarderUpgradeCleanup(); } catch (e) {} }
  if (shadow.__guarderUpgradeInstalled) return;
  shadow.__guarderUpgradeInstalled = true;
  var appearanceH2 = null;
  var noteP = null;
  var syncBtns = [];

  var ICON = "data:image/png;base64,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";
  var PAGE_DEFAULT = "#47bee6";
  var DESTS = {
    notion: { label: "Notion", url: "https://app.notion.com/p/419379783d4f819b8351f9cf25410c6f?pvs=204", ext: ".md", mime: "text/markdown" },
    obsidian: { label: "Obsidian", url: "obsidian://open?vault=Obsidian%20Vault&file=GPT%20Salad%20%E7%94%9F%E8%AF%8D%E6%9C%AC", ext: ".md", mime: "text/markdown" },
    onenote: { label: "OneNote", url: "onenote:///C:/Users/李忠浩/Documents/OneNote 笔记本/我的笔记本/快速笔记.one", ext: ".html", mime: "text/html" }
  };

  function $(sel) { return shadow.querySelector(sel); }
  function note(text) {
    var m = $("[data-message]");
    if (m) m.textContent = text;
  }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---- self-contained styles ---- */
  var style = document.createElement("style");
  style.setAttribute("data-guarder-skip", "");
  style.textContent =
    ".vocab-title{display:flex;align-items:center;gap:9px}" +
    ".vocab-logo{width:28px;height:28px;border-radius:8px;flex:0 0 auto;box-shadow:0 2px 8px rgba(0,0,0,.18)}" +
    ".dest-status{margin-left:8px;font-size:12px;opacity:.85;font-weight:600}" +
    ".dest-status[data-state=on]{color:#0a7d43}" +
    ".dest-status[data-state=off]{opacity:.55}" +
    ".destinations button[data-sync-destination]{background:#ffffff40}";
  shadow.append(style);

  /* ---- A. move the page-colour row from Theme into Settings ---- */
  var colorInput = $("[data-page-color]");
  var colorRow = colorInput && colorInput.closest(".color-row");
  var themeView = $('[data-view="theme"]');
  var settingsView = $('[data-view="settings"]');
  if (colorRow && themeView && settingsView && colorRow.parentElement === themeView) {
    var heading = document.createElement("h2");
    heading.textContent = "外观";
    appearanceH2 = heading;
    settingsView.append(heading, colorRow);
  }
  /* keep the static reset target in sync with the new built-in default */
  if (colorInput && !colorInput.value) colorInput.value = PAGE_DEFAULT;
  var hexInput = $("[data-page-hex]");
  if (hexInput && !hexInput.value) hexInput.value = PAGE_DEFAULT;

  /* ---- B. rebrand the vocabulary heading with the GPT Salad icon ---- */
  var vocabView = $('[data-view="vocabulary"]');
  if (vocabView) {
    var title = vocabView.querySelector("h2");
    if (title && !title.classList.contains("vocab-title")) {
      title.classList.add("vocab-title");
      var img = document.createElement("img");
      img.className = "vocab-logo";
      img.alt = "GPT Salad";
      img.setAttribute("data-guarder-skip", "");
      img.src = ICON;
      title.textContent = "";
      title.append(img, document.createTextNode("GPT Salad 生词本"));
    }
    var pars = vocabView.querySelectorAll("p");
    for (var pi = 0; pi < pars.length; pi++) {
      if (pars[pi].textContent.indexOf("以上按钮只打开你配置的地址") === 0) {
        pars[pi].textContent = "三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。";
        noteP = pars[pi];
      }
    }
  }

  /* ---- C. connect Notion / Obsidian / OneNote ---- */
  var destWrap = $(".destinations");
  if (!destWrap) return;

  function badge(name) {
    var b = shadow.querySelector('[data-dest-status="' + name + '"]');
    if (b) return b;
    var input = shadow.querySelector('[data-destination="' + name + '"]');
    if (!input) return null;
    b = document.createElement("span");
    b.className = "dest-status";
    b.setAttribute("data-dest-status", name);
    b.setAttribute("data-guarder-skip", "");
    var host = input.closest("label") || input.parentElement;
    host.append(b);
    return b;
  }
  function refreshBadge(name) {
    var b = badge(name);
    if (!b) return;
    var input = shadow.querySelector('[data-destination="' + name + '"]');
    var v = input ? input.value.trim() : "";
    b.textContent = (v ? "✓ " : "— ") + DESTS[name].label;
    b.setAttribute("data-state", v ? "on" : "off");
  }

  /* wrap the existing global response handler without breaking the panel */
  function control(action, payload) {
    return new Promise(function (resolve, reject) {
      if (typeof window.__gptDaddyDesktopControl !== "function") {
        reject(new Error("control channel unavailable"));
        return;
      }
      var id = 200000000 + Math.floor(Math.random() * 700000000);
      var prev = window.__gptDaddyControlResponse;
      var done = false;
      function restore() {
        if (window.__gptDaddyControlResponse === wrapped) window.__gptDaddyControlResponse = prev;
      }
      var timer = setTimeout(function () {
        if (done) return;
        done = true; restore(); reject(new Error("timeout"));
      }, 15000);
      var wrapped = function (rid, value, error) {
        if (rid === id) {
          done = true; clearTimeout(timer); restore();
          if (error) reject(new Error(error)); else resolve(value);
          return;
        }
        if (typeof prev === "function") prev(rid, value, error);
      };
      window.__gptDaddyControlResponse = wrapped;
      try { window.__gptDaddyDesktopControl(JSON.stringify({ id: id, action: action, payload: payload || {} })); }
      catch (e) { done = true; clearTimeout(timer); restore(); reject(e); }
    });
  }

  function format(name, list) {
    if (name === "obsidian") {
      var out = "# GPT Salad 生词本\n\n";
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        out += "- **" + String(e.source_text || "").replace(/\n/g, " ") + "**" +
               (e.notes ? " — " + String(e.notes).replace(/\n/g, " ") : "") +
               (e.favorite ? " ⭐" : "") + "\n";
      }
      return out;
    }
    if (name === "notion") {
      var t = "| 词条 | 释义 / 笔记 | 收藏 |\n| --- | --- | --- |\n";
      for (var j = 0; j < list.length; j++) {
        var q = list[j];
        t += "| " + String(q.source_text || "").replace(/\|/g, "\\|").replace(/\n/g, " ") +
             " | " + String(q.notes || "").replace(/\|/g, "\\|").replace(/\n/g, " ") +
             " | " + (q.favorite ? "是" : "否") + " |\n";
      }
      return t;
    }
    var h = "<table border='1'><tr><th>词条</th><th>笔记</th><th>收藏</th></tr>";
    for (var k = 0; k < list.length; k++) {
      var x = list[k];
      h += "<tr><td>" + esc(x.source_text) + "</td><td>" + esc(x.notes) + "</td><td>" +
           (x.favorite ? "★" : "") + "</td></tr>";
    }
    return h + "</table>";
  }

  function deliver(name, text, count) {
    var d = DESTS[name];
    function download() {
      var blob = new Blob([text], { type: d.mime + ";charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "GPT-Salad-Vocab-" + name + d.ext;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
      note("✓ " + count + " · " + d.label);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        note("✓ " + count + " · " + d.label);
      }).catch(download);
    } else {
      download();
    }
  }

  Object.keys(DESTS).forEach(function (name) {
    var input = shadow.querySelector('[data-destination="' + name + '"]');
    if (!input) return;
    var key = "gpt-guarder-destination-" + name;
    try { if (!localStorage.getItem(key)) input.value = DESTS[name].url; }
    catch (e) { input.value = DESTS[name].url; }

    var syncBtn = shadow.querySelector('[data-sync-destination="' + name + '"]');
    if (!syncBtn) {
      syncBtn = document.createElement("button");
      syncBtn.setAttribute("data-sync-destination", name);
      syncBtn.setAttribute("type", "button");
      syncBtn.textContent = "同步词条";
      var openBtn = shadow.querySelector('[data-open-destination="' + name + '"]');
      if (openBtn && openBtn.parentElement) openBtn.parentElement.insertBefore(syncBtn, openBtn.nextSibling);
      else destWrap.append(syncBtn);
    }
    if (!syncBtn.__wbSyncBound) {
      syncBtn.__wbSyncBound = true;
      syncBtn.addEventListener("click", function () {
        control("vocabList", {}).then(function (entries) {
          var live = (entries || []).filter(function (x) { return !x.archived; });
          deliver(name, format(name, live), live.length);
        }).catch(function () { note("✕ " + DESTS[name].label); });
      });
    }
    input.addEventListener("change", function () { refreshBadge(name); });
    refreshBadge(name);
  });

  /* new UI strings also follow the language switcher (zero-delay, DOM only) */
  var LANGS = ["zh-TW", "en", "ja", "ko"];
  var TR = {
    "GPT Salad 生词本": ["GPT Salad 生字本", "GPT Salad Vocabulary", "GPT Salad 単語帳", "GPT Salad 단어장"],
    "外观": ["外觀", "Appearance", "外観", "외형"],
    "同步词条": ["同步詞條", "Sync entries", "単語を同期", "단어 동기화"],
    "三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。": [
      "三個入口已連線你本機/雲端的目標；「同步詞條」會把本機詞庫按對應格式複製出來，本機 JSON 始終是原件，外部失敗不會刪除詞條。",
      "All three destinations are connected to your local/cloud targets. Sync copies the local vocabulary in each format; the local JSON always stays the original, and an external failure never deletes local entries.",
      "3 つの連携先はローカル/クラウドのターゲットに接続済みです。「単語を同期」はローカル詞庫を各形式でコピーします。ローカル JSON が常に原本であり、外部の失敗でローカル項目が削除されることはありません。",
      "세 연결 대상이 로컬/클라우드 목표에 연결되었습니다. '단어 동기화'는 로컬 단어장을 각 형식으로 복사하며, 로컬 JSON 이 항상 원본이고 외부 실패로 로컬 항목이 삭제되지 않습니다."
    ]
  };
  function currentLang() {
    var v = null;
    try { v = localStorage.getItem("gpt-guarder-language"); } catch (e) {}
    if (LANGS.indexOf(v) >= 0) return v;
    var h = (document.documentElement.lang || "").toLowerCase();
    if (h.indexOf("zh-tw") >= 0 || h.indexOf("zh-hant") >= 0) return "zh-TW";
    if (h.indexOf("ja") === 0) return "ja";
    if (h.indexOf("ko") === 0) return "ko";
    if (h.indexOf("en") === 0) return "en";
    return "zh-CN";
  }
  function localText(zh) {
    var li = LANGS.indexOf(currentLang());
    return li < 0 ? zh : TR[zh][li];
  }
  function applyNewLang() {
    var t = vocabView ? vocabView.querySelector("h2") : null;
    if (t) {
      var want = localText("GPT Salad 生词本");
      var last = t.lastChild;
      if (last && last.nodeType === 3) { if (last.nodeValue !== want) last.nodeValue = want; }
      else {
        var im = t.querySelector("img");
        t.textContent = "";
        t.append(im, document.createTextNode(want));
      }
    }
    if (appearanceH2) appearanceH2.textContent = localText("外观");
    var sbs = shadow.querySelectorAll("[data-sync-destination]");
    for (var si = 0; si < sbs.length; si++) sbs[si].textContent = localText("同步词条");
    if (noteP) noteP.textContent = localText("三个入口已连接你本机/云端的目标；「同步词条」会把本地词库按对应格式复制出来，本地 JSON 始终是原件，外部失败不会删除词条。");
  }

  /* capture-phase override: allow onenote:, honour the new built-in default
     colour on "restore default", and keep all three destinations openable */
  var clickHandler = function (ev) {
    var t = ev.target;
    if (t && t.closest && t.closest("[data-guarder-lang]")) setTimeout(applyNewLang, 0);
    var reset = t && t.closest ? t.closest('[data-action="reset-page-color"]') : null;
    if (reset) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      var pc = $("[data-page-color]"), ph = $("[data-page-hex]");
      if (ph) ph.value = PAGE_DEFAULT;
      if (pc) {
        pc.value = PAGE_DEFAULT;
        pc.dispatchEvent(new Event("input", { bubbles: true }));
      }
      note("✓ " + PAGE_DEFAULT);
      return;
    }
    var btn = t && t.closest ? t.closest("[data-open-destination]") : null;
    if (!btn) return;
    var name = btn.getAttribute("data-open-destination");
    if (!DESTS[name]) return;
    var input = shadow.querySelector('[data-destination="' + name + '"]');
    var url = input ? input.value.trim() : "";
    if (!url) return;
    var ok = url.indexOf("https://") === 0 ||
             (name === "obsidian" && url.indexOf("obsidian://") === 0) ||
             (name === "onenote" && url.indexOf("onenote:") === 0);
    if (!ok) return;
    ev.stopImmediatePropagation();
    ev.preventDefault();
    window.open(url, "_blank", "noopener");
    note("✓ " + DESTS[name].label);
  };
  shadow.addEventListener("click", clickHandler, true);
  applyNewLang();
  shadow.__guarderUpgradeCleanup = function () {
    shadow.removeEventListener("click", clickHandler, true);
    delete shadow.__guarderUpgradeInstalled;
    delete shadow.__guarderUpgradeCleanup;
  };
}
