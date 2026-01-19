// serverless/config/models/ConsumptionRecord.js
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
    min: 0
  },
  category: {
    type: String,
    required: [true, '请选择消费类别'],
    enum: ['餐饮', '购物', '交通', '娱乐', '日用品', '其他']
  },
  merchant: {
    type: String,
    required: [true, '请输入消费商家'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, '请选择消费日期'],
    default: Date.now
  },
  remark: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConsumptionRecord', ConsumptionRecordSchema);