// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    switch (event.action) {
      case 'getLikeCount':
        return await getLikeCount()
      case 'addLike':
        return await addLike(event, openid)
      case 'getLikes':
        return await getLikes(event)
      default:
        throw new Error('未知操作')
    }
  } catch (error) {
    console.error('云函数执行出错:', error)
    return {
      success: false,
      error: error.message || '服务器错误'
    }
  }
}

// 获取点赞数量
async function getLikeCount() {
  try {
    const countResult = await db.collection('likes').count()
    return {
      success: true,
      data: {
        likeCount: countResult.total
      }
    }
  } catch (error) {
    console.error('获取点赞数量失败:', error)
    throw new Error('获取点赞数量失败')
  }
}

// 添加点赞（支持身份信息）
async function addLike(event, openid) {
  const { nickName = '匿名用户', identityType = 'anonymous' } = event
  
  try {
    // 添加点赞记录，包含身份信息
    await db.collection('likes').add({
      data: {
        openid,
        nickName: nickName.trim() || '匿名用户',
        identityType,
        createTime: new Date()
      }
    })
    
    // 获取最新点赞数量
    const countResult = await db.collection('likes').count()
    
    return {
      success: true,
      data: {
        likeCount: countResult.total,
        message: '点赞成功'
      }
    }
  } catch (error) {
    console.error('点赞失败:', error)
    throw new Error('点赞失败')
  }
}

// 获取点赞记录列表
async function getLikes(event) {
  const { page = 1, pageSize = 10 } = event
  const skip = (page - 1) * pageSize
  
  try {
    const { data } = await db.collection('likes')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    
    // 获取总数量
    const countResult = await db.collection('likes').count()
    const total = countResult.total
    const hasMore = skip + pageSize < total
    
    return {
      success: true,
      data: {
        likes: data,
        hasMore,
        total
      }
    }
  } catch (error) {
    console.error('获取点赞记录失败:', error)
    throw new Error('获取点赞记录失败')
  }
}