const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

require(path.join(__dirname, "..", "src", "prompt-core.js"));
const core = globalThis.ChatGptPromptBarCore;

test("初次运行时提供示例数据，且返回独立副本", () => {
  const first = core.cloneDefaultState();
  const second = core.cloneDefaultState();
  assert.equal(first.enabled, true);
  assert.equal(first.prompts.length, 3);
  first.prompts[0].title = "changed";
  assert.notEqual(second.prompts[0].title, "changed");
});

test("迁移时保留用户主动清空的列表", () => {
  const state = core.migrateState({ enabled: false, panelCollapsed: true, prompts: [] });
  assert.equal(state.enabled, false);
  assert.equal(state.panelCollapsed, true);
  assert.deepEqual(state.prompts, []);
});

test("规范化提示词并拒绝空内容", () => {
  assert.equal(core.normalizePrompt({ title: "空", content: "  " }), null);
  const prompt = core.normalizePrompt({ title: "  名称  ", content: "  内容  ", favorite: 1 });
  assert.equal(prompt.title, "名称");
  assert.equal(prompt.content, "内容");
  assert.equal(prompt.favorite, true);
  assert.ok(prompt.id);
});

test("搜索同时匹配名称、正文和收藏状态", () => {
  const prompts = [
    { title: "翻译", content: "中文转英文", favorite: true },
    { title: "摘要", content: "提炼会议重点", favorite: false }
  ];
  assert.equal(core.filterPrompts(prompts, "会议", false).length, 1);
  assert.equal(core.filterPrompts(prompts, "", true).length, 1);
  assert.equal(core.filterPrompts(prompts, "中文", true)[0].title, "翻译");
});

test("拖动排序不会丢失提示词", () => {
  const prompts = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(core.movePrompt(prompts, "c", "a").map((item) => item.id), ["c", "a", "b"]);
  assert.deepEqual(core.movePrompt(prompts, "b", "c", true).map((item) => item.id), ["a", "c", "b"]);
  assert.deepEqual(prompts.map((item) => item.id), ["a", "b", "c"]);
});

test("导入和导出使用可验证的备份格式", () => {
  const state = core.cloneDefaultState();
  const exported = core.createExport(state);
  assert.equal(exported.format, "chatgpt-prompt-bar");
  assert.equal(core.parseImport(exported).length, state.prompts.length);
  assert.throws(() => core.parseImport({ format: "unknown", prompts: [] }), /不是提示词快捷栏/);
  assert.throws(() => core.parseImport({}), /没有提示词列表/);
});
