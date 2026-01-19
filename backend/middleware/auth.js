const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  let token;

  // 检查请求头中的Authorization字段
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 提取令牌
      token = req.headers.authorization.split(' ')[1];

      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 将用户信息添加到请求对象中
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (err) {
      console.error(err.message);
      res.status(401).json({ message: '未授权，请重新登录' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '未授权，请重新登录' });
  }
};

module.exports = auth;
