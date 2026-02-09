# CODEBUDDY.md 此文件为 CodeBuddy 在此代码库中工作时提供指导。

## 项目概述

这是一个名为"种下小美好"的微信小程序 - 一个综合性的植物养护和社区应用。该应用允许用户记录植物生长、参与社区讨论、访问植物百科，并获得 AI 驱动的植物养护助手。

## 常用开发命令

### 测试和预览
- 在微信开发者工具中打开项目，点击"编译"进行构建和预览
- 使用"预览"功能生成二维码在真机上测试
- 使用"真机调试"进行设备特定测试

### 云开发
- 云函数位于 `cloudfunctions/` 目录（当前结构中不可见，但在代码中有引用）
- 使用微信开发者工具 > 云开发来管理数据库、函数和存储
- 数据库集合：`plant_records`、`users`、`posts`（基于代码引用）

### 代码质量
- 微信开发者工具包含 JavaScript/WXML/WXSS 的内置代码检查
- 使用"详情"面板检查警告和错误
- 测试所有 tabBar 导航切换（`wx.switchTab`）和常规导航（`wx.navigateTo`）

## 架构和结构

### 核心应用结构

**全局应用配置 (`app.js`)**
- 初始化微信云开发，环境 ID：`eduction-cloud1-3gmwfya26924141a`
- 管理全局用户认证状态和本地存储
- 提供用户会话管理方法：`setUserInfo()`、`clearLogin()`、`checkLocalLogin()`

**TabBar 导航 (`app.json`)**
- 四个主要标签页：首页（`index`）、社区（`community`）、百科（`plantdb`）、登录（`login`）
- 通过导航可访问的其他页面：日历、记录、助手
- 使用 WeUI 扩展库以保持一致的 UI 组件

### 页面架构模式

**认证流程**
- 登录页面支持多种方式：微信授权、手机号、用户名
- 提供游客模式以获得有限功能
- 用户状态保存在本地存储中，基于令牌认证
- 云函数处理认证：`login`、`loginByPhone`、`loginByUsername`、`registerByPhone`

**数据管理**
- 植物记录存储在云数据库中，支持筛选、搜索和分页
- 社区帖子包含丰富元数据：点赞、评论、收藏、用户关注
- 使用微信云 AI 能力实现实时 AI 助手集成

**组件系统**
- 自定义导航栏组件（`components/navigation-bar/`）具有安全区域处理
- 遵循微信小程序组件生命周期和属性绑定模式
- 支持多插槽以实现灵活的组件组合

### 关键技术模式

**云数据库集成**
```javascript
// 数据库操作标准模式
const db = wx.cloud.database();
await db.collection('plant_records')
  .where(query)
  .orderBy('date', 'desc')
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .get();
```

**导航模式**
- TabBar 页面：使用 `wx.switchTab` 访问首页、社区、百科、登录
- 常规页面：使用 `wx.navigateTo` 访问日历、记录、助手、详情页
- 始终使用备用方法处理导航失败

**AI 集成**
- 使用微信云 AI，支持智能体和直接模型调用
- 支持流式响应以实现实时聊天体验
- 可用模型：`hunyuan-lite`（免费层）、`hunyuan-pro`、`claude-3-haiku`

**本地存储策略**
- 用户认证：`userInfo`、`userToken`、`userId`
- 应用偏好设置：`loginPrompted` 防止重复提示
- 聊天历史：`aiChatHistory`（最近 20 条消息）

### 文件组织

```
pages/
├── index/           # 主页仪表板，包含功能卡片和每日提示
├── community/       # 社交功能，包含帖子、评论、话题
├── plantdb/         # 植物百科和知识库  
├── record/          # 植物养护记录的 CRUD 操作
├── calendar/        # 植物养护日历和调度
├── assistant/       # AI 驱动的植物养护聊天机器人
├── login/           # 多方式认证
└── register/        # 用户注册流程

components/
└── navigation-bar/  # 自定义导航，支持安全区域
```

### 开发注意事项

**微信小程序特殊性**
- 所有 API 调用使用 `wx.` 命名空间（非标准 Web API）
- 页面生命周期：`onLoad`、`onShow`、`onReady`、`onHide`、`onUnload`
- WXML 中的事件处理使用 `bind:` 和 `catch:` 前缀
- 样式使用 WXSS 和 `rpx` 响应式单位（750rpx = 屏幕宽度）

**云开发要求**
- 在任何云操作之前确保云环境正确初始化
- 优雅地处理云函数错误并提供用户友好的消息
- 对所有异步云操作使用 `try/catch` 块
- 实现适当的加载状态和错误处理

**用户体验模式**
- 实现下拉刷新（`onPullDownRefresh`）和无限滚动（`onReachBottom`）
- 对异步操作使用 `wx.showLoading()`/`wx.hideLoading()`
- 为用户交互提供即时视觉反馈
- 适当处理网络故障和离线场景

**认证最佳实践**
- 在应用启动和页面导航时检查本地登录状态
- 在适用处实现自动令牌刷新
- 为需要登录的功能提供清晰指示
- 支持具有有限功能访问的游客模式

此架构强调模块化设计、云集成和微信平台约定，为植物养护管理和社区参与提供流畅的用户体验。