# 🚀 Quick Start Guide - NoteIM VSCode Extension

## For Developers

### 1. Install Dependencies

```bash
cd /Users/stark/item/okmdx/okmd-vscode
npm install
```

### 2. Debug the Extension

1. Open the project in VSCode
2. Press `F5` to start debugging
3. A new VSCode window will open with the extension loaded

### 3. Test Core Features

#### A. Paste Image (Clipboard Upload)

1. Copy an image to clipboard
2. Open any Markdown file
3. Press `Cmd+Alt+V` (Mac) or `Ctrl+Alt+V` (Windows/Linux)
4. Image uploads and Markdown inserted automatically

#### B. Upload Image File

1. Open Command Palette: `Cmd+Shift+P`
2. Run: `NoteIM: Upload Image`
3. Select an image file
4. URL copied to clipboard

#### C. View Uploaded Files

1. Command Palette → `NoteIM: Show Uploaded Files`
2. Select a file to:
   - Copy URL
   - Copy Markdown
   - Delete file

#### D. View Statistics

1. Command Palette → `NoteIM: Show Statistics`
2. See upload count, total size, etc.

---

## For End Users

### Installation

1. Open VSCode
2. Go to Extensions (`Cmd+Shift+X`)
3. Search for "NoteIM Image Uploader"
4. Click Install

### First Use

1. Copy an image to clipboard
2. Open a Markdown file
3. Press `Cmd+Alt+V` (Mac) or `Ctrl+Alt+V` (Windows)
4. **Magic happens!** 🎉
   - Device automatically activated
   - Image uploaded
   - Markdown inserted

**No setup required!**

---

## Configuration (Optional)

Go to VSCode Settings → Extensions → NoteIM:

```json
{
  // Change API endpoint (default: https://api.noteim.com)
  "noteim.apiUrl": "https://api.noteim.com",
  
  // Change temp folder (default: ./images)
  "noteim.localPath": "./images"
}
```

---

## Troubleshooting

### Issue: "Upload failed: Authentication failed"

**Solution:**
1. Command Palette → `NoteIM: Reset Device`
2. Try uploading again

### Issue: "No image in clipboard"

**Solution:**
- Make sure you copied an **image** (not file path)
- Try using screenshot tool (Cmd+Shift+4 on Mac)

### Issue: "Network error"

**Solution:**
- Check internet connection
- Try: `curl https://api.noteim.com/health`

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│          VSCode Extension               │
├─────────────────────────────────────────┤
│  extension.js (Entry Point)             │
│    ↓                                    │
│  ┌──────────────────────────────────┐   │
│  │  AuthManager                      │   │
│  │  - Device registration            │   │
│  │  - API key management             │   │
│  │  - Secrets API storage            │   │
│  └──────────────────────────────────┘   │
│    ↓                                    │
│  ┌──────────────────────────────────┐   │
│  │  Uploader                         │   │
│  │  - File upload                    │   │
│  │  - Progress tracking              │   │
│  │  - Error handling                 │   │
│  └──────────────────────────────────┘   │
│    ↓                                    │
│  ┌──────────────────────────────────┐   │
│  │  FileManager                      │   │
│  │  - List files                     │   │
│  │  - Delete files                   │   │
│  │  - Statistics                     │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓ HTTPS
┌─────────────────────────────────────────┐
│       NoteIM API                        │
│       https://api.noteim.com            │
├─────────────────────────────────────────┤
│  POST /v1/device/register               │
│  POST /v1/files/upload                  │
│  GET  /v1/files                         │
│  DELETE /v1/files/:id                   │
│  GET  /v1/device/stats                  │
└─────────────────────────────────────────┘
```

---

## File Structure

```
okmd-vscode/
├── extension.js              # Entry point
├── package.json              # Extension manifest
├── lib/
│   ├── auth-manager.js       # Authentication
│   ├── uploader.js           # File upload
│   ├── file-manager.js       # File management
│   ├── mac.applescript       # macOS clipboard
│   ├── pc.ps1                # Windows clipboard
│   └── linux.sh              # Linux clipboard
├── images/
│   └── logo.webp             # Extension icon
├── README.md                 # User documentation
├── CHANGELOG.md              # Version history
├── REFACTOR_PLAN.md          # Implementation plan
├── API_TEST_REPORT.md        # API testing results
├── IMPLEMENTATION_SUMMARY.md # Technical summary
└── QUICK_START.md            # This file
```

---

## API Key Storage

### Secure Storage (Preferred)

```javascript
// Store
await context.secrets.store('noteim.apiKey', apiKey);

// Retrieve
const apiKey = await context.secrets.get('noteim.apiKey');
```

### Location

- **macOS**: Keychain
- **Windows**: Credential Manager
- **Linux**: Secret Service API / Keyring

---

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Debug extension
code . && press F5

# Package extension
vsce package

# Publish extension
vsce publish
```

### Testing

```bash
# Test device registration
curl -X POST https://api.noteim.com/v1/device/register \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","device_name":"Test","device_type":"vscode","platform":"darwin"}'

# Test file upload (replace YOUR_API_KEY)
curl -X POST https://api.noteim.com/v1/files/upload \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "file=@test.png"

# Check API health
curl https://api.noteim.com/health
```

---

## Next Steps

1. ✅ **Development Complete** - All features implemented
2. 🧪 **Testing** - Manual testing on all platforms
3. 📦 **Packaging** - Create .vsix file
4. 🚀 **Publishing** - Upload to VSCode Marketplace
5. 📢 **Announcement** - Share with users

---

## Support

- **GitHub Issues**: https://github.com/okmdx/okmd-vscode/issues
- **API Docs**: https://api.noteim.com
- **Email**: shudongai@gmail.com

---

**Happy coding! 🎉**
