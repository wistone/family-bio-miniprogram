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

  // 获取点赞记录列表（优化显示策略：优先显示有昵称的记录，确保当前用户匿名记录可见）
  async getLikes(page = 1, pageSize = 10, currentUserIdentifier = null) {
    try {
      let currentUserAnonymousLikes = [];
      
      // 第一步：获取当前用户的所有匿名点赞记录
      if (currentUserIdentifier) {
        const currentUserQueryParams = {
          where: JSON.stringify({ 
            openid: currentUserIdentifier, 
            identityType: 'anonymous' 
          }),
          order: '-createdAt',
          limit: pageSize.toString() // 获取足够多的记录，确保不遗漏
        };
        
        const currentUserQueryString = this.buildQueryString(currentUserQueryParams);
        const currentUserResult = await this.request('GET', `/classes/likes?${currentUserQueryString}`);
        
        if (currentUserResult.results && currentUserResult.results.length > 0) {
          currentUserAnonymousLikes = currentUserResult.results.map(item => ({
            _id: item.objectId,
            openid: item.openid,
            nickName: item.nickName || '匿名用户',
            identityType: item.identityType,
            createTime: item.createdAt,
            isCurrentUser: true // 标记为当前用户
          }));
        }
      }
      
      // 第二步：获取有自定义昵称的记录（identityType = 'custom'）
      const customQueryParams = {
        where: JSON.stringify({ identityType: 'custom' }),
        order: '-createdAt',
        limit: pageSize.toString(),
        count: '1'
      };
      
      const customQueryString = this.buildQueryString(customQueryParams);
      const customResult = await this.request('GET', `/classes/likes?${customQueryString}`);
      
      const customLikes = (customResult.results || []).map(item => ({
        _id: item.objectId,
        openid: item.openid,
        nickName: item.nickName,
        identityType: item.identityType,
        createTime: item.createdAt,
        priority: 1 // 标记为高优先级
      }));

      let allLikes = [];
      const totalCustomCount = customResult.count || 0;
      
      // 第三步：组合记录，优先包含当前用户的所有匿名记录
      if (currentUserAnonymousLikes.length > 0) {
        allLikes = [...currentUserAnonymousLikes];
        
        // 如果当前用户匿名记录 + 自定义昵称记录超过pageSize，截取自定义记录
        const availableSlots = pageSize - currentUserAnonymousLikes.length;
        if (availableSlots > 0) {
          allLikes = [...allLikes, ...customLikes.slice(0, availableSlots)];
        }
      } else {
        allLikes = [...customLikes];
      }
      
      // 第四步：如果记录不够pageSize条，补充其他匿名记录
      if (allLikes.length < pageSize) {
        const remainingCount = pageSize - allLikes.length;
        
        // 构建排除条件：排除当前用户的所有匿名记录（如果存在）
        let whereCondition = { identityType: 'anonymous' };
        if (currentUserIdentifier && currentUserAnonymousLikes.length > 0) {
          whereCondition.openid = { $ne: currentUserIdentifier };
        }
        
        const anonymousQueryParams = {
          where: JSON.stringify(whereCondition),
          order: '-createdAt',
          limit: remainingCount.toString()
        };
        
        const anonymousQueryString = this.buildQueryString(anonymousQueryParams);
        const anonymousResult = await this.request('GET', `/classes/likes?${anonymousQueryString}`);
        
        const anonymousLikes = (anonymousResult.results || []).map(item => ({
          _id: item.objectId,
          openid: item.openid,
          nickName: item.nickName || '匿名用户',
          identityType: item.identityType,
          createTime: item.createdAt,
          priority: 2 // 标记为低优先级
        }));
        
        allLikes = [...allLikes, ...anonymousLikes];
      }
      
      // 第五步：统一按时间降序排序（最新的在前）
      allLikes.sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
      });
      
      // 移除内部标记，保持接口一致性
      const finalLikes = allLikes.map(item => {
        const { priority, isCurrentUser, ...like } = item;
        return like;
      });

      // 获取总记录数（用于分页）
      const totalCountResult = await this.request('GET', '/classes/likes?count=1&limit=0');
      const total = totalCountResult.count || 0;
      const hasMore = page * pageSize < total;

      return {
        success: true,
        data: {
          likes: finalLikes.slice(0, pageSize), // 确保不超过pageSize
          hasMore: hasMore,
          total: total,
          customCount: totalCustomCount // 返回自定义昵称记录数量，用于调试
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