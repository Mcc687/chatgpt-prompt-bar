(function initPopup() {
  "use strict";

  const core = globalThis.ChatGptPromptBarCore;
  const toggle = document.getElementById("enable-toggle");
  const count = document.getElementById("prompt-count");
  const openButton = document.getElementById("open-chatgpt");
  let state = core.cloneDefaultState();

  function getState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(core.STORAGE_KEY, (result) => resolve(result[core.STORAGE_KEY]));
    });
  }

  function setState(next) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [core.STORAGE_KEY]: next }, resolve);
    });
  }

  function render() {
    toggle.setAttribute("aria-checked", String(state.enabled));
    count.textContent = `${state.prompts.length} 条已保存提示词 · ${state.enabled ? "已启用" : "已停用"}`;
  }

  toggle.addEventListener("click", async () => {
    state.enabled = !state.enabled;
    await setState(state);
    render();
  });

  openButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://chatgpt.com/" });
  });

  getState().then((stored) => {
    state = core.migrateState(stored);
    render();
  });
})();
