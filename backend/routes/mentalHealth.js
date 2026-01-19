const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createMentalHealthResource,
  getMentalHealthResources,
  getMentalHealthResourceById,
  updateMentalHealthResource,
  deleteMentalHealthResource,
  getMentalHealthCategories,
  aiCompanion
} = require('../controllers/mentalHealthController');

// @route    POST /api/mental-health/resources
// @desc     创建心理疗愈资源
// @access   Private
router.post('/resources', [
  auth,
  check('title', '请输入资源标题').not().isEmpty(),
  check('description', '请输入资源描述').not().isEmpty(),
  check('type', '请选择资源类型').isIn(['文章', '音频', '视频', '测试', '练习']),
  check('category', '请选择资源分类').isIn(['压力管理', '情绪调节', '焦虑缓解', '抑郁支持', '自尊提升', '人际关系', '睡眠改善']),
  check('duration', '请输入预计时长').isNumeric().isInt({ min: 1 }),
  check('content', '请输入资源内容').not().isEmpty()
], createMentalHealthResource);

// @route    GET /api/mental-health/resources
// @desc     获取心理疗愈资源列表
// @access   Public
router.get('/resources', getMentalHealthResources);

// @route    GET /api/mental-health/resources/:id
// @desc     获取心理疗愈资源详情
// @access   Public
router.get('/resources/:id', getMentalHealthResourceById);

// @route    PUT /api/mental-health/resources/:id
// @desc     更新心理疗愈资源
// @access   Private
router.put('/resources/:id', [
  auth,
  check('title', '请输入资源标题').not().isEmpty(),
  check('description', '请输入资源描述').not().isEmpty(),
  check('type', '请选择资源类型').isIn(['文章', '音频', '视频', '测试', '练习']),
  check('category', '请选择资源分类').isIn(['压力管理', '情绪调节', '焦虑缓解', '抑郁支持', '自尊提升', '人际关系', '睡眠改善']),
  check('duration', '请输入预计时长').isNumeric().isInt({ min: 1 }),
  check('content', '请输入资源内容').not().isEmpty()
], updateMentalHealthResource);

// @route    DELETE /api/mental-health/resources/:id
// @desc     删除心理疗愈资源
// @access   Private
router.delete('/resources/:id', auth, deleteMentalHealthResource);

// @route    GET /api/mental-health/categories
// @desc     获取心理疗愈资源分类
// @access   Public
router.get('/categories', getMentalHealthCategories);

// @route    POST /api/mental-health/ai-companion
// @desc     AI心理陪伴系统
// @access   Private
router.post('/ai-companion', [
  auth,
  check('message', '请输入对话内容').not().isEmpty()
], aiCompanion);

module.exports = router;
