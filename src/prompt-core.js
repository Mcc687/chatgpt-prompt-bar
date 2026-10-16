(function initPromptBarCore(global) {
  "use strict";

  const STORAGE_KEY = "chatgptPromptBarState";
  const MAX_PROMPTS = 500;
  const MAX_TITLE_LENGTH = 80;
  const MAX_CONTENT_LENGTH = 50000;

  const DEFAULT_PROMPTS = Object.freeze([
    {
      id: "example-polish",
      title: "润色文本",
      content: "请润色下面这段文字，使表达更自然、清晰、简洁，同时保持原意不变：\n\n",
      favorite: true,
      createdAt: 1,
      updatedAt: 1
    },
    {
      id: "example-summary",
      title: "提炼要点",
      content: "请总结以下内容，先给出一句话结论，再用项目符号列出关键要点和待办事项：\n\n",
      favorite: false,
      createdAt: 2,
      updatedAt: 2
    },
    {
      id: "example-translate",
      title: "中译英",
      content: "请将以下中文翻译成自然、专业的英文。不要逐字直译，只输出译文：\n\n",
      favorite: false,
      createdAt: 3,
      updatedAt: 3
    }
  ]);

  function newId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function cleanString(value, maxLength) {
    return String(value == null ? "" : value).trim().slice(0, maxLength);
  }

  function normalizePrompt(value, index = 0) {
    if (!value || typeof value !== "object") return null;
    const content = cleanString(value.content, MAX_CONTENT_LENGTH);
    if (!content) return null;
    const fallbackTitle = content.split(/\r?\n/)[0].slice(0, 30) || `提示词 ${index + 1}`;
    const title = cleanString(value.title, MAX_TITLE_LENGTH) || fallbackTitle;
    const now = Date.now();
    return {
      id: cleanString(value.id, 120) || newId(),
      title,
      content,
      favorite: Boolean(value.favorite),
      createdAt: Number.isFinite(Number(value.createdAt)) ? Number(value.createdAt) : now,
      updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : now
    };
  }

  function cloneDefaultState() {
    return {
      version: 1,
      enabled: true,
      panelCollapsed: false,
      settings: { closeAfterSend: false },
      prompts: DEFAULT_PROMPTS.map((prompt) => ({ ...prompt }))
    };
  }

  function migrateState(raw) {
    if (!raw || typeof raw !== "object") return cloneDefaultState();
    const prompts = Array.isArray(raw.prompts)
      ? raw.prompts.slice(0, MAX_PROMPTS).map(normalizePrompt).filter(Boolean)
      : cloneDefaultState().prompts;
    return {
      version: 1,
      enabled: raw.enabled !== false,
      panelCollapsed: Boolean(raw.panelCollapsed),
      settings: {
        closeAfterSend: Boolean(raw.settings && raw.settings.closeAfterSend)
      },
      prompts
    };
  }

  function parseImport(payload) {
    if (!payload || typeof payload !== "object") throw new Error("备份文件格式无效");
    if (payload.format && payload.format !== "chatgpt-prompt-bar") {
      throw new Error("这不是提示词快捷栏的备份文件");
    }
    const source = Array.isArray(payload.prompts)
      ? payload.prompts
      : payload.state && Array.isArray(payload.state.prompts)
        ? payload.state.prompts
        : null;
    if (!source) throw new Error("备份文件中没有提示词列表");
    if (source.length > MAX_PROMPTS) throw new Error(`最多只能导入 ${MAX_PROMPTS} 条提示词`);
    const prompts = source.map(normalizePrompt).filter(Boolean);
    if (source.length && !prompts.length) throw new Error("备份中的提示词内容均为空");
    const seen = new Set();
    for (const prompt of prompts) {
      if (seen.has(prompt.id)) prompt.id = newId();
      seen.add(prompt.id);
    }
    return prompts;
  }

  function createExport(state) {
    return {
      format: "chatgpt-prompt-bar",
      version: 1,
      exportedAt: new Date().toISOString(),
      prompts: migrateState(state).prompts
    };
  }

  function filterPrompts(prompts, query, favoritesOnly) {
    const keyword = String(query || "").trim().toLocaleLowerCase();
    return prompts.filter((prompt) => {
      if (favoritesOnly && !prompt.favorite) return false;
      if (!keyword) return true;
      return `${prompt.title}\n${prompt.content}`.toLocaleLowerCase().includes(keyword);
    });
  }

  function movePrompt(prompts, sourceId, targetId, placeAfter = false) {
    if (sourceId === targetId) return prompts.slice();
    const next = prompts.slice();
    const sourceIndex = next.findIndex((prompt) => prompt.id === sourceId);
    const targetIndex = next.findIndex((prompt) => prompt.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return next;
    const [source] = next.splice(sourceIndex, 1);
    const currentTargetIndex = next.findIndex((prompt) => prompt.id === targetId);
    next.splice(currentTargetIndex + (placeAfter ? 1 : 0), 0, source);
    return next;
  }

  global.ChatGptPromptBarCore = Object.freeze({
    STORAGE_KEY,
    MAX_PROMPTS,
    MAX_TITLE_LENGTH,
    MAX_CONTENT_LENGTH,
    DEFAULT_PROMPTS,
    newId,
    normalizePrompt,
    cloneDefaultState,
    migrateState,
    parseImport,
    createExport,
    filterPrompts,
    movePrompt
  });
})(globalThis);
