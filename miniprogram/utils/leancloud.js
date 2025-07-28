// LeanCloud 工具类
// 封装所有与LeanCloud相关的API调用

const config = require('../config.js');

// 简化的LeanCloud REST API封装
class LeanCloudAPI {
  constructor() {
    this.appId = config.leanCloud.appId;
    this.appKey = config.leanCloud.appKey;
    this.serverURL = config.leanCloud.serverURL;
  }

  // 构建查询字符串
  buildQueryString(params) {
    const queryParts = [];
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
      }
    }
    return queryParts.join('&');
  }

  // 发送HTTP请求的通用方法
  async request(method, path, data = null) {
    const url = `${this.serverURL}/1.1${path}`;
    const headers = {
      'X-LC-Id': this.appId,
      'X-LC-Key': this.appKey,
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      header: headers,
      timeout: 10000
    };

    if (data) {
      options.data = data;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        ...options,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            console.error('LeanCloud API Error:', res);
            reject(new Error(`HTTP ${res.statusCode}: ${res.data?.error || 'Unknown error'}`));
          }
        },
        fail: (error) => {
          console.error('Request failed:', error);
          reject(new Error(`网络请求失败: ${error.errMsg || 'Unknown error'}`));
        }
      });
    });
  }

  // 获取点赞数量
  async getLikeCount() {
    try {
      const result = await this.request('GET', '/classes/likes?count=1&limit=0');
      return {
        success: true,
        data: {
          likeCount: result.count || 0
        }
      };
    } catch (error) {
      console.error('获取点赞数量失败:', error);
      return {
        success: false,
        error: error.message || '获取点赞数量失败'
      };
    }
  }

  // 添加点赞记录
  async addLike(openid, nickName = '匿名用户', identityType = 'anonymous') {
    try {
      const likeData = {
        openid: openid,
        nickName: nickName.trim() || '匿名用户',
        identityType: identityType
      };

      // 添加点赞记录
      await this.request('POST', '/classes/likes', likeData);

      // 获取最新点赞数量
      const countResult = await this.getLikeCount();
      
      if (countResult.success) {
        return {
          success: true,
          data: {
            likeCount: countResult.data.likeCount,
            message: '点赞成功'
          }
        };
      } else {
        throw new Error('获取点赞数量失败');
      }
    } catch (error) {
      console.error('点赞失败:', error);
      return {
        success: false,
        error: error.message || '点赞失败'
      };
    }
  }

  // 获取点赞记录列表
  async getLikes(page = 1, pageSize = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const queryParams = {
        order: '-createdAt',
        skip: skip.toString(),
        limit: pageSize.toString(),
        count: '1'
      };

      const queryString = this.buildQueryString(queryParams);
      const result = await this.request('GET', `/classes/likes?${queryString}`);
      
      // 转换数据格式以匹配原来的格式
      const likes = (result.results || []).map(item => ({
        _id: item.objectId,
        openid: item.openid,
        nickName: item.nickName,
        identityType: item.identityType,
        createTime: item.createdAt // LeanCloud使用createdAt而不是createTime
      }));

      const total = result.count || 0;
      const hasMore = skip + pageSize < total;

      return {
        success: true,
        data: {
          likes: likes,
          hasMore: hasMore,
          total: total
        }
      };
    } catch (error) {
      console.error('获取点赞记录失败:', error);
      return {
        success: false,
        error: error.message || '获取点赞记录失败'
      };
    }
  }

  // 获取评论数量（为未来扩展准备）
  async getCommentCount() {
    try {
      const result = await this.request('GET', '/classes/comments?count=1&limit=0');
      return {
        success: true,
        data: {
          commentCount: result.count || 0
        }
      };
    } catch (error) {
      console.error('获取评论数量失败:', error);
      return {
        success: false,
        error: error.message || '获取评论数量失败'
      };
    }
  }

  // 添加评论（为未来扩展准备）
  async addComment(openid, content, nickName = '匿名用户', identityType = 'anonymous', avatarUrl = '') {
    try {
      const commentData = {
        openid: openid,
        content: content.trim(),
        nickName: nickName.trim() || '匿名用户',
        identityType: identityType,
        avatarUrl: avatarUrl
      };

      const result = await this.request('POST', '/classes/comments', commentData);
      
      return {
        success: true,
        data: {
          id: result.objectId,
          message: '评论发布成功'
        }
      };
    } catch (error) {
      console.error('添加评论失败:', error);
      return {
        success: false,
        error: error.message || '添加评论失败'
      };
    }
  }

  // 获取评论列表（为未来扩展准备）
  async getComments(page = 1, pageSize = 20) {
    try {
      const skip = (page - 1) * pageSize;
      const queryParams = {
        order: '-createdAt',
        skip: skip.toString(),
        limit: pageSize.toString(),
        count: '1'
      };

      const queryString = this.buildQueryString(queryParams);
      const result = await this.request('GET', `/classes/comments?${queryString}`);
      
      // 转换数据格式
      const comments = (result.results || []).map(item => ({
        id: item.objectId,
        openid: item.openid,
        content: item.content,
        nickName: item.nickName,
        identityType: item.identityType,
        avatarUrl: item.avatarUrl || '',
        createTime: item.createdAt
      }));

      const total = result.count || 0;
      const hasMore = skip + pageSize < total;

      return {
        success: true,
        data: {
          comments: comments,
          hasMore: hasMore,
          total: total
        }
      };
    } catch (error) {
      console.error('获取评论列表失败:', error);
      return {
        success: false,
        error: error.message || '获取评论列表失败'
      };
    }
  }
}

// 创建单例实例
const leanCloudAPI = new LeanCloudAPI();

module.exports = leanCloudAPI; 