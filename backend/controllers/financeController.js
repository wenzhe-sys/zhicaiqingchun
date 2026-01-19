const FinancialPlan = require('../models/FinancialPlan');
const ConsumptionRecord = require('../models/ConsumptionRecord');
const { validationResult } = require('express-validator');

// 创建理财规划
exports.createFinancialPlan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { planType, totalIncome, categories, savingsGoal, startDate, endDate } = req.body;

  try {
    const plan = await FinancialPlan.create({
      userId: req.user.id,
      planType,
      totalIncome,
      categories,
      savingsGoal,
      startDate,
      endDate
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取理财规划列表
exports.getFinancialPlans = async (req, res) => {
  try {
    const { planType } = req.query;
    const query = { userId: req.user.id };

    if (planType) query.planType = planType;

    const plans = await FinancialPlan.find(query).sort({ startDate: -1 });

    res.status(200).json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取理财规划详情
exports.getFinancialPlanById = async (req, res) => {
  try {
    const plan = await FinancialPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: '理财规划不存在' });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权访问该规划' });
    }

    res.status(200).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新理财规划
exports.updateFinancialPlan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let plan = await FinancialPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: '理财规划不存在' });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权访问该规划' });
    }

    plan = await FinancialPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除理财规划
exports.deleteFinancialPlan = async (req, res) => {
  try {
    const plan = await FinancialPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: '理财规划不存在' });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '无权访问该规划' });
    }

    await plan.remove();

    res.status(200).json({ message: '理财规划已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 生成预算规划工具
exports.generateBudgetPlan = async (req, res) => {
  try {
    const { monthlyIncome, savingsRate = 0.2 } = req.body;

    // 根据收入和储蓄率生成预算建议
    const savingsAmount = monthlyIncome * savingsRate;
    const availableForExpenses = monthlyIncome - savingsAmount;

    // 基于50/30/20法则生成分类建议
    const budgetSuggestion = {
      totalIncome: monthlyIncome,
      savingsGoal: savingsAmount,
      categories: [
        { name: '必要支出', budget: availableForExpenses * 0.5 },
        { name: '需求支出', budget: availableForExpenses * 0.3 },
        { name: '自由支出', budget: availableForExpenses * 0.2 }
      ],
      savingsRate,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    };

    res.status(200).json(budgetSuggestion);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 生成健康评估报告
exports.generateHealthReport = async (req, res) => {
  try {
    // 获取最近3个月的消费数据
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const consumptionData = await ConsumptionRecord.aggregate([
      { $match: { userId: req.user.id, date: { $gte: threeMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, totalAmount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // 获取当前有效的理财规划
    const currentPlan = await FinancialPlan.findOne({
      userId: req.user.id,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    // 计算财务健康评分（示例逻辑）
    let healthScore = 70; // 基础分数
    let healthLevel = '良好';
    const recommendations = [];

    // 根据消费趋势调整分数
    if (consumptionData.length >= 2) {
      const latestMonth = consumptionData[consumptionData.length - 1].totalAmount;
      const previousMonth = consumptionData[consumptionData.length - 2].totalAmount;
      const growthRate = (latestMonth - previousMonth) / previousMonth;

      if (growthRate > 0.2) {
        healthScore -= 10;
        recommendations.push('消费增长过快，建议控制支出');
      } else if (growthRate < 0) {
        healthScore += 10;
        recommendations.push('消费呈下降趋势，继续保持良好习惯');
      }
    }

    // 根据储蓄情况调整分数
    if (currentPlan) {
      const totalBudget = currentPlan.categories.reduce((sum, cat) => sum + cat.budget, 0);
      const totalActual = currentPlan.categories.reduce((sum, cat) => sum + (cat.actual || 0), 0);
      const savingsAchievement = currentPlan.savingsGoal > 0 ? 
        ((currentPlan.totalIncome - totalActual) / currentPlan.savingsGoal) * 100 : 0;

      if (savingsAchievement >= 100) {
        healthScore += 15;
        recommendations.push('已达成储蓄目标，继续保持');
      } else if (savingsAchievement >= 70) {
        healthScore += 5;
        recommendations.push('接近储蓄目标，继续努力');
      } else {
        healthScore -= 10;
        recommendations.push('储蓄进度不足，建议增加储蓄');
      }
    }

    // 确定健康等级
    if (healthScore >= 90) {
      healthLevel = '优秀';
    } else if (healthScore >= 70) {
      healthLevel = '良好';
    } else if (healthScore >= 50) {
      healthLevel = '一般';
    } else {
      healthLevel = '较差';
    }

    // 生成报告
    const report = {
      healthScore,
      healthLevel,
      consumptionTrend: consumptionData,
      currentPlan,
      recommendations,
      assessmentDate: new Date()
    };

    res.status(200).json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};
