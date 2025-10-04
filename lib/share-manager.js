const axios = require('axios');
const vscode = require('vscode');

/**
 * Markdown分享管理器
 * 负责创建、管理Markdown文档分享
 */
class ShareManager {
  constructor(authManager) {
    this.authManager = authManager;
    this.apiUrl = this.authManager.getApiUrl();
  }

  /**
   * 分享当前Markdown文档
   * @param {object} options - 分享选项
   * @returns {Promise<{shareUrl: string, shortCode: string}>}
   */
  async shareMarkdown(options = {}) {
    try {
      const apiKey = await this.authManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('Not authenticated. Please upload an image first to activate your device.');
      }

      const {
        title,
        content,
        fileName,
        expiresIn = 0, // 0 = 永久
        password = null,
        isPublic = true
      } = options;

      console.log('[ShareManager] Creating share:', {
        title,
        fileName,
        contentLength: content.length,
        expiresIn,
        hasPassword: !!password
      });

      // 构建请求体，不包含null值
      const requestBody = {
        title: title,
        content: content,
        language: 'markdown'
      };

      // 可选字段：只有非空值才添加
      if (fileName) {
        requestBody.file_name = fileName;
      }
      
      if (typeof isPublic === 'boolean') {
        requestBody.is_public = isPublic;
      }
      
      if (password && password.trim().length > 0) {
        requestBody.password = password;
      }
      
      if (expiresIn && expiresIn > 0) {
        requestBody.expires_in = expiresIn;
      }

      console.log('[ShareManager] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        `${this.apiUrl}/v1/shares`,
        requestBody,
        {
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 0) {
        const { short_code, share_url, view_url, expires_at } = response.data.data;
        
        // 确保有分享链接（如果API没返回则自己拼接）
        const baseUrl = 'https://www.noteim.com';
        const finalShareUrl = share_url || `${baseUrl}/s/${short_code}`;
        const finalViewUrl = view_url || `${baseUrl}/view/${short_code}`;
        
        console.log('[ShareManager] Share created successfully:', {
          short_code,
          share_url: finalShareUrl
        });

        return {
          shortCode: short_code,
          shareUrl: finalShareUrl,
          viewUrl: finalViewUrl,
          expiresAt: expires_at
        };
      } else {
        throw new Error(response.data.message || 'Failed to create share');
      }
    } catch (error) {
      console.error('[ShareManager] Error creating share:', error);
      
      if (error.response && error.response.status === 401) {
        throw new Error('Authentication failed. Please upload an image to activate.');
      }
      
      throw new Error('Failed to create share: ' + error.message);
    }
  }

  /**
   * 获取我的分享列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise<{shares: Array, total: number}>}
   */
  async getMyShares(page = 1, pageSize = 20) {
    try {
      const apiKey = await this.authManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(
        `${this.apiUrl}/v1/shares/my`,
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
        const { shares, total_count } = response.data.data;
        
        console.log('[ShareManager] Retrieved shares:', {
          count: shares.length,
          total: total_count
        });

        return {
          shares: shares || [],
          total: total_count || 0
        };
      } else {
        throw new Error(response.data.message || 'Failed to get shares');
      }
    } catch (error) {
      console.error('[ShareManager] Error getting shares:', error);
      throw new Error('Failed to get shares: ' + error.message);
    }
  }

  /**
   * 删除分享
   * @param {string} shortCode - 分享短代码
   * @returns {Promise<boolean>}
   */
  async deleteShare(shortCode) {
    try {
      const apiKey = await this.authManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('Not authenticated');
      }

      const response = await axios.delete(
        `${this.apiUrl}/v1/shares/${shortCode}`,
        {
          headers: {
            'X-API-Key': apiKey
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 0) {
        console.log('[ShareManager] Share deleted:', shortCode);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete share');
      }
    } catch (error) {
      console.error('[ShareManager] Error deleting share:', error);
      throw new Error('Failed to delete share: ' + error.message);
    }
  }

  /**
   * 获取分享统计
   * @returns {Promise<{totalShares: number, activeShares: number, totalViews: number}>}
   */
  async getShareStats() {
    try {
      const apiKey = await this.authManager.getApiKey();
      
      if (!apiKey) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(
        `${this.apiUrl}/v1/shares/stats`,
        {
          headers: {
            'X-API-Key': apiKey
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 0) {
        const { total_shares, active_shares, total_views } = response.data.data;
        
        return {
          totalShares: total_shares,
          activeShares: active_shares,
          totalViews: total_views
        };
      } else {
        throw new Error(response.data.message || 'Failed to get stats');
      }
    } catch (error) {
      console.error('[ShareManager] Error getting stats:', error);
      return null;
    }
  }

  /**
   * 显示分享列表（QuickPick界面）
   */
  async showShareList() {
    try {
      const { shares } = await this.getMyShares(1, 50);

      if (shares.length === 0) {
        vscode.window.showInformationMessage('No shares created yet.');
        return;
      }

      const baseUrl = 'https://www.noteim.com';
      const items = shares.map(share => {
        // 确保有链接（如果没有则拼接）
        const shareUrl = share.share_url || `${baseUrl}/s/${share.short_code}`;
        return {
          label: share.title,
          description: `👁 ${share.view_count} views`,
          detail: `🔗 ${shareUrl} • Created: ${new Date(share.created_at).toLocaleString()}`,
          share: Object.assign({}, share, { share_url: shareUrl })
        };
      });

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a share to copy URL or delete',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (selected) {
        const action = await vscode.window.showQuickPick([
          { label: '$(copy) Copy Share URL', value: 'copy' },
          { label: '$(markdown) Copy Markdown Link', value: 'markdown' },
          { label: '$(trash) Delete Share', value: 'delete' },
          { label: '$(close) Cancel', value: 'cancel' }
        ], {
          placeHolder: 'Choose an action'
        });

        if (action) {
          await this.handleShareAction(action.value, selected.share);
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage('Failed to show share list: ' + error.message);
    }
  }

  /**
   * 处理分享操作
   */
  async handleShareAction(action, share) {
    const shareUrl = share.share_url || share.view_url;
    
    switch (action) {
      case 'copy':
        await vscode.env.clipboard.writeText(shareUrl);
        // 显示完整链接给用户
        vscode.window.showInformationMessage(
          `✅ Link copied!\n\n${shareUrl}`,
          { modal: true },
          'Open in Browser'
        ).then(choice => {
          if (choice === 'Open in Browser') {
            vscode.env.openExternal(vscode.Uri.parse(shareUrl));
          }
        });
        break;

      case 'markdown':
        const markdown = `[${share.title}](${shareUrl})`;
        await vscode.env.clipboard.writeText(markdown);
        vscode.window.showInformationMessage(
          `✅ Markdown copied!\n\n${markdown}`,
          { modal: false }
        );
        break;

      case 'delete':
        const confirm = await vscode.window.showWarningMessage(
          `Delete share "${share.title}"?`,
          { modal: true },
          'Delete'
        );

        if (confirm === 'Delete') {
          try {
            await this.deleteShare(share.short_code);
            vscode.window.showInformationMessage('✅ Share deleted successfully');
          } catch (error) {
            vscode.window.showErrorMessage('Failed to delete share: ' + error.message);
          }
        }
        break;

      case 'cancel':
      default:
        break;
    }
  }

  /**
   * 显示分享统计
   */
  async showShareStats() {
    try {
      const stats = await this.getShareStats();
      
      if (!stats) {
        vscode.window.showErrorMessage('Failed to get share statistics');
        return;
      }

      const message = `📊 Share Statistics:\n\n` +
        `Total Shares: ${stats.totalShares}\n` +
        `Active Shares: ${stats.activeShares}\n` +
        `Total Views: ${stats.totalViews}`;

      vscode.window.showInformationMessage(message, { modal: true });
    } catch (error) {
      vscode.window.showErrorMessage('Failed to show statistics: ' + error.message);
    }
  }
}

module.exports = ShareManager;
