const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createLearningPath,
  getLearningPaths,
  getLearningPathById,
  updateLearningPath,
  deleteLearningPath,
  getLearningPathCategories,
  recommendLearningPaths
} = require('../controllers/educationController');

// @route    POST /api/education/paths
// @desc     创建学习路径
// @access   Private
router.post('/paths', [
  auth,
  check('title', '请输入学习路径标题').not().isEmpty(),
  check('description', '请输入学习路径描述').not().isEmpty(),
  check('category', '请选择学习分类').isIn(['基础金融', '投资管理', '消费理财', '职业规划', '创业指导']),
  check('level', '请选择学习难度').isIn(['入门', '进阶', '高级']),
  check('duration', '请输入预计学习时长').isNumeric().isInt({ min: 1 }),
  check('modules', '请添加至少一个学习模块').isArray({ min: 1 })
], createLearningPath);

// @route    GET /api/education/paths
// @desc     获取学习路径列表
// @access   Public
router.get('/paths', getLearningPaths);

// @route    GET /api/education/paths/:id
// @desc     获取学习路径详情
// @access   Public
router.get('/paths/:id', getLearningPathById);

// @route    PUT /api/education/paths/:id
// @desc     更新学习路径
// @access   Private
router.put('/paths/:id', [
  auth,
  check('title', '请输入学习路径标题').not().isEmpty(),
  check('description', '请输入学习路径描述').not().isEmpty(),
  check('category', '请选择学习分类').isIn(['基础金融', '投资管理', '消费理财', '职业规划', '创业指导']),
  check('level', '请选择学习难度').isIn(['入门', '进阶', '高级']),
  check('duration', '请输入预计学习时长').isNumeric().isInt({ min: 1 }),
  check('modules', '请添加至少一个学习模块').isArray({ min: 1 })
], updateLearningPath);

// @route    DELETE /api/education/paths/:id
// @desc     删除学习路径
// @access   Private
router.delete('/paths/:id', auth, deleteLearningPath);

// @route    GET /api/education/categories
// @desc     获取学习路径分类
// @access   Public
router.get('/categories', getLearningPathCategories);

// @route    GET /api/education/recommend
// @desc     推荐学习路径
// @access   Public
router.get('/recommend', recommendLearningPaths);

module.exports = router;
