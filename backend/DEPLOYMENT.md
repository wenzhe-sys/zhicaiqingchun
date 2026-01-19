# 智财青春后端部署指南

## 1. 环境要求

- Node.js 18.x 或更高版本
- MongoDB 4.x 或更高版本
- 推荐使用 Linux 系统（Ubuntu 22.04 LTS）

## 2. 本地开发环境搭建

### 2.1 安装 Node.js

```bash
# Ubuntu/Debian 系统
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 2.2 安装 MongoDB

```bash
# Ubuntu/Debian 系统
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动 MongoDB 服务
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证安装
sudo systemctl status mongod
```

### 2.3 安装依赖

```bash
cd backend
npm install
```

### 2.4 配置环境变量

复制 `.env.example` 文件并修改为 `.env`，然后根据需要调整配置：

```bash
cp .env.example .env
```

`.env` 文件内容示例：

```
# 数据库配置
MONGO_URI=mongodb://localhost:27017/zhicaiqc

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 2.5 启动开发服务器

```bash
node app.js
```

或者使用 nodemon 进行热重载开发：

```bash
npm install -g nodemon
nodemon app.js
```

## 3. 生产环境部署

### 3.1 使用 PM2 管理进程

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start app.js --name "zhicaiqc"

# 配置 PM2 开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# 保存当前进程列表
pm2 save
```

### 3.2 使用 Nginx 作为反向代理

```bash
# 安装 Nginx
sudo apt-get install -y nginx

# 配置 Nginx
sudo nano /etc/nginx/sites-available/zhicaiqc
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 前端静态文件配置
    location / {
        root /path/to/your/frontend;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # 后端API配置
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置并重启 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/zhicaiqc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.3 配置 HTTPS（推荐）

使用 Let's Encrypt 申请免费 SSL 证书：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

## 4. 数据库备份与恢复

### 4.1 备份数据库

```bash
mongodump --db zhicaiqc --out /path/to/backup
```

### 4.2 恢复数据库

```bash
mongorestore --db zhicaiqc /path/to/backup/zhicaiqc
```

## 5. 常见问题排查

### 5.1 MongoDB 连接失败

- 检查 MongoDB 服务是否正在运行：`sudo systemctl status mongod`
- 检查 MongoDB 配置是否正确
- 检查防火墙是否允许访问 27017 端口

### 5.2 端口被占用

- 查看端口占用情况：`lsof -i :3000`
- 杀死占用端口的进程：`kill -9 <PID>`
- 修改 `.env` 文件中的 `PORT` 配置

### 5.3 PM2 进程管理

- 查看进程状态：`pm2 status`
- 查看日志：`pm2 logs zhicaiqc`
- 重启进程：`pm2 restart zhicaiqc`
- 停止进程：`pm2 stop zhicaiqc`

## 6. API 文档

### 6.1 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 6.2 消费相关 API

- `POST /api/consumption` - 创建消费记录
- `GET /api/consumption` - 获取消费记录列表
- `GET /api/consumption/:id` - 获取消费记录详情
- `PUT /api/consumption/:id` - 更新消费记录
- `DELETE /api/consumption/:id` - 删除消费记录
- `GET /api/consumption/analysis` - 获取消费分析数据
- `GET /api/consumption/prediction` - 生成消费预测报告
- `GET /api/consumption/evaluation` - 生成消费评估报告

### 6.3 理财规划 API

- `POST /api/finance/plans` - 创建理财规划
- `GET /api/finance/plans` - 获取理财规划列表
- `GET /api/finance/plans/:id` - 获取理财规划详情
- `PUT /api/finance/plans/:id` - 更新理财规划
- `DELETE /api/finance/plans/:id` - 删除理财规划
- `POST /api/finance/budget` - 生成预算规划
- `GET /api/finance/health-report` - 生成健康评估报告

### 6.4 教育赋能 API

- `POST /api/education/paths` - 创建学习路径
- `GET /api/education/paths` - 获取学习路径列表
- `GET /api/education/paths/:id` - 获取学习路径详情
- `PUT /api/education/paths/:id` - 更新学习路径
- `DELETE /api/education/paths/:id` - 删除学习路径
- `GET /api/education/categories` - 获取学习路径分类
- `GET /api/education/recommend` - 推荐学习路径

### 6.5 心理疗愈 API

- `POST /api/mental-health/resources` - 创建心理疗愈资源
- `GET /api/mental-health/resources` - 获取心理疗愈资源列表
- `GET /api/mental-health/resources/:id` - 获取心理疗愈资源详情
- `PUT /api/mental-health/resources/:id` - 更新心理疗愈资源
- `DELETE /api/mental-health/resources/:id` - 删除心理疗愈资源
- `GET /api/mental-health/categories` - 获取心理疗愈资源分类
- `POST /api/mental-health/ai-companion` - AI心理陪伴系统

## 7. 监控与维护

- 定期备份数据库
- 监控服务器资源使用情况
- 定期更新依赖包，修复安全漏洞
- 查看日志文件，及时发现并解决问题

## 8. 安全建议

- 使用 HTTPS 加密传输
- 设置强密码策略
- 定期更换 JWT 密钥
- 限制 API 访问频率
- 对敏感数据进行加密存储
- 定期进行安全审计

---

部署完成后，您可以通过浏览器访问 `http://your_domain.com` 来使用智财青春小程序。
