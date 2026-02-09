// pages/record/record.js
Page({
  data: {
    records: [],           // 记录列表
    filterOptions: ['全部类型', '浇水', '施肥', '修剪', '除草', '换盆'],
    currentFilter: 0,      // 当前筛选类型索引
    searchKeyword: '',     // 搜索关键词
    page: 1,               // 当前页码
    pageSize: 10,          // 每页数量
    hasMore: true,         // 是否有更多数据
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
    if (refresh) {
      this.setData({ page: 1, hasMore: true });
    }

    wx.showLoading({ title: '加载中...' });

    try {
      const db = wx.cloud.database();
      const query = this.buildQuery();
      
      const res = await db.collection('plant_records')
        .where(query)
        .orderBy('date', 'desc')
        .orderBy('time', 'desc')
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get();

      const records = refresh ? res.data : [...this.data.records, ...res.data];
      
      this.setData({
        records: records,
        hasMore: res.data.length === this.data.pageSize
      });

      console.log('加载记录成功:', records.length);
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

  // 构建查询条件
  buildQuery() {
    const query = {};
    
    // 搜索条件
    if (this.data.searchKeyword) {
      query.plantName = db.RegExp({
        regexp: this.data.searchKeyword,
        options: 'i'
      });
    }
    
    // 筛选条件
    if (this.data.currentFilter > 0) {
      const filterMap = ['', 'watering', 'fertilizing', 'pruning', 'weeding', 'repotting'];
      query.type = filterMap[this.data.currentFilter];
    }
    
    return query;
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
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore) return;
    
    this.setData({ page: this.data.page + 1 });
    this.loadRecords();
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 添加新记录
  addNewRecord() {
    wx.navigateTo({
      url: '/pages/record/addRecord'
    });
  },

  // 查看记录详情
  viewRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/record/detail?id=${id}`
    });
  },

  // 编辑记录
  editRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/record/addRecord?id=${id}`
    });
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          await this.confirmDelete(id);
        }
      }
    });
  },

  async confirmDelete(id) {
    try {
      await wx.cloud.database().collection('plant_records').doc(id).remove();
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 重新加载数据
      this.loadRecords(true);
    } catch (err) {
      console.error('删除失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },

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
  }
});