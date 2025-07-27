const app = getApp();

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
    showIdentitySelector: false, // 控制身份选择区域显示
    
    // 提交状态
    submitting: false,
    
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
    
    // 加载初始数据
    this.loadLikeCount();
    this.loadLikes();
  },

  // 加载点赞数量
  async loadLikeCount() {
    this.setData({
      loadingLikeCount: true
    });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'feedback',
        data: { action: 'getLikeCount' }
      });
      
      if (result.result.success) {
        this.setData({
          likeCount: result.result.data.likeCount,
          liked: false, // 始终允许点赞
          loadingLikeCount: false
        });
      } else {
        throw new Error(result.result.error);
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

  // 显示身份选择器
  showIdentitySelector() {
    this.setData({
      showIdentitySelector: true
    });
  },

  // 隐藏身份选择器
  hideIdentitySelector() {
    this.setData({
      showIdentitySelector: false
    });
  },

  // 身份类型选择
  onIdentityTypeChange(event) {
    const identityType = event.currentTarget.dataset.type;
    this.setData({ 
      identityType: identityType 
    });
  },

  // 自定义昵称输入
  onCustomNicknameInput(event) {
    this.setData({
      customNickname: event.detail.value
    });
  },

  // 检查身份信息是否有效
  checkValidIdentity() {
    return this.data.identityType === 'anonymous' || 
           (this.data.identityType === 'custom' && this.data.customNickname.trim().length > 0);
  },

  // 确认点赞
  async confirmLike() {
    // 验证身份信息
    if (this.data.identityType === 'custom' && !this.data.customNickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    // 隐藏身份选择器
    this.hideIdentitySelector();

    // 执行点赞
    await this.handleLike();
  },

  // 处理点赞
  async handleLike() {
    // 先更新UI，提供即时反馈
    const originalLikeCount = this.data.likeCount;
    const newLikeCount = this.data.likeCount + 1;
    this.setData({
      likeCount: newLikeCount,
      showLikeAnimation: true,
      submitting: true
    });

    // 触觉反馈
    wx.vibrateShort({ type: 'light' });

    // 隐藏动画
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

      const result = await wx.cloud.callFunction({
        name: 'feedback',
        data: { 
          action: 'addLike',
          nickName: nickName,
          identityType: this.data.identityType
        }
      });
      
      if (result.result.success) {
        // 使用服务器返回的真实数量
        this.setData({
          likeCount: result.result.data.likeCount,
          submitting: false
        });
        
        wx.showToast({
          title: '点赞成功',
          icon: 'success',
          duration: 1500
        });

        // 立即添加新的点赞记录到列表顶部，无需等待服务器
        const newLike = {
          id: 'temp_' + Date.now(),
          nickName: nickName,
          identityType: this.data.identityType,
          createTime: '刚刚'
        };
        
        // 将新记录插入到列表开头，并保持最多10条
        const updatedLikes = [newLike, ...this.data.likes].slice(0, 10);
        this.setData({
          likes: updatedLikes
        });

        // 异步刷新数据确保数据同步
        setTimeout(() => {
          this.loadLikes();
        }, 1000);
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('Failed to handle like:', error);
      // 恢复原状态
      this.setData({
        likeCount: originalLikeCount,
        submitting: false
      });
      
      wx.showToast({
        title: error.message || '点赞失败，请重试',
        icon: 'none'
      });
    }
  },

  // 加载点赞记录（仅获取最近10条）
  async loadLikes() {
    if (this.data.loadingLikes) return;
    
    this.setData({
      loadingLikes: true
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'feedback',
        data: { 
          action: 'getLikes',
          page: 1,
          pageSize: this.data.pageSize
        }
      });
      
      if (result.result.success) {
        const { likes } = result.result.data;
        
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
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('Failed to load likes:', error);
      this.setData({
        loadingLikes: false
      });
      
      // 如果首次加载失败，显示示例数据
      if (this.data.likes.length === 0) {
        const mockLikes = [
          {
            id: 'demo1',
            nickName: '家族后人',
            createTime: '刚刚'
          },
          {
            id: 'demo2',
            nickName: '匿名用户',
            createTime: '5分钟前'
          }
        ];
        
        this.setData({
          likes: mockLikes
        });
      }
    }
  },

  // 格式化时间显示
  formatTime(createTime) {
    const now = new Date();
    const likeTime = new Date(createTime);
    const diff = now - likeTime;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      // 超过7天显示具体日期
      const year = likeTime.getFullYear();
      const month = String(likeTime.getMonth() + 1).padStart(2, '0');
      const day = String(likeTime.getDate()).padStart(2, '0');
      
      if (year === now.getFullYear()) {
        return `${month}-${day}`;
      } else {
        return `${year}-${month}-${day}`;
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

  onShareAppMessage() {
    return {
      title: '父親母親一大家 - 亲友反馈',
      path: '/pages/feedback/feedback',
      imageUrl: '/assets/share-feedback.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '父親母親一大家 - 分享家族故事',
      imageUrl: '/assets/share-feedback.jpg'
    };
  }
});