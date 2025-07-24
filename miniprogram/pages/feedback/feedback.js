const app = getApp();

Page({
  data: {
    // 点赞相关
    likeCount: 128, // 默认点赞数
    liked: false,
    showLikeAnimation: false,
    
    // 评论相关
    commentText: '',
    comments: [],
    loadingComments: false,
    hasMoreComments: false,
    submitting: false,
    
    // 分页参数
    pageSize: 20,
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
    this.loadComments();
  },

  // 加载点赞数量
  async loadLikeCount() {
    try {
      // 模拟云函数调用（实际项目中会调用真实的云函数）
      // const result = await wx.cloud.callFunction({
      //   name: 'like',
      //   data: { action: 'get' }
      // });
      
      // 使用本地存储模拟
      const storedLikeCount = wx.getStorageSync('likeCount') || 128;
      const userLiked = wx.getStorageSync('userLiked') || false;
      
      this.setData({
        likeCount: storedLikeCount,
        liked: userLiked
      });
    } catch (error) {
      console.error('Failed to load like count:', error);
      // 使用默认值
      this.setData({
        likeCount: 128,
        liked: false
      });
    }
  },

  // 处理点赞
  async handleLike() {
    if (this.data.liked) {
      // 已经点赞过，不能重复点赞
      wx.showToast({
        title: '您已经点过赞了',
        icon: 'none'
      });
      return;
    }

    // 先更新UI，提供即时反馈
    const newLikeCount = this.data.likeCount + 1;
    this.setData({
      liked: true,
      likeCount: newLikeCount,
      showLikeAnimation: true
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
      // 保存到本地存储（实际项目中会调用云函数）
      wx.setStorageSync('likeCount', newLikeCount);
      wx.setStorageSync('userLiked', true);
    } catch (error) {
      console.error('Failed to handle like:', error);
    }
  },

  // 加载评论
  async loadComments(loadMore = false) {
    if (this.data.loadingComments) return;
    
    this.setData({
      loadingComments: true
    });

    const page = loadMore ? this.data.currentPage + 1 : 1;

    try {
      // 模拟评论数据（实际项目中会从云函数获取）
      const mockComments = [
        {
          id: 'demo1',
          nickName: '家族后人',
          avatarUrl: '',
          content: '看到这个家族故事很感动，我们应该更多地记录和传承这些珍贵的回忆。',
          createTime: '刚刚'
        },
        {
          id: 'demo2',
          nickName: '读者',
          avatarUrl: '',
          content: '父母的坚韧和奋斗精神值得我们学习，这种家族传记很有意义。',
          createTime: '5分钟前'
        },
        {
          id: 'demo3',
          nickName: '石家亲戚',
          avatarUrl: '',
          content: '这些故事让我想起了自己的祖辈，每个家庭都有着不平凡的历史。',
          createTime: '1小时前'
        }
      ];
      
      this.setData({
        comments: loadMore ? [...this.data.comments, ...mockComments] : mockComments,
        hasMoreComments: false, // 示例数据没有更多
        currentPage: page,
        loadingComments: false
      });
      
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.setData({
        loadingComments: false
      });
      
      if (loadMore) {
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      }
    }
  },

  // 加载更多评论
  loadMoreComments() {
    this.loadComments(true);
  },

  // 评论输入处理
  onCommentInput(event) {
    this.setData({
      commentText: event.detail.value
    });
  },

  // 提交评论
  async submitComment() {
    const content = this.data.commentText.trim();
    
    if (!content) {
      wx.showToast({
        title: '请输入留言内容',
        icon: 'none'
      });
      return;
    }

    this.setData({
      submitting: true
    });

    try {
      // 模拟提交评论（实际项目中会调用云函数）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 成功提交，清空输入框并刷新评论列表
      this.setData({
        commentText: '',
        submitting: false
      });
      
      wx.showToast({
        title: '留言发布成功',
        icon: 'success'
      });
      
      // 重新加载评论列表
      this.loadComments();
      
      // 触觉反馈
      wx.vibrateShort({ type: 'light' });
      
    } catch (error) {
      console.error('Failed to submit comment:', error);
      this.setData({
        submitting: false
      });
      
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      });
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
    this.loadComments();
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    console.log('Feedback page reach bottom');
    
    // 加载更多评论
    if (this.data.hasMoreComments) {
      this.loadMoreComments();
    }
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