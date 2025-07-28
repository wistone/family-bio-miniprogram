const app = getApp();
const leanCloudAPI = require('../../utils/leancloud.js');

Page({
  data: {
    // 点赞相关
    likeCount: 0, // 初始值，等待从云端加载
    liked: false,
    showLikeAnimation: false,
    loadingLikeCount: true, // 加载状态
    
    // 点赞记录相关
    likes: [],
    loadingLikes: false,
    
    // 身份选择相关
    identityType: 'anonymous', // 'custom', 'anonymous'
    customNickname: '',
    showIdentitySelector: false, // 控制身份选择弹窗显示
    
    // 提交状态
    submitting: false,
    canSubmit: false, // 表单提交状态
    
    // 分页参数
    pageSize: 10, // 改为10条记录
    currentPage: 1,
  },

  onLoad(options) {
    console.log('Feedback page loaded');
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '亲友反馈'
    });
    
    // 初始化用户标识
    this.initUserIdentifier();
    
    // 加载初始数据
    this.loadLikeCount();
    this.loadLikes();
    this.updateSubmitState(); // 初始化提交状态
  },

  // 初始化用户唯一标识
  async initUserIdentifier() {
    try {
      // 尝试从本地存储获取用户标识
      let userIdentifier = wx.getStorageSync('userIdentifier');
      
      if (!userIdentifier) {
        // 如果没有，生成一个基于时间戳和随机数的标识
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        userIdentifier = `user_${timestamp}_${random}`;
        
        // 保存到本地存储
        wx.setStorageSync('userIdentifier', userIdentifier);
      }
      
      this.userIdentifier = userIdentifier;
      console.log('用户标识:', userIdentifier);
    } catch (error) {
      console.error('初始化用户标识失败:', error);
      // 使用临时标识
      this.userIdentifier = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },

  // 加载点赞数量
  async loadLikeCount() {
    this.setData({
      loadingLikeCount: true
    });
    
    try {
      const result = await leanCloudAPI.getLikeCount();
      
      if (result.success) {
        this.setData({
          likeCount: result.data.likeCount,
          liked: false, // 始终允许点赞
          loadingLikeCount: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to load like count:', error);
      // 不使用默认值，显示加载失败状态
      this.setData({
        loadingLikeCount: false,
        likeCount: 0 // 保持为0，表示加载失败
      });
      
      wx.showToast({
        title: '点赞数加载失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 获取要显示的点赞按钮文本
  getLikeButtonText() {
    if (this.data.submitting) {
      return '提交中...';
    }
    
    switch (this.data.identityType) {
      case 'custom':
        const nickname = this.data.customNickname.trim();
        return nickname ? `${nickname} 点赞` : '点赞';
      case 'anonymous':
      default:
        return '匿名点赞';
    }
  },

  // 点赞功能
  async onLike() {
    if (this.data.submitting) {
      return;
    }

    // 检查身份信息
    if (this.data.identityType === 'custom' && !this.data.customNickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    this.setData({
      submitting: true,
      showLikeAnimation: true
    });
    
    // 触发震动反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 延迟一下让动画效果更明显
    setTimeout(() => {
      this.setData({
        showLikeAnimation: false
      });
    }, 600);

    try {
      // 根据身份类型获取昵称
      let nickName = '匿名用户';
      if (this.data.identityType === 'custom') {
        nickName = this.data.customNickname.trim();
      }

      const result = await leanCloudAPI.addLike(
        this.userIdentifier, 
        nickName, 
        this.data.identityType
      );
      
      if (result.success) {
        // 使用服务器返回的真实数量
        this.setData({
          likeCount: result.data.likeCount,
          submitting: false
        });
        
        wx.showToast({
          title: '点赞成功',
          icon: 'success',
          duration: 1500
        });

        // 刷新点赞记录列表
        this.loadLikes();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('点赞失败:', error);
      this.setData({
        submitting: false
      });
      
      wx.showToast({
        title: error.message || '点赞失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 身份类型变更
  onIdentityTypeChange(event) {
    const identityType = event.currentTarget.dataset.type;
    this.setData({
      identityType: identityType
    });
    this.updateSubmitState();
  },

  // 自定义昵称输入
  onCustomNicknameInput(event) {
    this.setData({
      customNickname: event.detail.value
    });
    this.updateSubmitState();
  },

  // 显示身份选择弹窗
  showIdentitySelector() {
    // 触发震动反馈
    wx.vibrateShort({
      type: 'light'
    });
    
    this.setData({
      showIdentitySelector: true
    });
  },

  // 隐藏身份选择弹窗
  hideIdentitySelector() {
    this.setData({
      showIdentitySelector: false
    });
  },

  // 确认点赞
  async confirmLike() {
    // 检查身份信息
    if (this.data.identityType === 'custom' && !this.data.customNickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    // 先隐藏弹窗
    this.hideIdentitySelector();
    
    // 执行点赞操作
    await this.onLike();
  },

  // 检查是否可以提交
  checkCanSubmit() {
    if (this.data.identityType === 'custom') {
      return this.data.customNickname.trim().length > 0;
    }
    return true; // 匿名用户总是可以提交
  },

  // 更新提交状态
  updateSubmitState() {
    const canSubmit = this.checkCanSubmit();
    this.setData({
      canSubmit: canSubmit
    });
  },

  // 加载点赞记录
  async loadLikes() {
    this.setData({
      loadingLikes: true
    });

    try {
      const result = await leanCloudAPI.getLikes(1, this.data.pageSize);
      
      if (result.success) {
        const { likes, customCount } = result.data;
        
        // 调试信息：显示记录分布
        console.log(`📊 点赞记录: 总共 ${likes.length} 条，其中有昵称 ${customCount} 条`);
        
        // 格式化时间显示
        const formattedLikes = likes.map(like => ({
          ...like,
          id: like._id,
          createTime: this.formatTime(like.createTime)
        }));
        
        this.setData({
          likes: formattedLikes,
          loadingLikes: false
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('加载点赞记录失败:', error);
      this.setData({
        loadingLikes: false
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 格式化时间显示
  formatTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) {
      return '刚刚';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}小时前`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days < 30) {
        return `${days}天前`;
      } else {
        // 超过30天显示具体日期
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const currentYear = now.getFullYear();
        
        if (year === currentYear) {
          return `${month}月${day}日`;
        } else {
          return `${year}年${month}月${day}日`;
        }
      }
    }
  },

  onReady() {
    console.log('Feedback page ready');
  },

  onShow() {
    console.log('Feedback page show');
    
    // 确保tabBar显示
    wx.showTabBar();
  },

  onHide() {
    console.log('Feedback page hide');
  },

  onUnload() {
    console.log('Feedback page unload');
  },

  onPullDownRefresh() {
    console.log('Feedback page pull down refresh');
    
    // 重新加载数据
    this.loadLikeCount();
    this.loadLikes();
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    console.log('Feedback page reach bottom');
    // 不再需要加载更多，因为只显示最近10条记录
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '家族历史记录 - 欢迎亲友留言',
      path: '/pages/feedback/feedback',
      imageUrl: '/assets/share-cover.png' // 如果有分享图片的话
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '家族历史记录 - 欢迎亲友留言',
      imageUrl: '/assets/share-cover.png' // 如果有分享图片的话
    };
  }
});