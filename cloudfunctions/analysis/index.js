// cloudfunctions/consumption/analysis/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { timeRange = 'week', searchKey = '' } = event

  try {
    // 设置默认时间范围
    const now = new Date()
    const startDate = new Date()
    
    // 根据timeRange设置开始日期
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // 构建查询条件
    const query = {
      userId: wxContext.OPENID,
      date: {
        $gte: startDate,
        $lte: now
      }
    }

    // 如果有搜索关键词，添加搜索条件
    if (searchKey) {
      query.merchant = db.RegExp({
        regexp: searchKey,
        options: 'i' // 不区分大小写
      })
    }

    // 按分类统计消费金额
    const categoryStats = await db.collection('consumption_records')
      .where(query)
      .aggregate()
      .group({
        _id: '$category',
        totalAmount: db.command.sum('$amount')
      })
      .sort({
        totalAmount: -1
      })
      .end()

    // 计算总消费
    const totalStats = await db.collection('consumption_records')
      .where(query)
      .aggregate()
      .group({
        _id: null,
        totalAmount: db.command.sum('$amount'),
        count: db.command.sum(1)
      })
      .end()

    // 按日期统计消费金额（用于趋势分析）
    const dailyStats = await db.collection('consumption_records')
      .where(query)
      .aggregate()
      .group({
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalAmount: db.command.sum('$amount')
      })
      .sort({
        _id: 1
      })
      .end()

    // 获取最近的消费记录
    const recentRecords = await db.collection('consumption_records')
      .where(query)
      .orderBy('date', 'desc')
      .limit(20)
      .get()

    return {
      success: true,
      data: {
        categoryStats: categoryStats.list,
        totalAmount: totalStats.list[0]?.totalAmount || 0,
        totalCount: totalStats.list[0]?.count || 0,
        dailyStats: dailyStats.list,
        recentRecords: recentRecords.data,
        startDate: startDate,
        endDate: now
      },
      message: '获取消费分析成功'
    }
  } catch (error) {
    console.error('获取消费分析失败:', error)
    return {
      success: false,
      message: '获取消费分析失败，请稍后重试'
    }
  }
}