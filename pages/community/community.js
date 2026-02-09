// pages/community/community.js
Page({
  data: {
    // 标签页数据
    tabs: [
      { id: 'recommend', name: '推荐' },
      { id: 'follow', name: '关注' },
      { id: 'hot', name: '热门' },
      { id: 'qa', name: '问答' },
      { id: 'show', name: '晒图' },
      { id: 'tips', name: '技巧' }
    ],
    activeTab: 'recommend',
    followCount: 0,
    
    // 排序选项
    sortOptions: ['最新发布', '最热内容', '最多评论'],
    currentSort: 0,
    
    // 轮播图数据
    banners: [
      {
        id: 1,
        title: '绿植养护大赛',
        desc: '分享你的养护经验，赢取精美礼品',
        bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        id: 2,
        title: '新手养植指南',
        desc: '从零开始，轻松养好你的第一盆绿植',
        bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      },
      {
        id: 3,
        title: '植物摄影大赛',
        desc: '用镜头记录植物的美好瞬间',
        bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ],
    
    // 今日话题
    dailyTopic: {
      title: '冬季如何正确给植物浇水？',
      participants: 1256,
      comments: 342
    },
    
    // 帖子列表数据
    posts: [
      {
        id: 'post001',
        user: {
          id: 'user001',
          name: '绿意生活家',
          avatar: '/images/avatars/user1.jpg'
        },
        time: '2小时前',
        category: '养护技巧',
        title: '我的多肉植物养护心得分享',
        content: '养多肉三年了，总结了一些实用的养护技巧。最重要的是控制浇水和充足的光照。冬季要减少浇水频率，避免根部腐烂...',
        images: [
          '/images/posts/plant1.jpg',
          '/images/posts/plant2.jpg',
          '/images/posts/plant3.jpg',
          '/images/posts/plant4.jpg'
        ],
        plants: ['多肉植物', '仙人掌', '景天科'],
        isFollowing: true,
        isLiked: false,
        likeCount: 156,
        isCollected: false,
        collectCount: 42,
        commentCount: 23,
        hotComments: [
          { id: 'c1', user: '植友小张', content: '说得很好，我也是这么养的' },
          { id: 'c2', user: '多肉爱好者', content: '请问施肥用什么比较好？' }
        ]
      },
      {
        id: 'post002',
        user: {
          id: 'user002',
          name: '花园梦想家',
          avatar: '/images/avatars/user2.jpg'
        },
        time: '5小时前',
        category: '植物晒图',
        title: '阳台小花园初建成，太有成就感了！',
        content: '经过三个月的精心打理，我的阳台小花园终于初具规模了！每天看到这些绿植都觉得心情特别好...',
        images: [
          '/images/posts/garden1.jpg',
          '/images/posts/garden2.jpg'
        ],
        plants: ['绿萝', '吊兰', '文竹', '虎皮兰'],
        isFollowing: false,
        isLiked: true,
        likeCount: 289,
        isCollected: true,
        collectCount: 78,
        commentCount: 45,
        hotComments: [
          { id: 'c3', user: '阳台种植', content: '布置得真漂亮！我也要学习' }
        ]
      },
      {
        id: 'post003',
        user: {
          id: 'user003',
          name: '植物医生',
          avatar: '/images/avatars/user3.jpg'
        },
        time: '1天前',
        category: '问题求助',
        title: '求助：绿萝叶子发黄是什么原因？',
        content: '养了一年的绿萝最近叶子开始发黄，不知道是什么原因。浇水一直很规律，也没有换过位置...',
        images: [
          '/images/posts/problem1.jpg'
        ],
        plants: ['绿萝'],
        isFollowing: true,
        isLiked: false,
        likeCount: 89,
        isCollected: false,
        collectCount: 15,
        commentCount: 36,
        hotComments: [
          { id: 'c4', user: '绿植专家', content: '可能是浇水过多或者缺少光照' },
          { id: 'c5', user: '园艺师老王', content: '检查一下土壤湿度，可能是烂根了' }
        ]
      }
    ],
    
    // 状态控制
    loading: false,
    hasMore: true,
    refreshing: false,
    
    // 评论相关
    showCommentInput: false,
    commentText: '',
    currentPostId: ''
  },

  onLoad() {
    console.log('社区页面加载');
    this.loadFollowCount();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 加载关注数量
  loadFollowCount() {
    // 模拟数据
    this.setData({
      followCount: 3
    });
  },

  // 刷新数据
  refreshData() {
    console.log('刷新社区数据');
    // 这里可以加载最新数据
  },

  // ============= 标签页切换 =============
  switchTab(e) {
    const tabId = e.currentTarget.dataset.id;
    console.log('切换到标签:', tabId);
    
    this.setData({
      activeTab: tabId,
      posts: [], // 清空帖子列表
      loading: true,
      hasMore: true
    }, () => {
      // 加载对应标签的数据
      this.loadTabData(tabId);
    });
  },

  loadTabData(tabId) {
    console.log('加载标签数据:', tabId);
    
    // 模拟加载延迟
    setTimeout(() => {
      // 这里可以根据不同的标签加载不同的数据
      let posts = [];
      
      if (tabId === 'follow') {
        // 关注页显示已关注的用户帖子
        posts = this.data.posts.filter(post => post.isFollowing);
      } else if (tabId === 'hot') {
        // 热门页显示点赞多的帖子
        posts = [...this.data.posts].sort((a, b) => b.likeCount - a.likeCount);
      } else {
        // 其他标签显示所有帖子
        posts = this.data.posts;
      }
      
      this.setData({
        posts: posts,
        loading: false,
        hasMore: false // 模拟数据，实际应该判断是否有更多
      });
    }, 500);
  },

  // ============= 搜索和筛选 =============
  onSearchInput(e) {
    const keyword = e.detail.value;
    console.log('搜索关键词:', keyword);
    
    // 防抖处理
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.performSearch(keyword);
    }, 500);
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value;
    console.log('确认搜索:', keyword);
    this.performSearch(keyword);
  },

  performSearch(keyword) {
    if (!keyword.trim()) {
      // 清空搜索，显示所有帖子
      this.loadTabData(this.data.activeTab);
      return;
    }
    
    // 模拟搜索
    const filtered = this.data.posts.filter(post => 
      post.title.includes(keyword) || 
      post.content.includes(keyword) ||
      post.plants.some(plant => plant.includes(keyword))
    );
    
    this.setData({
      posts: filtered,
      hasMore: false
    });
  },

  onSortChange(e) {
    const index = e.detail.value;
    console.log('切换排序:', this.data.sortOptions[index]);
    
    this.setData({
      currentSort: index
    }, () => {
      this.applySorting();
    });
  },

  applySorting() {
    let sortedPosts = [...this.data.posts];
    
    switch (this.data.currentSort) {
      case 0: // 最新发布
        // 按时间排序（模拟）
        break;
      case 1: // 最热内容
        sortedPosts.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 2: // 最多评论
        sortedPosts.sort((a, b) => b.commentCount - a.commentCount);
        break;
    }
    
    this.setData({ posts: sortedPosts });
  },

  // ============= 帖子操作 =============
  // 查看帖子详情
  viewPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    console.log('查看帖子详情:', postId);
    
    wx.showToast({
      title: '帖子详情功能开发中',
      icon: 'none'
    });
    
    // 实际跳转到帖子详情页
    // wx.navigateTo({
    //   url: `/pages/community/postDetail?id=${postId}`
    // });
  },

  // 查看全部话题
  viewAllTopics() {
    console.log('查看全部话题');
    wx.showToast({
      title: '话题列表功能开发中',
      icon: 'none'
    });
  },

  // 参与话题讨论
  joinTopic() {
    console.log('参与今日话题讨论');
    
    this.setData({
      showCommentInput: true,
      commentText: '',
      currentPostId: 'dailyTopic'
    });
  },

  // 关注/取消关注用户
  toggleFollow(e) {
    const userId = e.currentTarget.dataset.id;
    console.log('关注/取消关注用户:', userId);
    
    const posts = this.data.posts.map(post => {
      if (post.user.id === userId) {
        const newFollowState = !post.isFollowing;
        const followCountChange = newFollowState ? 1 : -1;
        
        // 更新关注数量
        this.setData({
          followCount: this.data.followCount + followCountChange
        });
        
        return {
          ...post,
          isFollowing: newFollowState
        };
      }
      return post;
    });
    
    this.setData({ posts });
    
    wx.showToast({
      title: this.data.followCount > 0 ? '操作成功' : '已取消关注',
      icon: 'success'
    });
  },

  // 点赞/取消点赞
  toggleLike(e) {
    const postId = e.currentTarget.dataset.id;
    console.log('点赞/取消点赞帖子:', postId);
    
    const posts = this.data.posts.map(post => {
      if (post.id === postId) {
        const newLikeState = !post.isLiked;
        const likeCountChange = newLikeState ? 1 : -1;
        
        return {
          ...post,
          isLiked: newLikeState,
          likeCount: post.likeCount + likeCountChange
        };
      }
      return post;
    });
    
    this.setData({ posts });
  },

  // 收藏/取消收藏
  toggleCollect(e) {
    const postId = e.currentTarget.dataset.id;
    console.log('收藏/取消收藏帖子:', postId);
    
    const posts = this.data.posts.map(post => {
      if (post.id === postId) {
        const newCollectState = !post.isCollected;
        const collectCountChange = newCollectState ? 1 : -1;
        
        return {
          ...post,
          isCollected: newCollectState,
          collectCount: post.collectCount + collectCountChange
        };
      }
      return post;
    });
    
    this.setData({ posts });
    
    wx.showToast({
      title: posts.find(p => p.id === postId).isCollected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 分享帖子
  sharePost(e) {
    const postId = e.currentTarget.dataset.id;
    console.log('分享帖子:', postId);
    
    wx.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            this.shareToFriend(postId);
            break;
          case 1:
            this.shareToTimeline(postId);
            break;
          case 2:
            this.copyLink(postId);
            break;
        }
      }
    });
  },

  shareToFriend(postId) {
    const post = this.data.posts.find(p => p.id === postId);
    if (post) {
      wx.shareAppMessage({
        title: post.title,
        path: `/pages/community/community?post=${postId}`,
        imageUrl: post.images.length > 0 ? post.images[0] : '/images/share-default.jpg'
      });
    }
  },

  shareToTimeline(postId) {
    const post = this.data.posts.find(p => p.id === postId);
    if (post) {
      wx.showToast({
        title: '已分享到朋友圈',
        icon: 'success'
      });
    }
  },

  copyLink(postId) {
    wx.setClipboardData({
      data: `pages/community/community?post=${postId}`,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  // ============= 评论功能 =============
  // 聚焦评论输入框
  focusComment(e) {
    const postId = e.currentTarget.dataset.id;
    console.log('评论帖子:', postId);
    
    this.setData({
      showCommentInput: true,
      commentText: '',
      currentPostId: postId
    });
  },

  // 隐藏评论输入框
  hideCommentInput() {
    this.setData({
      showCommentInput: false,
      commentText: '',
      currentPostId: ''
    });
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  // 提交评论
  submitComment() {
    const { commentText, currentPostId } = this.data;
    
    if (!commentText.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }

    console.log('提交评论:', commentText, '帖子ID:', currentPostId);
    
    // 更新帖子评论数量
    const posts = this.data.posts.map(post => {
      if (post.id === currentPostId) {
        return {
          ...post,
          commentCount: post.commentCount + 1
        };
      }
      return post;
    });
    
    this.setData({
      posts,
      showCommentInput: false,
      commentText: '',
      currentPostId: ''
    });
    
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    });
  },

  // ============= 页面跳转 =============
  // 发布新帖子
  goToPublish() {
    console.log('跳转到发布页面');
    wx.showToast({
      title: '发布功能开发中',
      icon: 'none'
    });
    
    // 实际跳转代码
    // wx.navigateTo({
    //   url: '/pages/community/publish'
    // });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 返回首页
  goBackHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // ============= 页面生命周期 =============
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.setData({ refreshing: true });
    
    // 模拟刷新延迟
    setTimeout(() => {
      this.refreshData();
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
      // 这里应该加载更多数据
      this.setData({
        loading: false,
        hasMore: false // 模拟数据已加载完毕
      });
    }, 1000);
  },

  onShareAppMessage() {
    return {
      title: '绿意社区 - 与万千植物爱好者一起成长',
      path: '/pages/community/community',
      imageUrl: '/images/share-community.jpg'
    };
  }
});