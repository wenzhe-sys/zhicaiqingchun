const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 初始化应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 数据存储路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 确保数据文件存在
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(RECORDS_FILE)) {
  fs.writeFileSync(RECORDS_FILE, JSON.stringify([]));
}

// 读取数据
const readData = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// 写入数据
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 认证中间件
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: '无效的认证令牌' });
  }
};

// API路由

// 测试路由
app.get('/', (req, res) => {
  res.send('智财青春后端API服务正在运行');
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = readData(USERS_FILE);

    // 检查用户是否已存在
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    if (users.some(user => user.username === username)) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    // 生成令牌
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readData(USERS_FILE);

    // 查找用户
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 生成令牌
    const token = generateToken(user.id);

    res.status(200).json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', auth, (req, res) => {
  try {
    const users = readData(USERS_FILE);
    const user = users.find(user => user.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建消费记录
app.post('/api/consumption', auth, (req, res) => {
  try {
    const { amount, category, date, description, paymentMethod, location } = req.body;
    const records = readData(RECORDS_FILE);

    // 创建新记录
    const newRecord = {
      id: Date.now().toString(),
      userId: req.user.id,
      amount,
      category,
      date: new Date(date).toISOString(),
      description,
      paymentMethod: paymentMethod || '微信',
      location,
      createdAt: new Date().toISOString()
    };

    records.push(newRecord);
    writeData(RECORDS_FILE, records);

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取消费记录列表
app.get('/api/consumption', auth, (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const records = readData(RECORDS_FILE);

    // 过滤用户记录
    let userRecords = records.filter(record => record.userId === req.user.id);

    // 分类过滤
    if (category) {
      userRecords = userRecords.filter(record => record.category === category);
    }

    // 日期过滤
    if (startDate) {
      userRecords = userRecords.filter(record => new Date(record.date) >= new Date(startDate));
    }

    if (endDate) {
      userRecords = userRecords.filter(record => new Date(record.date) <= new Date(endDate));
    }

    // 按日期降序排序
    userRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 分页
    const total = userRecords.length;
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / parseInt(limit));
    const paginatedRecords = userRecords.slice(
      (currentPage - 1) * parseInt(limit),
      currentPage * parseInt(limit)
    );

    res.status(200).json({
      records: paginatedRecords,
      total,
      currentPage,
      totalPages
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取消费记录详情
app.get('/api/consumption/:id', auth, (req, res) => {
  try {
    const records = readData(RECORDS_FILE);
    const record = records.find(r => r.id === req.params.id);

    if (!record) {
      return res.status(404).json({ message: '消费记录不存在' });
    }

    if (record.userId !== req.user.id) {
      return res.status(403).json({ message: '无权访问该记录' });
    }

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新消费记录
app.put('/api/consumption/:id', auth, (req, res) => {
  try {
    const { amount, category, date, description, paymentMethod, location } = req.body;
    const records = readData(RECORDS_FILE);
    const recordIndex = records.findIndex(r => r.id === req.params.id);

    if (recordIndex === -1) {
      return res.status(404).json({ message: '消费记录不存在' });
    }

    if (records[recordIndex].userId !== req.user.id) {
      return res.status(403).json({ message: '无权访问该记录' });
    }

    // 更新记录
    records[recordIndex] = {
      ...records[recordIndex],
      amount,
      category,
      date: new Date(date).toISOString(),
      description,
      paymentMethod: paymentMethod || records[recordIndex].paymentMethod,
      location
    };

    writeData(RECORDS_FILE, records);

    res.status(200).json(records[recordIndex]);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除消费记录
app.delete('/api/consumption/:id', auth, (req, res) => {
  try {
    const records = readData(RECORDS_FILE);
    const recordIndex = records.findIndex(r => r.id === req.params.id);

    if (recordIndex === -1) {
      return res.status(404).json({ message: '消费记录不存在' });
    }

    if (records[recordIndex].userId !== req.user.id) {
      return res.status(403).json({ message: '无权访问该记录' });
    }

    // 删除记录
    records.splice(recordIndex, 1);
    writeData(RECORDS_FILE, records);

    res.status(200).json({ message: '消费记录已删除' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取消费分析数据
app.get('/api/consumption/analysis', auth, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const records = readData(RECORDS_FILE);

    // 过滤用户记录
    let userRecords = records.filter(record => record.userId === req.user.id);

    // 设置默认时间范围为最近30天
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    // 日期过滤
    userRecords = userRecords.filter(record => {
      const recordDate = new Date(record.date);
      return (
        recordDate >= (startDate ? new Date(startDate) : defaultStartDate) &&
        recordDate <= (endDate ? new Date(endDate) : new Date())
      );
    });

    // 按分类统计
    const categoryStats = userRecords.reduce((stats, record) => {
      stats[record.category] = (stats[record.category] || 0) + record.amount;
      return stats;
    }, {});

    // 转换为数组格式
    const categoryStatsArray = Object.entries(categoryStats).map(([category, totalAmount]) => ({
      _id: category,
      totalAmount
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    // 计算总消费
    const totalAmount = userRecords.reduce((sum, record) => sum + record.amount, 0);
    const totalCount = userRecords.length;

    // 按日期统计
    const dailyStats = userRecords.reduce((stats, record) => {
      const date = new Date(record.date).toISOString().split('T')[0];
      stats[date] = (stats[date] || 0) + record.amount;
      return stats;
    }, {});

    // 转换为数组格式
    const dailyStatsArray = Object.entries(dailyStats).map(([date, totalAmount]) => ({
      _id: date,
      totalAmount
    })).sort((a, b) => new Date(a._id) - new Date(b._id));

    res.status(200).json({
      categoryStats: categoryStatsArray,
      totalAmount,
      totalCount,
      dailyStats: dailyStatsArray,
      startDate: startDate || defaultStartDate.toISOString(),
      endDate: endDate || new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 测试路由
app.get('/', (req, res) => {
  res.send('智财青春Serverless后端服务正在运行');
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
