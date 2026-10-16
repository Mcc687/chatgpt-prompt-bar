globalThis.ChatGptPromptBarStyle = String.raw`
  :host {
    all: initial;
    --pb-bg: #ffffff;
    --pb-elevated: #f7f7f5;
    --pb-hover: #f0f0ed;
    --pb-border: #e5e5e1;
    --pb-text: #20201f;
    --pb-muted: #74746f;
    --pb-accent: #10a37f;
    --pb-accent-strong: #087f64;
    --pb-accent-soft: #e8f7f2;
    --pb-danger: #c94040;
    --pb-shadow: 0 20px 55px rgba(20, 24, 22, 0.16), 0 2px 8px rgba(20, 24, 22, 0.08);
    color: var(--pb-text);
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    font-size: 16px;
    line-height: 1.45;
  }

  :host([data-theme="dark"]) {
    --pb-bg: #252624;
    --pb-elevated: #30312f;
    --pb-hover: #383936;
    --pb-border: #41423f;
    --pb-text: #f2f2ef;
    --pb-muted: #a5a6a0;
    --pb-accent: #20c997;
    --pb-accent-strong: #55dbb3;
    --pb-accent-soft: #173f35;
    --pb-danger: #ff7770;
    --pb-shadow: 0 22px 60px rgba(0, 0, 0, 0.42), 0 2px 8px rgba(0, 0, 0, 0.28);
  }

  * { box-sizing: border-box; }
  button, input, textarea { font: inherit; }
  button { color: inherit; }

  .pb-panel {
    position: fixed;
    z-index: 2147483000;
    top: 72px;
    right: 18px;
    display: flex;
    flex-direction: column;
    width: min(420px, calc(100vw - 32px));
    max-height: calc(100vh - 96px);
    overflow: hidden;
    border: 1px solid var(--pb-border);
    border-radius: 18px;
    background: var(--pb-bg);
    box-shadow: var(--pb-shadow);
    animation: pb-slide-in 160ms ease-out;
  }

  .pb-handle {
    position: fixed;
    z-index: 2147483000;
    top: 112px;
    right: 0;
    display: grid;
    place-items: center;
    width: 48px;
    height: 86px;
    padding: 0;
    border: 1px solid var(--pb-border);
    border-right: 0;
    border-radius: 15px 0 0 15px;
    background: var(--pb-bg);
    box-shadow: var(--pb-shadow);
    cursor: pointer;
  }

  .pb-handle:hover { width: 52px; background: var(--pb-elevated); }
  .pb-handle-mark {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 9px;
    color: white;
    background: var(--pb-accent);
    font-size: 15px;
    font-weight: 800;
  }

  .pb-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 15px 12px 17px;
  }
  .pb-brand {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: white;
    background: linear-gradient(145deg, var(--pb-accent), #0b8067);
    font-size: 16px;
    font-weight: 850;
    box-shadow: 0 5px 14px color-mix(in srgb, var(--pb-accent) 30%, transparent);
  }
  .pb-title-wrap { min-width: 0; flex: 1; }
  .pb-title { margin: 0; font-size: 16px; font-weight: 730; letter-spacing: .01em; }
  .pb-subtitle { margin-top: 2px; color: var(--pb-muted); font-size: 12px; }
  .pb-header-actions { display: flex; gap: 3px; }

  .pb-icon-btn {
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 0;
    border-radius: 9px;
    background: transparent;
    cursor: pointer;
  }
  .pb-icon-btn:hover { background: var(--pb-hover); }
  .pb-icon-btn svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }

  .pb-toolbar {
    display: flex;
    gap: 7px;
    padding: 0 15px 13px;
    border-bottom: 1px solid var(--pb-border);
  }
  .pb-search-wrap { position: relative; min-width: 0; flex: 1; }
  .pb-search-icon {
    position: absolute;
    top: 50%; left: 10px;
    width: 17px; height: 17px;
    color: var(--pb-muted);
    transform: translateY(-50%);
    pointer-events: none;
  }
  .pb-search {
    width: 100%; height: 42px;
    padding: 0 32px;
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    outline: none;
    color: var(--pb-text);
    background: var(--pb-elevated);
  }
  .pb-search::placeholder { color: var(--pb-muted); }
  .pb-search:focus { border-color: var(--pb-accent); box-shadow: 0 0 0 3px var(--pb-accent-soft); }
  .pb-filter-btn { width: 42px; height: 42px; border: 1px solid var(--pb-border); background: var(--pb-bg); }
  .pb-filter-btn[data-active="true"] { color: #c48708; border-color: #e5bb54; background: #fff8dc; }
  :host([data-theme="dark"]) .pb-filter-btn[data-active="true"] { background: #4b3c18; }
  .pb-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 42px;
    padding: 0 14px;
    border: 0;
    border-radius: 10px;
    color: white;
    background: var(--pb-accent);
    font-size: 14px;
    font-weight: 650;
    cursor: pointer;
  }
  .pb-add-btn:hover { background: var(--pb-accent-strong); }

  .pb-list {
    min-height: 120px;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--pb-border) transparent;
  }
  .pb-card {
    position: relative;
    margin-bottom: 10px;
    padding: 14px;
    border: 1px solid var(--pb-border);
    border-radius: 13px;
    background: var(--pb-bg);
    transition: border-color 120ms, background 120ms, transform 120ms;
  }
  .pb-card:hover { border-color: color-mix(in srgb, var(--pb-accent) 55%, var(--pb-border)); background: var(--pb-elevated); }
  .pb-card[data-dragging="true"] { opacity: .45; transform: scale(.98); }
  .pb-card-head { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
  .pb-drag {
    display: grid;
    place-items: center;
    width: 20px; height: 24px;
    margin-left: -4px;
    border: 0;
    color: var(--pb-muted);
    background: transparent;
    cursor: grab;
    font-size: 17px;
    letter-spacing: -3px;
  }
  .pb-card-title { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 700; }
  .pb-fav { width: 29px; height: 29px; color: var(--pb-muted); }
  .pb-fav[data-active="true"] { color: #d79a13; }
  .pb-fav svg { fill: transparent; }
  .pb-fav[data-active="true"] svg { fill: currentColor; }
  .pb-card-text {
    display: -webkit-box;
    min-height: 44px;
    margin: 0 0 11px;
    overflow: hidden;
    color: var(--pb-muted);
    font-size: 14px;
    line-height: 1.62;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
  }
  .pb-card-actions { display: flex; align-items: center; gap: 5px; }
  .pb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 35px;
    padding: 0 11px;
    border: 1px solid var(--pb-border);
    border-radius: 8px;
    color: var(--pb-text);
    background: var(--pb-bg);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .pb-btn:hover { background: var(--pb-hover); }
  .pb-btn:disabled { opacity: .48; cursor: wait; }
  .pb-btn-primary { flex: 1; color: white; border-color: var(--pb-accent); background: var(--pb-accent); }
  .pb-btn-primary:hover { background: var(--pb-accent-strong); }
  .pb-btn-danger { color: var(--pb-danger); }
  .pb-more { width: 35px; padding: 0; }

  .pb-empty { display: grid; place-items: center; min-height: 190px; padding: 24px; text-align: center; color: var(--pb-muted); }
  .pb-empty-icon { display: grid; place-items: center; width: 46px; height: 46px; margin: 0 auto 10px; border-radius: 15px; color: var(--pb-accent); background: var(--pb-accent-soft); font-size: 22px; }
  .pb-empty strong { display: block; margin-bottom: 4px; color: var(--pb-text); font-size: 15px; }

  .pb-footer { display: flex; justify-content: space-between; align-items: center; padding: 9px 15px; border-top: 1px solid var(--pb-border); color: var(--pb-muted); font-size: 11px; }
  .pb-footer kbd { padding: 1px 4px; border: 1px solid var(--pb-border); border-bottom-width: 2px; border-radius: 4px; background: var(--pb-elevated); font-family: inherit; font-size: 9px; }

  .pb-popover {
    position: absolute;
    z-index: 3;
    top: 52px;
    right: 12px;
    width: 250px;
    padding: 7px;
    border: 1px solid var(--pb-border);
    border-radius: 13px;
    background: var(--pb-bg);
    box-shadow: var(--pb-shadow);
  }
  .pb-menu-btn {
    display: flex; align-items: center; gap: 9px;
    width: 100%; min-height: 34px;
    padding: 6px 9px;
    border: 0; border-radius: 8px;
    color: var(--pb-text); background: transparent;
    text-align: left; font-size: 14px; cursor: pointer;
  }
  .pb-menu-btn:hover { background: var(--pb-hover); }
  .pb-menu-btn-danger { color: var(--pb-danger); }
  .pb-menu-divider { height: 1px; margin: 5px 2px; background: var(--pb-border); }
  .pb-switch-row { justify-content: space-between; }
  .pb-switch {
    position: relative; width: 34px; height: 19px;
    border-radius: 999px; background: var(--pb-border);
  }
  .pb-switch::after {
    content: ""; position: absolute; top: 3px; left: 3px;
    width: 13px; height: 13px; border-radius: 50%; background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform 120ms;
  }
  .pb-switch[data-active="true"] { background: var(--pb-accent); }
  .pb-switch[data-active="true"]::after { transform: translateX(15px); }

  .pb-backdrop {
    position: fixed;
    z-index: 2147483001;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(0, 0, 0, .36);
    backdrop-filter: blur(2px);
  }
  .pb-dialog {
    width: min(520px, 100%);
    max-height: min(680px, calc(100vh - 36px));
    overflow: auto;
    border: 1px solid var(--pb-border);
    border-radius: 18px;
    background: var(--pb-bg);
    box-shadow: var(--pb-shadow);
    animation: pb-pop-in 140ms ease-out;
  }
  .pb-dialog-head { display: flex; align-items: center; padding: 16px 18px 12px; }
  .pb-dialog-title { flex: 1; margin: 0; font-size: 18px; font-weight: 750; }
  .pb-form { padding: 0 18px 18px; }
  .pb-field { display: block; margin-top: 12px; }
  .pb-label { display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--pb-muted); font-size: 13px; font-weight: 650; }
  .pb-input, .pb-textarea {
    width: 100%;
    border: 1px solid var(--pb-border);
    border-radius: 10px;
    outline: none;
    color: var(--pb-text);
    background: var(--pb-elevated);
  }
  .pb-input { height: 43px; padding: 0 11px; font-size: 15px; }
  .pb-textarea { min-height: 230px; resize: vertical; padding: 11px 12px; font-size: 15px; line-height: 1.62; }
  .pb-input:focus, .pb-textarea:focus { border-color: var(--pb-accent); box-shadow: 0 0 0 3px var(--pb-accent-soft); }
  .pb-check { display: inline-flex; align-items: center; gap: 7px; margin-top: 11px; font-size: 14px; cursor: pointer; }
  .pb-check input { accent-color: var(--pb-accent); }
  .pb-dialog-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 16px; }
  .pb-dialog-actions .pb-btn { min-height: 40px; padding: 0 17px; font-size: 14px; }

  .pb-toast-region { position: fixed; z-index: 2147483003; right: 22px; bottom: 22px; display: grid; gap: 7px; pointer-events: none; }
  .pb-toast { max-width: min(420px, calc(100vw - 44px)); padding: 11px 14px; border: 1px solid var(--pb-border); border-radius: 11px; color: var(--pb-text); background: var(--pb-bg); box-shadow: var(--pb-shadow); font-size: 14px; animation: pb-toast-in 150ms ease-out; }
  .pb-toast[data-type="success"] { border-left: 4px solid var(--pb-accent); }
  .pb-toast[data-type="error"] { border-left: 4px solid var(--pb-danger); }

  .pb-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

  @keyframes pb-slide-in { from { opacity: 0; transform: translateX(14px); } }
  @keyframes pb-pop-in { from { opacity: 0; transform: scale(.975); } }
  @keyframes pb-toast-in { from { opacity: 0; transform: translateY(6px); } }

  @media (max-width: 620px) {
    .pb-panel { top: 58px; right: 8px; width: calc(100vw - 16px); max-height: calc(100vh - 70px); border-radius: 15px; }
    .pb-handle { top: 96px; }
    .pb-footer { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }
`;
