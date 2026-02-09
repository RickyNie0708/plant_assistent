// pages/register/register.js
Page({
  data: {
    nickname: '',
    password: '',
    confirmPassword: '',
    agreed: false,
    loading: false,
    passwordMatch: false,
    canSubmit: false,
    
    // 新增状态
    nicknameFocus: false,
    passwordFocus: false,
    confirmPasswordFocus: false,
    showPassword: false,
    showConfirmPassword: false,
    passwordStrength: 0,
    passwordStrengthText: '弱'
  },

  onLoad() {
    console.log('注册页面加载');
  },

  // 用户名相关
  onNicknameInput(e) {
    const nickname = e.detail.value;
    this.setData({ nickname }, () => this.updateSubmitButton());
  },
  
  onNicknameFocus() {
    this.setData({ nicknameFocus: true });
  },
  
  onNicknameBlur() {
    this.setData({ nicknameFocus: false });
  },

  // 密码相关
  onPasswordInput(e) {
    const password = e.detail.value;
    const passwordMatch = password === this.data.confirmPassword;
    const passwordStrength = this.calculatePasswordStrength(password);
    
    this.setData({ 
      password,
      passwordMatch,
      passwordStrength: passwordStrength.level,
      passwordStrengthText: passwordStrength.text
    }, () => this.updateSubmitButton());
  },
  
  onPasswordFocus() {
    this.setData({ passwordFocus: true });
  },
  
  onPasswordBlur() {
    this.setData({ passwordFocus: false });
  },
  
  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  // 确认密码
  onConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value;
    const passwordMatch = confirmPassword === this.data.password;
    this.setData({ 
      confirmPassword,
      passwordMatch
    }, () => this.updateSubmitButton());
  },
  
  onConfirmPasswordFocus() {
    this.setData({ confirmPasswordFocus: true });
  },
  
  onConfirmPasswordBlur() {
    this.setData({ confirmPasswordFocus: false });
  },

  // 计算密码强度（简化版）
  calculatePasswordStrength(password) {
    if (!password || password.length < 6) {
      return { level: 0, text: '太短' };
    }
    
    let hasLetter = /[a-zA-Z]/.test(password);
    let hasNumber = /\d/.test(password);
    let hasSpecial = /[!@#$%^&*]/.test(password);
    
    if (password.length >= 12 && hasLetter && hasNumber && hasSpecial) {
      return { level: 3, text: '强' };
    } else if (password.length >= 8 && hasLetter && hasNumber) {
      return { level: 2, text: '中' };
    } else {
      return { level: 1, text: '弱' };
    }
  },

  // 协议勾选
  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed }, () => this.updateSubmitButton());
  },

  // 更新按钮状态
  updateSubmitButton() {
    const { nickname, password, confirmPassword, agreed } = this.data;
    
    const canSubmit = nickname.length >= 2 && 
                      nickname.length <= 10 &&
                      password.length >= 6 &&
                      password === confirmPassword &&
                      agreed;
    
    this.setData({ canSubmit });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 注册账号（保持原有云开发逻辑）
  async onRegister() {
    if (!this.data.canSubmit || this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      // 验证用户名格式
      if (!/^[\u4e00-\u9fa5a-zA-Z0-9]{2,10}$/.test(this.data.nickname)) {
        throw new Error('用户名只能包含中文、英文和数字，2-10个字符');
      }
      
      // 验证密码强度
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(this.data.password)) {
        throw new Error('密码需要包含字母和数字');
      }
      
      // 检查用户名是否已存在
      const db = wx.cloud.database();
      const usersCollection = db.collection('users');
      
      const queryResult = await usersCollection.where({
        nickname: this.data.nickname
      }).get();
      
      if (queryResult.data.length > 0) {
        throw new Error('用户名已存在，请换一个');
      }
      
      // 创建用户记录
      const registerResult = await usersCollection.add({
        data: {
          nickname: this.data.nickname,
          password: this.data.password,
          createTime: db.serverDate(),
          lastLoginTime: db.serverDate(),
          status: 'active',
          isGuest: false
        }
      });
      
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 2000
      });
      
      // 保存用户信息
      wx.setStorageSync('userInfo', {
        _id: registerResult._id,
        nickname: this.data.nickname,
        isGuest: false
      });
      
      // 延迟跳转
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
      
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: error.message || '注册失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 游客体验
  onGuestRegister() {
    if (this.data.loading) return;
    
    wx.showModal({
      title: '游客模式',
      content: '以游客身份体验，部分功能可能受限',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          try {
            const db = wx.cloud.database();
            const guestName = '游客' + Math.floor(Math.random() * 10000);
            
            const result = await db.collection('users').add({
              data: {
                nickname: guestName,
                createTime: db.serverDate(),
                lastLoginTime: db.serverDate(),
                status: 'active',
                isGuest: true
              }
            });
            
            wx.setStorageSync('userInfo', {
              _id: result._id,
              nickname: guestName,
              isGuest: true
            });
            
            wx.showToast({
              title: '游客模式开启',
              icon: 'success'
            });
            
            wx.switchTab({
              url: '/pages/index/index'
            });
            
          } catch (error) {
            console.error('游客注册失败:', error);
            wx.showToast({
              title: '进入失败，请重试',
              icon: 'none'
            });
          } finally {
            this.setData({ loading: false });
          }
        }
      }
    });
  },

  // 查看协议
  viewAgreement() {
    wx.showModal({
      title: '《种下小美好》用户协议',
      content: `最后更新：2026年1月31日

欢迎使用"种下小美好"！

请您在使用本小程序前，花一点时间阅读以下核心条款。继续使用即表示您同意本协议。

一、我们做什么？
"种下小美好"是一款为您提供植物养护提醒、知识查询与生长记录服务的小程序。

二、请您注意：
1. 请合法使用本小程序。
2. 请妥善保管您的微信账号。
3. 所有养护建议均由算法或内容库提供，仅供参考。因依赖此建议造成的任何植物损失，我们无法承担责任。
4. 我们会尽力提供服务，但无法保证服务绝对不中断。

三、我们可能更新本协议，更新内容将在此页面发布。`,
      confirmText: '知道了',
      showCancel: false
    });
  },

  // 查看隐私政策
  viewPrivacy() {
    wx.showModal({
      title: '《种下小美好》隐私政策',
      content: `最后更新：2026年1月31日

我们深知您数据的重要性。本政策简要说明了我们如何收集和使用您的信息。

一、我们收集哪些信息？
1. 您提供的信息：您添加的植物名称、设置的提醒、上传的图片和记录的文字。
2. 微信提供的信息：您的公开微信头像和昵称（用于登录和界面显示）。

二、信息如何被使用？
• 用于核心功能：为您创建提醒、保存记录、识别植物。
• 用于优化：让我们了解哪些功能更受欢迎，以改进小程序。
• 我们不会出售或未经授权分享您的个人数据。

三、您的数据如何存储？
您的数据将安全地存储在腾讯云服务器上。您可以通过删除小程序来清除您的个人数据。

四、联系我们
如对本政策有任何疑问，可通过小程序内的客服入口与我们联系。

继续使用即表示您同意本政策的内容。`,
      confirmText: '知道了',
      showCancel: false
    });
  },

  // 跳转到登录
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});