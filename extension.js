const vscode = require('vscode');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const { spawn } = require('child_process');
const AuthManager = require('./lib/auth-manager');
const Uploader = require('./lib/uploader');
const FileManager = require('./lib/file-manager');
const ShareManager = require('./lib/share-manager');

exports.activate = (context) => {
  console.log('[NoteIM] Extension activated');

  // Initialize managers
  const authManager = new AuthManager(context);
  const uploader = new Uploader(authManager);
  const fileManager = new FileManager(authManager);
  const shareManager = new ShareManager(authManager);

  // Command: Paste Image (保留原有快捷键功能)
  const pasteImageCommand = vscode.commands.registerCommand('extension.okmd', () => {
    pasteImage(uploader);
  });

  // Command: Upload Image (选择文件上传)
  const uploadImageCommand = vscode.commands.registerCommand('noteim.uploadImage', async () => {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'Images': ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico']
      },
      title: 'Select an image to upload'
    });

    if (fileUri && fileUri.length > 0) {
      await uploadImageFile(fileUri[0].fsPath, uploader);
    }
  });

  // Command: Show File List
  const showFilesCommand = vscode.commands.registerCommand('noteim.showFiles', async () => {
    await fileManager.showFileList();
  });

  // Command: Show Statistics
  const showStatsCommand = vscode.commands.registerCommand('noteim.showStats', async () => {
    await fileManager.showStats();
  });

  // Command: Reset Device
  const resetDeviceCommand = vscode.commands.registerCommand('noteim.resetDevice', async () => {
    const confirm = await vscode.window.showWarningMessage(
      'Are you sure you want to reset your device? You will need to reactivate on next upload.',
      { modal: true },
      'Reset'
    );

    if (confirm === 'Reset') {
      try {
        await authManager.clearDevice();
      } catch (error) {
        vscode.window.showErrorMessage('Failed to reset device: ' + error.message);
      }
    }
  });

  // Command: Share Markdown (快捷键分享当前文档)
  const shareMarkdownCommand = vscode.commands.registerCommand('noteim.shareMarkdown', async () => {
    console.log('[NoteIM] Share Markdown command triggered!');
    try {
      await shareCurrentMarkdown(shareManager);
    } catch (error) {
      console.error('[NoteIM] Share Markdown error:', error);
      vscode.window.showErrorMessage('Share failed: ' + error.message);
    }
  });

  // Command: Show My Shares (查看分享列表)
  const showSharesCommand = vscode.commands.registerCommand('noteim.showShares', async () => {
    await shareManager.showShareList();
  });

  // Command: Show API Key (查看API Key)
  const showApiKeyCommand = vscode.commands.registerCommand('noteim.showApiKey', async () => {
    await showApiKey(authManager);
  });

  // Register all commands
  context.subscriptions.push(
    pasteImageCommand,
    uploadImageCommand,
    showFilesCommand,
    showStatsCommand,
    resetDeviceCommand,
    shareMarkdownCommand,
    showSharesCommand,
    showApiKeyCommand
  );

  console.log('[NoteIM] All commands registered');
  console.log('[NoteIM] Registered commands:');
  console.log('  - extension.okmd (Paste Image)');
  console.log('  - noteim.uploadImage');
  console.log('  - noteim.showFiles');
  console.log('  - noteim.showStats');
  console.log('  - noteim.resetDevice');
  console.log('  - noteim.shareMarkdown ✨');
  console.log('  - noteim.showShares');
  console.log('  - noteim.showApiKey');
}

// this method is called when your extension is deactivated
exports.deactivate = () => { }

/**
 * 粘贴图片功能（保留原有逻辑）
 */
async function pasteImage(uploader) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const fileUri = editor.document.uri;
  if (!fileUri) return;

  if (fileUri.scheme === 'untitled') {
    vscode.window.showInformationMessage('Please save the file before pasting an image.');
    return;
  }

  const selection = editor.selection;
  const selectText = editor.document.getText(selection);

  if (selectText && !/^[\w\-.]+$/.test(selectText)) {
    vscode.window.showInformationMessage('Selected text is not a valid file name.');
    return;
  }

  const config = vscode.workspace.getConfiguration('noteim');
  let localPath = config.get('localPath') || './images';
  
  if (localPath && (localPath.length !== localPath.trim().length)) {
    vscode.window.showErrorMessage('Invalid path: "' + localPath + '"');
    return;
  }

  const filePath = fileUri.fsPath;
  const imagePath = getImagePath(filePath, selectText, localPath);

  try {
    await createImageDirWithImagePath(imagePath);
    
    saveClipboardImageToFileAndGetPath(imagePath, async (savedImagePath) => {
      if (!savedImagePath) return;
      
      if (savedImagePath === 'no image') {
        vscode.window.setStatusBarMessage('No image in clipboard', 3000);
        return;
      }

      // Upload with progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Uploading image...',
        cancellable: false
      }, async (progress) => {
        try {
          progress.report({ increment: 0, message: 'Initializing...' });

          const altText = selectText || path.basename(savedImagePath, path.extname(savedImagePath));
          const result = await uploader.uploadImage(savedImagePath, {
            altText,
            caption: `Uploaded from VSCode at ${new Date().toLocaleString()}`,
            onProgress: (percent) => {
              progress.report({ increment: percent, message: `Uploading... ${percent}%` });
            }
          });

          progress.report({ increment: 100, message: 'Done!' });

          // Insert markdown
          const markdown = `![${altText}](${result.url})`;
          await editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, markdown);
          });

          vscode.window.showInformationMessage('✅ Image uploaded successfully!');

          // Delete temp file
          fs.unlink(savedImagePath, (err) => {
            if (err) {
              console.error('[Extension] Failed to delete temp file:', err);
            }
          });
        } catch (error) {
          console.error('[Extension] Upload error:', error);
          vscode.window.showErrorMessage('Upload failed: ' + error.message);
          
          // Delete temp file on error
          fs.unlink(savedImagePath, () => {});
        }
      });
    });
  } catch (error) {
    vscode.window.showErrorMessage('Failed to create folder: ' + error.message);
  }
}

/**
 * 上传选中的图片文件
 */
async function uploadImageFile(filePath, uploader) {
  const editor = vscode.window.activeTextEditor;

  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Uploading image...',
    cancellable: false
  }, async (progress) => {
    try {
      progress.report({ increment: 0, message: 'Starting upload...' });

      const fileName = path.basename(filePath, path.extname(filePath));
      const result = await uploader.uploadImage(filePath, {
        altText: fileName,
        onProgress: (percent) => {
          progress.report({ increment: percent, message: `${percent}%` });
        }
      });

      progress.report({ increment: 100, message: 'Done!' });

      // Copy URL to clipboard
      await vscode.env.clipboard.writeText(result.url);

      // Show success with action buttons
      const action = await vscode.window.showInformationMessage(
        '✅ Image uploaded! URL copied to clipboard.',
        'Insert to Editor',
        'Copy Markdown'
      );

      if (action === 'Insert to Editor' && editor) {
        const markdown = `![${fileName}](${result.url})`;
        await editor.edit(editBuilder => {
          editBuilder.insert(editor.selection.active, markdown);
        });
      } else if (action === 'Copy Markdown') {
        const markdown = `![${fileName}](${result.url})`;
        await vscode.env.clipboard.writeText(markdown);
        vscode.window.showInformationMessage('Markdown copied to clipboard');
      }
    } catch (error) {
      console.error('[Extension] Upload error:', error);
      vscode.window.showErrorMessage('Upload failed: ' + error.message);
    }
  });
}

function getImagePath(filePath, selectText, localPath) {
  // 图片名称
  let imageFileName = '';
  if (!selectText) {
    imageFileName = 's' + moment().format("HHmmssMMDDY") + '.png';
  } else {
    imageFileName = selectText + '.png';
  }

  // Image local save path
  let folderPath = path.dirname(filePath);
  let imagePath = '';
  if (path.isAbsolute(localPath)) {
    imagePath = path.join(localPath, imageFileName);
  } else {
    imagePath = path.join(folderPath, localPath, imageFileName);
  }

  return imagePath;
}

function createImageDirWithImagePath(imagePath) {
  // let imageDir = path.dirname(imagePath)
  // let config = vscode.workspace.getConfiguration('qiniu');
  // vscode.window.showInformationMessage(imageDir);
  return new Promise((resolve, reject) => {
    let imageDir = path.dirname(imagePath);
    fs.exists(imageDir, (exists) => {
      if (exists) {
        resolve(imagePath);
        return;
      }
      fs.mkdir(imageDir, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(imagePath);
      });
    });
  });
}

function saveClipboardImageToFileAndGetPath(imagePath, cb) {
  if (!imagePath) return;
  let platform = process.platform;

  if (platform === 'win32') {
    // Windows
    const scriptPath = path.join(__dirname, './lib/pc.ps1');
    const powershell = spawn('powershell', [
      '-noprofile',
      '-noninteractive',
      '-nologo',
      '-sta',
      '-executionpolicy', 'unrestricted',
      '-windowstyle', 'hidden',
      '-file', scriptPath,
      imagePath
    ]);
    powershell.on('exit', function (code, signal) {

    });
    powershell.stdout.on('data', function (data) {
      cb(data.toString().trim());
    });
  } else if (platform === 'darwin') {
    // Mac
    let scriptPath = path.join(__dirname, './lib/mac.applescript');

    let ascript = spawn('osascript', [scriptPath, imagePath]);
    ascript.on('exit', function (code, signal) {

    });

    ascript.stdout.on('data', function (data) {
      cb(data.toString().trim());
    });
  } else {
    // Linux 

    let scriptPath = path.join(__dirname, './lib/linux.sh');

    let ascript = spawn('sh', [scriptPath, imagePath]);
    ascript.on('exit', function (code, signal) {

    });

    ascript.stdout.on('data', function (data) {
      let result = data.toString();
      if (result == "no xclip") {
        vscode.window.showInformationMessage('You need to install xclip command first.');
        return;
      }
      cb(result);
    });
  }
}

/**
 * 分享当前Markdown文档
 */
async function shareCurrentMarkdown(shareManager) {
  console.log('[ShareMarkdown] Function called');
  
  const editor = vscode.window.activeTextEditor;
  console.log('[ShareMarkdown] Editor:', editor ? 'Found' : 'Not found');
  
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const document = editor.document;
  console.log('[ShareMarkdown] Language:', document.languageId);
  console.log('[ShareMarkdown] FileName:', document.fileName);
  
  // 检查是否是Markdown文件
  if (document.languageId !== 'markdown') {
    vscode.window.showWarningMessage('Current file is not a Markdown document');
    return;
  }

  // 获取文件内容
  const content = document.getText();
  console.log('[ShareMarkdown] Content length:', content.length);
  
  if (!content || content.trim().length === 0) {
    vscode.window.showWarningMessage('Document is empty');
    return;
  }
  
  console.log('[ShareMarkdown] About to show QuickPick for expiry');

  // 获取文件名作为标题
  const fileName = path.basename(document.fileName);
  const title = fileName.replace(/\.md$/i, '');

  // 询问过期时间
  const expiryOptions = await vscode.window.showQuickPick([
    { label: '$(clock) Permanent', description: 'Never expires', value: 0 },
    { label: '$(clock) 1 Hour', description: 'Expires in 1 hour', value: 1 },
    { label: '$(clock) 24 Hours', description: 'Expires in 24 hours', value: 24 },
    { label: '$(clock) 7 Days', description: 'Expires in 7 days', value: 168 },
    { label: '$(clock) 30 Days', description: 'Expires in 30 days', value: 720 }
  ], {
    placeHolder: 'Select expiration time'
  });

  if (!expiryOptions) {
    return; // 用户取消
  }

  // 询问是否设置密码
  const needPassword = await vscode.window.showQuickPick([
    { label: '$(unlock) No Password', description: 'Anyone can view', value: false },
    { label: '$(lock) Set Password', description: 'Protect with password', value: true }
  ], {
    placeHolder: 'Do you want to protect with a password?'
  });

  if (needPassword === undefined) {
    return; // 用户取消
  }

  let password = null;
  if (needPassword.value) {
    password = await vscode.window.showInputBox({
      prompt: 'Enter password (others will need this to view)',
      password: true,
      validateInput: (value) => {
        if (!value || value.length < 4) {
          return 'Password must be at least 4 characters';
        }
        return null;
      }
    });

    if (!password) {
      return; // 用户取消
    }
  }

  // 上传并显示进度
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Creating share...',
    cancellable: false
  }, async (progress) => {
    try {
      progress.report({ increment: 0, message: 'Uploading...' });

      const result = await shareManager.shareMarkdown({
        title: title,
        content: content,
        fileName: fileName,
        expiresIn: expiryOptions.value,
        password: password
      });

      progress.report({ increment: 100, message: 'Done!' });

      // 复制链接到剪贴板
      await vscode.env.clipboard.writeText(result.shareUrl);

      // 显示成功消息（使用modal让用户必须看到）
      let message = '✅ Markdown Share Created!\n\n';
      message += '🔗 Share Link:\n';
      message += `${result.shareUrl}\n\n`;
      message += '📋 Link has been copied to clipboard.\n';
      
      if (result.expiresAt) {
        const expireDate = new Date(result.expiresAt);
        message += `⏰ Expires: ${expireDate.toLocaleString()}`;
      } else {
        message += '⏰ Expires: Never (Permanent)';
      }

      const action = await vscode.window.showInformationMessage(
        message,
        { modal: true },
        'Open in Browser',
        'Copy Link Again',
        'OK'
      );

      if (action === 'Open in Browser') {
        vscode.env.openExternal(vscode.Uri.parse(result.shareUrl));
      } else if (action === 'Copy Link Again') {
        await vscode.env.clipboard.writeText(result.shareUrl);
        vscode.window.showInformationMessage('✅ Link copied to clipboard');
      }
    } catch (error) {
      console.error('[Extension] Share error:', error);
      vscode.window.showErrorMessage('Failed to create share: ' + error.message);
    }
  });
}

/**
 * 显示API Key
 */
async function showApiKey(authManager) {
  try {
    const apiKey = await authManager.getApiKey();
    
    if (!apiKey) {
      vscode.window.showWarningMessage(
        'No API Key found. Please upload an image to activate your device first.'
      );
      return;
    }

    // 显示API Key和使用说明
    const action = await vscode.window.showInformationMessage(
      `🔑 Your API Key:\n\n${apiKey}\n\n` +
      `You can use this key to manage your images and notes at:\nhttps://www.noteim.com`,
      { modal: true },
      'Copy API Key',
      'Open Website'
    );

    if (action === 'Copy API Key') {
      await vscode.env.clipboard.writeText(apiKey);
      vscode.window.showInformationMessage('✅ API Key copied to clipboard');
    } else if (action === 'Open Website') {
      vscode.env.openExternal(vscode.Uri.parse('https://www.noteim.com'));
    }
  } catch (error) {
    vscode.window.showErrorMessage('Failed to get API Key: ' + error.message);
  }
}
