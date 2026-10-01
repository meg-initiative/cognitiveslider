/* CognitiveSlider - MIT License. Pure helpers shared by adapters and tests. */
(() => {
  'use strict';
  const start = '[CognitiveSlider instructions]';
  const end = '[/CognitiveSlider instructions]';
  function level(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 10) throw new RangeError('MCS level must be an integer from 0 to 10.');
    return n;
  }
  function instructions(value) {
    return globalThis.MCS_PROTOCOL.replace(/^MCS_LEVEL=\d{2}/, 'MCS_LEVEL=' + String(level(value)).padStart(2, '0'));
  }
  function suffix(value) { return '\n\n--------------------------------\n' + start + '\n' + instructions(value).trimEnd() + '\n' + end; }
  // Only remove the exact block last inserted by this extension instance.
  // User-supplied text resembling a protocol is never broadly stripped.
  function base(text, previousSuffix) {
    if (!previousSuffix) return text;
    const at = text.indexOf(previousSuffix);
    return at >= 0 && at === text.lastIndexOf(previousSuffix)
      ? text.slice(0, at) + text.slice(at + previousSuffix.length) : text;
  }
  function command(text) {
    let found = null, fence = null;
    for (const line of text.split(/\r?\n/)) {
      const f = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (f) {
        if (!fence) fence = f[1];
        else if (f[1][0] === fence[0] && f[1].length >= fence.length) fence = null;
        continue;
      }
      if (fence) continue;
      const m = line.match(/^\s{0,3}\/mcsset(0[0-9]|10)\s*$/i);
      if (m) found = Number(m[1]);
    }
    return found;
  }
  globalThis.MCSCore = Object.freeze({level, instructions, suffix, base, command});
})();
