// 配置文件示例
// 请复制此文件为 config.js 并填入你的真实配置信息

module.exports = {
  // 微信云开发环境ID (保留，如需回退)
  // 在微信开发者工具的云开发控制台中可以找到
  // cloudEnv: 'your-cloud-env-id-here',

  // LeanCloud 配置
  leanCloud: {
    appId: 'your-leancloud-app-id-here',
    appKey: 'your-leancloud-app-key-here',
    serverURL: 'https://your-app-id.lc-cn-n1-shared.com'  // 请根据您的应用域名调整
  },

  // 其他配置项可以在这里添加
  // 例如：API密钥、第三方服务配置等
}; 