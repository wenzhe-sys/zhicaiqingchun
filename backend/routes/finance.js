const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createFinancialPlan,
  getFinancialPlans,
  getFinancialPlanById,
  updateFinancialPlan,
  deleteFinancialPlan,
  generateBudgetPlan,
  generateHealthReport
} = require('../controllers/financeController');

// @route    POST /api/finance/plans
// @desc     创建理财规划
// @access   Private
router.post('/plans', [
  auth,
  check('planType', '请选择计划类型').isIn(['monthly', 'yearly']),
  check('totalIncome', '请输入总收入').isNumeric().isFloat({ min: 0 }),
  check('categories', '请添加至少一个预算分类').isArray({ min: 1 }),
  check('savingsGoal', '请输入储蓄目标').isNumeric().isFloat({ min: 0 }),
  check('startDate', '请选择开始日期').isISO8601(),
  check('endDate', '请选择结束日期').isISO8601()
], createFinancialPlan);

// @route    GET /api/finance/plans
// @desc     获取理财规划列表
// @access   Private
router.get('/plans', auth, getFinancialPlans);

// @route    GET /api/finance/plans/:id
// @desc     获取理财规划详情
// @access   Private
router.get('/plans/:id', auth, getFinancialPlanById);

// @route    PUT /api/finance/plans/:id
// @desc     更新理财规划
// @access   Private
router.put('/plans/:id', [
  auth,
  check('planType', '请选择计划类型').isIn(['monthly', 'yearly']),
  check('totalIncome', '请输入总收入').isNumeric().isFloat({ min: 0 }),
  check('categories', '请添加至少一个预算分类').isArray({ min: 1 }),
  check('savingsGoal', '请输入储蓄目标').isNumeric().isFloat({ min: 0 }),
  check('startDate', '请选择开始日期').isISO8601(),
  check('endDate', '请选择结束日期').isISO8601()
], updateFinancialPlan);

// @route    DELETE /api/finance/plans/:id
// @desc     删除理财规划
// @access   Private
router.delete('/plans/:id', auth, deleteFinancialPlan);

// @route    POST /api/finance/budget
// @desc     生成预算规划
// @access   Private
router.post('/budget', [
  auth,
  check('monthlyIncome', '请输入月收入').isNumeric().isFloat({ min: 0 }),
  check('savingsRate', '储蓄率必须在0-1之间').optional().isFloat({ min: 0, max: 1 })
], generateBudgetPlan);

// @route    GET /api/finance/health-report
// @desc     生成健康评估报告
// @access   Private
router.get('/health-report', auth, generateHealthReport);

module.exports = router;
