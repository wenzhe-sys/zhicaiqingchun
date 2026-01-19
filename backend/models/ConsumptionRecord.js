const mongoose = require('mongoose');

const ConsumptionRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, '请输入消费金额'],
    min: [0.01, '消费金额必须大于0']
  },
  category: {
    type: String,
    required: [true, '请选择消费分类'],
    enum: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '其他']
  },
  date: {
    type: Date,
    required: [true, '请选择消费日期'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述长度不能超过200个字符']
  },
  paymentMethod: {
    type: String,
    enum: ['现金', '银行卡', '微信', '支付宝', '其他'],
    default: '微信'
  },
  location: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConsumptionRecord', ConsumptionRecordSchema);
