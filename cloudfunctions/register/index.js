// cloudfunctions/auth/register/index.js
const cloud = require('wx-server-sdk')
const bcrypt = require('bcryptjs')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { username, email, password } = event

  try {
    // 检查用户是否已存在
    const existingUser = await db.collection('users').where({
      email: email
    }).get()

    if (existingUser.data.length > 0) {
      return {
        success: false,
        message: '该邮箱已被注册'
      }
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 创建用户
    const result = await db.collection('users').add({
      data: {
        username,
        email,
        password: hashedPassword,
        openid: wxContext.OPENID,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        _id: result._id,
        username,
        email
      },
      message: '注册成功'
    }
  } catch (error) {
    console.error('注册失败:', error)
    return {
      success: false,
      message: '注册失败，请稍后重试'
    }
  }
}