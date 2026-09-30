const assert = require('node:assert/strict');
require('../extension/protocol.js');
require('../extension/core.js');
const c = globalThis.MCSCore;
for (let n=0; n<=10; n++) {
  const suffix = c.suffix(n);
  assert(suffix.includes('MCS_LEVEL='+String(n).padStart(2,'0')));
  assert.equal(c.base('Question'+suffix,suffix),'Question');
  assert.equal(c.base('Question'+suffix+'\nMore detail',suffix),'Question\nMore detail');
}
assert.throws(()=>c.level(-1));assert.throws(()=>c.level(11));assert.throws(()=>c.level(1.5));
assert.equal(c.command('/mcsset03\nQuestion\n/mcsset10'),10);
assert.equal(c.command('> /mcsset01\n```\n/mcsset08\n```\n/mcsset04'),4);
assert.equal(c.command('~~~text\n/mcsset06\n~~~'),null);
assert.equal(c.command('    /mcsset06'),null);
assert.equal(c.command('Use /mcsset03'),null);
assert.equal(c.command('/mcsset11'),null);
assert.equal(c.command('/MCSSET00'),0);
assert.equal(c.base('User supplied [CognitiveSlider instructions]', ''),'User supplied [CognitiveSlider instructions]');
console.log('Core tests passed.');
