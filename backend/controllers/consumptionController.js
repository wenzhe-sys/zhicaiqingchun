const ConsumptionRecord = require('../models/ConsumptionRecord');
const { validationResult } = require('express-validator');

// 创建消费记录
exports.createConsumptionRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, category, date, description, paymentMethod, location } = req.body;

  try {
    const record = await ConsumptionRecord.create({
      userId: req.user.id,
      amount,
      category,
      date,
      description,
      paymentMethod,
      location
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取消费记录列表
exports.getConsumptionRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    // 添加筛选条件
    if (category) query.category = category;
    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

    // 分页查询
    const records = await ConsumptionRecord.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ConsumptionRecord.countDocuments(query);

    res.status(200).json({
      records,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取消费记录详情
exports.getConsumptionRecordById = async (req, res) => {
  try {
    const record = await ConsumptionRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: '消费记录不存在' });
    }

    // 验证记录是否属于当前用户
    if (record.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权访问该记录' });
    }

    res.status(200).json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新消费记录
exports.updateConsumptionRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let record = await ConsumptionRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: '消费记录不存在' });
    }

    // 验证记录是否属于当前用户
    if (record.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权访问该记录' });
    }

    record = await ConsumptionRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除消费记录
exports.deleteConsumptionRecord = async (req, res) => {
  try {
    const record = await ConsumptionRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: '消费记录不存在' });
    }

    // 验证记录是否属于当前用户
    if (record.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权访问该记录' });
    }

    await record.remove();

    res.status(200).json({ message: '消费记录已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取消费分析数据
exports.getConsumptionAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.id };

    // 设置默认时间范围为最近30天
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    query.date = {
      $gte: startDate ? new Date(startDate) : defaultStartDate,
      $lte: endDate ? new Date(endDate) : new Date()
    };

    // 按分类统计消费金额
    const categoryStats = await ConsumptionRecord.aggregate([
      { $match: query },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } },
      { $sort: { totalAmount: -1 } }
    ]);

    // 计算总消费
    const totalStats = await ConsumptionRecord.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // 按日期统计消费金额（用于趋势分析）
    const dailyStats = await ConsumptionRecord.aggregate([
      { $match: query },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalAmount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      categoryStats,
      totalAmount: totalStats[0]?.totalAmount || 0,
      totalCount: totalStats[0]?.count || 0,
      dailyStats,
      startDate: query.date.$gte,
      endDate: query.date.$lte
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 生成消费预测报告
exports.generateConsumptionPrediction = async (req, res) => {
  try {
    // 这里可以实现消费预测算法，例如基于历史数据的线性回归
    const { months = 3 } = req.query;
    const monthsToPredict = parseInt(months);

    // 获取过去6个月的消费数据
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const historicalData = await ConsumptionRecord.aggregate([
      { $match: { userId: req.user.id, date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, totalAmount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // 简单的预测算法：基于最近3个月的平均值
    let predictedAmount = 0;
    if (historicalData.length >= 3) {
      const recentData = historicalData.slice(-3);
      const average = recentData.reduce((sum, item) => sum + item.totalAmount, 0) / recentData.length;
      predictedAmount = average * monthsToPredict;
    }

    res.status(200).json({
      prediction: {
        months: monthsToPredict,
        predictedTotalAmount: predictedAmount,
        averageMonthlyAmount: predictedAmount / monthsToPredict
      },
      historicalData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 生成消费评估报告
exports.generateConsumptionEvaluation = async (req, res) => {
  try {
    // 评估周期：最近30天
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query = { userId: req.user.id, date: { $gte: thirtyDaysAgo } };

    // 获取评估数据
    const totalStats = await ConsumptionRecord.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const categoryStats = await ConsumptionRecord.aggregate([
      { $match: query },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } },
      { $sort: { totalAmount: -1 } }
    ]);

    // 生成评估建议（示例逻辑）
    const totalAmount = totalStats[0]?.totalAmount || 0;
    const evaluation = {
      totalAmount,
      totalCount: totalStats[0]?.count || 0,
      averageDailyAmount: totalAmount / 30,
      categoryDistribution: categoryStats,
      suggestions: []
    };

    // 根据消费情况生成建议
    if (totalAmount > 5000) {
      evaluation.suggestions.push('您的本月消费较高，建议适当控制支出');
    }

    const foodExpense = categoryStats.find(item => item._id === '餐饮')?.totalAmount || 0;
    if (foodExpense > totalAmount * 0.4) {
      evaluation.suggestions.push('餐饮支出占比较高，建议尝试自己做饭，节省开支');
    }

    const entertainmentExpense = categoryStats.find(item => item._id === '娱乐')?.totalAmount || 0;
    if (entertainmentExpense > totalAmount * 0.3) {
      evaluation.suggestions.push('娱乐支出占比较高，建议适当减少娱乐消费');
    }

    res.status(200).json(evaluation);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};
