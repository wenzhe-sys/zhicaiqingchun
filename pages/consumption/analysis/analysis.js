// pages/consumption/analysis/analysis.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    consumptionData: null,
    loading: true,
    activeTab: 'week',
    searchKey: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    this.checkLoginStatus();
    // 获取消费分析数据
    this.getConsumptionAnalysis();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次页面显示时重新获取数据
    this.getConsumptionAnalysis();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const app = getApp();
    const hasLogin = app.checkLogin();
    if (hasLogin) {
      this.setData({
        userInfo: app.getUserInfo()
      });
    } else {
      // 如果未登录，跳转到登录页面
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
    }
  },

  /**
   * 获取消费分析数据
   */
  getConsumptionAnalysis() {
    this.setData({ loading: true });
    
    // 调用云函数获取消费分析数据
    wx.cloud.callFunction({
      name: 'analysis',
      data: {
        timeRange: this.data.activeTab,
        searchKey: this.data.searchKey
      },
      success: res => {
        console.log('消费分析数据获取成功:', res.result);
        if (res.result.success) {
          this.setData({
            consumptionData: res.result.data,
            loading: false
          });
          // 处理图表数据
          this.processChartData();
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: err => {
        console.error('获取消费分析数据失败:', err);
        wx.showToast({
          title: '获取数据失败，请稍后重试',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },

  /**
   * 处理图表数据
   */
  processChartData() {
    // 这里可以添加图表数据处理逻辑，例如使用小程序的canvas绘制图表
    // 或者使用第三方图表库
    console.log('处理图表数据');
  },

  /**
   * 切换时间范围标签
   */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    // 重新获取数据
    this.getConsumptionAnalysis();
  },

  /**
   * 搜索输入事件
   */
  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    });
  },

  /**
   * 执行搜索
   */
  onSearch() {
    this.getConsumptionAnalysis();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getConsumptionAnalysis();
    wx.stopPullDownRefresh();
  }
})