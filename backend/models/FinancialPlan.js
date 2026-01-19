const mongoose = require('mongoose');

const FinancialPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    required: [true, '请选择计划类型'],
    enum: ['monthly', 'yearly']
  },
  totalIncome: {
    type: Number,
    required: [true, '请输入总收入'],
    min: [0, '收入不能为负数']
  },
  categories: [
    {
      name: {
        type: String,
        required: [true, '请输入分类名称']
      },
      budget: {
        type: Number,
        required: [true, '请输入预算金额'],
        min: [0, '预算不能为负数']
      },
      actual: {
        type: Number,
        default: 0,
        min: [0, '实际支出不能为负数']
      }
    }
  ],
  savingsGoal: {
    type: Number,
    required: [true, '请输入储蓄目标'],
    min: [0, '储蓄目标不能为负数']
  },
  startDate: {
    type: Date,
    required: [true, '请选择开始日期']
  },
  endDate: {
    type: Date,
    required: [true, '请选择结束日期']
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

module.exports = mongoose.model('FinancialPlan', FinancialPlanSchema);
