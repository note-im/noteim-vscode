const axios = require('axios');
const vscode = require('vscode');

/**
 * 文件管理器
 * 负责查看、删除上传的文件
 */
class FileManager {
  constructor(authManager) {
    this.authManager = authManager;
    this.apiUrl = this.authManager.getApiUrl();
  }

  /**
   * 获取文件列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise<{files: Array, total: number}>}
   */
  async getFiles(page = 1, pageSize = 20) {
    try {
      const apiKey = await this.authManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('Not authenticated. Please upload an image first to activate your device.');
      }

      const response = await axios.get(
        `${this.apiUrl}/v1/files`,
        {
          headers: {
            'X-API-Key': apiKey
          },
          params: {
            page,
            page_size: pageSize
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 0) {
        const { files, total_count } = response.data.data;
        
        console.log('[FileManager] Retrieved files:', {
          count: files.length,
          total: total_count
        });

        return {
          files: files || [],
          total: total_count || 0
        };
      } else {
        throw new Error(response.data.message || 'Failed to get files');
      }
    } catch (error) {
      console.error('[FileManager] Error getting files:', error);
      
      if (error.response && error.response.status === 401) {
        throw new Error('Authentication failed. Please upload an image to reactivate.');
      }
      
      throw new Error('Failed to get files: ' + error.message);
    }
  }

  /**
   * 删除文件
   * @param {number} fileId - 文件ID
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileId) {
    try {
      const apiKey = await this.authManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('Not authenticated');
      }

      const response = await axios.delete(
        `${this.apiUrl}/v1/files/${fileId}`,
        {
          headers: {
            'X-API-Key': apiKey
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 0) {
        console.log('[FileManager] File deleted:', fileId);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('[FileManager] Error deleting file:', error);
      throw new Error('Failed to delete file: ' + error.message);
    }
  }

  /**
   * 显示文件列表（QuickPick界面）
   */
  async showFileList() {
    try {
      const { files } = await this.getFiles(1, 50);

      if (files.length === 0) {
        vscode.window.showInformationMessage('No files uploaded yet.');
        return;
      }

      // 创建QuickPick项
      const items = files.map(file => ({
        label: file.file_name,
        description: this.formatFileSize(file.file_size),
        detail: `${file.file_url} • Uploaded: ${new Date(file.created_at).toLocaleString()}`,
        file: file
      }));

      // 显示文件列表
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a file to copy URL or delete',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (selected) {
        // 显示操作选项
        const action = await vscode.window.showQuickPick([
          { label: '$(copy) Copy URL', value: 'copy' },
          { label: '$(markdown) Copy Markdown', value: 'markdown' },
          { label: '$(trash) Delete File', value: 'delete' },
          { label: '$(close) Cancel', value: 'cancel' }
        ], {
          placeHolder: 'Choose an action'
        });

        if (action) {
          await this.handleFileAction(action.value, selected.file);
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage('Failed to show file list: ' + error.message);
    }
  }

  /**
   * 处理文件操作
   */
  async handleFileAction(action, file) {
    switch (action) {
      case 'copy':
        await vscode.env.clipboard.writeText(file.file_url);
        vscode.window.showInformationMessage('✅ URL copied to clipboard');
        break;

      case 'markdown':
        const markdown = `![${file.alt_text || file.file_name}](${file.file_url})`;
        await vscode.env.clipboard.writeText(markdown);
        vscode.window.showInformationMessage('✅ Markdown copied to clipboard');
        break;

      case 'delete':
        const confirm = await vscode.window.showWarningMessage(
          `Delete "${file.file_name}"?`,
          { modal: true },
          'Delete'
        );

        if (confirm === 'Delete') {
          try {
            await this.deleteFile(file.id);
            vscode.window.showInformationMessage('✅ File deleted successfully');
          } catch (error) {
            vscode.window.showErrorMessage('Failed to delete file: ' + error.message);
          }
        }
        break;

      case 'cancel':
      default:
        break;
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  /**
   * 获取文件统计信息
   */
  async getStats() {
    try {
      const { files, total } = await this.getFiles(1, 1000);
      
      const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
      const avgSize = files.length > 0 ? totalSize / files.length : 0;

      return {
        totalFiles: total,
        totalSize: totalSize,
        averageSize: avgSize,
        files: files
      };
    } catch (error) {
      console.error('[FileManager] Error getting stats:', error);
      return null;
    }
  }

  /**
   * 显示统计信息
   */
  async showStats() {
    try {
      const stats = await this.getStats();
      const deviceStats = await this.authManager.getDeviceStats();

      if (!stats) {
        vscode.window.showErrorMessage('Failed to get statistics');
        return;
      }

      let message = `📊 Your Statistics:\n\n`;
      message += `Files Uploaded: ${stats.totalFiles}\n`;
      message += `Total Size: ${this.formatFileSize(stats.totalSize)}\n`;
      message += `Average Size: ${this.formatFileSize(stats.averageSize)}\n`;

      if (deviceStats) {
        message += `\n🌐 Global Statistics:\n\n`;
        message += `Total Devices: ${deviceStats.total_devices}\n`;
        message += `Active Devices: ${deviceStats.active_devices}\n`;
      }

      vscode.window.showInformationMessage(message, { modal: true });
    } catch (error) {
      vscode.window.showErrorMessage('Failed to show statistics: ' + error.message);
    }
  }
}

module.exports = FileManager;
