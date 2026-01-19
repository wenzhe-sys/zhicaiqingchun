// pages/auth/login/login.js
Page({
  data: {
    email: '',
    password: ''
  },

  // 邮箱输入事件
  onEmailInput: function(e) {
    this.setData({
      email: e.detail.value
    })
  },

  // 密码输入事件
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录按钮点击事件
  onLogin: function() {
    const { email, password } = this.data
    const app = getApp()

    // 表单验证
    if (!email || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // 调用登录云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {
        email,
        password
      },
      success: res => {
        if (res.result.success) {
          // 登录成功，保存用户信息到全局
          app.setUserInfo(res.result.data)
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 返回上一页或跳转到首页
          wx.navigateBack()
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('登录失败:', err)
        wx.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  }
})