(function initChatGptPromptBar() {
  "use strict";

  if (window.top !== window || document.getElementById("chatgpt-prompt-bar-host")) return;

  const core = globalThis.ChatGptPromptBarCore;
  const styleText = globalThis.ChatGptPromptBarStyle;
  if (!core || !styleText || !globalThis.chrome?.storage?.local) return;

  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"></path></svg>',
    collapse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z"></path><path d="m14.8 6.4 3 3"></path></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"></path></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>'
  };

  const host = document.createElement("div");
  host.id = "chatgpt-prompt-bar-host";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styleText;
  const app = document.createElement("div");
  app.className = "pb-app";
  shadow.append(style, app);
  document.documentElement.append(host);

  let state = core.cloneDefaultState();
  const view = {
    query: "",
    favoritesOnly: false,
    settingsOpen: false,
    editor: null,
    busyId: null,
    draggingId: null
  };

  function storageGet(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        const error = chrome.runtime.lastError;
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  function storageSet(value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(value, () => {
        const error = chrome.runtime.lastError;
        if (error) reject(error);
        else resolve();
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function visible(element) {
    if (
      !element ||
      element.disabled ||
      element.getAttribute("aria-disabled") === "true" ||
      element.getAttribute("aria-hidden") === "true"
    ) return false;
    const rect = element.getBoundingClientRect();
    const css = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && css.display !== "none" && css.visibility !== "hidden";
  }

  function isDarkPage() {
    const rootClass = `${document.documentElement.className} ${document.body?.className || ""}`.toLowerCase();
    if (rootClass.includes("dark")) return true;
    const colorScheme = getComputedStyle(document.documentElement).colorScheme;
    if (String(colorScheme).includes("dark") && !String(colorScheme).includes("light")) return true;
    const color = getComputedStyle(document.body || document.documentElement).backgroundColor.match(/[\d.]+/g);
    if (!color || color.length < 3 || Number(color[3] ?? 1) === 0) return false;
    return Number(color[0]) * 0.299 + Number(color[1]) * 0.587 + Number(color[2]) * 0.114 < 105;
  }

  function updateTheme() {
    host.dataset.theme = isDarkPage() ? "dark" : "light";
  }

  async function saveState() {
    await storageSet({ [core.STORAGE_KEY]: state });
  }

  function promptById(id) {
    return state.prompts.find((prompt) => prompt.id === id);
  }

  function promptCardsHtml() {
    const prompts = core.filterPrompts(state.prompts, view.query, view.favoritesOnly);
    if (!prompts.length) {
      const hasFilters = Boolean(view.query || view.favoritesOnly);
      return `<div class="pb-empty">
        <div><div class="pb-empty-icon">${hasFilters ? "⌕" : "+"}</div>
        <strong>${hasFilters ? "没有匹配的提示词" : "还没有提示词"}</strong>
        <span>${hasFilters ? "换个关键词，或取消收藏筛选" : "点击右上角“新建”添加第一条"}</span></div>
      </div>`;
    }
    return prompts.map((prompt) => `<article class="pb-card" data-card-id="${escapeHtml(prompt.id)}" data-dragging="${view.draggingId === prompt.id}">
      <div class="pb-card-head">
        <span class="pb-drag" draggable="true" data-drag-id="${escapeHtml(prompt.id)}" title="拖动排序" aria-label="拖动排序">⠿</span>
        <div class="pb-card-title" title="${escapeHtml(prompt.title)}">${escapeHtml(prompt.title)}</div>
        <button class="pb-icon-btn pb-fav" data-action="favorite" data-id="${escapeHtml(prompt.id)}" data-active="${prompt.favorite}" title="${prompt.favorite ? "取消收藏" : "收藏"}" aria-label="${prompt.favorite ? "取消收藏" : "收藏"}">${icons.star}</button>
      </div>
      <p class="pb-card-text">${escapeHtml(prompt.content)}</p>
      <div class="pb-card-actions">
        <button class="pb-btn" data-action="fill" data-id="${escapeHtml(prompt.id)}" ${view.busyId ? "disabled" : ""}>仅填入</button>
        <button class="pb-btn pb-btn-primary" data-action="send" data-id="${escapeHtml(prompt.id)}" ${view.busyId ? "disabled" : ""}>${view.busyId === prompt.id ? "正在发送…" : "填入并发送"}</button>
        <button class="pb-icon-btn pb-more" data-action="edit" data-id="${escapeHtml(prompt.id)}" title="编辑" aria-label="编辑">${icons.edit}</button>
        <button class="pb-icon-btn pb-more pb-btn-danger" data-action="delete" data-id="${escapeHtml(prompt.id)}" title="删除" aria-label="删除">${icons.trash}</button>
      </div>
    </article>`).join("");
  }

  function editorHtml() {
    if (!view.editor) return "";
    const editing = Boolean(view.editor.id);
    return `<div class="pb-backdrop" data-action="backdrop-close">
      <section class="pb-dialog" role="dialog" aria-modal="true" aria-labelledby="pb-dialog-title">
        <div class="pb-dialog-head">
          <h2 class="pb-dialog-title" id="pb-dialog-title">${editing ? "编辑提示词" : "新建提示词"}</h2>
          <button class="pb-icon-btn" data-action="close-editor" title="关闭" aria-label="关闭">${icons.close}</button>
        </div>
        <form class="pb-form" data-role="editor-form">
          <label class="pb-field">
            <span class="pb-label"><span>名称</span><span data-role="title-count">${view.editor.title.length}/${core.MAX_TITLE_LENGTH}</span></span>
            <input class="pb-input" name="title" maxlength="${core.MAX_TITLE_LENGTH}" value="${escapeHtml(view.editor.title)}" placeholder="例如：周报总结" autocomplete="off">
          </label>
          <label class="pb-field">
            <span class="pb-label"><span>提示词内容</span><span data-role="content-count">${view.editor.content.length}/${core.MAX_CONTENT_LENGTH}</span></span>
            <textarea class="pb-textarea" name="content" maxlength="${core.MAX_CONTENT_LENGTH}" required placeholder="输入要保存的完整提示词…">${escapeHtml(view.editor.content)}</textarea>
          </label>
          <label class="pb-check"><input type="checkbox" name="favorite" ${view.editor.favorite ? "checked" : ""}> 添加到收藏</label>
          <div class="pb-dialog-actions">
            <button type="button" class="pb-btn" data-action="close-editor">取消</button>
            <button type="submit" class="pb-btn pb-btn-primary">${editing ? "保存修改" : "添加提示词"}</button>
          </div>
        </form>
      </section>
    </div>`;
  }

  function settingsHtml() {
    if (!view.settingsOpen) return "";
    return `<div class="pb-popover" role="menu">
      <button class="pb-menu-btn pb-switch-row" data-action="toggle-close-after-send" role="menuitem">
        <span>发送后收起面板</span><span class="pb-switch" data-active="${state.settings.closeAfterSend}"></span>
      </button>
      <div class="pb-menu-divider"></div>
      <button class="pb-menu-btn" data-action="export" role="menuitem"><span>⇩</span><span>导出 JSON 备份</span></button>
      <button class="pb-menu-btn" data-action="import" role="menuitem"><span>⇧</span><span>导入 JSON 备份</span></button>
      <button class="pb-menu-btn" data-action="restore-examples" role="menuitem"><span>↺</span><span>恢复示例提示词</span></button>
      <div class="pb-menu-divider"></div>
      <button class="pb-menu-btn pb-menu-btn-danger" data-action="clear-all" role="menuitem"><span>×</span><span>清空全部提示词</span></button>
    </div>`;
  }

  function render() {
    if (!state.enabled) {
      app.innerHTML = '<div class="pb-toast-region" aria-live="polite"></div>';
      return;
    }
    if (state.panelCollapsed) {
      app.innerHTML = `<button class="pb-handle" data-action="expand" title="展开提示词快捷栏" aria-label="展开提示词快捷栏"><span class="pb-handle-mark">P</span></button><div class="pb-toast-region" aria-live="polite"></div>${editorHtml()}`;
      return;
    }
    app.innerHTML = `<aside class="pb-panel" aria-label="ChatGPT 提示词快捷栏">
      <header class="pb-header">
        <div class="pb-brand">P</div>
        <div class="pb-title-wrap"><h1 class="pb-title">提示词快捷栏</h1><div class="pb-subtitle"><span data-role="result-count">${state.prompts.length}</span> 条提示词</div></div>
        <div class="pb-header-actions">
          <button class="pb-icon-btn" data-action="settings" title="管理与备份" aria-label="管理与备份">${icons.settings}</button>
          <button class="pb-icon-btn" data-action="collapse" title="收起" aria-label="收起">${icons.collapse}</button>
        </div>
      </header>
      <div class="pb-toolbar">
        <label class="pb-search-wrap"><span class="pb-search-icon">${icons.search}</span><span class="pb-sr-only">搜索提示词</span><input class="pb-search" data-role="search" value="${escapeHtml(view.query)}" placeholder="搜索提示词…"></label>
        <button class="pb-icon-btn pb-filter-btn" data-action="favorites-only" data-active="${view.favoritesOnly}" title="只看收藏" aria-label="只看收藏">${icons.star}</button>
        <button class="pb-add-btn" data-action="add"><span>＋</span><span>新建</span></button>
      </div>
      <div class="pb-list" data-role="prompt-list">${promptCardsHtml()}</div>
      <footer class="pb-footer"><span>内容仅保存在本机</span><span><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></span></footer>
      ${settingsHtml()}
    </aside>
    <input class="pb-sr-only" type="file" data-role="import-input" accept="application/json,.json">
    <div class="pb-toast-region" aria-live="polite"></div>
    ${editorHtml()}`;
  }

  function updateList() {
    const list = shadow.querySelector('[data-role="prompt-list"]');
    if (list) list.innerHTML = promptCardsHtml();
    const count = shadow.querySelector('[data-role="result-count"]');
    if (count) count.textContent = String(core.filterPrompts(state.prompts, view.query, view.favoritesOnly).length);
  }

  function toast(message, type = "success") {
    const region = shadow.querySelector(".pb-toast-region");
    if (!region) return;
    const item = document.createElement("div");
    item.className = "pb-toast";
    item.dataset.type = type;
    item.textContent = message;
    region.append(item);
    setTimeout(() => item.remove(), 3200);
  }

  function openEditor(prompt) {
    if (!prompt && state.prompts.length >= core.MAX_PROMPTS) {
      toast(`最多可保存 ${core.MAX_PROMPTS} 条提示词`, "error");
      return;
    }
    view.settingsOpen = false;
    view.editor = prompt
      ? { id: prompt.id, title: prompt.title, content: prompt.content, favorite: prompt.favorite }
      : { id: null, title: "", content: "", favorite: false };
    render();
    requestAnimationFrame(() => shadow.querySelector('input[name="title"]')?.focus());
  }

  function closeEditor() {
    view.editor = null;
    render();
  }

  function findComposer() {
    const candidates = document.querySelectorAll([
      'form div.ProseMirror[contenteditable="true"][role="textbox"]',
      'form [contenteditable="true"][role="textbox"][aria-label]',
      '#prompt-textarea[contenteditable="true"]',
      '[data-testid="prompt-textarea"][contenteditable="true"]',
      'form [contenteditable="true"][role="textbox"]',
      'textarea[data-testid="prompt-textarea"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="消息"]'
    ].join(","));
    return [...candidates].find(visible) || null;
  }

  function composerText(input) {
    if (!input) return "";
    return input.matches("textarea,input") ? input.value : (input.innerText || input.textContent || "");
  }

  function setNativeTextareaValue(input, value) {
    const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
  }

  function replaceContentEditable(input, text) {
    input.focus();
    input.replaceChildren();
    text.split("\n").forEach((line) => {
      const paragraph = document.createElement("p");
      if (line) paragraph.textContent = line;
      else paragraph.append(document.createElement("br"));
      input.append(paragraph);
    });

    // ChatGPT 的富文本编辑器会观察 DOM 变化。直接写入后只发送一次不携带
    // 大段 data 的 input 事件，避免 execCommand 与第二次 InputEvent 让编辑器
    // 重复解析相同内容，造成页面主线程卡死。
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function fillComposer(text) {
    const input = findComposer();
    if (!input) throw new Error("未找到 ChatGPT 输入框，请刷新页面后重试");
    input.focus();
    if (input.matches("textarea,input")) setNativeTextareaValue(input, text);
    else replaceContentEditable(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (!composerText(input).trim()) throw new Error("提示词未能写入输入框，请刷新 ChatGPT 后重试");
    return input;
  }

  function findSendButton(input) {
    const knownSelector = [
      'button[data-testid="send-button"]',
      'button[data-testid="composer-submit-button"]',
      'button[aria-label="Send"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send message"]',
      'button[aria-label="发送"]',
      'button[aria-label="发送提示"]',
      'button[aria-label="发送消息"]'
    ].join(",");
    const form = input.closest("form");
    const formCandidates = form
      ? [
          ...form.querySelectorAll(knownSelector),
          // 2026-09 的 ChatGPT 撰写器移除了发送按钮的 data-testid，
          // 但保留了与输入框同一 form 内唯一的 submit 语义。
          ...form.querySelectorAll('button[type="submit"]')
        ]
      : [];
    return [
      ...formCandidates,
      ...document.querySelectorAll(knownSelector)
    ].find(visible) || null;
  }

  async function waitForSendButton(input, timeoutMs = 5000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const button = findSendButton(input);
      if (button) return button;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("提示词已填入，但发送按钮不可用；请检查页面状态后手动发送");
  }

  async function fillOnly(prompt) {
    try {
      await fillComposer(prompt.content);
      toast(`已填入“${prompt.title}”`);
    } catch (error) {
      toast(error.message || "填入失败", "error");
    }
  }

  async function fillAndSend(prompt) {
    if (view.busyId) return;
    view.busyId = prompt.id;
    updateList();
    try {
      const input = await fillComposer(prompt.content);
      const button = await waitForSendButton(input);
      button.click();
      toast(`已发送“${prompt.title}”`);
      if (state.settings.closeAfterSend) {
        state.panelCollapsed = true;
        await saveState();
      }
    } catch (error) {
      toast(error.message || "发送失败", "error");
    } finally {
      view.busyId = null;
      render();
    }
  }

  function exportPrompts() {
    const json = JSON.stringify(core.createExport(state), null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const day = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `chatgpt-prompts-${day}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("提示词备份已导出");
  }

  async function importPrompts(file) {
    try {
      const payload = JSON.parse(await file.text());
      const prompts = core.parseImport(payload);
      if (!confirm(`将用备份中的 ${prompts.length} 条提示词替换当前列表，是否继续？`)) return;
      state.prompts = prompts;
      view.query = "";
      view.favoritesOnly = false;
      view.settingsOpen = false;
      await saveState();
      render();
      toast(`已导入 ${prompts.length} 条提示词`);
    } catch (error) {
      toast(error.message || "导入失败，请检查文件格式", "error");
    }
  }

  app.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches('[data-role="search"]')) {
      view.query = target.value;
      updateList();
      return;
    }
    if (target.matches('input[name="title"]')) {
      const counter = shadow.querySelector('[data-role="title-count"]');
      if (counter) counter.textContent = `${target.value.length}/${core.MAX_TITLE_LENGTH}`;
    }
    if (target.matches('textarea[name="content"]')) {
      const counter = shadow.querySelector('[data-role="content-count"]');
      if (counter) counter.textContent = `${target.value.length}/${core.MAX_CONTENT_LENGTH}`;
    }
  });

  app.addEventListener("submit", async (event) => {
    if (!event.target.matches('[data-role="editor-form"]')) return;
    event.preventDefault();
    const form = event.target;
    const normalized = core.normalizePrompt({
      id: view.editor?.id,
      title: form.elements.title.value,
      content: form.elements.content.value,
      favorite: form.elements.favorite.checked,
      createdAt: promptById(view.editor?.id)?.createdAt,
      updatedAt: Date.now()
    });
    if (!normalized) {
      toast("提示词内容不能为空", "error");
      form.elements.content.focus();
      return;
    }
    const existingIndex = state.prompts.findIndex((prompt) => prompt.id === normalized.id);
    if (existingIndex >= 0) state.prompts.splice(existingIndex, 1, normalized);
    else state.prompts.unshift(normalized);
    view.editor = null;
    await saveState();
    render();
    toast(existingIndex >= 0 ? "提示词已更新" : "提示词已添加");
  });

  app.addEventListener("click", async (event) => {
    const actionNode = event.target.closest("[data-action]");
    if (!actionNode) return;
    const action = actionNode.dataset.action;
    const prompt = promptById(actionNode.dataset.id);

    if (action === "backdrop-close" && event.target !== actionNode) return;
    if (action === "expand") { state.panelCollapsed = false; await saveState(); render(); return; }
    if (action === "collapse") { state.panelCollapsed = true; view.settingsOpen = false; await saveState(); render(); return; }
    if (action === "settings") { view.settingsOpen = !view.settingsOpen; render(); return; }
    if (action === "favorites-only") { view.favoritesOnly = !view.favoritesOnly; render(); return; }
    if (action === "add") { openEditor(null); return; }
    if (action === "close-editor" || action === "backdrop-close") { closeEditor(); return; }
    if (action === "edit" && prompt) { openEditor(prompt); return; }
    if (action === "fill" && prompt) { await fillOnly(prompt); return; }
    if (action === "send" && prompt) { await fillAndSend(prompt); return; }
    if (action === "favorite" && prompt) {
      prompt.favorite = !prompt.favorite;
      prompt.updatedAt = Date.now();
      await saveState();
      render();
      return;
    }
    if (action === "delete" && prompt) {
      if (!confirm(`确定删除“${prompt.title}”吗？`)) return;
      state.prompts = state.prompts.filter((item) => item.id !== prompt.id);
      await saveState();
      render();
      toast("提示词已删除");
      return;
    }
    if (action === "toggle-close-after-send") {
      state.settings.closeAfterSend = !state.settings.closeAfterSend;
      await saveState();
      render();
      return;
    }
    if (action === "export") { exportPrompts(); return; }
    if (action === "import") { shadow.querySelector('[data-role="import-input"]')?.click(); return; }
    if (action === "restore-examples") {
      if (!confirm("这会用内置示例替换当前提示词列表，是否继续？")) return;
      state.prompts = core.cloneDefaultState().prompts;
      view.settingsOpen = false;
      await saveState();
      render();
      toast("已恢复示例提示词");
      return;
    }
    if (action === "clear-all") {
      if (!state.prompts.length || !confirm("确定清空全部提示词吗？此操作无法撤销。")) return;
      state.prompts = [];
      view.settingsOpen = false;
      await saveState();
      render();
      toast("全部提示词已清空");
    }
  });

  app.addEventListener("change", (event) => {
    if (!event.target.matches('[data-role="import-input"]') || !event.target.files?.[0]) return;
    importPrompts(event.target.files[0]);
    event.target.value = "";
  });

  app.addEventListener("dragstart", (event) => {
    const handle = event.target.closest("[data-drag-id]");
    if (!handle) return;
    view.draggingId = handle.dataset.dragId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", view.draggingId);
    requestAnimationFrame(updateList);
  });

  app.addEventListener("dragover", (event) => {
    if (view.draggingId && event.target.closest("[data-card-id]")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  });

  app.addEventListener("drop", async (event) => {
    const card = event.target.closest("[data-card-id]");
    if (!card || !view.draggingId) return;
    event.preventDefault();
    const rect = card.getBoundingClientRect();
    const placeAfter = event.clientY > rect.top + rect.height / 2;
    state.prompts = core.movePrompt(state.prompts, view.draggingId, card.dataset.cardId, placeAfter);
    view.draggingId = null;
    await saveState();
    render();
  });

  app.addEventListener("dragend", () => {
    view.draggingId = null;
    updateList();
  });

  window.addEventListener("keydown", async (event) => {
    if (event.altKey && event.shiftKey && event.code === "KeyP") {
      event.preventDefault();
      state.panelCollapsed = !state.panelCollapsed;
      view.settingsOpen = false;
      await saveState();
      render();
      return;
    }
    if (event.key === "Escape") {
      if (view.editor) closeEditor();
      else if (view.settingsOpen) { view.settingsOpen = false; render(); }
    }
  }, true);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[core.STORAGE_KEY]?.newValue) return;
    const next = core.migrateState(changes[core.STORAGE_KEY].newValue);
    if (JSON.stringify(next) === JSON.stringify(state)) return;
    state = next;
    render();
  });

  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
  if (document.body) themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);

  (async () => {
    try {
      const stored = await storageGet(core.STORAGE_KEY);
      const hadState = Boolean(stored[core.STORAGE_KEY]);
      state = core.migrateState(stored[core.STORAGE_KEY]);
      if (!hadState) await saveState();
      updateTheme();
      render();
    } catch (error) {
      console.warn("[ChatGPT Prompt Bar] 初始化失败", error);
      render();
    }
  })();
})();
