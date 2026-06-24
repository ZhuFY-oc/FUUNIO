```markdown
# Fuunio - 在线游戏聚合平台

一个专注于 .io 游戏及轻量网页游戏的精品导航平台。

## 📁 项目目录结构

```
Fuunio/
├── index.html                    # 主页面
├── README.md                     # 项目说明
│
├── assets/                       # 静态资源
│   ├── fonts/                    # 字体文件
│   ├── images/                   # 图片资源
│   └── favicon.ico               # 网站图标
│
├── css/                          # 样式文件
│   └── style.css                 # 主样式表
│
├── js/                           # JavaScript 脚本
│   ├── data/                     # 数据文件
│   │   └── games.json            # 80 款游戏数据
│   │
│   ├── config.js                 # Supabase 配置
│   ├── state.js                  # 用户状态管理
│   ├── auth.js                   # 登录/注册/登出
│   ├── stats.js                  # 游玩统计 & 后台面板
│   ├── reactions.js              # 表情功能
│   ├── games.js                  # 游戏数据加载 & 渲染
│   ├── banner.js                 # 轮播图
│   ├── modal.js                  # 游戏弹窗
│   ├── sidebar.js                # 侧边栏
│   ├── dice.js                   # 骰子随机（随缘玩）
│   ├── blindbox.js               # 每日盲盒
│   ├── fufu.js                   # 福福宠物
│   ├── pages.js                  # 页面导航
│   ├── i18n.js                   # 多语言
│   ├── policy.js                 # 政策弹窗
│   └── main.js                   # 入口文件
│
├── .env.example                  # 环境变量示例
└── .gitignore                    # Git 忽略文件
```

## 📄 核心文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面，包含所有 HTML 结构 |
| `js/data/games.json` | 80 款游戏数据（名称、分类、标签、链接等） |
| `js/config.js` | Supabase 配置（URL、Anon Key） |
| `js/auth.js` | 用户登录/注册/登出逻辑 |
| `js/games.js` | 游戏数据加载、过滤、渲染 |
| `js/i18n.js` | 多语言（中文、英文、日语） |
| `js/main.js` | 入口文件，初始化所有模块 |

## 🚀 快速开始

### 1. 本地运行

```bash
# 使用 VS Code Live Server 打开
# 或使用任意 HTTP 服务器
python3 -m http.server 5500
```

### 2. 配置 Supabase

1. 复制 `.env.example` 为 `.env`
2. 填写你的 Supabase 配置
3. 或在 `js/config.js` 中直接配置

### 3. 打包部署

```bash
# 打包整个项目
tar -czf fuunio.tar.gz index.html assets/ css/ js/
```

## 🛠️ 技术栈

- HTML5
- CSS3 (Steam 暗色主题)
- JavaScript (ES6+)
- Supabase (Auth + Database)
- Three.js (3D 宠物)

## 📝 功能列表

- ✅ 游戏分类浏览（全部/热门/新游戏/动作/射击/生存/休闲/.io/策略/竞速）
- ✅ 实时搜索
- ✅ 用户登录/注册（Supabase Auth）
- ✅ 游戏游玩次数统计
- ✅ 游戏表情反馈（😍 😐 😡）
- ✅ 每日盲盒
- ✅ 骰子随机（随缘玩）
- ✅ 多语言（中文/English/日本語）
- ✅ 管理员后台数据面板
- ✅ 3D 宠物（福福）
- ✅ 响应式设计（PC/平板/手机）

## 📧 联系方式

- 邮箱: fuunio@qq.com
- 玩家大厅: [QQ 频道](https://pd.qq.com/s/af6be3xv8?b=9)

## 📄 版权

© 2026 Fuunio. All rights reserved.
```
