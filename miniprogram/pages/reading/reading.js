const app = getApp();

Page({
  data: {
    allChapters: [], // 所有章节数据
    visibleChapters: [], // 当前可见的章节
    currentChapterIndex: 0, // 当前章节索引
    totalChapters: 0, // 总章节数
    hasMore: true, // 是否还有更多章节
    scrollIntoView: '', // 滚动到指定元素
    showChapterPopup: false, // 是否显示章节选择弹窗
    useCalligraphyStyle: true, // 是否使用书法风格 (温润古韵)
    
    // 优化配置 - 预加载所有章节以提升性能
    visibleCount: 50, // 一次加载的章节数量（足够大以加载所有章节）
    loadBuffer: 5, // 缓冲章节数量
  },

  onLoad(options) {
    console.log('Reading page loaded with options:', options);
    
    // 加载章节数据
    this.loadChapterData();
    
    // 如果有指定章节ID，跳转到该章节
    if (options.chapterId) {
      const chapterId = parseInt(options.chapterId);
      this.jumpToChapterById(chapterId);
    }
  },

  // 加载章节数据
  loadChapterData() {
    try {
      // 数据已经在app.js中预加载，直接使用
      const chaptersData = app.globalData.chaptersData;
      
      if (!chaptersData || chaptersData.length === 0) {
        throw new Error('章节数据为空');
      }
      
      // 处理章节数据，将content分割成段落
      const processedChapters = chaptersData.map(chapter => {
        const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());
        console.log(`Chapter ${chapter.id} paragraphs:`, paragraphs.length);
        return {
          ...chapter,
          paragraphs: paragraphs
        };
      });
      
      this.setData({
        allChapters: processedChapters,
        totalChapters: processedChapters.length,
        visibleChapters: processedChapters, // 直接加载所有章节
        hasMore: false // 已加载完所有章节
      });
      
      console.log('Chapters loaded:', processedChapters.length);
    } catch (error) {
      console.error('Failed to load chapters:', error);
      wx.showToast({
        title: '章节加载失败',
        icon: 'none'
      });
    }
  },


  // 滚动事件处理
  onScroll(event) {
    const { scrollTop } = event.detail;
    
    // 更新当前章节索引
    this.updateCurrentChapter(scrollTop);
  },

  // 更新当前章节
  updateCurrentChapter(scrollTop) {
    const query = wx.createSelectorQuery().in(this);
    
    query.selectAll('.chapter-item').boundingClientRect((rects) => {
      if (rects && rects.length > 0) {
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          if (rect.top <= 100 && rect.bottom > 100) {
            const chapterIndex = i;
            if (chapterIndex !== this.data.currentChapterIndex) {
              this.setData({
                currentChapterIndex: chapterIndex
              });
            }
            break;
          }
        }
      }
    }).exec();
  },

  // 跳转到指定章节
  jumpToChapterById(chapterId) {
    const chapterIndex = this.data.allChapters.findIndex(chapter => chapter.id === chapterId);
    if (chapterIndex !== -1) {
      // 所有章节已预加载，直接滚动到目标章节
      this.setData({
        scrollIntoView: `chapter-${chapterId}`,
        currentChapterIndex: chapterIndex
      });
    }
  },

  // 上一章
  gotoPrevChapter() {
    if (this.data.currentChapterIndex > 0) {
      const prevChapterIndex = this.data.currentChapterIndex - 1;
      const prevChapter = this.data.allChapters[prevChapterIndex];
      this.jumpToChapterById(prevChapter.id);
      
      // 触觉反馈
      wx.vibrateShort({ type: 'light' });
    }
  },

  // 下一章
  gotoNextChapter() {
    if (this.data.currentChapterIndex < this.data.totalChapters - 1) {
      const nextChapterIndex = this.data.currentChapterIndex + 1;
      const nextChapter = this.data.allChapters[nextChapterIndex];
      this.jumpToChapterById(nextChapter.id);
      
      // 触觉反馈
      wx.vibrateShort({ type: 'light' });
    }
  },

  // 显示章节列表
  showChapterList() {
    this.setData({
      showChapterPopup: true
    });
    
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  // 隐藏章节列表
  hideChapterList() {
    this.setData({
      showChapterPopup: false
    });
  },

  // 跳转到章节
  jumpToChapter(event) {
    const chapterId = event.currentTarget.dataset.chapterId;
    this.jumpToChapterById(chapterId);
    this.hideChapterList();
    
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  onReady() {
    console.log('Reading page ready');
  },

  onShow() {
    // 显示TabBar
    wx.showTabBar();
    
    // 检查是否有通过全局数据传递的章节ID
    const app = getApp();
    if (app.globalData.selectedChapterId) {
      const chapterId = app.globalData.selectedChapterId;
      app.globalData.selectedChapterId = null; // 清除标记
      this.jumpToChapterById(chapterId);
    }
  },

  onHide() {
    // 隐藏章节选择弹窗
    this.setData({
      showChapterPopup: false
    });
  },



  onUnload() {
    console.log('Reading page unload');
  },

  onPullDownRefresh() {
    // 重新加载章节数据
    this.loadChapterData();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    // 所有章节已预加载，无需额外处理
  },

  onShareAppMessage() {
    const currentChapter = this.data.allChapters[this.data.currentChapterIndex];
    return {
      title: `父親母親一大家 - ${currentChapter ? currentChapter.title : '家族传记'}`,
      path: `/pages/reading/reading?chapterId=${currentChapter ? currentChapter.id : 1}`,
      imageUrl: '/assets/share-reading.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '父親母親一大家 - 家族传记阅读',
      imageUrl: '/assets/share-reading.jpg'
    };
  }
});