// cloudfunctions/auth/login/index.js
const cloud = require('wx-server-sdk')
const bcrypt = require('bcryptjs')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { email, password } = event

  try {
    // 查找用户
    const userResult = await db.collection('users').where({
      email: email
    }).get()

    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '邮箱或密码错误'
      }
    }

    const user = userResult.data[0]

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return {
        success: false,
        message: '邮箱或密码错误'
      }
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user

    return {
      success: true,
      data: userInfo,
      message: '登录成功'
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      message: '登录失败，请稍后重试'
    }
  }
}