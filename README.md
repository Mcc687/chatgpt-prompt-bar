# ChatGPT 提示词快捷栏

[![CI](https://github.com/Mcc687/chatgpt-prompt-bar/actions/workflows/ci.yml/badge.svg)](https://github.com/Mcc687/chatgpt-prompt-bar/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue.svg)](manifest.json)

一个仅在 ChatGPT 官方网页运行的轻量级 Chrome 扩展。它在页面右侧提供可折叠提示词面板，用于保存、整理、快速填入并发送常用提示词。

> 本项目为独立开源工具，与 OpenAI 没有关联或官方认可。ChatGPT 是其相应权利人的商标。

## 功能

- 一键“填入并发送”，也可以只填入、不发送
- 新建、编辑、删除、收藏和搜索提示词
- 拖动调整提示词顺序
- `Alt + Shift + P` 快速展开或收起面板
- 可选“发送后自动收起面板”
- JSON 导入、导出备份与恢复示例
- 跟随 ChatGPT 明暗主题并适配窄屏
- 弹窗一键启用或停用
- 数据仅保存在 `chrome.storage.local`
- 仅申请 `storage` 权限，不包含远程代码或分析脚本

## 安装

### 从源码安装

```bash
git clone https://github.com/Mcc687/chatgpt-prompt-bar.git
```

1. 打开 `chrome://extensions/`。
2. 开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择克隆得到的 `chatgpt-prompt-bar` 文件夹。
5. 打开或刷新 [ChatGPT](https://chatgpt.com/)。

### 从 ZIP 安装

下载 Release 中的 ZIP 并解压，然后按上面的第 1～5 步加载解压后的文件夹。Chrome 不能直接加载 ZIP。

## 使用

- 点击卡片的“仅填入”将覆盖 ChatGPT 当前输入框内容，但不会发送。
- 点击“填入并发送”会等待 ChatGPT 接收输入，再点击同一撰写表单中的可用发送按钮。
- 点击星标收藏提示词；面板顶部星标用于只看收藏。
- 导入 JSON 会替换当前列表，执行前有二次确认。
- 导出的 JSON 可能含有私人或业务提示词，请勿直接提交到公开仓库。

## 当前兼容策略

版本 `1.0.2` 已兼容：

- 旧版 `#prompt-textarea` 和 `data-testid`；
- 新版 `div.ProseMirror[contenteditable="true"][role="textbox"]`；
- 有 `data-testid` 的旧发送按钮；
- 无 `data-testid`、使用 `button[type="submit"]` 的新发送按钮。

扩展不会简单模拟 Enter，而是等待编辑器状态同步，再在输入框所属表单内寻找真实、可见且可用的提交按钮。实现思路见 [架构说明](docs/ARCHITECTURE.md)。

## 开发与验证

需要 Node.js 20 或更高版本，无需安装第三方依赖：

```bash
npm run check
```

Windows 上生成分发包：

```powershell
npm run package
```

更多信息：

- [架构说明](docs/ARCHITECTURE.md)
- [二次开发指南](docs/DEVELOPMENT.md)
- [参与开发](CONTRIBUTING.md)
- [隐私说明](PRIVACY.md)
- [安全策略](SECURITY.md)
- [更新记录](CHANGELOG.md)

## 权限与隐私

内容脚本只匹配：

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`（旧官方地址兼容）

扩展不读取历史对话，不向自有服务器上传任何内容。只有用户点击“填入并发送”时，所选提示词才会通过 ChatGPT 页面正常提交。详见 [PRIVACY.md](PRIVACY.md)。

## License

[MIT](LICENSE)
