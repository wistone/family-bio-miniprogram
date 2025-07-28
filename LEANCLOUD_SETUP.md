# LeanCloud 后端配置指南

本项目已从腾讯CloudBase迁移到LeanCloud，本文档说明如何配置和使用LeanCloud后端服务。

## 1. 前置条件

- 已注册LeanCloud账号
- 已创建LeanCloud应用
- 已获取App ID和App Key

## 2. 配置文件设置

### 2.1 配置应用信息

1. 复制配置示例文件：
   ```bash
   cp miniprogram/config.example.js miniprogram/config.js
   ```

2. 编辑 `miniprogram/config.js`，填入您的LeanCloud应用信息：
   ```javascript
   module.exports = {
     // LeanCloud 配置
     leanCloud: {
       appId: 'your-app-id-here',       // 替换为您的App ID
       appKey: 'your-app-key-here',     // 替换为您的App Key
       serverURL: 'https://your-app-id.lc-cn-n1-shared.com'  // 根据您的应用域名调整
     }
   };
   ```

### 2.2 获取LeanCloud应用信息

1. 登录 [LeanCloud控制台](https://console.leancloud.cn/)
2. 进入您的应用
3. 在"设置" > "应用凭证"中找到：
   - AppID
   - AppKey
   - 服务器地址

## 3. 数据库设置

### 3.1 创建数据表

在LeanCloud控制台中创建以下Class（数据表）：

#### 3.1.1 likes表（点赞记录）
- **表名**: `likes`
- **字段**:
  - `openid` (String): 用户唯一标识
  - `nickName` (String): 用户昵称
  - `identityType` (String): 身份类型 (custom/anonymous)
- **ACL权限**: 所有用户可读写

## 4. 微信小程序配置

### 4.1 配置请求域名

在微信公众平台的小程序管理后台中，需要将LeanCloud的服务器域名添加到请求域名白名单：

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入您的小程序
3. 在"开发" > "开发管理" > "开发设置" > "服务器域名"中添加：
   - **request合法域名**: `https://your-app-id.lc-cn-n1-shared.com`

**注意**: 请将 `your-app-id` 替换为您实际的LeanCloud应用ID。

## 5. 功能验证

完成配置后，您可以测试以下功能：

- ✅ 查看点赞数量
- ✅ 添加点赞记录
- ✅ 查看点赞历史
- ✅ 自定义昵称点赞
- ✅ 匿名点赞

## 6. 常见问题

### 6.1 网络请求失败

**问题**: 小程序无法连接LeanCloud
**解决方案**: 
- 检查域名白名单配置
- 确认App ID和App Key正确
- 检查网络连接

### 6.2 权限错误

**问题**: 403 Forbidden错误
**解决方案**:
- 检查App Key是否正确
- 确认数据表ACL权限设置
- 验证请求格式 