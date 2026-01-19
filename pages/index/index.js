// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查用户登录状态
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 检查登录状态
  checkLoginStatus: function() {
    const app = getApp();
    const hasLogin = app.checkLogin();
    if (hasLogin) {
      this.setData({
        userInfo: app.getUserInfo()
      });
    }
  },

  // 跳转到消费分析页面
  goToConsumption: function() {
    wx.navigateTo({
      url: '/pages/consumption/analysis/analysis'
    });
  },

  // 跳转到添加消费记录页面
  goToAddConsumption: function() {
    wx.navigateTo({
      url: '/pages/consumption/add/add'
    });
  },

  // 跳转到理财规划页面
  goToFinance: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转到教育赋能页面
  goToEducation: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转到登录页面
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/auth/login/login'
    });
  },

  // 跳转到注册页面
  goToRegister: function() {
    wx.navigateTo({
      url: '/pages/auth/register/register'
    });
  }
})