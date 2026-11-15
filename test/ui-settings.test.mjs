import test from 'node:test';
import assert from 'node:assert/strict';
import { uiToSetting, settingToUi, buildInappPanelScript } from '../src/wallpaper/inapp-panel.mjs';
import { normalizeSettings } from '../src/daemon.mjs';

test('all four sliders round-trip every 0–100 integer without rollback', () => {
  for (const key of ['opacity', 'scrimOpacity', 'blurPx', 'zoom']) {
    for (let ui = 0; ui <= 100; ui += 1) {
      const persisted = normalizeSettings({ [key]: uiToSetting(key, ui) })[key];
      assert.equal(settingToUi(key, persisted), ui, `${key} at ${ui}`);
    }
  }
  assert.equal(uiToSetting('zoom', 0), 50);
  assert.equal(uiToSetting('zoom', 100), 200);
  assert.equal(uiToSetting('scrimOpacity', 100), 1);
  assert.equal(uiToSetting('blurPx', 100), 100);
});

test('in-app panel previews changes and saves automatically', () => {
  const script = buildInappPanelScript();
  assert.doesNotThrow(() => new Function(script));
  assert.match(script, /__gptDaddyWallpaperControllerV1\?\.configure\(settings\)/);
  assert.doesNotMatch(script, /data-action="save"/);
  assert.match(script, /status = await request\('settings', settings\)/);
  for (const key of ['opacity', 'scrimOpacity', 'blurPx', 'zoom']) {
    assert.match(script, new RegExp(`data-setting="${key}" type="range" min="0" max="100"`));
  }
});
