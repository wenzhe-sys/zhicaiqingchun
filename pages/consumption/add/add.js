// pages/consumption/add/add.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    amount: '',
    selectedCategory: '',
    merchant: '',
    date: '',
    remark: '',
    currentDate: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    this.checkLoginStatus();
    
    // 设置当前日期为默认日期
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    this.setData({
      date: currentDate,
      currentDate: currentDate
    });
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const app = getApp();
    const hasLogin = app.checkLogin();
    if (!hasLogin) {
      // 如果未登录，跳转到登录页面
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
    }
  },

  /**
   * 金额输入处理
   */
  onAmountInput(e) {
    this.setData({
      amount: e.detail.value
    });
  },

  /**
   * 选择消费类别
   */
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });
  },

  /**
   * 日期选择处理
   */
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  /**
   * 表单提交
   */
  onSubmit(e) {
    const { amount, selectedCategory, merchant, date, remark } = this.data;
    
    // 表单验证
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入有效的消费金额',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedCategory) {
      wx.showToast({
        title: '请选择消费类别',
        icon: 'none'
      });
      return;
    }
    
    if (!merchant) {
      wx.showToast({
        title: '请输入消费商家',
        icon: 'none'
      });
      return;
    }
    
    // 调用云函数保存消费记录
    wx.cloud.callFunction({
      name: 'createRecord',
      data: {
        amount: parseFloat(amount),
        category: selectedCategory,
        merchant: merchant,
        date: date,
        remark: remark || ''
      },
      success: res => {
        console.log('添加消费记录成功:', res.result);
        if (res.result.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
          
          // 延迟跳转到消费分析页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/consumption/analysis/analysis'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('添加消费记录失败:', err);
        wx.showToast({
          title: '添加失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 表单重置
   */
  onReset() {
    this.setData({
      amount: '',
      selectedCategory: '',
      merchant: '',
      remark: ''
    });
  }
})