/* Conversation identity, independent of account prefixes and message subroutes. */
(() => {
  'use strict';
  function route(host, pathname) {
    const original = pathname.replace(/\/+$/, '') || '/';
    const account = original.match(/^\/u\/(\d+)(?=\/|$)/);
    const scope = account ? 'account:' + account[1] : 'default';
    const path = account ? original.slice(account[0].length) || '/' : original;
    let id = null, isNew = false;
    if (host === 'gemini.google.com') {
      id = path.match(/^\/app\/([^/]+)/)?.[1];
      isNew = path === '/app' || path === '/';
    } else if (host === 'chatgpt.com') {
      id = path.match(/(?:^|\/)c\/([^/]+)/)?.[1];
      isNew = path === '/' || /^\/g\/[^/]+$/.test(path);
    } else if (host === 'claude.ai') {
      id = path.match(/^\/chat\/([^/]+)/)?.[1];
      isNew = path === '/' || path === '/new';
    }
    // Unknown intermediate routes are not evidence of a new conversation.
    return {key: id ? scope + ':chat:' + id : isNew ? scope + ':new:' + path : null, scope, isNew, id: id || null};
  }
  function create(host, pathname) {
    let active = route(host, pathname), value = 5, pending = false;
    const saved = new Map();
    function set(n) { value = globalThis.MCSCore.level(n); if (active.key) saved.set(active.key, value); }
    function update(pathname) {
      const next = route(host, pathname);
      if (!next.key || next.key === active.key) return false;
      const sameAccount = next.scope === active.scope;
      // A new-chat setting transfers only after its Send action; selecting an
      // unrelated existing conversation must not overwrite that chat's level.
      const carry = sameAccount && pending && active.isNew && next.id;
      value = carry ? value : !next.isNew && saved.has(next.key) ? saved.get(next.key) : 5;
      active = next; pending = false; set(value); return true;
    }
    return Object.freeze({set, update, sent: () => { pending = active.isNew; }, get: () => value});
  }
  globalThis.MCSConversation = Object.freeze({route, create});
})();
