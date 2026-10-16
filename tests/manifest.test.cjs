const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

test("扩展使用 Manifest V3 和最小权限", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.equal(manifest.host_permissions, undefined);
});

test("内容脚本只匹配 ChatGPT 官方网页", () => {
  const matches = manifest.content_scripts.flatMap((script) => script.matches);
  assert.deepEqual(matches.sort(), ["https://chat.openai.com/*", "https://chatgpt.com/*"]);
  for (const match of matches) assert.match(match, /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//);
});

test("清单引用的文件均存在", () => {
  const files = [
    manifest.action.default_popup,
    ...manifest.content_scripts.flatMap((script) => script.js)
  ];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} 不存在`);
});

test("ChatGPT 富文本写入不使用可能造成重复解析的 execCommand", () => {
  const contentScript = fs.readFileSync(path.join(root, "src", "content.js"), "utf8");
  assert.doesNotMatch(contentScript, /execCommand\s*\(/);
  assert.doesNotMatch(contentScript, /new InputEvent\s*\(/);
});

test("兼容 2026-09 ChatGPT 撰写器和无 data-testid 的发送按钮", () => {
  const contentScript = fs.readFileSync(path.join(root, "src", "content.js"), "utf8");
  assert.match(contentScript, /div\.ProseMirror\[contenteditable=/);
  assert.match(contentScript, /button\[aria-label=\\?"发送\\?"\]/);
  assert.match(contentScript, /form\.querySelectorAll\('button\[type=\\?"submit\\?"\]'/);
  assert.match(contentScript, /input\.closest\("form"\)/);
});
