const axios = require('axios');

// 测试API端点
const testApi = async () => {
  console.log('开始测试智财青春后端API...');
  
  try {
    // 测试根路径
    console.log('\n1. 测试根路径 http://localhost:3000');
    const rootResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('✅ 根路径测试成功:', rootResponse.data);
    
    // 测试教育赋能分类API（公开接口）
    console.log('\n2. 测试教育赋能分类API http://localhost:3000/api/education/categories');
    const categoriesResponse = await axios.get('http://localhost:3000/api/education/categories', { timeout: 5000 });
    console.log('✅ 教育赋能分类API测试成功:', categoriesResponse.data);
    
    // 测试心理疗愈分类API（公开接口）
    console.log('\n3. 测试心理疗愈分类API http://localhost:3000/api/mental-health/categories');
    const mentalHealthCategoriesResponse = await axios.get('http://localhost:3000/api/mental-health/categories', { timeout: 5000 });
    console.log('✅ 心理疗愈分类API测试成功:', mentalHealthCategoriesResponse.data);
    
    console.log('\n🎉 所有公开API测试成功！');
    console.log('\n提示：需要认证的API端点需要先注册用户，然后使用JWT令牌进行测试。');
  } catch (error) {
    console.error('\n❌ API测试失败:');
    console.error('错误类型:', error.code || error.name);
    console.error('错误信息:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送，但未收到响应');
      console.error('请求详情:', error.request);
    }
    console.error('\n可能的原因:');
    console.error('1. MongoDB数据库未运行');
    console.error('2. 端口3000被占用');
    console.error('3. 后端服务器未正常启动');
  }
};

testApi();
