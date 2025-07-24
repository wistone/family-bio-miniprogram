const app = getApp();

Page({
  data: {
    chapters: [], // 章节列表
    loading: true, // 加载状态
  },

  onLoad(options) {
    console.log('Catalog page loaded');
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '阅读目录'
    });
    
    // 加载章节数据
    this.loadChapters();
  },

  // 加载章节数据
  loadChapters() {
    this.setData({ loading: true });
    
    try {
      // 数据已经在app.js中预加载，直接使用
      const chaptersData = app.globalData.chaptersData;
      
      if (!chaptersData || chaptersData.length === 0) {
        throw new Error('章节数据为空');
      }
      
      // 处理章节数据，添加预览文本和阅读时间
      const processedChapters = chaptersData.map((chapter, index) => {
        const content = chapter.content || '';
        const wordCount = content.length;
        const readTime = Math.max(1, Math.ceil(wordCount / 300)); // 假设每分钟阅读300字
        
        // 提取前50个字符作为预览
        let preview = content.substring(0, 50);
        if (content.length > 50) {
          preview += '...';
        }
        
        return {
          ...chapter,
          preview,
          wordCount,
          readTime
        };
      });
      
      this.setData({
        chapters: processedChapters,
        loading: false
      });
      
      console.log('Chapters loaded for catalog:', processedChapters.length);
      
    } catch (error) {
      console.error('Failed to load chapters:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '章节加载失败',
        icon: 'none'
      });
    }
  },

  // 导航到指定章节
  navigateToChapter(event) {
    const chapterId = event.currentTarget.dataset.chapterId;
    
    if (!chapterId) {
      console.error('Chapter ID not found');
      return;
    }
    
    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
    
    // 跳转到阅读页面，并传递章节ID
    wx.navigateTo({
      url: `/pages/reading/reading?chapterId=${chapterId}`,
      success: () => {
        console.log('Navigate to reading page with chapter:', chapterId);
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
    console.log('Catalog page ready');
  },

  onShow() {
    console.log('Catalog page show');
    
    // 确保tabBar显示
    wx.showTabBar();
  },

  onHide() {
    console.log('Catalog page hide');
  },

  onUnload() {
    console.log('Catalog page unload');
  },

  onPullDownRefresh() {
    console.log('Catalog page pull down refresh');
    
    // 重新加载章节数据
    this.loadChapters();
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    console.log('Catalog page reach bottom');
    // 目录页暂时不需要分页加载
  },

  onShareAppMessage() {
    return {
      title: '父親母親一大家 - 章节目录',
      path: '/pages/catalog/catalog',
      imageUrl: '/assets/share-catalog.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '父親母親一大家 - 家族传记目录',
      imageUrl: '/assets/share-catalog.jpg'
    };
  }
});