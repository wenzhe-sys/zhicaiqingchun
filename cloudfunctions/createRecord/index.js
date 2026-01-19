// cloudfunctions/consumption/createRecord/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { amount, category, merchant, date, remark } = event

  try {
    // 创建消费记录
    const result = await db.collection('consumption_records').add({
      data: {
        userId: wxContext.OPENID,
        amount,
        category,
        merchant,
        date: new Date(date),
        remark,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })

    return {
      success: true,
      data: result,
      message: '消费记录创建成功'
    }
  } catch (error) {
    console.error('创建消费记录失败:', error)
    return {
      success: false,
      message: '创建消费记录失败，请稍后重试'
    }
  }
}