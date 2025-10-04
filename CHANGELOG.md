# Change Log

All notable changes to the NoteIM Image Uploader extension.

## [3.0.0] - 2025-10-04

### Major Update - Markdown Sharing & Full Integration

#### 🆕 New Features
- **📋 Markdown Sharing** - Share Markdown documents with one shortcut (`Cmd/Ctrl+Alt+S`)
  - Generate short links instantly
  - Set expiration time (1 hour to permanent)
  - Optional password protection
  - View counter for tracking
- **🔗 Share Management** - View and manage all your shared documents
- **🔑 API Key Access** - View your API Key to access web dashboard at noteim.com
- **🌐 Web Dashboard** - Manage all images and shares on the website

#### 📸 Image Upload Features
- **Zero-configuration setup** - No registration or login required
- **Device-based authentication** - Automatic API key generation on first use
- **File upload command** - Select and upload image files via command palette
- **File management** - View, copy URLs, and delete uploaded files
- **Statistics dashboard** - Track uploads and storage usage
- **Device reset** - Clear authentication and reactivate
- **Secure storage** - API keys stored using VSCode Secrets API
- **NoteIM CDN** - Fast global image delivery

#### Changed
- **Migrated from Qiniu to NoteIM API**
- **Updated dependencies** - Replaced deprecated `request` with `axios`
- **Modular architecture** - Separated concerns into auth, upload, and file management
- **Improved error handling** - Better error messages and retry logic
- **Enhanced UX** - Progress indicators and detailed notifications
- **Updated configuration** - Simplified settings (removed Qiniu credentials)

#### Removed
- **Qiniu cloud storage support**
- **Manual API key configuration**
- **`request` library dependency**

#### Technical Details
- New modules: `auth-manager.js`, `uploader.js`, `file-manager.js`
- API endpoint: `https://api.noteim.com`
- Device ID generation using `vscode.env.machineId`
- Automatic device registration on first upload
- RESTful API integration with proper error handling