# 架构说明

## 目标

扩展保持“无需构建、权限最小、页面变化时容易维修”的结构。Chrome 加载仓库根目录即可运行。

## 文件职责

```text
manifest.json             Manifest V3 权限、入口和域名范围
popup.html/css/js         工具栏弹窗与启停开关
src/prompt-core.js        数据规范化、迁移、搜索、排序、导入导出
src/panel-style.js        Shadow DOM 内的面板样式
src/content.js            面板交互、ChatGPT 输入框写入和发送适配
tests/                    纯 Node.js 回归测试
scripts/package.ps1       生成不含私人数据的分发压缩包
```

## 运行流程

1. `content.js` 在 ChatGPT 页面创建一个开放的 Shadow DOM 宿主，隔离面板样式。
2. `prompt-core.js` 从 `chrome.storage.local` 读取并迁移状态。
3. 用户选择提示词后，脚本定位当前可见的撰写器。
4. 对原生输入框使用原型 setter；对富文本输入框构造段落节点。
5. 仅触发一次轻量 `input` 事件，并等待两个渲染帧同步页面状态。
6. “填入并发送”会在同一表单内寻找可见且可用的提交按钮，再执行点击。

## 为什么不直接模拟 Enter

脚本生成的键盘事件不是可信用户事件，页面可能忽略；同时 ChatGPT 的富文本编辑器需要时间把 DOM 内容同步到内部状态。点击真实、可用的提交按钮比立即模拟 Enter 更稳定。

## 选择器策略

从稳定到脆弱依次使用：

1. 语义关系：输入框所属表单中的 `button[type="submit"]`。
2. ARIA 角色和标签：`role="textbox"`、中英文发送标签。
3. 官方测试标识：`data-testid`，用于兼容旧页面。
4. 实现类名：例如 `ProseMirror`，只作为明确版本的兼容入口。

所有候选元素都要通过可见、未禁用和非 `aria-disabled` 检查。

## 数据模型

持久化键为 `chatgptPromptBarState`。当前状态版本为 `1`，包含：

- `enabled`：是否显示扩展；
- `panelCollapsed`：面板折叠状态；
- `settings.closeAfterSend`：发送后是否收起；
- `prompts[]`：提示词 ID、名称、正文、收藏状态和时间戳。

导入时会限制数量和字段长度、忽略空内容，并修复重复 ID。
