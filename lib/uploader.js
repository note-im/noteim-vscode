const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * 文件上传管理器
 * 负责文件上传到NoteIM API
 */
class Uploader {
  constructor(authManager) {
    this.authManager = authManager;
    this.apiUrl = this.authManager.getApiUrl();
  }

  /**
   * 上传图片文件
   * @param {string} filePath - 本地文件路径
   * @param {object} options - 上传选项
   * @returns {Promise<{url: string, uuid: string, fileName: string}>}
   */
  async uploadImage(filePath, options = {}) {
    try {
      // 1. 确保文件存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // 2. 获取API Key（自动注册如果需要）
      console.log('[Uploader] Getting API Key...');
      const { apiKey } = await this.authManager.getOrRegisterDevice();

      if (!apiKey) {
        throw new Error('Failed to get API Key. Please try again.');
      }

      // 3. 准备上传数据
      const fileName = path.basename(filePath);
      const fileStats = fs.statSync(filePath);
      const fileSize = fileStats.size;

      console.log('[Uploader] Uploading file:', {
        fileName,
        fileSize: (fileSize / 1024).toFixed(2) + ' KB'
      });

      // 4. 创建FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: fileName,
        contentType: this.getMimeType(filePath)
      });

      // 添加可选元数据
      if (options.altText) {
        formData.append('alt_text', options.altText);
      }
      if (options.caption) {
        formData.append('caption', options.caption);
      }

      // 5. 上传文件
      const headers = Object.assign({}, formData.getHeaders(), {
        'X-API-Key': apiKey
      });
      
      const response = await axios.post(
        `${this.apiUrl}/v1/files/upload`,
        formData,
        {
          headers: headers,
          timeout: 30000, // 30秒超时
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (options.onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              options.onProgress(percentCompleted);
            }
          }
        }
      );

      // 6. 处理响应
      if (response.data && response.data.code === 0) {
        const { url, uuid } = response.data.data;
        
        console.log('[Uploader] Upload successful:', {
          url,
          uuid
        });

        return {
          url,
          uuid,
          fileName
        };
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('[Uploader] Upload error:', error);

      if (error.response) {
        // 服务器返回错误
        const status = error.response.status;
        const errorData = error.response.data || {};
        const message = errorData.error || errorData.message || error.response.statusText;

        if (status === 401) {
          // API Key无效，清除并提示重新激活
          await this.authManager.clearDevice();
          throw new Error('Authentication failed. Please try uploading again to reactivate.');
        } else if (status === 413) {
          throw new Error('File too large. Please upload a smaller file.');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Upload failed: ${message}`);
        }
      } else if (error.request) {
        // 网络错误
        throw new Error('Network error: Unable to upload file. Please check your internet connection.');
      } else {
        // 其他错误
        throw new Error('Upload failed: ' + error.message);
      }
    }
  }

  /**
   * 根据文件扩展名获取MIME类型
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * 批量上传图片
   * @param {string[]} filePaths - 文件路径数组
   * @param {function} onProgress - 进度回调
   * @returns {Promise<Array>}
   */
  async uploadMultiple(filePaths, onProgress) {
    const results = [];
    const total = filePaths.length;

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      
      try {
        const result = await this.uploadImage(filePath);
        results.push(Object.assign({}, result, {
          success: true,
          filePath: filePath
        }));
      } catch (error) {
        results.push({
          success: false,
          filePath,
          error: error.message
        });
      }

      if (onProgress) {
        onProgress(i + 1, total);
      }
    }

    return results;
  }

  /**
   * 上传并获取Markdown格式的图片链接
   */
  async uploadAndGetMarkdown(filePath, options = {}) {
    try {
      const { url, fileName } = await this.uploadImage(filePath, options);
      const altText = options.altText || path.basename(fileName, path.extname(fileName));
      return `![${altText}](${url})`;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Uploader;
