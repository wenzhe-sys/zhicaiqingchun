const MentalHealthResource = require('../models/MentalHealthResource');
const { validationResult } = require('express-validator');

// 创建心理疗愈资源
exports.createMentalHealthResource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, type, category, duration, content, isFeatured } = req.body;

  try {
    const resource = await MentalHealthResource.create({
      title,
      description,
      type,
      category,
      duration,
      content,
      isFeatured
    });

    res.status(201).json(resource);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取心理疗愈资源列表
exports.getMentalHealthResources = async (req, res) => {
  try {
    const { type, category, isFeatured, page = 1, limit = 10 } = req.query;
    const query = {};

    // 添加筛选条件
    if (type) query.type = type;
    if (category) query.category = category;
    if (isFeatured === 'true') query.isFeatured = true;

    // 分页查询
    const resources = await MentalHealthResource.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentalHealthResource.countDocuments(query);

    res.status(200).json({
      resources,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取心理疗愈资源详情
exports.getMentalHealthResourceById = async (req, res) => {
  try {
    const resource = await MentalHealthResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    res.status(200).json(resource);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新心理疗愈资源
exports.updateMentalHealthResource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let resource = await MentalHealthResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    resource = await MentalHealthResource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(resource);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除心理疗愈资源
exports.deleteMentalHealthResource = async (req, res) => {
  try {
    const resource = await MentalHealthResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    await resource.remove();

    res.status(200).json({ message: '资源已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取心理疗愈资源分类
exports.getMentalHealthCategories = async (req, res) => {
  try {
    const categories = ['压力管理', '情绪调节', '焦虑缓解', '抑郁支持', '自尊提升', '人际关系', '睡眠改善'];
    res.status(200).json({ categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// AI心理陪伴系统
exports.aiCompanion = async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    // 简单的AI响应逻辑，这里可以替换为更复杂的AI模型
    const responses = [
      '我理解你的感受，你愿意告诉我更多吗？',
      '听起来你现在面临一些挑战，我在这里支持你。',
      '你的情绪是正常的，给自己一些时间和空间。',
      '你已经做得很好了，不要对自己太苛刻。',
      '尝试深呼吸，放松一下，一切都会好起来的。',
      '你有什么具体的问题或困扰想要探讨吗？',
      '记住，寻求帮助是勇敢的表现。',
      '你可以尝试写下自己的感受，这有助于理清思绪。',
      '保持积极的心态，专注于你能控制的事情。',
      '给自己设定小目标，逐步实现，会带来成就感。'
    ];

    // 随机选择一个响应
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // 模拟AI思考延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    res.status(200).json({
      response: randomResponse,
      context: [...context, { user: message, ai: randomResponse }],
      timestamp: new Date()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};
