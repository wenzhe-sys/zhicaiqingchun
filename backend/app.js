const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// 加载环境变量
dotenv.config();

// 初始化应用
const app = express();

// 连接数据库
connectDB();

// 中间件配置
app.use(cors());
app.use(express.json()); // 解析JSON请求体

// 导入路由
const authRoutes = require('./routes/auth');
const consumptionRoutes = require('./routes/consumption');
const financeRoutes = require('./routes/finance');
const educationRoutes = require('./routes/education');
const mentalHealthRoutes = require('./routes/mentalHealth');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/mental-health', mentalHealthRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.send('智财青春后端API服务正在运行');
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
