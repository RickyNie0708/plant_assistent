// pages/record/addRecord.js - 完整版本
Page({
  data: {
    // 表单数据
    formData: {
      date: '',
      time: '',
      plantName: '',
      type: '',
      description: '',
      images: [],
      recordLocation: false,
      location: ''
    },
    
    // 最大日期（今天）
    maxDate: '',
    
    // 养护类型选项
    careTypes: [
      { id: 'watering', icon: '💧', label: '浇水' },
      { id: 'fertilizing', icon: '🌱', label: '施肥' },
      { id: 'pruning', icon: '✂️', label: '修剪' },
      { id: 'weeding', icon: '🌿', label: '除草' },
      { id: 'repotting', icon: '🪴', label: '换盆' },
      { id: 'observation', icon: '🔍', label: '观察' }
    ],
    
    // 表单验证状态
    formValid: false,
    
    // 编辑模式
    isEditMode: false,
    recordId: ''
  },

  onLoad(options) {
    console.log('addRecord页面加载，参数:', options);
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 设置最大日期为今天
    const today = new Date();
    const maxDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // 初始化表单数据
    const initialData = {
      date: options.date || maxDate,
      time: this.formatTime(today),
      plantName: '',
      type: '',
      description: '',
      images: [],
      recordLocation: false,
      location: ''
    };
    
    this.setData({
      maxDate: maxDate,
      formData: initialData
    }, () => {
      this.validateForm();
    });

    // 检查是否是编辑模式
    if (options && options.id) {
      this.setData({
        isEditMode: true,
        recordId: options.id
      });
      this.loadRecordForEdit(options.id);
    }

    // 如果URL中有日期参数，自动获取位置
    if (options.date) {
      this.getLocation();
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('userToken');
    
    if (!userInfo || !token) {
      console.log('用户未登录，显示登录提示');
      this.showLoginModal();
      return false;
    }
    
    console.log('用户已登录:', userInfo.nickName);
    return true;
  },

  // 显示登录弹窗
  showLoginModal() {
    wx.showModal({
      title: '需要登录',
      content: '请先登录才能保存记录',
      showCancel: true,
      cancelText: '稍后再说',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.goToLogin();
        } else if (res.cancel) {
          // 用户取消，返回上一页
          wx.navigateBack();
        }
      }
    });
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 日期改变
  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      'formData.date': date
    }, () => {
      this.validateForm();
    });
  },

  // 时间改变
  onTimeChange(e) {
    const time = e.detail.value;
    this.setData({
      'formData.time': time
    }, () => {
      this.validateForm();
    });
  },

  // 植物名称改变
  onPlantNameChange(e) {
    const plantName = e.detail.value;
    this.setData({
      'formData.plantName': plantName
    }, () => {
      this.validateForm();
    });
  },

  // 选择养护类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.type': type
    }, () => {
      this.validateForm();
    });
  },

  // 描述改变
  onDescriptionChange(e) {
    const description = e.detail.value;
    this.setData({
      'formData.description': description
    }, () => {
      this.validateForm();
    });
  },

  // 切换位置记录
  toggleLocation(e) {
    const recordLocation = e.detail.value;
    this.setData({
      'formData.recordLocation': recordLocation
    }, () => {
      if (recordLocation) {
        this.getLocation();
      }
    });
  },

  // 获取位置
  getLocation() {
    wx.showLoading({ title: '获取位置中...' });
    
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        // 简化处理，显示坐标
        this.setData({
          'formData.location': `纬度: ${res.latitude.toFixed(6)}, 经度: ${res.longitude.toFixed(6)}`
        });
        wx.hideLoading();
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        this.setData({
          'formData.location': '获取位置失败，请检查权限设置'
        });
        wx.hideLoading();
      }
    });
  },

  // 上传图片
  uploadImage() {
    wx.chooseImage({
      count: 9 - this.data.formData.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        const newImages = [...this.data.formData.images, ...tempFilePaths];
        
        this.setData({
          'formData.images': newImages
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 移除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.formData.images];
    images.splice(index, 1);
    
    this.setData({
      'formData.images': images
    });
  },

  // 验证表单
  validateForm() {
    const { date, time, plantName, type } = this.data.formData;
    const formValid = date && time && plantName && type;
    
    this.setData({
      formValid: formValid
    });
  },

  // ============= 保存功能 =============

  // 保存记录（顶部按钮）
  saveRecord() {
    console.log('点击保存按钮');
    this.submitForm();
  },

  // 提交表单
  async submitForm() {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    // 表单验证
    if (!this.data.formValid) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      if (this.data.isEditMode) {
        // 编辑模式：更新记录
        await this.updateRecord();
      } else {
        // 新增模式：创建记录
        await this.createRecord();
      }
      
    } catch (err) {
      console.error('保存失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 创建新记录
  async createRecord() {
    try {
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      
      // 准备记录数据
      const recordData = {
        ...this.data.formData,
        userId: userInfo.openId || 'test_user_001', // 实际应该是用户的openId
        userName: userInfo.nickName || '用户',
        userAvatar: userInfo.avatarUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 保存到云数据库
      const db = wx.cloud.database();
      const result = await db.collection('plant_records').add({
        data: recordData
      });

      console.log('保存成功，记录ID:', result._id);

      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (err) {
      console.error('创建记录失败:', err);
      throw err;
    }
  },

  // 更新记录
  async updateRecord() {
    try {
      // 准备更新数据
      const updateData = {
        ...this.data.formData,
        updatedAt: new Date()
      };

      // 更新到云数据库
      const db = wx.cloud.database();
      await db.collection('plant_records').doc(this.data.recordId).update({
        data: updateData
      });

      console.log('更新成功，记录ID:', this.data.recordId);

      wx.hideLoading();
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (err) {
      console.error('更新记录失败:', err);
      throw err;
    }
  },

  // 加载要编辑的记录
  async loadRecordForEdit(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 从云数据库加载
      const db = wx.cloud.database();
      const res = await db.collection('plant_records').doc(id).get();
      
      console.log('加载编辑记录:', res.data);
      
      this.setData({
        formData: {
          ...res.data,
          // 确保日期格式正确
          date: res.data.date || this.data.formData.date,
          time: res.data.time || this.data.formData.time
        }
      }, () => {
        this.validateForm();
      });
      
      wx.hideLoading();
      
    } catch (err) {
      console.error('加载记录失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      
      // 加载失败，返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});