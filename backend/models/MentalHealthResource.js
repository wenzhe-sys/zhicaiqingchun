const mongoose = require('mongoose');

const MentalHealthResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入资源标题']
  },
  description: {
    type: String,
    required: [true, '请输入资源描述']
  },
  type: {
    type: String,
    required: [true, '请选择资源类型'],
    enum: ['文章', '音频', '视频', '测试', '练习']
  },
  category: {
    type: String,
    required: [true, '请选择资源分类'],
    enum: ['压力管理', '情绪调节', '焦虑缓解', '抑郁支持', '自尊提升', '人际关系', '睡眠改善']
  },
  duration: {
    type: Number,
    required: [true, '请输入预计时长（分钟）'],
    min: [1, '时长不能少于1分钟']
  },
  content: {
    type: String,
    required: [true, '请输入资源内容']
  },
  isFeatured: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('MentalHealthResource', MentalHealthResourceSchema);
