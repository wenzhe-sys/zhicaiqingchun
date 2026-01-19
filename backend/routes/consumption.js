const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createConsumptionRecord,
  getConsumptionRecords,
  getConsumptionRecordById,
  updateConsumptionRecord,
  deleteConsumptionRecord,
  getConsumptionAnalysis,
  generateConsumptionPrediction,
  generateConsumptionEvaluation
} = require('../controllers/consumptionController');

// @route    POST /api/consumption
// @desc     创建消费记录
// @access   Private
router.post('/', [
  auth,
  check('amount', '请输入消费金额').isNumeric().isFloat({ min: 0.01 }),
  check('category', '请选择消费分类').not().isEmpty(),
  check('date', '请选择消费日期').isISO8601()
], createConsumptionRecord);

// @route    GET /api/consumption
// @desc     获取消费记录列表
// @access   Private
router.get('/', auth, getConsumptionRecords);

// @route    GET /api/consumption/:id
// @desc     获取消费记录详情
// @access   Private
router.get('/:id', auth, getConsumptionRecordById);

// @route    PUT /api/consumption/:id
// @desc     更新消费记录
// @access   Private
router.put('/:id', [
  auth,
  check('amount', '请输入消费金额').isNumeric().isFloat({ min: 0.01 }),
  check('category', '请选择消费分类').not().isEmpty(),
  check('date', '请选择消费日期').isISO8601()
], updateConsumptionRecord);

// @route    DELETE /api/consumption/:id
// @desc     删除消费记录
// @access   Private
router.delete('/:id', auth, deleteConsumptionRecord);

// @route    GET /api/consumption/analysis
// @desc     获取消费分析数据
// @access   Private
router.get('/analysis', auth, getConsumptionAnalysis);

// @route    GET /api/consumption/prediction
// @desc     生成消费预测报告
// @access   Private
router.get('/prediction', auth, generateConsumptionPrediction);

// @route    GET /api/consumption/evaluation
// @desc     生成消费评估报告
// @access   Private
router.get('/evaluation', auth, generateConsumptionEvaluation);

module.exports = router;
