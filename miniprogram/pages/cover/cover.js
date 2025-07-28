const app = getApp();

Page({
  data: {
    // 页面数据
  },

  onLoad(options) {
    // 页面加载时执行
    // console.log('Cover page loaded');
    
    // 设置导航栏样式
    wx.setNavigationBarTitle({
      title: '父親母親一大家'
    });
    
    // 预加载章节数据
    this.preloadChapterData();
  },

  onShow() {
    // 页面显示时执行
    // 隐藏tabBar
    wx.hideTabBar();
  },

  // 预加载章节数据
  preloadChapterData() {
    try {
      // 数据已经在app.js中预加载，直接使用
      const chaptersData = app.globalData.chaptersData;
      if (chaptersData && chaptersData.length > 0) {
        // console.log('Chapters data preloaded:', chaptersData.length + ' chapters');
      } else {
        throw new Error('章节数据为空');
      }
    } catch (error) {
      console.error('Failed to preload chapters data:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
    }
  },

  // 开始阅读按钮点击事件
  startReading() {
    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 设置全局标记，告诉reading页面需要跳转到第一章
    app.globalData.shouldJumpToFirstChapter = true;

    // 跳转到阅读页面
    wx.switchTab({
      url: '/pages/reading/reading',
      success: () => {
        // console.log('Navigate to reading page');
      },
      fail: (error) => {
        console.error('Failed to navigate to reading page:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onReady() {
    // 页面初次渲染完成
  },

  onHide() {
    // 页面隐藏
  },

  onUnload() {
    // 页面卸载
  },

  onPullDownRefresh() {
    // 用户下拉刷新
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    // 页面上拉触底事件
  },

  onShareAppMessage() {
    return {
      title: '父親母親一大家 - 家族传记',
      path: '/pages/cover/cover',
      imageUrl: '/assets/share-cover.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '父親母親一大家 - 用文字记录家族记忆',
      imageUrl: '/assets/share-cover.jpg'
    };
  }
});