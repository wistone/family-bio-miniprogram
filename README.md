# 家族口述历史小程序

一个用于记录和分享家族口述历史的微信小程序，采用优雅的水墨风格设计，使用LeanCloud作为后端服务。

## ✨ 功能特性

- 📖 **故事阅读**: 分章节展示家族历史故事
- ❤️ **点赞功能**: 支持身份选择的点赞互动
  - 🕶️ 匿名点赞
  - 👤 自定义昵称点赞
- 📊 **点赞统计**: 实时显示点赞数量和记录
- 🎨 **水墨风格**: 优雅的中国传统美学设计
- ☁️ **云端同步**: 基于LeanCloud的数据存储

## 🚀 快速开始

### 1. 配置LeanCloud后端

本项目使用LeanCloud作为后端数据库服务：

```bash
# 复制配置示例文件
cp miniprogram/config.example.js miniprogram/config.js

# 编辑配置文件，填入你的LeanCloud应用信息
# 在 miniprogram/config.js 中填入App ID、App Key等信息
```

详细配置步骤请参考：**[LeanCloud配置指南](./LEANCLOUD_SETUP.md)**

### 2. 开发工具

1. 使用微信开发者工具打开项目
2. 在LeanCloud控制台创建应用和数据表
3. 在微信公众平台配置LeanCloud域名白名单

### 3. 安全说明

- `miniprogram/config.js` - 包含敏感配置信息，已添加到 `.gitignore`
- `miniprogram/config.example.js` - 配置模板文件，安全提交到版本控制

## 📁 项目结构

```
├── miniprogram/           # 小程序主要代码
│   ├── pages/            # 页面文件
│   │   ├── cover/        # 封面页
│   │   ├── reading/      # 阅读页
│   │   └── feedback/     # 反馈页（点赞功能）
│   ├── utils/            # 工具函数
│   │   └── leancloud.js  # LeanCloud API封装
│   ├── assets/           # 静态资源
│   ├── config.js         # 配置文件（不提交到git）
│   └── config.example.js # 配置模板
├── LEANCLOUD_SETUP.md   # LeanCloud配置说明
└── README.md            # 项目说明
```

## 🛠️ 技术栈

- **前端**: 微信小程序原生开发
- **后端**: LeanCloud BaaS服务
- **数据库**: LeanCloud数据存储
- **API**: LeanCloud REST API

## 📊 数据结构

### likes表（点赞记录）
```json
{
  "objectId": "唯一标识",
  "openid": "用户标识", 
  "nickName": "用户昵称",
  "identityType": "身份类型(custom/anonymous)",
  "createdAt": "创建时间",
  "updatedAt": "更新时间"
}
```

## 📋 版本历史

- **v2.0.0** (当前版本)
  - ✅ 迁移到LeanCloud后端服务
  - ✅ 重构API调用逻辑
  - ✅ 优化用户标识生成机制
  - ✅ 简化项目依赖

- **v1.1.0**
  - ✅ 去除留言功能，专注点赞体验
  - ✅ 新增身份选择功能（匿名/自定义昵称）
  - ✅ 优化UI为紧凑横排显示

- **v1.0.0**
  - ✅ 基础故事阅读功能
  - ✅ 支持点赞和留言功能
  - ✅ 水墨风格UI设计

## 🔧 开发指南

详细的LeanCloud配置请参考：**[LEANCLOUD_SETUP.md](./LEANCLOUD_SETUP.md)**

## 🌟 特性说明

### 后端服务优势
- **免费额度**: LeanCloud提供免费的API调用额度
- **简单易用**: 基于REST API，无需复杂的云函数配置
- **数据安全**: 支持ACL权限控制
- **高可用性**: 稳定的云服务保障

### 用户体验
- **即时反馈**: 点赞操作的即时响应
- **身份灵活**: 支持匿名和自定义昵称两种模式
- **数据实时**: 实时同步的点赞数据
- **界面优雅**: 传统文化风格的设计美学

## 📖 使用说明

1. **阅读功能**: 浏览家族历史章节
2. **点赞互动**: 选择身份进行点赞
3. **记录查看**: 查看最新的点赞记录
4. **分享传播**: 分享给更多家族成员

## �� 许可证

MIT License 