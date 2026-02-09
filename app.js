// app.js
App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'eduction-cloud1-3gmwfya26924141a', // 替换为你的云环境ID
        traceUser: true,
      });
    }

    // 检查本地登录状态
    this.checkLocalLogin();
  },

  globalData: {
    userInfo: null,
    openid: null,
    isLogin: false
  },

  // 检查本地登录状态
  checkLocalLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = openid;
      this.globalData.isLogin = true;
      console.log('本地登录状态有效');
    }
  },

  // 更新用户信息
  setUserInfo(userInfo, openid) {
    this.globalData.userInfo = userInfo;
    this.globalData.openid = openid;
    this.globalData.isLogin = true;
    
    // 存储到本地
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('openid', openid);
  },

  // 清除登录状态
  clearLogin() {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    this.globalData.isLogin = false;
    
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('openid');
  }
});