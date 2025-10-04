# VSCode 插件改造方案

## 📊 项目现状分析

### 现有架构
```
extension.js (主入口)
  ↓
lib/upload.js (上传到 api.okmd.dev)
  ↓
使用 UUID 标识用户
```

### 存在的问题
1. ❌ 使用硬编码的API地址和Cookie
2. ❌ UUID方式无法实现后端设备管理
3. ❌ 缺少API认证机制
4. ❌ 没有文件管理功能
5. ❌ 依赖过时的 `request` 库

---

## 🎯 改造目标

### 核心功能
1. ✅ **设备自动注册** - 首次使用自动激活
2. ✅ **API Key认证** - 安全的设备认证
3. ✅ **剪贴板上传** - 保留现有快捷键功能
4. ✅ **文件管理** - 查看和删除上传的文件
5. ✅ **现代化依赖** - 使用 `axios` 替代 `request`

---

## 🏗️ 新架构设计

```
extension.js (主入口)
  ↓
lib/
  ├── auth-manager.js (设备认证管理)
  ├── uploader.js (文件上传)
  ├── file-manager.js (文件列表和管理)
  └── config.js (配置管理)
```

### 模块职责

#### 1. auth-manager.js
- 生成设备ID（使用 `vscode.env.machineId`）
- 设备注册（调用 `/v1/device/register`）
- API Key存储（使用 `context.secrets`）
- API Key验证和自动刷新

#### 2. uploader.js
- 文件上传（调用 `/v1/files/upload`）
- multipart/form-data 处理
- 进度显示
- 错误重试

#### 3. file-manager.js
- 文件列表查询
- 文件删除
- 文件搜索
- WebView面板展示

#### 4. config.js
- API URL配置
- 本地保存路径配置
- 快捷键配置

---

## 🔄 改造步骤

### Phase 1: 核心改造 (MVP)
1. 安装新依赖（axios, form-data）
2. 创建 `auth-manager.js`
3. 改造 `upload.js` → `uploader.js`
4. 更新 `extension.js` 集成认证流程
5. 更新 `package.json` 配置

### Phase 2: 增强功能
1. 创建 `file-manager.js`
2. 添加文件列表命令
3. 添加文件删除命令
4. 添加WebView面板

### Phase 3: 优化体验
1. 添加状态栏显示（上传数量、配额等）
2. 添加设置面板
3. 优化错误提示
4. 添加日志输出通道

---

## 📦 依赖更新

### 移除
```json
{
  "request": "^2.88.2"  // 已废弃
}
```

### 添加
```json
{
  "axios": "^1.6.0",
  "form-data": "^4.0.0"
}
```

### 保留
```json
{
  "moment": "^2.18.1",
  "uuid": "^10.0.0"  // 用于文件名生成
}
```

---

## 🔧 配置改造

### 移除旧配置
```json
{
  "qiniu.access_key": "...",
  "qiniu.secret_key": "...",
  "qiniu.bucket": "...",
  "qiniu.domain": "..."
}
```

### 新增配置
```json
{
  "noteim.apiUrl": {
    "type": "string",
    "default": "https://api.noteim.com",
    "description": "NoteIM API 地址"
  },
  "noteim.autoActivate": {
    "type": "boolean",
    "default": true,
    "description": "首次使用时自动激活设备"
  },
  "noteim.localPath": {
    "type": "string",
    "default": "./images",
    "description": "图片本地临时保存路径"
  },
  "noteim.imageQuality": {
    "type": "number",
    "default": 100,
    "description": "图片质量（未来功能）"
  }
}
```

---

## 🎨 命令改造

### 保留命令
```json
{
  "command": "extension.okmd",
  "title": "Paste Image (粘贴图片)",
  "keybinding": "cmd+alt+v"
}
```

### 新增命令
```json
[
  {
    "command": "noteim.uploadImage",
    "title": "NoteIM: Upload Image (上传图片)"
  },
  {
    "command": "noteim.showFiles",
    "title": "NoteIM: Show Uploaded Files (查看已上传文件)"
  },
  {
    "command": "noteim.resetDevice",
    "title": "NoteIM: Reset Device (重置设备)"
  },
  {
    "command": "noteim.showStats",
    "title": "NoteIM: Show Statistics (显示统计信息)"
  }
]
```

---

## 🔒 安全改进

### 1. API Key存储
```javascript
// 旧方式（不安全）
context.globalState.update('apiKey', key);

// 新方式（安全）
await context.secrets.store('noteim.apiKey', key);
```

### 2. 设备ID生成
```javascript
// 旧方式
const uuid = uuidv4();

// 新方式（更稳定）
const deviceId = vscode.env.machineId;
```

### 3. 错误处理
```javascript
// 添加详细的错误类型
class AuthError extends Error {}
class UploadError extends Error {}
class NetworkError extends Error {}
```

---

## 📱 用户体验改进

### 1. 首次使用流程
```
用户按快捷键
  ↓
检测是否有API Key
  ↓ 无
后台自动注册（显示进度）
  ↓
获得API Key
  ↓
上传图片
  ↓
显示成功消息
```

### 2. 进度提示
```javascript
vscode.window.withProgress({
  location: vscode.ProgressLocation.Notification,
  title: "Uploading image...",
  cancellable: false
}, async (progress) => {
  progress.report({ increment: 0, message: "Initializing..." });
  // 上传逻辑
  progress.report({ increment: 50, message: "Uploading..." });
  progress.report({ increment: 100, message: "Done!" });
});
```

### 3. 状态栏集成
```javascript
const statusBar = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);
statusBar.text = "$(cloud-upload) 23 images";
statusBar.show();
```

---

## 🎯 兼容性考虑

### 平台兼容
- ✅ macOS (保留 `mac.applescript`)
- ✅ Windows (保留 `pc.ps1`)
- ✅ Linux (保留 `linux.sh`)

### VSCode版本
- 当前要求: `^1.11.0`
- 建议更新: `^1.80.0` (支持 `context.secrets`)

---

## 📈 未来扩展

### Phase 4: 高级功能
1. 图片压缩和格式转换
2. 批量上传
3. 拖拽上传
4. 图片预览
5. 文件搜索和标签

### Phase 5: 云端功能
1. 多设备同步配置
2. 自定义CDN
3. 图片处理（裁剪、滤镜）
4. 协作功能

---

## ✅ 优势总结

| 改进点 | 旧方案 | 新方案 |
|--------|--------|--------|
| 认证方式 | UUID | API Key (设备绑定) |
| 存储安全 | globalState | secrets API |
| HTTP库 | request (废弃) | axios (现代) |
| 错误处理 | 简单提示 | 详细错误类型 |
| 文件管理 | ❌ | ✅ 列表+删除 |
| 进度显示 | StatusBar | Progress API |
| 配置管理 | 硬编码 | Configuration |

---

## 🚀 实施建议

### 代码风格
- 使用 ES6+ 语法（async/await）
- 统一错误处理机制
- 完善的注释和JSDoc
- 模块化设计

### 测试策略
1. 单元测试（auth、upload、file-manager）
2. 集成测试（完整上传流程）
3. 跨平台测试（Mac/Win/Linux）

### 发布策略
1. 先发布 MVP 版本（Phase 1）
2. 收集用户反馈
3. 迭代增强功能（Phase 2-3）
4. 长期规划（Phase 4-5）

---

## 📝 改造检查清单

- [ ] 安装新依赖
- [ ] 创建 `auth-manager.js`
- [ ] 重构 `uploader.js`
- [ ] 创建 `file-manager.js`
- [ ] 创建 `config.js`
- [ ] 更新 `extension.js`
- [ ] 更新 `package.json`
- [ ] 更新 `README.md`
- [ ] 添加 `CHANGELOG.md`
- [ ] 测试所有平台
- [ ] 更新版本号
- [ ] 发布新版本
