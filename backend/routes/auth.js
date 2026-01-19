const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { register, login, getCurrentUser } = require('../controllers/authController');

// @route    POST /api/auth/register
// @desc     用户注册
// @access   Public
router.post('/register', [
  check('username', '用户名长度不能少于3个字符').isLength({ min: 3 }),
  check('email', '请输入有效的邮箱地址').isEmail(),
  check('password', '密码长度不能少于6个字符').isLength({ min: 6 })
], register);

// @route    POST /api/auth/login
// @desc     用户登录
// @access   Public
router.post('/login', [
  check('email', '请输入有效的邮箱地址').isEmail(),
  check('password', '密码不能为空').exists()
], login);

// @route    GET /api/auth/me
// @desc     获取当前用户信息
// @access   Private
router.get('/me', auth, getCurrentUser);

module.exports = router;
