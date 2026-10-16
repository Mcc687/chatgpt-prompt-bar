# 二次开发指南

## 环境

- Google Chrome
- Node.js 20+
- Windows、macOS 或 Linux 均可开发；当前打包脚本使用 PowerShell

项目无运行时依赖，也没有打包器。修改保存后，在 Chrome 扩展管理页重新加载即可。

## 常用命令

```powershell
npm run check
npm run package
```

`npm run check` 运行语法检查和核心逻辑测试。`npm run package` 在 `dist` 中生成可分发 ZIP，只包含运行扩展所需文件和 README。

## 调试 ChatGPT 兼容问题

1. 在 ChatGPT 页面打开开发者工具。
2. 检查当前可见输入框的标签、`role`、`contenteditable`、`aria-label` 和所属表单。
3. 检查发送按钮是否仍在同一表单、是否为 `type="submit"`、是否有 `aria-disabled`。
4. 更新 `findComposer` 或 `findSendButton`，保留仍有效的旧分支。
5. 验证空输入框、已有文本、带附件、生成回复中和窄屏场景。
6. 增加回归测试并更新版本和更新记录。

## 新功能建议

适合在现有数据层和面板上扩展的方向：

- 标签和分组；
- 占位变量或模板参数；
- 键盘快捷搜索；
- 可选的 `chrome.storage.sync` 同步；
- 多语言界面；
- 提示词版本历史。

新增功能应保持默认本地存储，并明确说明任何会向第三方发送数据的行为。
