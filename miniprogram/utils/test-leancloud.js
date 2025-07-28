// LeanCloud配置测试工具
// 用于验证LeanCloud连接和基本功能

const leanCloudAPI = require('./leancloud.js');

// 测试LeanCloud连接和基本功能
async function testLeanCloudConnection() {
  console.log('🧪 开始测试LeanCloud连接...');
  
  try {
    // 1. 测试获取点赞数量
    console.log('📊 测试获取点赞数量...');
    const likeCountResult = await leanCloudAPI.getLikeCount();
    if (likeCountResult.success) {
      console.log('✅ 获取点赞数量成功:', likeCountResult.data.likeCount);
    } else {
      console.error('❌ 获取点赞数量失败:', likeCountResult.error);
      return false;
    }

    // 2. 测试添加点赞记录
    console.log('👍 测试添加点赞记录...');
    const testOpenid = `test_${Date.now()}`;
    const addLikeResult = await leanCloudAPI.addLike(testOpenid, '测试用户', 'custom');
    if (addLikeResult.success) {
      console.log('✅ 添加点赞记录成功，新的点赞数量:', addLikeResult.data.likeCount);
    } else {
      console.error('❌ 添加点赞记录失败:', addLikeResult.error);
      return false;
    }

    // 3. 测试获取点赞记录列表
    console.log('📋 测试获取点赞记录列表...');
    const likesResult = await leanCloudAPI.getLikes(1, 5);
    if (likesResult.success) {
      console.log('✅ 获取点赞记录成功，记录数量:', likesResult.data.likes.length);
      console.log('最新记录:', likesResult.data.likes[0]);
    } else {
      console.error('❌ 获取点赞记录失败:', likesResult.error);
      return false;
    }

    console.log('🎉 所有测试通过！LeanCloud配置正确。');
    return true;

  } catch (error) {
    console.error('💥 测试过程中出现错误:', error);
    return false;
  }
}

// 显示配置信息（隐藏敏感信息）
function showConfigInfo() {
  const config = require('../config.js');
  const leanCloudConfig = config.leanCloud;
  
  console.log('⚙️ 当前LeanCloud配置:');
  console.log('  App ID:', leanCloudConfig.appId ? `${leanCloudConfig.appId.substring(0, 8)}...` : '未配置');
  console.log('  App Key:', leanCloudConfig.appKey ? `${leanCloudConfig.appKey.substring(0, 8)}...` : '未配置');
  console.log('  Server URL:', leanCloudConfig.serverURL || '未配置');
}

// 主测试函数
async function runTests() {
  console.log('🚀 LeanCloud配置测试工具');
  console.log('=====================================');
  
  try {
    showConfigInfo();
    console.log('');
    
    const testResult = await testLeanCloudConnection();
    
    console.log('');
    console.log('=====================================');
    if (testResult) {
      console.log('✅ 测试结果: 配置正确，可以正常使用！');
    } else {
      console.log('❌ 测试结果: 配置有误，请检查以下几点:');
      console.log('   1. App ID和App Key是否正确');
      console.log('   2. Server URL是否匹配您的应用');
      console.log('   3. likes数据表是否已创建');
      console.log('   4. 网络连接是否正常');
      console.log('   5. 微信小程序域名白名单是否已配置');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('');
    console.log('🔧 故障排除建议:');
    console.log('   1. 检查 miniprogram/config.js 文件是否存在');
    console.log('   2. 确认LeanCloud应用信息配置正确');
    console.log('   3. 参考 LEANCLOUD_SETUP.md 进行完整配置');
  }
}

// 导出测试函数
module.exports = {
  testLeanCloudConnection,
  showConfigInfo,
  runTests
};

// 如果直接运行此文件，执行测试
if (typeof module === 'undefined') {
  // 在小程序环境中运行
  runTests();
} 