// app.js
App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // 使用用户提供的环境ID
        env: 'cloud1-0gpbqljoe14fc601',
        traceUser: true,
      })
    }

    this.globalData = {
      userInfo: null,
      hasLogin: false
    }
  },
  
  // 全局方法：获取用户信息
  getUserInfo: function() {
    return this.globalData.userInfo;
  },
  
  // 全局方法：设置用户信息
  setUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.hasLogin = true;
  },
  
  // 全局方法：检查登录状态
  checkLogin: function() {
    return this.globalData.hasLogin;
  }
})