// pages/auth/register/register.js
Page({
  data: {
    username: '',
    email: '',
    password: ''
  },

  // 用户名输入事件
  onUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    })
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

  // 注册按钮点击事件
  onRegister: function() {
    const { username, email, password } = this.data

    // 表单验证
    if (!username || !email || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      wx.showToast({
        title: '请输入有效的邮箱地址',
        icon: 'none'
      })
      return
    }

    // 密码长度验证
    if (password.length < 6) {
      wx.showToast({
        title: '密码长度不能少于6个字符',
        icon: 'none'
      })
      return
    }

    // 调用注册云函数
    wx.cloud.callFunction({
      name: 'register',
      data: {
        username,
        email,
        password
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({
            title: '注册成功',
            icon: 'success'
          })
          
          // 跳转到登录页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/auth/login/login'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('注册失败:', err)
        wx.showToast({
          title: '注册失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  }
})