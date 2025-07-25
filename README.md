# 家族口述历史小程序

一个用于记录和分享家族口述历史的微信小程序。

## 快速开始

### 1. 配置云开发环境

为了保护敏感信息，本项目使用配置文件管理云开发环境ID：

```bash
# 复制配置示例文件
cp miniprogram/config.example.js miniprogram/config.js

# 编辑配置文件，填入你的云环境ID
# 在 miniprogram/config.js 中替换 'your-cloud-env-id-here' 为你的实际云环境ID
```

### 2. 开发工具

1. 使用微信开发者工具打开项目
2. 确保已开通云开发服务
3. 按照 `CLOUD_SETUP.md` 的说明配置云函数和数据库

### 3. 安全说明

- `miniprogram/config.js` - 包含敏感配置信息，已添加到 `.gitignore`
- `miniprogram/config.example.js` - 配置模板文件，安全提交到版本控制

## 项目结构

```
├── miniprogram/           # 小程序主要代码
│   ├── pages/            # 页面文件
│   ├── data/             # 数据文件
│   ├── config.js         # 配置文件（不提交到git）
│   └── config.example.js # 配置模板
├── cloudfunctions/       # 云函数
└── CLOUD_SETUP.md       # 详细的云开发配置说明
```

## 更多信息

详细的云开发配置请参考：[CLOUD_SETUP.md](./CLOUD_SETUP.md) 