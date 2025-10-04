# 🧪 Testing Guide - NoteIM VSCode Extension

## ✅ Syntax Validation

All JavaScript files pass syntax check:

```bash
✅ extension.js - OK
✅ lib/auth-manager.js - OK  
✅ lib/uploader.js - OK
✅ lib/file-manager.js - OK
```

---

## 🎯 Test Scenarios

### 1. First-Time Activation Test

**Objective**: Verify device auto-registration

**Steps:**
1. Install extension (fresh install, no existing API key)
2. Open a Markdown file
3. Copy an image to clipboard
4. Press `Cmd+Alt+V`

**Expected Result:**
- ✅ Device registers automatically
- ✅ Shows: "🎉 NoteIM Image Uploader activated!"
- ✅ Image uploads successfully
- ✅ Markdown inserted: `![filename](https://noteimg.com/...)`

**Verification:**
```bash
# Check API key is stored
# On Mac: Keychain Access → search "noteim"
# Or check globalState if Secrets API unavailable
```

---

### 2. Clipboard Paste Upload Test

**Objective**: Test clipboard image upload

**Steps:**
1. Take screenshot (Cmd+Shift+4 on Mac)
2. Open Markdown file
3. Press `Cmd+Alt+V`

**Expected Result:**
- ✅ Progress notification appears
- ✅ Upload completes in < 5 seconds
- ✅ Markdown inserted at cursor position
- ✅ Success message: "✅ Image uploaded successfully!"

**Edge Cases:**
- Empty clipboard → "No image in clipboard"
- Text in clipboard → "No image in clipboard"
- Network error → "Network error: Unable to upload..."

---

### 3. File Upload Test

**Objective**: Upload image file via dialog

**Steps:**
1. Command Palette → `NoteIM: Upload Image`
2. Select an image file (PNG/JPG/GIF)
3. Choose action: "Insert to Editor" or "Copy Markdown"

**Expected Result:**
- ✅ File dialog opens
- ✅ Upload progress shown
- ✅ URL copied to clipboard
- ✅ Action buttons appear

**Test Files:**
- Small image (< 100KB)
- Large image (> 5MB)
- Unsupported format (should show error)

---

### 4. File Management Test

**Objective**: View and manage uploaded files

**Steps:**
1. Command Palette → `NoteIM: Show Uploaded Files`
2. Select a file from list
3. Choose "Copy URL"
4. Choose "Copy Markdown"
5. Choose "Delete File"

**Expected Result:**
- ✅ File list shows recent uploads
- ✅ File info displays (name, size, date)
- ✅ Copy URL works
- ✅ Copy Markdown works
- ✅ Delete confirmation appears
- ✅ File deleted successfully

---

### 5. Statistics Test

**Objective**: View upload statistics

**Steps:**
1. Command Palette → `NoteIM: Show Statistics`

**Expected Result:**
- ✅ Shows personal stats:
  - Files Uploaded: X
  - Total Size: X MB
  - Average Size: X KB
- ✅ Shows global stats:
  - Total Devices: X
  - Active Devices: X

---

### 6. Device Reset Test

**Objective**: Clear authentication and reactivate

**Steps:**
1. Command Palette → `NoteIM: Reset Device`
2. Confirm reset
3. Upload new image

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ API key cleared
- ✅ Success message shown
- ✅ Next upload triggers reactivation
- ✅ New API key generated

---

### 7. Error Handling Tests

#### A. Invalid API Key
**Steps:**
1. Manually corrupt API key (if accessible)
2. Try to upload

**Expected Result:**
- ✅ "Authentication failed" error
- ✅ Prompt to reset device
- ✅ Auto-clears invalid key

#### B. Network Error
**Steps:**
1. Disconnect network
2. Try to upload

**Expected Result:**
- ✅ "Network error: Unable to connect..." message
- ✅ No crash

#### C. Rate Limit
**Steps:**
1. Upload > 20 images in 1 minute

**Expected Result:**
- ✅ "Rate limit exceeded" error
- ✅ Prompt to try again later

---

## 🌐 Platform-Specific Tests

### macOS ✅ (Primary Development Platform)

**Clipboard:**
- ✅ Screenshot (Cmd+Shift+4)
- ✅ Copy from Preview
- ✅ Copy from browser

**Storage:**
- ✅ Keychain integration
- ✅ Secrets API

### Windows (Needs Testing)

**Clipboard:**
- Snipping Tool
- Copy from Paint
- Copy from browser

**Storage:**
- Credential Manager
- Secrets API fallback

**Notes:**
- PowerShell execution policy may need adjustment
- Test `lib/pc.ps1` script

### Linux (Needs Testing)

**Clipboard:**
- GNOME Screenshot
- Copy from GIMP
- xclip integration

**Storage:**
- Secret Service API
- Keyring

**Requirements:**
- Ensure `xclip` is installed
- Test `lib/linux.sh` script

---

## 🔐 Security Tests

### 1. API Key Storage

**Test:** Verify API key is stored securely

**Check:**
```bash
# macOS
security find-generic-password -s "vscode-noteim.apiKey" -w

# Should output encrypted key
```

**Verification:**
- ✅ Not in plaintext files
- ✅ Not in git repository
- ✅ Uses OS-level secure storage

### 2. Device ID Generation

**Test:** Verify device ID is consistent

**Steps:**
1. Note device ID (check console logs)
2. Restart VSCode
3. Check device ID again

**Expected:**
- ✅ Same device ID across restarts
- ✅ Different ID on different machines

---

## 📊 Performance Tests

### Upload Speed

**Test:** Measure upload time for different file sizes

| File Size | Expected Time | Actual Time | Status |
|-----------|---------------|-------------|--------|
| 100 KB    | < 2s          | TBD         | ⏳     |
| 1 MB      | < 5s          | TBD         | ⏳     |
| 5 MB      | < 15s         | TBD         | ⏳     |

### API Response Time

**Test:** Measure API endpoint response times

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| `/device/register` | < 1s | TBD | ⏳ |
| `/files/upload` | < 5s | TBD | ⏳ |
| `/files` | < 1s | TBD | ⏳ |
| `/device/stats` | < 1s | TBD | ⏳ |

---

## 🐛 Known Issues & Workarounds

### Issue 1: ESLint Warnings
**Status:** Minor (non-blocking)
**Description:** Unused `signal` parameters in event handlers
**Impact:** None (warnings only)
**Fix:** Remove unused parameters (optional)

### Issue 2: Markdown Linting
**Status:** Minor (documentation only)
**Description:** Formatting warnings in MD files
**Impact:** None (doesn't affect functionality)
**Fix:** Run prettier on markdown files (optional)

---

## 📝 Test Checklist

### Core Functionality
- [ ] Device auto-registration (first use)
- [ ] Clipboard paste upload
- [ ] File selection upload
- [ ] Markdown insertion
- [ ] Progress indicators
- [ ] Error messages

### File Management
- [ ] List uploaded files
- [ ] Copy file URL
- [ ] Copy Markdown format
- [ ] Delete file
- [ ] View statistics

### Configuration
- [ ] API URL configuration
- [ ] Local path configuration
- [ ] Settings persistence

### Commands
- [ ] `extension.okmd` (paste)
- [ ] `noteim.uploadImage`
- [ ] `noteim.showFiles`
- [ ] `noteim.showStats`
- [ ] `noteim.resetDevice`

### Error Handling
- [ ] Invalid API key
- [ ] Network error
- [ ] Rate limit exceeded
- [ ] Invalid file type
- [ ] File too large

### Platform Support
- [x] macOS (tested)
- [ ] Windows
- [ ] Linux

---

## 🚀 Manual Testing Steps

### Quick Test (5 minutes)

```bash
# 1. Open extension in debug mode
code /Users/stark/item/okmdx/okmd-vscode
# Press F5

# 2. In new VSCode window:
# - Create test.md file
# - Copy an image
# - Press Cmd+Alt+V
# - Verify upload works

# 3. Test commands:
# - Cmd+Shift+P → "NoteIM: Upload Image"
# - Cmd+Shift+P → "NoteIM: Show Uploaded Files"
# - Cmd+Shift+P → "NoteIM: Show Statistics"
```

### Full Test (30 minutes)

1. **Fresh Install Test**
   - Uninstall extension
   - Clear API keys
   - Reinstall
   - Test first activation

2. **Feature Test**
   - Test all commands
   - Upload various file types
   - Test file management

3. **Error Test**
   - Disconnect network
   - Test rate limiting
   - Test invalid inputs

4. **Performance Test**
   - Upload large files
   - Batch uploads
   - Measure response times

---

## 📊 Test Report Template

```markdown
# Test Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Platform:** macOS/Windows/Linux
**VSCode Version:** X.X.X
**Extension Version:** 3.0.0

## Results

### Passed ✅
- Feature 1
- Feature 2

### Failed ❌
- Issue 1: Description
  - Steps to reproduce
  - Expected vs Actual
  - Screenshots

### Skipped ⏭️
- Test X (reason)

## Overall Status
- Pass Rate: X/Y (XX%)
- Critical Issues: X
- Minor Issues: X

## Recommendations
- Action item 1
- Action item 2
```

---

## 🔧 Debug Tips

### Enable Console Logging

Look for logs with `[NoteIM]`, `[AuthManager]`, `[Uploader]`, `[FileManager]` prefixes.

### View Extension Output

1. Open Output panel (`Cmd+Shift+U`)
2. Select "Extension Host" from dropdown
3. Look for error messages

### Inspect API Calls

Use network debugging:
```bash
# Monitor API calls
tail -f ~/Library/Logs/VSCode/console.log | grep noteim
```

### Check API Key Storage

```javascript
// In extension debug console
context.secrets.get('noteim.apiKey').then(console.log)
```

---

## ✅ Ready for Production

**Checklist:**
- [x] All syntax checks pass
- [x] Core features implemented
- [x] Error handling in place
- [x] Documentation complete
- [ ] Manual testing completed
- [ ] Platform testing (Windows/Linux)
- [ ] Performance benchmarks
- [ ] Security audit

**Status:** 🟡 **Ready for Testing Phase**

Next step: Run manual tests and collect feedback!
