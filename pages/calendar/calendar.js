// pages/calendar/calendar.js
Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarDays: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    todayRecords: [],
    allRecords: [],
    typeIcons: {
      watering: '💧',
      fertilizing: '🌱',
      pruning: '✂️',
      weeding: '🌿',
      repotting: '🪴'
    },
    typeNames: {
      watering: '浇水',
      fertilizing: '施肥',
      pruning: '修剪',
      weeding: '除草',
      repotting: '换盆'
    }
  },

  onLoad() {
    this.generateCalendar();
    this.loadTodayRecords();
  },

  onShow() {
    this.loadTodayRecords();
  },

  // 生成日历
  generateCalendar() {
    const { currentYear, currentMonth } = this.data;
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    let calendarDays = [];
    
    // 填充上个月的日期
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthLastDay - i,
        month: 'prev',
        dateStr: this.formatDate(currentYear, currentMonth - 1, prevMonthLastDay - i)
      });
    }

    // 填充当月日期
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const isToday = date.toDateString() === today.toDateString();
      
      calendarDays.push({
        day: i,
        month: 'current',
        isToday,
        dateStr: this.formatDate(currentYear, currentMonth, i)
      });
    }

    // 填充下个月的日期
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        day: i,
        month: 'next',
        dateStr: this.formatDate(currentYear, currentMonth + 1, i)
      });
    }

    this.setData({ calendarDays });
  },

  // 格式化日期
  formatDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // 加载今日记录
  async loadTodayRecords() {
    try {
      const today = new Date();
      const todayStr = this.formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
      
      const db = wx.cloud.database();
      const res = await db.collection('plant_records')
        .where({
          date: todayStr
        })
        .orderBy('time', 'desc')
        .get();
      
      this.setData({ 
        todayRecords: res.data,
        todayDate: todayStr.replace(/-/g, '/')
      });
    } catch (err) {
      console.error('加载记录失败:', err);
    }
  },

  // 获取某日记录
  getDateRecords(dateStr) {
    // 这里简化处理，实际应该从数据库查询
    return this.data.todayRecords.filter(record => record.date === dateStr);
  },

  // 选择日期
  selectDate(e) {
    const dateStr = e.currentTarget.dataset.date;
    wx.navigateTo({
      url: `/pages/record/addRecord?date=${dateStr}`
    });
  },

  // 切换月份
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear--;
    } else {
      currentMonth--;
    }
    
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendar();
    });
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear++;
    } else {
      currentMonth++;
    }
    
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendar();
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 添加记录
  addRecord() {
    wx.navigateTo({
      url: '/pages/record/addRecord'
    });
  },

  // 添加今日记录
  addTodayRecord() {
    const today = new Date();
    const todayStr = this.formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    wx.navigateTo({
      url: `/pages/record/addRecord?date=${todayStr}`
    });
  },

  // 查看记录详情
  viewRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/record/detail?id=${id}`
    });
  }
});