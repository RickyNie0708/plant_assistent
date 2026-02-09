// pages/login/login.js
Page({
  data: {
    // 当前选中的tab：0-手机登录，1-用户名登录，2-注册
    currentTab: 0,
    loginTitle: '欢迎回来',
    
    // 表单数据
    phone: '',
    username: '',
    password: '',
    verificationCode: '',
    
    // 状态控制
    canSubmit: false,
    loading: false,
    countdown: 0,
    phoneValid: false,
    
    // 不再需要 mockUsers
  },

  onLoad(options) {
    console.log('登录页面加载', options)
    
    // 检查是否有跳转参数
    if (options && options.redirect) {
      wx.showToast({ title: '请先登录', icon: 'none' })
    }
    
    // 检查自动登录
    this.checkAutoLogin()
  },

  // 自动登录检查
  async checkAutoLogin() {
    const token = wx.getStorageSync('userToken')
    const userInfo = wx.getStorageSync('userInfo')
    
    // 如果本地有登录态，尝试静默登录
    if (token && userInfo) {
      try {
        wx.showLoading({ title: '自动登录中...' })
        
        const result = await wx.cloud.callFunction({
          name: 'login',
          data: { 
            loginType: 'auto'
          }
        })
        
        if (result.result.code === 200) {
          wx.hideLoading()
          // 更新本地缓存
          wx.setStorageSync('userInfo', result.result.data.userInfo)
          wx.setStorageSync('userToken', result.result.data.openid)
          // 自动登录成功，直接跳转
          this.navigateBackAfterLogin()
          return
        }
      } catch (error) {
        console.log('自动登录失败，需要手动登录:', error)
        // 清除可能过期的缓存
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('userToken')
      } finally {
        wx.hideLoading()
      }
    }
  },

  // 切换登录方式
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const titles = ['手机登录', '用户名登录', '注册账号']
    
    this.setData({
      currentTab: index,
      loginTitle: titles[index],
      canSubmit: false,
      phone: '',
      username: '',
      password: '',
      verificationCode: ''
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value.replace(/\D/g, '')
    const phoneValid = /^1[3-9]\d{9}$/.test(phone)
    
    this.setData({
      phone: phone,
      phoneValid: phoneValid
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 用户名输入
  onUsernameInput(e) {
    const username = e.detail.value.trim()
    this.setData({ username }, () => {
      this.checkCanSubmit()
    })
  },

  // 密码输入
  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({ password }, () => {
      this.checkCanSubmit()
    })
  },

  // 验证码输入
  onCodeInput(e) {
    const code = e.detail.value.replace(/\D/g, '')
    this.setData({ verificationCode: code }, () => {
      this.checkCanSubmit()
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { currentTab, phone, username, password, verificationCode, phoneValid } = this.data
    let canSubmit = false

    switch (currentTab) {
      case 0: // 手机登录
        canSubmit = phoneValid && password.length >= 6
        break
      case 1: // 用户名登录
        canSubmit = username.length >= 2 && password.length >= 6
        break
      case 2: // 注册
        canSubmit = phoneValid && 
                   password.length >= 6 && 
                   verificationCode.length === 6 && 
                   username.length >= 2
        break
    }

    this.setData({ canSubmit })
  },

  // 获取验证码
  async getVerificationCode() {
    const { phone, phoneValid, countdown } = this.data
    
    if (!phoneValid) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    
    if (countdown > 0) return
    
    // 开始倒计时
    this.startCountdown()
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCode = '123456'
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success',
        duration: 2000
      })
      
      // 开发环境下显示验证码
      if (process.env.NODE_ENV === 'development') {
        console.log('验证码（仅开发环境显示）:', mockCode)
        this.setData({ verificationCode: mockCode }, () => {
          this.checkCanSubmit()
        })
      }
      
    } catch (error) {
      console.error('发送验证码失败:', error)
      wx.showToast({ title: '发送失败，请重试', icon: 'error' })
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({ countdown: 60 })
    
    const timer = setInterval(() => {
      let { countdown } = this.data
      countdown--
      
      if (countdown <= 0) {
        clearInterval(timer)
        this.setData({ countdown: 0 })
      } else {
        this.setData({ countdown })
      }
    }, 1000)
  },

  // 手机号登录
  async onPhoneLogin() {
    const { phone, password, canSubmit } = this.data
    
    if (!canSubmit) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '登录中...' })

    try {
      // 调用云函数进行手机号登录
      const result = await wx.cloud.callFunction({
        name: 'loginByPhone',
        data: { phone, password }
      })
      
      if (result.result.code === 200) {
        // 保存用户信息到本地
        wx.setStorageSync('userInfo', result.result.data.userInfo)
        wx.setStorageSync('userToken', result.result.data.userId)
        wx.setStorageSync('userId', result.result.data.userId)

        console.log('手机登录成功:', result.result.data.userInfo)

        wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
        this.navigateBackAfterLogin()
      } else {
        throw new Error(result.result.message)
      }
    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({ title: error.message || '登录失败，请重试', icon: 'error' })
    } finally {
      this.setData({ loading: false })
      wx.hideLoading()
    }
  },

  // 用户名登录
  async onUsernameLogin() {
    const { username, password, canSubmit } = this.data
    
    if (!canSubmit) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '登录中...' })

    try {
      // 调用云函数进行用户名登录
      const result = await wx.cloud.callFunction({
        name: 'loginByUsername',
        data: { username, password }
      })
      
      if (result.result.code === 200) {
        // 保存用户信息到本地
        wx.setStorageSync('userInfo', result.result.data.userInfo)
        wx.setStorageSync('userToken', result.result.data.userId)
        wx.setStorageSync('userId', result.result.data.userId)

        console.log('用户名登录成功:', result.result.data.userInfo)

        wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
        this.navigateBackAfterLogin()
      } else {
        throw new Error(result.result.message)
      }
    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({ title: error.message || '登录失败，请重试', icon: 'error' })
    } finally {
      this.setData({ loading: false })
      wx.hideLoading()
    }
  },

  // 手机号注册
  async onRegister() {
    const { phone, username, password, verificationCode, canSubmit } = this.data
    
    if (!canSubmit) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    
    // 验证码验证
    if (verificationCode !== '123456') {
      wx.showToast({ title: '验证码错误', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '注册中...' })

    try {
      // 调用注册云函数
      const result = await wx.cloud.callFunction({
        name: 'registerByPhone',
        data: { phone, username, password }
      })
      
      if (result.result.code === 200) {
        // 注册成功后，自动登录
        const loginResult = await wx.cloud.callFunction({
          name: 'loginByPhone',
          data: { phone, password }
        })
        
        if (loginResult.result.code === 200) {
          // 保存登录态
          wx.setStorageSync('userInfo', loginResult.result.data.userInfo)
          wx.setStorageSync('userToken', loginResult.result.data.userId)
          wx.setStorageSync('userId', loginResult.result.data.userId)
          
          wx.showToast({ title: '注册成功', icon: 'success', duration: 1500 })
          this.navigateBackAfterLogin()
        }
      } else {
        throw new Error(result.result.message)
      }
    } catch (error) {
      console.error('注册失败:', error)
      wx.showToast({ title: error.message || '注册失败，请重试', icon: 'error' })
    } finally {
      this.setData({ loading: false })
      wx.hideLoading()
    }
  },

  // 微信一键登录/注册
  async onWechatLogin(e) {
    if (e.detail.userInfo) {
      this.setData({ loading: true })

      try {
        const userInfo = e.detail.userInfo
        wx.showLoading({ title: '登录中...' })
        
        // 调用云函数
        const result = await wx.cloud.callFunction({
          name: 'login',
          data: { 
            userInfo,
            loginType: 'wechat'
          }
        })
        
        if (result.result.code === 200) {
          // 保存用户信息到本地（用于自动登录）
          wx.setStorageSync('userInfo', result.result.data.userInfo)
          wx.setStorageSync('userToken', result.result.data.openid)
          wx.setStorageSync('userId', result.result.data.openid)
          
          wx.showToast({
            title: result.result.data.isNewUser ? '注册并登录成功' : '登录成功',
            icon: 'success',
            duration: 1500
          })
          
          this.navigateBackAfterLogin()
        } else {
          throw new Error(result.result.message)
        }
      } catch (error) {
        console.error('微信登录失败:', error)
        wx.showToast({ title: error.message || '登录失败，请重试', icon: 'error' })
      } finally {
        this.setData({ loading: false })
        wx.hideLoading()
      }
    } else {
      wx.showToast({ title: '需要授权才能登录', icon: 'none' })
    }
  },

  // 登录后导航
  navigateBackAfterLogin() {
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({ url: '/pages/index/index' })
      }
    }, 1500)
  },

  // 游客模式
  enterAsGuest() {
    wx.showModal({
      title: '游客模式',
      content: '以游客身份进入，部分功能可能受限，确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          const guestInfo = {
            userId: 'guest_' + Date.now(),
            nickName: '游客',
            avatarUrl: '/images/default-avatar.png',
            isGuest: true,
            joinTime: new Date().toISOString()
          }

          wx.setStorageSync('userInfo', guestInfo)
          wx.setStorageSync('userToken', 'guest_token_' + Date.now())
          wx.setStorageSync('userId', guestInfo.userId)

          wx.showToast({ title: '已进入游客模式', icon: 'success', duration: 1500 })

          setTimeout(() => {
            wx.switchTab({ url: '/pages/index/index' })
          }, 1500)
        }
      }
    })
  },

  // 忘记密码
  goToForgetPassword() {
    wx.navigateTo({ url: '/pages/forget-password/forget-password' })
  },

  onUnload() {
    // 清理定时器
    clearInterval(this.data.countdownTimer)
  }
})