// cloudfunctions/auth/getUserInfo/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 根据openid查找用户
    const userResult = await db.collection('users').where({
      openid: wxContext.OPENID
    }).get()

    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = userResult.data[0]

    return {
      success: true,
      data: userInfo,
      message: '获取用户信息成功'
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      message: '获取用户信息失败，请稍后重试'
    }
  }
}