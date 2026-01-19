// serverless/utils/auth.js
const jwt = require('jsonwebtoken');

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 验证JWT令牌
const protect = (req, res, next) => {
  let token;

  // 检查Authorization头
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 提取令牌
      token = req.headers.authorization.split(' ')[1];
      
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 将用户信息添加到请求对象
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: '无效的令牌' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '未提供令牌' });
  }
};

module.exports = { generateToken, protect };