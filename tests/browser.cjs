/* npm install --no-save playwright && npx playwright install chromium
   node tests/browser.cjs
   Optional: MCS_PLAYWRIGHT_MODULE, MCS_CHROMIUM_PATH, MCS_CHROMIUM_ARGS (JSON array). */
const {chromium} = require(process.env.MCS_PLAYWRIGHT_MODULE || 'playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.MCS_CHROMIUM_PATH ? {executablePath:process.env.MCS_CHROMIUM_PATH} : {}),
    args:JSON.parse(process.env.MCS_CHROMIUM_ARGS || '[]')});
  try {
  const context=await browser.newContext();
  for (const [domain, markup] of [
    ['chatgpt.com', '<div id="prompt-textarea" contenteditable="true"></div><button data-testid="send-button">Send</button>'],
    ['claude.ai', '<div class="ProseMirror" contenteditable="true"></div><button aria-label="Send message">Send</button>'],
    ['gemini.google.com', '<rich-textarea><div class="ql-editor" contenteditable="true"></div></rich-textarea><button class="send-button">Send</button>'],
    ['chatgpt.com', '<textarea id="prompt-textarea"></textarea><button data-testid="send-button">Send</button>']
  ]) {
    const page=await context.newPage();
    const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    await context.route('https://'+domain+'/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body><form>'+markup+'</form></body></html>'}));
    await page.goto('https://'+domain+'/');
    for (const file of ['protocol.js','core.js','adapters.js','content.js']) await page.addScriptTag({path:path.join(root,'extension',file)});
    await page.evaluate(()=>{
      window.sent=[];
      const editor=document.querySelector('[contenteditable],textarea');
      window.editorState='';
      editor.addEventListener('input',()=>{window.editorState=editor.value ?? editor.innerText;});
      document.querySelector('form').addEventListener('submit',e=>{e.preventDefault();window.sent.push(window.editorState);if('value' in editor)editor.value='';else editor.innerText='';window.editorState='';});
    });
    const editor=page.locator('[contenteditable],textarea');
    const panel=page.locator('#cognitive-slider-extension');
    await editor.fill('Explain gravity.');
    await page.locator('form button').click();
    await page.waitForFunction(()=>sent.length===1);
    assert((await page.evaluate(()=>sent[0])).includes('MCS_LEVEL=05'));
    await panel.locator('input').fill('8');
    await editor.fill('Question two.'); await editor.press('Enter');
    await page.waitForFunction(()=>sent.length===2);
    assert((await page.evaluate(()=>sent[1])).includes('MCS_LEVEL=08'));
    await editor.fill('/mcsset00\nUrgent question'); await panel.locator('#prepare').click();
    assert.equal(await panel.locator('input').inputValue(),'0');
    await panel.locator('#prepare').click();
    const prepared=await editor.evaluate(el=>el.value ?? el.innerText);
    assert.equal(prepared.split('[CognitiveSlider instructions]').length,2);
    await panel.locator('#remove').click();
    assert.equal(await editor.evaluate(el=>el.value ?? el.innerText),'/mcsset00\nUrgent question');
    await panel.locator('#prepare').click();
    await page.locator('form button').click();
    await page.waitForFunction(()=>sent.length===3);
    assert((await page.evaluate(()=>sent[2])).includes('MCS_LEVEL=00'));
    await page.evaluate(()=>history.pushState({},'', '/c/created-chat'));
    await page.waitForTimeout(900);
    assert.equal(await panel.locator('input').inputValue(),'0');
    await editor.fill('New message');await panel.locator('#prepare').click();
    await panel.locator('input').fill('9');
    assert((await editor.evaluate(el=>el.value ?? el.innerText)).includes('MCS_LEVEL=09'));
    await editor.press('End');await editor.press('Shift+Enter');
    assert.equal(await page.evaluate(()=>sent.length),3);
    await page.evaluate(()=>history.pushState({},'', '/unseen-conversation'));
    await page.waitForTimeout(900);
    assert.equal(await panel.locator('input').inputValue(),'5');
    await page.evaluate(()=>{
      const original=document.querySelector('[contenteditable],textarea');
      const duplicate=original.cloneNode(true);duplicate.id=original.id;original.after(duplicate);
    });
    await page.locator('form button').click();
    assert.equal(await page.evaluate(()=>sent.length),3);
    assert((await panel.locator('#status').innerText()).includes('Composer not identified'));
    await page.setViewportSize({width:375,height:800});
    assert(await panel.isVisible());
    assert.deepEqual(errors,[]);
    console.log(domain+(markup.includes('textarea id')?' textarea':' contenteditable')+': send, input synchronization, Enter, zero, deduplication, remove, slider, route reset passed.');
    await context.unrouteAll();await page.close();
  }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
