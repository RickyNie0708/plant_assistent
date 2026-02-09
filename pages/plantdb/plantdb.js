// pages/plantdb/plantdb.js
Page({
  data: {
    // 分类数据
    categories: [
      { id: 'all', name: '全部', icon: '🌿' },
      { id: 'indoor', name: '室内绿植', icon: '🏠' },
      { id: 'outdoor', name: '室外植物', icon: '🌳' },
      { id: 'succulent', name: '多肉植物', icon: '🌵' },
      { id: 'flower', name: '开花植物', icon: '🌸' },
      { id: 'herb', name: '香草植物', icon: '🌱' },
      { id: 'aquatic', name: '水生植物', icon: '💧' }
    ],
    activeCategory: 'all',
    
    // 热门植物
    hotPlants: [
      {
        id: 'hot1',
        name: '绿萝',
        scientificName: 'Epipremnum aureum',
        image: '/images/plants/lvluo.jpg',
        temperature: '15-25℃'
      },
      {
        id: 'hot2',
        name: '多肉',
        scientificName: 'Succulent plants',
        image: '/images/plants/duorou.jpg',
        temperature: '10-30℃'
      },
      {
        id: 'hot3',
        name: '吊兰',
        scientificName: 'Chlorophytum comosum',
        image: '/images/plants/diaolan.jpg',
        temperature: '15-25℃'
      }
    ],
    
    // 植物列表
    plants: [
      {
        id: 'p1',
        name: '绿萝',
        scientificName: 'Epipremnum aureum',
        image: '/images/plants/lvluo.jpg',
        difficulty: 'easy',
        difficultyText: '容易',
        waterNeed: '中等',
        lightNeed: '散射光',
        temperature: '15-25℃',
        careTip: '耐阴，适合室内养殖',
        isFavorite: true,
        category: 'indoor'
      },
      {
        id: 'p2',
        name: '多肉植物',
        scientificName: 'Succulent plants',
        image: '/images/plants/duorou.jpg',
        difficulty: 'easy',
        difficultyText: '容易',
        waterNeed: '少量',
        lightNeed: '充足阳光',
        temperature: '10-30℃',
        careTip: '控制浇水，多晒太阳',
        isFavorite: false,
        category: 'succulent'
      },
      {
        id: 'p3',
        name: '吊兰',
        scientificName: 'Chlorophytum comosum',
        image: '/images/plants/diaolan.jpg',
        difficulty: 'easy',
        difficultyText: '容易',
        waterNeed: '中等',
        lightNeed: '散射光',
        temperature: '15-25℃',
        careTip: '空气净化能力强',
        isFavorite: true,
        category: 'indoor'
      },
      {
        id: 'p4',
        name: '仙人掌',
        scientificName: 'Cactaceae',
        image: '/images/plants/xianrenzhang.jpg',
        difficulty: 'easy',
        difficultyText: '容易',
        waterNeed: '极少',
        lightNeed: '充足阳光',
        temperature: '15-30℃',
        careTip: '耐旱，少浇水',
        isFavorite: false,
        category: 'succulent'
      },
      {
        id: 'p5',
        name: '芦荟',
        scientificName: 'Aloe vera',
        image: '/images/plants/luhui.jpg',
        difficulty: 'easy',
        difficultyText: '容易',
        waterNeed: '少量',
        lightNeed: '明亮光线',
        temperature: '15-25℃',
        careTip: '药用价值高',
        isFavorite: false,
        category: 'indoor'
      },
      {
        id: 'p6',
        name: '月季',
        scientificName: 'Rosa chinensis',
        image: '/images/plants/yueji.jpg',
        difficulty: 'medium',
        difficultyText: '中等',
        waterNeed: '中等',
        lightNeed: '全日照',
        temperature: '15-25℃',
        careTip: '需要定期修剪',
        isFavorite: true,
        category: 'flower'
      },
      {
        id: 'p7',
        name: '薄荷',
        scientificName: 'Mentha',
        image: '/images/plants/bohe.jpg',
        difficulty: 'easy',
        difficultyText: '容易',
        waterNeed: '较多',
        lightNeed: '充足阳光',
        temperature: '15-25℃',
        careTip: '可食用，生长快',
        isFavorite: false,
        category: 'herb'
      },
      {
        id: 'p8',
        name: '龟背竹',
        scientificName: 'Monstera deliciosa',
        image: '/images/plants/guibeizhu.jpg',
        difficulty: 'medium',
        difficultyText: '中等',
        waterNeed: '中等',
        lightNeed: '散射光',
        temperature: '18-25℃',
        careTip: '网红植物，叶片美观',
        isFavorite: true,
        category: 'indoor'
      }
    ],
    
    // 筛选和搜索
    searchKeyword: '',
    filterOptions: ['默认排序', '按名称', '按难度', '按热度'],
    currentFilter: 0,
    viewMode: 'grid', // 'grid' 或 'list'
    
    // 状态控制
    loading: false,
    hasMore: true,
    refreshing: false
  },

  onLoad() {
    console.log('植物百科页面加载');
    this.loadPlants();
  },

  onShow() {
    // 页面显示时刷新收藏状态
    this.refreshFavorites();
  },

  // 加载植物数据
  loadPlants() {
    console.log('加载植物数据');
    // 这里实际应该从数据库加载
    // 暂时使用模拟数据
  },

  // 刷新收藏状态
  refreshFavorites() {
    // 从本地存储获取收藏状态
    const favorites = wx.getStorageSync('plantFavorites') || [];
    const plants = this.data.plants.map(plant => ({
      ...plant,
      isFavorite: favorites.includes(plant.id)
    }));
    
    this.setData({ plants });
  },

  // ============= 分类切换 =============
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    console.log('切换到分类:', categoryId);
    
    this.setData({
      activeCategory: categoryId,
      loading: true
    }, () => {
      this.filterPlantsByCategory();
    });
  },

  filterPlantsByCategory() {
    const { activeCategory, plants } = this.data;
    
    let filteredPlants = plants;
    
    if (activeCategory !== 'all') {
      filteredPlants = plants.filter(plant => plant.category === activeCategory);
    }
    
    // 应用当前排序
    filteredPlants = this.applySorting(filteredPlants);
    
    this.setData({
      plants: filteredPlants,
      loading: false,
      hasMore: false
    });
  },

  // ============= 搜索功能 =============
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    // 防抖搜索
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.performSearch(keyword);
    }, 500);
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value;
    this.performSearch(keyword);
  },

  performSearch(keyword) {
    if (!keyword.trim()) {
      // 清空搜索，显示所有植物
      this.filterPlantsByCategory();
      return;
    }
    
    const filtered = this.data.plants.filter(plant => 
      plant.name.includes(keyword) || 
      plant.scientificName.includes(keyword) ||
      plant.careTip.includes(keyword)
    );
    
    this.setData({
      plants: this.applySorting(filtered),
      hasMore: false
    });
  },

  // ============= 筛选功能 =============
  onFilterChange(e) {
    const index = e.detail.value;
    console.log('切换排序:', this.data.filterOptions[index]);
    
    this.setData({
      currentFilter: index
    }, () => {
      this.applySortingToPlants();
    });
  },

  applySorting(plants) {
    const { currentFilter } = this.data;
    let sortedPlants = [...plants];
    
    switch (currentFilter) {
      case 1: // 按名称
        sortedPlants.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
        break;
      case 2: // 按难度
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        sortedPlants.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 3: // 按热度（收藏数）
        // 模拟收藏数
        sortedPlants.sort((a, b) => {
          const aScore = a.isFavorite ? 1 : 0;
          const bScore = b.isFavorite ? 1 : 0;
          return bScore - aScore;
        });
        break;
      // 默认排序保持原顺序
    }
    
    return sortedPlants;
  },

  applySortingToPlants() {
    const sortedPlants = this.applySorting(this.data.plants);
    this.setData({ plants: sortedPlants });
  },

  // ============= 视图切换 =============
  toggleViewMode() {
    const newMode = this.data.viewMode === 'grid' ? 'list' : 'grid';
    console.log('切换视图模式:', newMode);
    
    this.setData({ viewMode: newMode });
    
    // 如果需要切换列表视图的样式，可以在这里处理
    if (newMode === 'list') {
      // 切换到列表视图
      wx.showToast({
        title: '列表视图',
        icon: 'none'
      });
    }
  },

  // ============= 植物操作 =============
  // 查看植物详情
  viewPlantDetail(e) {
    const plantId = e.currentTarget.dataset.id;
    console.log('查看植物详情:', plantId);
    
    wx.showToast({
      title: '详情功能开发中',
      icon: 'none'
    });
    
    // 实际跳转代码
    // wx.navigateTo({
    //   url: `/pages/plantdb/detail?id=${plantId}`
    // });
  },

  // 收藏/取消收藏
  toggleFavorite(e) {
    const plantId = e.currentTarget.dataset.id;
    console.log('收藏/取消收藏植物:', plantId);
    
    // 更新本地状态
    const plants = this.data.plants.map(plant => {
      if (plant.id === plantId) {
        const newFavoriteState = !plant.isFavorite;
        
        // 更新本地存储
        let favorites = wx.getStorageSync('plantFavorites') || [];
        if (newFavoriteState) {
          if (!favorites.includes(plantId)) {
            favorites.push(plantId);
          }
        } else {
          favorites = favorites.filter(id => id !== plantId);
        }
        wx.setStorageSync('plantFavorites', favorites);
        
        return {
          ...plant,
          isFavorite: newFavoriteState
        };
      }
      return plant;
    });
    
    this.setData({ plants });
    
    // 显示操作反馈
    const plant = plants.find(p => p.id === plantId);
    wx.showToast({
      title: plant.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success',
      duration: 1500
    });
  },

  // 植物识图
  scanPlant() {
    console.log('开始植物识图');
    
    wx.showActionSheet({
      itemList: ['拍照识别', '从相册选择', '取消'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto();
        } else if (res.tapIndex === 1) {
          this.chooseImage();
        }
      }
    });
  },

  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.identifyPlant(res.tempFilePaths[0]);
      },
      fail: (err) => {
        console.error('拍照失败:', err);
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        });
      }
    });
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.identifyPlant(res.tempFilePaths[0]);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        });
      }
    });
  },

  identifyPlant(imagePath) {
    wx.showLoading({ title: '识别中...' });
    
    // 模拟识别过程
    setTimeout(() => {
      wx.hideLoading();
      
      const mockResult = {
        name: '绿萝',
        confidence: 92,
        scientificName: 'Epipremnum aureum'
      };
      
      wx.showModal({
        title: '识别结果',
        content: `识别为：${mockResult.name}\n学名：${mockResult.scientificName}\n置信度：${mockResult.confidence}%`,
        confirmText: '查看详情',
        cancelText: '知道了',
        success: (res) => {
          if (res.confirm) {
            // 跳转到对应的植物详情
            this.viewPlantDetail({ currentTarget: { dataset: { id: 'p1' } } });
          }
        }
      });
    }, 2000);
  },

  // 阻止事件冒泡
  stopPropagation(e) {
    // 什么都不做，只是阻止冒泡
  },

  // ============= 页面生命周期 =============
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.setData({ refreshing: true });
    
    // 模拟刷新延迟
    setTimeout(() => {
      this.refreshFavorites();
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onReachBottom() {
    if (this.data.loading || !this.data.hasMore) return;
    
    console.log('上拉加载更多');
    this.setData({ loading: true });
    
    // 模拟加载更多
    setTimeout(() => {
      this.setData({
        loading: false,
        hasMore: false // 模拟数据已加载完毕
      });
    }, 1000);
  },

  onShareAppMessage() {
    return {
      title: '植物百科 - 认识每一株生命的奥秘',
      path: '/pages/plantdb/plantdb',
      imageUrl: '/images/share-plant.jpg'
    };
  }
});