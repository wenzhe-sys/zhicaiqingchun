const mongoose = require('mongoose');

const LearningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入学习路径标题']
  },
  description: {
    type: String,
    required: [true, '请输入学习路径描述']
  },
  category: {
    type: String,
    required: [true, '请选择学习分类'],
    enum: ['基础金融', '投资管理', '消费理财', '职业规划', '创业指导']
  },
  level: {
    type: String,
    required: [true, '请选择学习难度'],
    enum: ['入门', '进阶', '高级']
  },
  duration: {
    type: Number,
    required: [true, '请输入预计学习时长（小时）'],
    min: [1, '学习时长不能少于1小时']
  },
  modules: [
    {
      title: {
        type: String,
        required: [true, '请输入模块标题']
      },
      description: {
        type: String,
        required: [true, '请输入模块描述']
      },
      duration: {
        type: Number,
        required: [true, '请输入模块时长（分钟）'],
        min: [5, '模块时长不能少于5分钟']
      },
      content: {
        type: String,
        required: [true, '请输入模块内容']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
