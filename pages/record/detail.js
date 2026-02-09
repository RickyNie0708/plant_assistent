// pages/record/record.js
Page({
  data: {
    records: [],           // 记录列表
    filterOptions: ['全部类型', '浇水', '施肥', '修剪', '除草', '换盆'],
    currentFilter: 0,      // 当前筛选类型索引
    searchKeyword: '',     // 搜索关键词
    refreshing: false      // 下拉刷新状态
  },

  onLoad() {
    console.log('养花印记列表页加载');
    this.loadRecords();
  },

  onShow() {
    // 页面显示时刷新数据（比如从添加页面返回）
    this.loadRecords(true);
  },

  // 加载记录
  async loadRecords(refresh = false) {
    wx.showLoading({ title: '加载中...' });

    try {
      const db = wx.cloud.database();
      
      // 模拟数据（实际开发中替换为数据库查询）
      const mockRecords = [
        {
          _id: '1',
          plantName: '绿萝',
          type: 'watering',
          date: '2024-01-15',
          time: '10:30',
          description: '今天给绿萝浇水，发现新长了两片叶子，真开心！',
          images: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          plantName: '多肉植物',
          type: 'fertilizing',
          date: '2024-01-14',
          time: '15:20',
          description: '给多肉施了专用肥料，希望它长得更好',
          images: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '3',
          plantName: '月季',
          type: 'pruning',
          date: '2024-01-13',
          time: '09:15',
          description: '修剪了枯萎的枝叶，期待春天的新芽',
          images: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      this.setData({
        records: mockRecords
      });

      console.log('加载记录成功:', mockRecords.length);
    } catch (err) {
      console.error('加载记录失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
      if (this.data.refreshing) {
        this.setData({ refreshing: false });
      }
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    }, () => {
      // 防抖处理
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.loadRecords(true);
      }, 500);
    });
  },

  // 筛选改变
  onFilterChange(e) {
    this.setData({
      currentFilter: e.detail.value
    }, () => {
      this.loadRecords(true);
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadRecords(true);
    wx.stopPullDownRefresh();
  },

  // ============= 跳转函数 =============

  // 1. 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 2. 添加新记录
  addNewRecord() {
    console.log('跳转到添加记录页');
    wx.navigateTo({
      url: '/pages/record/addRecord',
      success: () => {
        console.log('跳转到添加页成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'error'
        });
      }
    });
  },

  // 3. 查看记录详情（跳转到detail页）← 这是你要找的函数！
  viewRecord(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
    console.log('查看记录详情，ID:', id, '索引:', index);
    
    // 重要：这里跳转到detail页面
    wx.navigateTo({
      url: `/pages/record/detail?id=${id}`,
      success: () => {
        console.log('跳转到详情页成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'error'
        });
      }
    });
  },

  // 4. 编辑记录
  editRecord(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
    console.log('编辑记录，ID:', id, '索引:', index);
    
    // 跳转到编辑页
    wx.navigateTo({
      url: `/pages/record/addRecord?id=${id}`,
      success: () => {
        console.log('跳转到编辑页成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'error'
        });
      }
    });
  },

  // 5. 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
    console.log('删除记录，ID:', id, '索引:', index);
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          await this.confirmDelete(id, index);
        }
      }
    });
  },

  async confirmDelete(id, index) {
    try {
      wx.showLoading({ title: '删除中...' });
      
      // 模拟删除操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 从列表中移除
      const records = [...this.data.records];
      records.splice(index, 1);
      
      this.setData({ records });
      
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
    } catch (err) {
      console.error('删除失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },

  // ============= 工具函数 =============

  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      watering: '💧',
      fertilizing: '🌱',
      pruning: '✂️',
      weeding: '🌿',
      repotting: '🪴',
      observation: '🔍'
    };
    return icons[type] || '📝';
  },

  // 获取类型文本
  getTypeText(type) {
    const texts = {
      watering: '浇水',
      fertilizing: '施肥',
      pruning: '修剪',
      weeding: '除草',
      repotting: '换盆',
      observation: '观察'
    };
    return texts[type] || '其他';
  },

  // 获取类型颜色
  getTypeColor(type) {
    const colors = {
      watering: '#4facfe',
      fertilizing: '#43e97b',
      pruning: '#fa709a',
      weeding: '#ffd166',
      repotting: '#9370DB',
      observation: '#667eea'
    };
    return colors[type] || '#95A5A6';
  }
});