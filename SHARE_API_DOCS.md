# 📝 Markdown 分享功能 API 文档

## 🎯 功能说明

用户可以通过 VSCode 插件一键分享 Markdown 文档，生成短链接供他人查看。

**基础 URL**: `https://api.noteim.com/v1`

---

## 📡 API 接口

### 1. 创建分享

**接口**: `POST /v1/shares`  
**认证**: 需要 (X-API-Key)  
**说明**: 创建一个新的 Markdown 分享

#### 请求体
```json
{
  "title": "我的 Markdown 笔记",
  "content": "# Hello World\n\nThis is **markdown** content.\n\n```python\nprint('Hello')\n```",
  "file_name": "README.md",
  "language": "markdown",
  "is_public": true,
  "password": "optional-password-123",
  "expires_in": 24
}
```

#### 参数说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 分享标题（最多 255 字符） |
| `content` | string | ✅ | Markdown 内容 |
| `language` | string | ✅ | 语言类型（固定为 "markdown"） |
| `file_name` | string | ❌ | 原文件名（不传或传空字符串表示无文件名） |
| `is_public` | boolean | ❌ | 是否公开（不传默认 true） |
| `password` | string | ❌ | 访问密码（**不传该字段**表示无密码，传空字符串会报错） |
| `expires_in` | int | ❌ | 过期时间（小时），**不传该字段**表示永久有效 |

**⚠️ 重要说明**:
- `password` 和 `expires_in` 如果不需要，**请不要传该字段**（不要传 `null` 或 `0`）
- 只传需要的字段，避免传递空值导致服务端错误

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "short_code": "abc123xy",
    "share_url": "https://www.noteim.com/s/abc123xy",
    "view_url": "https://www.noteim.com/view/abc123xy",
    "created_at": "2025-10-04T19:30:00Z",
    "expires_at": "2025-10-05T19:30:00Z"
  }
}
```

#### cURL 示例

**✅ 正确示例 1: 永久有效、无密码**
```bash
curl -X POST https://api.noteim.com/v1/shares \
  -H "X-API-Key: your-device-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试分享",
    "content": "# Hello\n\nWorld",
    "language": "markdown"
  }'
```

**✅ 正确示例 2: 24小时过期、有密码**
```bash
curl -X POST https://api.noteim.com/v1/shares \
  -H "X-API-Key: your-device-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试分享",
    "content": "# Hello\n\nThis is a test.",
    "language": "markdown",
    "file_name": "test.md",
    "expires_in": 24,
    "password": "secret123"
  }'
```

**❌ 错误示例 1: 传递 null 值（会导致500错误）**
```bash
# 不要这样做！
curl -X POST https://api.noteim.com/v1/shares \
  -H "X-API-Key: your-device-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试分享",
    "content": "# Hello",
    "language": "markdown",
    "password": null,        ❌ 不要传 null
    "expires_in": 0          ❌ 0会被视为立即过期
  }'
```

**❌ 错误示例 2: 传递空字符串密码（会导致错误）**
```bash
# 不要这样做！
curl -X POST https://api.noteim.com/v1/shares \
  -H "X-API-Key: your-device-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试分享",
    "content": "# Hello",
    "language": "markdown",
    "password": ""           ❌ 空字符串会报错
  }'
```

**✅ 正确做法: 不需要密码就不传该字段**
```bash
curl -X POST https://api.noteim.com/v1/shares \
  -H "X-API-Key: your-device-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试分享",
    "content": "# Hello",
    "language": "markdown"
    # password 和 expires_in 不传，表示无密码、永久有效
  }'
```

---

### 2. 获取分享内容

**接口**: `GET /v1/shares/:code`  
**认证**: 不需要（公开接口）  
**说明**: 通过短代码获取分享内容

#### 路径参数
- `code`: 分享短代码（如 `abc123xy`）

#### 查询参数（可选）
- `password`: 如果分享有密码保护，需要提供密码

#### 响应示例（无密码）
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "short_code": "abc123xy",
    "title": "我的 Markdown 笔记",
    "content": "# Hello World\n\n...",
    "file_name": "README.md",
    "language": "markdown",
    "view_count": 42,
    "created_at": "2025-10-04T19:30:00Z",
    "expires_at": "2025-10-05T19:30:00Z",
    "is_protected": false
  }
}
```

#### 响应示例（有密码但未提供）
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "short_code": "abc123xy",
    "title": "我的 Markdown 笔记",
    "is_protected": true
  }
}
```

#### 响应示例（密码错误）
```json
{
  "code": 500,
  "message": "invalid password"
}
```

#### cURL 示例
```bash
# 无密码
curl https://api.noteim.com/v1/shares/abc123xy

# 有密码
curl "https://api.noteim.com/v1/shares/abc123xy?password=secret123"
```

---

### 3. 获取我的分享列表

**接口**: `GET /v1/shares/my`  
**认证**: 需要 (X-API-Key)  
**说明**: 获取当前设备创建的所有分享

#### 查询参数
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码 |
| `page_size` | int | 10 | 每页数量（最大 100） |

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "shares": [
      {
        "short_code": "abc123xy",
        "title": "我的笔记",
        "file_name": "note.md",
        "language": "markdown",
        "view_count": 42,
        "is_public": true,
        "is_active": true,
        "created_at": "2025-10-04T19:30:00Z",
        "expires_at": "2025-10-05T19:30:00Z"
      },
      {
        "short_code": "xyz789ab",
        "title": "另一个笔记",
        "file_name": "README.md",
        "language": "markdown",
        "view_count": 15,
        "is_public": true,
        "is_active": true,
        "created_at": "2025-10-03T10:00:00Z",
        "expires_at": null
      }
    ],
    "total_count": 2,
    "page": 1,
    "page_size": 10
  }
}
```

#### cURL 示例
```bash
curl https://api.noteim.com/v1/shares/my?page=1&page_size=10 \
  -H "X-API-Key: your-device-api-key"
```

---

### 4. 更新分享

**接口**: `PUT /v1/shares/:code`  
**认证**: 需要 (X-API-Key)  
**说明**: 更新自己创建的分享

#### 路径参数
- `code`: 分享短代码

#### 请求体
```json
{
  "title": "新标题",
  "content": "# 更新的内容",
  "is_public": false,
  "is_active": true
}
```

#### 参数说明（所有字段都是可选的）
| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 新标题 |
| `content` | string | 新内容 |
| `is_public` | boolean | 是否公开 |
| `is_active` | boolean | 是否激活（false 表示禁用） |

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "Share updated successfully"
  }
}
```

#### cURL 示例
```bash
curl -X PUT https://api.noteim.com/v1/shares/abc123xy \
  -H "X-API-Key: your-device-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新后的标题",
    "is_active": false
  }'
```

---

### 5. 删除分享

**接口**: `DELETE /v1/shares/:code`  
**认证**: 需要 (X-API-Key)  
**说明**: 删除自己创建的分享（软删除）

#### 路径参数
- `code`: 分享短代码

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "Share deleted successfully"
  }
}
```

#### cURL 示例
```bash
curl -X DELETE https://api.noteim.com/v1/shares/abc123xy \
  -H "X-API-Key: your-device-api-key"
```

---

### 6. 分享统计

**接口**: `GET /v1/shares/stats`  
**认证**: 需要 (X-API-Key)  
**说明**: 获取当前设备的分享统计数据

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total_shares": 15,
    "active_shares": 12,
    "total_views": 342
  }
}
```

#### cURL 示例
```bash
curl https://api.noteim.com/v1/shares/stats \
  -H "X-API-Key: your-device-api-key"
```

---

## 🔗 短链接访问

### Web 页面访问
用户可以直接在浏览器访问以下 URL：

```
https://www.noteim.com/s/abc123xy
或
https://www.noteim.com/view/abc123xy
```

这将返回一个渲染好的 HTML 页面，Markdown 内容会自动转换为美观的网页。

---

## 📊 完整接口列表

| 接口 | 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|------|
| 创建分享 | POST | `/v1/shares` | ✅ | 创建新分享 |
| 获取分享 | GET | `/v1/shares/:code` | ❌ | 获取分享内容（公开） |
| 我的分享 | GET | `/v1/shares/my` | ✅ | 分享列表（分页） |
| 更新分享 | PUT | `/v1/shares/:code` | ✅ | 更新分享 |
| 删除分享 | DELETE | `/v1/shares/:code` | ✅ | 删除分享 |
| 分享统计 | GET | `/v1/shares/stats` | ✅ | 统计数据 |

---

## 🔒 认证说明

需要认证的接口使用设备 API Key：

```bash
Headers: X-API-Key: your-device-api-key
```

获取 API Key 的方式参考设备注册接口：`POST /v1/device/register`

---

## 🎨 使用场景示例

### 场景 1: VSCode 插件快速分享
```typescript
// 1. 读取当前 Markdown 文件内容
const content = editor.document.getText();
const fileName = path.basename(editor.document.fileName);

// 2. 调用 API 创建分享
const response = await fetch('https://api.noteim.com/v1/shares', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: fileName,
    content: content,
    file_name: fileName,
    expires_in: 24 // 24小时后过期
  })
});

const data = await response.json();

// 3. 复制链接到剪贴板
await vscode.env.clipboard.writeText(data.data.share_url);

// 4. 显示通知
vscode.window.showInformationMessage(
  `✅ 分享链接已复制: ${data.data.share_url}`
);
```

### 场景 2: 设置密码保护
```typescript
const password = await vscode.window.showInputBox({
  prompt: '设置访问密码（可选）',
  password: true
});

const response = await fetch('https://api.noteim.com/v1/shares', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Private Note',
    content: content,
    password: password, // 添加密码
    expires_in: 1 // 1小时后过期
  })
});
```

### 场景 3: 查看我的分享历史
```typescript
const response = await fetch('https://api.noteim.com/v1/shares/my?page=1', {
  headers: {
    'X-API-Key': apiKey
  }
});

const data = await response.json();

// 在 VSCode 侧边栏显示分享列表
data.data.shares.forEach(share => {
  console.log(`${share.title} - ${share.view_count} 次浏览`);
});
```

---

## 📋 快速测试

### 1. 创建分享
```bash
curl -X POST http://localhost:6066/v1/shares \
  -H "X-API-Key: caace9dbee496292e3070f4da1986b6a4b4e717f693e2136de77de91347e7570" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试 Markdown 分享",
    "content": "# Hello World\n\nThis is a **test** markdown.\n\n```python\nprint(\"Hello\")\n```",
    "file_name": "test.md",
    "expires_in": 24
  }'
```

### 2. 获取分享内容
```bash
# 替换 abc123xy 为实际的 short_code
curl http://localhost:6066/v1/shares/abc123xy
```

### 3. 查看我的分享
```bash
curl http://localhost:6066/v1/shares/my \
  -H "X-API-Key: caace9dbee496292e3070f4da1986b6a4b4e717f693e2136de77de91347e7570"
```

---

## 🚀 部署后需要做的事

1. **运行数据库迁移**
   ```bash
   go run cmd/migrate/main.go
   ```

2. **重启服务**
   ```bash
   go run cmd/main.go
   ```

3. **配置 baseURL**
   在代码中将 `https://www.noteim.com` 替换为你的实际域名

---

## 💡 前端开发提示

- 短代码 `short_code` 是 8 位随机字符串
- 密码使用 BCrypt 加密存储
- `expires_at` 为 null 表示永久有效
- `is_protected` 为 true 表示需要密码
- 浏览次数 `view_count` 自动累加
- 所有时间使用 ISO 8601 格式

---

**文档版本**: 1.0  
**最后更新**: 2025-10-04
