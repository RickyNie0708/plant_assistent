// pages/index/index.js
Page({
  data: {
    // 轮播图数据
    swiperList: [
      {
        id: 1,
        title: '一花一世界',
        desc: '每片叶子都在诉说着生命的故事',
        bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        linkType: 'plantDB'
      },
      {
        id: 2,
        title: '春种一粒粟',
        desc: '从种子到绽放的奇迹旅程',
        bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        linkType: 'record'
      },
      {
        id: 3,
        title: '绿意生活家',
        desc: '让绿色成为日常的诗篇',
        bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        linkType: 'community'
      }
    ],
    // 功能卡片数据
    functionCards: [
      {
        id: 1,
        title: '时光手账',
        desc: '记录每一刻的生长',
        icon: '📅',
        color: 'linear-gradient(135deg, #667eea, #764ba2)',
        page: 'calendar',
        size: 'large'
      },
      {
        id: 2,
        title: '成长印记',
        desc: '',
        icon: '🌱',
        color: 'linear-gradient(135deg, #f093fb, #f5576c)',
        page: 'record',
        size: 'small'
      },
      {
        id: 3,
        title: '绿意社区',
        desc: '',
        icon: '👥',
        color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        page: 'community',
        size: 'small'
      },
      {
        id: 4,
        title: '植物百科',
        desc: '了解每一株生命',
        icon: '📚',
        color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
        page: 'plantdb',
        size: 'large'
      },
      {
        id: 5,
        title: '智能助手',
        desc: '解答你的养护困惑',
        icon: '✨',
        color: 'linear-gradient(135deg, #fa709a, #fee140)',
        page: 'assistant',
        size: 'full'
      }
    ],
    // 诗意提示
    dailyTips: [
      '今日小美好：为你的绿植说一句鼓励的话',
      '植物不说话，却懂得倾听你的心声',
      '每一滴水都饱含生命的祝福',
      '让绿色成为生活的诗行',
      '养护植物，也是滋养自己的心灵'
    ],
    currentTip: '',
    // 天气信息
    weatherInfo: {
      icon: '🌤️',
      text: '宜养护'
    },
    // 用户信息
    userInfo: null,
    // 当前日期
    currentDate: ''
  },

  onLoad() {
    // 初始化数据
    this.initData();
    
    // 检查登录状态
    this.checkLogin();
    
    // 获取用户信息
    this.getUserInfo();
  },

  onShow() {
    // 每次显示页面时更新提示
    this.setDailyTip();
  },

  // 初始化数据
  initData() {
    // 设置每日不同的诗意提示
    this.setDailyTip();
    
    // 设置当前日期
    this.setCurrentDate();
    
    // 获取天气信息（模拟）
    this.getWeatherInfo();
  },

  // 设置每日诗意提示
  setDailyTip() {
    const today = new Date().getDate();
    const index = today % this.data.dailyTips.length;
    this.setData({
      currentTip: this.data.dailyTips[index]
    });
  },

  // 设置当前日期
  setCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    
    this.setData({
      currentDate: `${year}年${month}月${day}日 星期${weekDay}`
    });
  },

  // 获取天气信息（模拟数据）
  getWeatherInfo() {
    const weatherOptions = [
      { icon: '🌤️', text: '宜养护' },
      { icon: '🌧️', text: '宜浇水' },
      { icon: '☀️', text: '需防晒' },
      { icon: '💨', text: '宜通风' },
      { icon: '🌡️', text: '需保温' }
    ];
    const randomIndex = Math.floor(Math.random() * weatherOptions.length);
    this.setData({
      weatherInfo: weatherOptions[randomIndex]
    });
  },

  

  // 检查登录状态
  // 检查登录状态
checkLogin() {
  const token = wx.getStorageSync('userToken');
  
  // 添加一个标记，防止重复提示
  const hasPrompted = wx.getStorageSync('loginPrompted');
  
  if (!token && !hasPrompted) {
    console.log('用户未登录，显示登录提示');
    
    // 立即设置标记，防止重复提示
    wx.setStorageSync('loginPrompted', true);
    
    // 使用短延时确保页面渲染完成
    setTimeout(() => {
      wx.showModal({
        title: '欢迎来到种下小美好 🌱',
        content: '登录后可以记录植物生长、参与社区交流哦~',
        confirmText: '立即登录',
        cancelText: '先逛逛',
        success: (res) => {
          if (res.confirm) {
            console.log('用户选择登录，开始跳转...');
            
            // 直接跳转，不使用this引用，避免上下文问题
            this.directLoginJump();
          }
        }
      });
    }, 500);
  }
},

// 直接跳转登录页（避免this问题）
directLoginJump() {
  console.log('直接跳转登录页...');
  
  // 使用最简单直接的跳转方式
  wx.navigateTo({
    url: '/pages/login/login',
    success: () => {
      console.log('跳转成功');
    },
    fail: (err) => {
      console.error('跳转失败，尝试备选方案:', err);
      
      // 备选方案1：使用redirectTo
      wx.redirectTo({
        url: '/pages/login/login',
        fail: (err2) => {
          console.error('redirectTo也失败:', err2);
          
          // 备选方案2：使用reLaunch（最保险）
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      });
    }
  });
},
  

  // 获取用户信息
  getUserInfo() {
    wx.getStorage({
      key: 'userInfo',
      success: (res) => {
        this.setData({
          userInfo: res.data
        });
      },
      fail: () => {
        // 如果没有用户信息，使用默认
        this.setData({
          userInfo: {
            nickName: '绿意生活家',
            avatarUrl: '/images/default-avatar.png'
          }
        });
      }
    });
  },

  // ============= 跳转函数 =============

  // 1. 轮播图跳转
  onSwiperTap(e) {
    const index = e.currentTarget.dataset.index;
    const swiperItem = this.data.swiperList[index];
    
    switch(swiperItem.linkType) {
      case 'plantDB':
        this.goToPlantDB();
        break;
      case 'record':
        this.goToRecord();
        break;
      case 'community':
        this.goToCommunity();
        break;
      default:
        this.goToPlantDB();
    }
  },

  // 2. 功能卡片跳转
  onCardTap(e) {
    const page = e.currentTarget.dataset.page;
    const id = e.currentTarget.dataset.id;
    
    console.log('跳转到页面:', page, '卡片ID:', id);
    
    switch(page) {
      case 'calendar':
        this.goToCalendar();
        break;
      case 'record':
        this.goToRecord();
        break;
      case 'community':
        this.goToCommunity();
        break;
      case 'plantdb':
        this.goToPlantDB();
        break;
      case 'assistant':
        this.goToAssistant();
        break;
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
    }
  },

  // 3. 具体跳转方法
  goToCalendar() {
    console.log('跳转到养花日历...');
    wx.navigateTo({
      url: '/pages/calendar/calendar',
      success: () => {
        console.log('跳转到养花日历成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'error'
        });
      }
    });
  },

  goToRecord() {
    console.log('跳转到养花印记...');
    wx.navigateTo({
      url: '/pages/record/record',
      success: () => {
        console.log('跳转到养花印记成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'error'
        });
      }
    });
  },

  goToCommunity() {
    console.log('跳转到绿意社区（tabBar页面）...');
    
    // 重要：tabBar页面必须使用 switchTab
    wx.switchTab({
      url: '/pages/community/community',
      success: () => {
        console.log('switchTab跳转到社区成功');
      },
      fail: (err) => {
        console.error('switchTab跳转失败:', err);
        
        // 如果 switchTab 失败，可能是页面配置问题
        wx.showModal({
          title: '跳转失败',
          content: `社区页面跳转失败：${err.errMsg || '未知错误'}\n\n请检查：\n1. app.json中的tabBar配置\n2. 社区页面文件是否存在`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },

  goToPlantDB() {
    console.log('跳转到植物百科（tabBar页面）...');
    
    // 重要：tabBar页面必须使用 switchTab
    wx.switchTab({
      url: '/pages/plantdb/plantdb',
      success: () => {
        console.log('switchTab跳转到植物百科成功');
      },
      fail: (err) => {
        console.error('switchTab跳转失败:', err);
        
        // 如果 switchTab 失败，可能是页面配置问题
        wx.showModal({
          title: '跳转失败',
          content: `植物百科页面跳转失败：${err.errMsg || '未知错误'}\n\n请检查：\n1. app.json中的tabBar配置\n2. 植物百科页面文件是否存在`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },

  goToAssistant() {
    console.log('跳转到智能助手...');
    wx.navigateTo({
      url: '/pages/assistant/assistant',
      success: () => {
        console.log('跳转到智能助手成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'error'
        });
      }
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
      success: () => {
        console.log('跳转到登录页面成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'error'
        });
      }
    });
  },

  // 4. 用户头像点击
  onAvatarTap() {
    if (!this.data.userInfo || !this.data.userInfo.nickName) {
      this.goToLogin();
    } else {
      wx.showActionSheet({
        itemList: ['个人中心', '我的收藏', '设置', '退出登录'],
        success: (res) => {
          switch(res.tapIndex) {
            case 0:
              this.goToProfile();
              break;
            case 1:
              this.goToFavorites();
              break;
            case 2:
              this.goToSettings();
              break;
            case 3:
              this.logout();
              break;
          }
        }
      });
    }
  },

  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  goToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userToken');
          wx.removeStorageSync('userInfo');
          this.setData({
            userInfo: null
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 5. 天气信息点击
  onWeatherTap() {
    wx.showModal({
      title: '今日养护建议',
      content: this.getDailyCareTip(),
      showCancel: false,
      confirmText: '知道了'
    });
  },

  getDailyCareTip() {
    const tips = [
      '今天天气不错，适合给植物浇水施肥。',
      '温度适宜，可以给植物适当修剪。',
      '空气干燥，记得给植物叶片喷水保湿。',
      '阳光充足，但要注意避免中午暴晒。',
      '夜间温度较低，记得将植物移到室内。'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  },

  // 6. 诗意提示点击
  onTipTap() {
    wx.showModal({
      title: '今日小美好',
      content: this.data.currentTip,
      showCancel: false,
      confirmText: '记录美好',
      success: (res) => {
        if (res.confirm) {
          this.goToRecord();
        }
      }
    });
  },

  // ============= 其他功能 =============

  // 分享功能
  onShareAppMessage() {
    return {
      title: '种下小美好 · 在柴米油盐中寻找诗意',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '种下小美好',
      query: ''
    };
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    // 更新数据
    this.setDailyTip();
    this.getWeatherInfo();
    this.setCurrentDate();
    
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 页面上拉触底
  onReachBottom() {
    console.log('上拉加载更多');
    // 这里可以加载更多内容
  },

  // 页面滚动
  onPageScroll(e) {
    // console.log('页面滚动', e.scrollTop);
  }
});