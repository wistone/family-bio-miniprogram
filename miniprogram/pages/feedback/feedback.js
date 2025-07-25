const app = getApp();

Page({
  data: {
    // 点赞相关
    likeCount: 0, // 初始值，等待从云端加载
    liked: false,
    showLikeAnimation: false,
    loadingLikeCount: true, // 加载状态
    
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

  // 处理点赞
  async handleLike() {
    // 先更新UI，提供即时反馈
    const originalLikeCount = this.data.likeCount;
    const newLikeCount = this.data.likeCount + 1;
    this.setData({
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
      const result = await wx.cloud.callFunction({
        name: 'feedback',
        data: { action: 'addLike' }
      });
      
      if (result.result.success) {
        // 使用服务器返回的真实数量
        this.setData({
          likeCount: result.result.data.likeCount
        });
        
        wx.showToast({
          title: '点赞成功',
          icon: 'success'
        });
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('Failed to handle like:', error);
      // 恢复原状态
      this.setData({
        likeCount: originalLikeCount
      });
      
      wx.showToast({
        title: error.message || '点赞失败，请重试',
        icon: 'none'
      });
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
      const result = await wx.cloud.callFunction({
        name: 'feedback',
        data: { 
          action: 'getComments',
          page: page,
          pageSize: this.data.pageSize
        }
      });
      
      if (result.result.success) {
        const { comments, hasMore } = result.result.data;
        
        // 格式化时间显示
        const formattedComments = comments.map(comment => ({
          ...comment,
          id: comment._id,
          createTime: this.formatTime(comment.createTime)
        }));
        
        this.setData({
          comments: loadMore ? [...this.data.comments, ...formattedComments] : formattedComments,
          hasMoreComments: hasMore,
          currentPage: page,
          loadingComments: false
        });
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.setData({
        loadingComments: false
      });
      
      // 如果是首次加载失败，显示示例数据
      if (!loadMore && this.data.comments.length === 0) {
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
          }
        ];
        
        this.setData({
          comments: mockComments,
          hasMoreComments: false
        });
      }
      
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
      // 获取用户信息
      const userInfo = app.globalData.userInfo;
      
      const result = await wx.cloud.callFunction({
        name: 'feedback',
        data: {
          action: 'addComment',
          content: content,
          nickName: userInfo ? userInfo.nickName : '匿名用户',
          avatarUrl: userInfo ? userInfo.avatarUrl : ''
        }
      });
      
      if (result.result.success) {
        // 创建新评论对象用于立即显示
        const newComment = {
          id: result.result.data.id,
          nickName: userInfo ? userInfo.nickName : '匿名用户',
          avatarUrl: userInfo ? userInfo.avatarUrl : '',
          content: content,
          createTime: '刚刚'
        };
        
        // 将新评论插入到评论列表开头
        const updatedComments = [newComment, ...this.data.comments];
        
        // 成功提交，清空输入框并更新评论列表
        this.setData({
          commentText: '',
          submitting: false,
          comments: updatedComments
        });
        
        wx.showToast({
          title: '留言发布成功',
          icon: 'success'
        });
        
        // 触觉反馈
        wx.vibrateShort({ type: 'light' });
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('Failed to submit comment:', error);
      this.setData({
        submitting: false
      });
      
      wx.showToast({
        title: error.message || '发布失败，请重试',
        icon: 'none'
      });
    }
  },

  // 格式化时间显示
  formatTime(createTime) {
    const now = new Date();
    const commentTime = new Date(createTime);
    const diff = now - commentTime;
    
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
      const year = commentTime.getFullYear();
      const month = String(commentTime.getMonth() + 1).padStart(2, '0');
      const day = String(commentTime.getDate()).padStart(2, '0');
      
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