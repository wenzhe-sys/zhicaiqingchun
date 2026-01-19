const LearningPath = require('../models/LearningPath');
const { validationResult } = require('express-validator');

// 创建学习路径
exports.createLearningPath = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, category, level, duration, modules } = req.body;

  try {
    const learningPath = await LearningPath.create({
      title,
      description,
      category,
      level,
      duration,
      modules
    });

    res.status(201).json(learningPath);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取学习路径列表
exports.getLearningPaths = async (req, res) => {
  try {
    const { category, level, page = 1, limit = 10 } = req.query;
    const query = {};

    // 添加筛选条件
    if (category) query.category = category;
    if (level) query.level = level;

    // 分页查询
    const paths = await LearningPath.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LearningPath.countDocuments(query);

    res.status(200).json({
      paths,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取学习路径详情
exports.getLearningPathById = async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);

    if (!path) {
      return res.status(404).json({ message: '学习路径不存在' });
    }

    res.status(200).json(path);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新学习路径
exports.updateLearningPath = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let path = await LearningPath.findById(req.params.id);

    if (!path) {
      return res.status(404).json({ message: '学习路径不存在' });
    }

    path = await LearningPath.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(path);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除学习路径
exports.deleteLearningPath = async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);

    if (!path) {
      return res.status(404).json({ message: '学习路径不存在' });
    }

    await path.remove();

    res.status(200).json({ message: '学习路径已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取学习路径分类
exports.getLearningPathCategories = async (req, res) => {
  try {
    const categories = ['基础金融', '投资管理', '消费理财', '职业规划', '创业指导'];
    res.status(200).json({ categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 推荐学习路径
exports.recommendLearningPaths = async (req, res) => {
  try {
    // 简单的推荐逻辑：根据用户可能的兴趣推荐
    // 这里可以扩展为基于用户行为的个性化推荐
    const recommendedPaths = await LearningPath.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ recommendedPaths });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};
