# 🎉 New Features - Version 3.0

## 📋 概览

本次更新添加了两个重要功能：
1. **Markdown一键分享** - 类似Loom，一键生成分享链接
2. **API Key网站访问** - 在官网管理您的所有内容

---

## 🚀 功能1: Markdown一键分享

### 💡 使用场景
- 快速分享笔记给同事
- 分享技术文档给团队
- 临时共享Markdown内容
- 创建带密码的私密分享

### ⌨️ 快捷键
```
Mac: Cmd + Alt + S
Windows/Linux: Ctrl + Alt + S
```

### 📝 使用步骤

1. **打开Markdown文件**
   - 任何 `.md` 文件都可以分享

2. **按快捷键 `Cmd/Ctrl+Alt+S`**
   - 或通过命令面板: `NoteIM: Share Markdown`

3. **选择过期时间**
   ```
   ⏰ Permanent (永久)
   ⏰ 1 Hour (1小时后过期)
   ⏰ 24 Hours (24小时后过期)
   ⏰ 7 Days (7天后过期)
   ⏰ 30 Days (30天后过期)
   ```

4. **可选: 设置密码**
   ```
   🔓 No Password (任何人可查看)
   🔒 Set Password (需要密码才能查看)
   ```

5. **完成!**
   - 分享链接自动复制到剪贴板
   - 可选择在浏览器中打开查看效果

### 🌟 分享功能特性

#### 生成的链接格式
```
https://noteimg.com/s/abc123xy
```

#### 可配置选项
| 选项 | 说明 | 默认值 |
|------|------|--------|
| **标题** | 自动使用文件名 | `filename.md` |
| **过期时间** | 1小时-永久 | 永久 |
| **密码保护** | 可选 | 无密码 |
| **公开状态** | 是否公开列表 | 公开 |

#### 浏览统计
- 每次有人查看链接，浏览次数 +1
- 可在 "我的分享" 中查看统计

### 🎯 典型使用场景

#### 场景1: 快速分享技术文档
```markdown
1. 写好技术文档
2. Cmd+Alt+S
3. 选择 "24 Hours"
4. 将链接发给同事
```

#### 场景2: 创建私密笔记分享
```markdown
1. 编写私密笔记
2. Cmd+Alt+S
3. 选择 "Set Password"
4. 设置密码: "secret123"
5. 只有知道密码的人才能查看
```

#### 场景3: 永久文档链接
```markdown
1. 创建帮助文档
2. Cmd+Alt+S
3. 选择 "Permanent"
4. 链接永不过期，可用作文档引用
```

---

## 🔑 功能2: API Key网站访问

### 💡 功能说明
使用您的API Key在 **https://www.noteim.com** 网站上管理所有内容

### 📖 如何获取API Key

#### 方法1: 通过命令
1. 打开VSCode
2. 按 `Cmd/Ctrl+Shift+P`
3. 输入: `NoteIM: Show API Key`
4. API Key会显示在弹窗中
5. 点击 "Copy API Key" 复制

#### 方法2: 通过设置
1. 打开VSCode设置
2. 搜索 "noteim"
3. 查看配置说明中的提示

### 🌐 网站功能

访问 **https://www.noteim.com** 后可以：

#### 图片管理
- 📸 查看所有上传的图片
- 🖼️ 美观的图片画廊展示
- 📥 下载原图
- 🗑️ 批量删除
- 🔍 搜索和筛选

#### Markdown分享管理
- 📄 查看所有分享的文档
- 👁️ 实时查看浏览统计
- ✏️ 编辑分享内容
- 🗑️ 删除过期分享
- 🔒 修改密码设置

#### 统计信息
- 📊 总上传数量
- 💾 存储空间使用情况
- 👀 总浏览次数
- 📈 趋势图表

#### 账户设置
- 🔑 重置API Key
- ⚙️ 配置默认选项
- 🌐 域名设置

### 🔒 安全提示

**API Key 相当于密码:**
- ✅ 保存在安全的地方
- ✅ 不要公开分享
- ✅ 定期检查使用情况
- ❌ 不要提交到Git仓库
- ❌ 不要发送到公共频道

**如果API Key泄露:**
1. 运行命令: `NoteIM: Reset Device`
2. 重新上传一张图片激活新的API Key
3. 旧的API Key将失效

---

## 📋 新增命令清单

### Markdown分享相关

| 命令 | 快捷键 | 功能 |
|------|--------|------|
| `NoteIM: Share Markdown` | `Cmd/Ctrl+Alt+S` | 分享当前Markdown文档 |
| `NoteIM: Show My Shares` | - | 查看我的分享列表 |

### API Key相关

| 命令 | 快捷键 | 功能 |
|------|--------|------|
| `NoteIM: Show API Key` | - | 显示API Key和网站访问说明 |

---

## ⚙️ 配置更新

### package.json 新增配置

```json
{
  "noteim.websiteUrl": {
    "type": "string",
    "default": "https://www.noteim.com",
    "description": "NoteIM website URL. Use your API Key to manage images and notes at this website."
  }
}
```

### 配置说明
在VSCode设置中会显示：
> **NoteIM Website URL**  
> Use your **API Key** (view via `NoteIM: Show API Key` command) to manage your images and notes at https://www.noteim.com

---

## 🎨 用户体验改进

### 分享流程 (类似Loom体验)

```
打开Markdown → 快捷键 → 选项确认 → 链接复制 → 完成!
    📄           ⌨️         ⏰🔒        📋        ✅
    
总耗时: < 5秒
```

### 视觉反馈
- ✅ 成功消息提示
- 📋 自动复制到剪贴板
- 🌐 可选在浏览器打开
- 📊 显示过期时间

---

## 🧪 使用示例

### 示例1: 分享会议纪要

```markdown
# 团队会议纪要 2025-10-04

## 讨论内容
- 项目进度更新
- 技术方案评审
- 下周计划

## Action Items
- [ ] 完成API文档
- [ ] 部署测试环境
```

**操作:**
1. `Cmd+Alt+S`
2. 选择 "24 Hours"
3. 无密码
4. 分享链接发到群聊

**结果:**
```
https://noteimg.com/s/xyz789ab
```
24小时后自动过期，无需手动删除

### 示例2: 技术文档长期分享

```markdown
# API使用指南

## 快速开始
...

## API参考
...
```

**操作:**
1. `Cmd+Alt+S`
2. 选择 "Permanent"
3. 无密码
4. 添加到README中

**结果:**
```markdown
详细文档: [API使用指南](https://noteimg.com/s/abc123xy)
```
永久有效，可作为文档引用

### 示例3: 私密笔记分享

```markdown
# 服务器密码清单

## 生产环境
- Server 1: xxx
- Server 2: xxx
```

**操作:**
1. `Cmd+Alt+S`
2. 选择 "1 Hour"
3. 设置密码: "team2025"
4. 告知团队密码

**结果:**
- 链接1小时后自动过期
- 需要密码才能查看
- 安全分享敏感信息

---

## 🔄 工作流程对比

### 传统方式
```
1. 复制Markdown内容
2. 打开在线编辑器
3. 粘贴内容
4. 生成链接
5. 复制链接
6. 手动设置过期时间
7. 可能需要注册账号

总耗时: 2-3分钟
```

### NoteIM方式
```
1. Cmd+Alt+S
2. 选择选项 (5秒)

总耗时: 5秒
```

**效率提升: 24x - 36x** 🚀

---

## 📊 API接口使用

### 创建分享
```javascript
POST /v1/shares
Headers: X-API-Key: your-api-key

Body: {
  "title": "文档标题",
  "content": "# Markdown内容",
  "expires_in": 24,
  "password": "optional"
}

Response: {
  "short_code": "abc123xy",
  "share_url": "https://noteimg.com/s/abc123xy"
}
```

### 查看分享列表
```javascript
GET /v1/shares/my?page=1&page_size=20
Headers: X-API-Key: your-api-key

Response: {
  "shares": [{
    "short_code": "abc123xy",
    "title": "标题",
    "view_count": 42,
    "created_at": "2025-10-04T19:00:00Z"
  }],
  "total_count": 15
}
```

### 删除分享
```javascript
DELETE /v1/shares/abc123xy
Headers: X-API-Key: your-api-key

Response: {
  "message": "Share deleted successfully"
}
```

详细API文档: [SHARE_API_DOCS.md](./SHARE_API_DOCS.md)

---

## 🎓 最佳实践

### 1. 过期时间选择
- **1 Hour**: 临时会议纪要
- **24 Hours**: 日常文档分享
- **7 Days**: 周报、项目文档
- **30 Days**: 月度报告
- **Permanent**: 长期参考文档、教程

### 2. 密码保护建议
- 敏感信息: **必须**设置密码
- 内部文档: 建议设置密码
- 公开教程: 不需要密码

### 3. 链接管理
- 定期清理过期分享
- 重要文档建议永久保存
- 使用 `Show My Shares` 查看统计

---

## 🚀 未来计划

### 即将推出
- [ ] 自定义域名
- [ ] 分享主题定制
- [ ] 二维码生成
- [ ] 评论功能
- [ ] 协作编辑

---

## 📞 反馈与支持

如果您有任何建议或遇到问题:
- GitHub Issues: https://github.com/okmdx/okmd-vscode/issues
- Email: shudongai@gmail.com

---

**享受新功能! 🎉**
