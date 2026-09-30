const assert = require('node:assert/strict');
require('../extension/protocol.js');require('../extension/core.js');require('../extension/conversation.js');
const {create} = globalThis.MCSConversation;
for (const prefix of ['', '/u/0', '/u/1']) {
 const c=create('gemini.google.com',prefix+'/app/');
 c.set(8);c.sent();c.update(prefix+'/app/abc');assert.equal(c.get(),8);
 for (let i=0;i<5;i++) {
  c.sent();c.update(prefix+'/app/abc/response/'+i);assert.equal(c.get(),8);
  c.update(prefix+'/app/abc/');assert.equal(c.get(),8);
 }
 c.set(0);c.sent();c.update(prefix+'/app/abc/response/6');assert.equal(c.get(),0);
 c.update(prefix+'/loading');assert.equal(c.get(),0);
 c.update(prefix+'/app/def');assert.equal(c.get(),5);
 c.set(3);c.update(prefix+'/app/abc');assert.equal(c.get(),0);
 c.update(prefix+'/app');assert.equal(c.get(),5);
 c.set(9);c.update(prefix+'/app/def');assert.equal(c.get(),3);
}
const c=create('gemini.google.com','/u/0/app');c.set(9);c.sent();c.update('/u/1/app/other');assert.equal(c.get(),5);
for (const [host,start,chat] of [['chatgpt.com','/','/c/a'],['claude.ai','/new','/chat/a'],['chatgpt.com','/g/my-gpt','/g/my-gpt/c/a']]) {
 const c=create(host,start);c.set(7);c.sent();c.update(chat);assert.equal(c.get(),7);
 c.update(chat+'/message/2');assert.equal(c.get(),7);
 c.update(start);assert.equal(c.get(),5);
}
console.log('Conversation regressions passed: account prefixes, trailing slash, repeated turns, zero, intermediate routes, chat switching, new chats.');
