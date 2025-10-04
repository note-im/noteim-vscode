const axios = require('axios');
const vscode = require('vscode');

/**
 * 设备认证管理器
 * 负责设备注册、API Key管理
 */
class AuthManager {
  constructor(context) {
    this.context = context;
    this.apiUrl = this.getApiUrl();
  }

  /**
   * 获取API URL（从配置或默认值）
   */
  getApiUrl() {
    const config = vscode.workspace.getConfiguration('noteim');
    return config.get('apiUrl') || 'https://api.noteim.com';
  }

  /**
   * 生成设备ID（使用VSCode的machineId）
   */
  getDeviceId() {
    return vscode.env.machineId;
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    const platform = process.platform;
    const platformMap = {
      'darwin': 'macOS',
      'win32': 'Windows',
      'linux': 'Linux'
    };

    return {
      device_id: this.getDeviceId(),
      device_name: vscode.env.appName + ' - ' + (platformMap[platform] || platform),
      device_type: 'vscode',
      platform: platform
    };
  }

  /**
   * 从本地存储获取API Key
   */
  async getApiKey() {
    try {
      // 优先使用 secrets API (更安全)
      if (this.context.secrets) {
        const apiKey = await this.context.secrets.get('noteim.apiKey');
        if (apiKey) {
          console.log('[AuthManager] API Key retrieved from secrets');
          return apiKey;
        }
      }

      // 降级到 globalState (兼容旧版本VSCode)
      const apiKey = this.context.globalState.get('noteim.apiKey');
      if (apiKey) {
        console.log('[AuthManager] API Key retrieved from globalState');
        // 迁移到 secrets
        if (this.context.secrets) {
          await this.context.secrets.store('noteim.apiKey', apiKey);
          await this.context.globalState.update('noteim.apiKey', undefined);
          console.log('[AuthManager] API Key migrated to secrets');
        }
        return apiKey;
      }

      return null;
    } catch (error) {
      console.error('[AuthManager] Error getting API Key:', error);
      return null;
    }
  }

  /**
   * 保存API Key到本地
   */
  async saveApiKey(apiKey) {
    try {
      if (this.context.secrets) {
        await this.context.secrets.store('noteim.apiKey', apiKey);
        console.log('[AuthManager] API Key saved to secrets');
      } else {
        await this.context.globalState.update('noteim.apiKey', apiKey);
        console.log('[AuthManager] API Key saved to globalState');
      }
      return true;
    } catch (error) {
      console.error('[AuthManager] Error saving API Key:', error);
      throw new Error('Failed to save API Key: ' + error.message);
    }
  }

  /**
   * 注册设备并获取API Key
   */
  async registerDevice() {
    const deviceInfo = this.getDeviceInfo();
    
    console.log('[AuthManager] Registering device:', {
      device_id: deviceInfo.device_id.substring(0, 8) + '...',
      device_name: deviceInfo.device_name,
      device_type: deviceInfo.device_type,
      platform: deviceInfo.platform
    });

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/device/register`,
        deviceInfo,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10秒超时
        }
      );

      if (response.data && response.data.code === 0) {
        const { api_key, is_new_device, message } = response.data.data;
        
        console.log('[AuthManager] Device registration response:', {
          is_new_device,
          message
        });

        // 保存API Key
        await this.saveApiKey(api_key);

        return {
          apiKey: api_key,
          isNewDevice: is_new_device,
          message: message
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('[AuthManager] Registration error:', error);
      
      if (error.response) {
        // 服务器返回错误
        const errorMessage = error.response.data && error.response.data.message ? error.response.data.message : error.response.statusText;
        throw new Error(`Registration failed: ${errorMessage}`);
      } else if (error.request) {
        // 网络错误
        throw new Error('Network error: Unable to connect to NoteIM API. Please check your internet connection.');
      } else {
        // 其他错误
        throw new Error('Registration failed: ' + error.message);
      }
    }
  }

  /**
   * 获取或注册设备（自动激活）
   */
  async getOrRegisterDevice() {
    try {
      // 1. 检查本地是否已有API Key
      let apiKey = await this.getApiKey();
      
      if (apiKey) {
        console.log('[AuthManager] Using existing API Key');
        return {
          apiKey,
          isNewDevice: false
        };
      }

      // 2. 首次使用，自动注册
      console.log('[AuthManager] No API Key found, registering device...');
      
      const result = await this.registerDevice();
      
      // 3. 显示激活消息
      if (result.isNewDevice) {
        vscode.window.showInformationMessage(
          '🎉 NoteIM Image Uploader activated! Your device is ready to use.'
        );
      } else {
        vscode.window.showInformationMessage(
          '✅ NoteIM device reconnected successfully.'
        );
      }

      return result;
    } catch (error) {
      console.error('[AuthManager] Auto-activation failed:', error);
      throw error;
    }
  }

  /**
   * 验证API Key是否有效
   */
  async validateApiKey(apiKey) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/files?page=1&page_size=1`,
        {
          headers: {
            'X-API-Key': apiKey
          },
          timeout: 5000
        }
      );

      if (response.status === 401) {
        throw new Error('Invalid API Key');
      }

      return response.status === 200 && response.data.code === 0;
    } catch (error) {
      console.error('[AuthManager] API Key validation failed:', error);
      return false;
    }
  }
  /**
   * 清除设备信息（重置）
   */
  async clearDevice() {
    try {
      if (this.context.secrets) {
        await this.context.secrets.delete('noteim.apiKey');
      }
      await this.context.globalState.update('noteim.apiKey', undefined);
      console.log('[AuthManager] Device info cleared');
      
      vscode.window.showInformationMessage(
        '✅ Device reset successfully. You will be asked to activate again on next upload.'
      );
    } catch (error) {
      console.error('[AuthManager] Error clearing device:', error);
      throw new Error('Failed to reset device: ' + error.message);
    }
  }

  /**
   * 获取设备统计信息
   */
  async getDeviceStats() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/device/stats`,
        {
          timeout: 5000
        }
      );

      if (response.data && response.data.code === 0) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('[AuthManager] Failed to get stats:', error);
      return null;
    }
  }
}

module.exports = AuthManager;
