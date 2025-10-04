# 🚀 VSCode 插件发布指南

## 📋 发布前检查清单

### ✅ 已完成
- [x] 更新 `CHANGELOG.md`
- [x] 修改 `package.json` name (noteim-uploader)
- [x] 更新 `.vscodeignore`
- [x] 测试所有功能
- [x] 更新 README.md
- [x] 添加新功能文档

### ⚠️ 需要确认
- [ ] Logo图标存在: `images/logo.webp`
- [ ] 所有功能已测试通过
- [ ] API Key 已激活（上传图片测试）
- [ ] Markdown 分享功能正常
- [ ] 快捷键工作正常

---

## 📦 打包与发布步骤

### 步骤 1: 安装 vsce (如果还没有)
```bash
npm install -g @vscode/vsce
```

### 步骤 2: 登录或创建 Visual Studio Marketplace 账号

1. 访问 [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
2. 点击右上角登录（使用 Microsoft 或 GitHub 账号）
3. 创建 Publisher（如果还没有）
   - 访问 https://marketplace.visualstudio.com/manage
   - 点击 "Create Publisher"
   - Publisher ID: `starkwang` (已在 package.json 中配置)

### 步骤 3: 获取 Personal Access Token (PAT)

1. 访问 https://dev.azure.com/
2. 点击右上角用户图标 → "Personal access tokens"
3. 创建新 Token:
   - **Name**: VSCode Extension Publishing
   - **Organization**: All accessible organizations
   - **Expiration**: 90 days (或自定义)
   - **Scopes**: 
     - ✅ **Marketplace** → **Manage**
4. 复制生成的 Token（只显示一次！）

### 步骤 4: 登录 vsce

```bash
vsce login starkwang
# 粘贴你的 Personal Access Token
```

### 步骤 5: 打包插件（本地测试）

```bash
cd /Users/stark/item/okmdx/okmd-vscode
vsce package
```

这会生成一个 `.vsix` 文件，例如: `markdown-3.0.0.vsix`

### 步骤 6: 本地测试 .vsix 文件

```bash
# 在 VSCode 中安装 .vsix
# 方法1: 命令行
code --install-extension markdown-3.0.0.vsix

# 方法2: VSCode UI
# Extensions → ... → Install from VSIX...
```

### 步骤 7: 发布到 Marketplace

```bash
vsce publish
```

或者指定版本号：
```bash
# 发布 minor 版本 (3.0.0 → 3.1.0)
vsce publish minor

# 发布 patch 版本 (3.0.0 → 3.0.1)
vsce publish patch

# 发布 major 版本 (3.0.0 → 4.0.0)
vsce publish major
```

---

## 🔍 发布后验证

### 1. 检查 Marketplace 页面
访问: https://marketplace.visualstudio.com/items?itemName=starkwang.markdown

### 2. 安装测试
```bash
# 从 Marketplace 安装
code --install-extension starkwang.markdown
```

### 3. 功能测试
- [ ] 图片上传 (Cmd+Alt+V)
- [ ] Markdown 分享 (Cmd+Alt+S)
- [ ] 查看文件列表
- [ ] 显示 API Key
- [ ] 查看分享列表

---

## 📝 常见问题

### Q1: `vsce` 命令找不到
```bash
npm install -g @vscode/vsce
```

### Q2: 发布失败 - 权限错误
- 确认已用正确的 Publisher ID 登录
- 确认 PAT token 有 **Marketplace → Manage** 权限

### Q3: 包太大
查看哪些文件被包含：
```bash
vsce ls
```
更新 `.vscodeignore` 排除不需要的文件

### Q4: 图标问题
确保 `images/logo.webp` 存在且大小合适（推荐 128x128 px）

### Q5: 更新已发布的插件
```bash
# 1. 更新 package.json 版本号
# 2. 更新 CHANGELOG.md
# 3. 发布
vsce publish
```

---

## 🔄 版本管理

### 版本号规则 (Semantic Versioning)
```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     └─ Bug fixes (3.0.0 → 3.0.1)
  |     └─────── New features (3.0.0 → 3.1.0)
  └───────────── Breaking changes (3.0.0 → 4.0.0)
```

### 当前版本
- **v3.0.0** - Major update with Markdown sharing

### 下一版本计划
- **v3.0.1** - Bug fixes
- **v3.1.0** - New features (自定义域名、主题等)
- **v4.0.0** - 重大架构变更（如果有）

---

## 📊 发布统计

发布后可以在以下地址查看统计：
- https://marketplace.visualstudio.com/manage/publishers/starkwang
- 安装量、评分、评论等

---

## 🎉 发布成功后

### 1. 推送到 GitHub
```bash
git add .
git commit -m "Release v3.0.0 - Markdown sharing feature"
git tag v3.0.0
git push origin main --tags
```

### 2. 创建 GitHub Release
1. 访问 https://github.com/okmdx/okmd-vscode/releases
2. 点击 "Create a new release"
3. 选择 tag `v3.0.0`
4. 标题: `v3.0.0 - Markdown Sharing & Full Integration`
5. 描述: 复制 CHANGELOG.md 内容
6. 附加 `.vsix` 文件（可选）
7. 发布

### 3. 更新文档
- README.md 添加 Marketplace 徽章
- 添加使用说明视频（可选）
- 更新项目主页

---

## 📞 获取帮助

- **vsce 文档**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **GitHub Issues**: https://github.com/okmdx/okmd-vscode/issues
- **Email**: shudongai@gmail.com

---

**准备好了就开始发布吧！** 🚀
