# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

后续任务回复使用中文

## Project Overview
任务激励系统 - 一个基于任务积分的个人激励管理应用，通过完成任务获取积分来维持动力。

## Architecture Overview
- **Frontend**: React 19 + Vite 6 + Tailwind CSS 4 + Radix UI + Recharts
- **Backend**: Node.js + Express + SQLite3
- **Package Management**: pnpm (frontend), npm (backend)

## Project Structure
```
task-motivation/
├── task-motivation-app/          # React 前端
│   ├── src/
│   │   ├── App.jsx             # 主应用组件
│   │   ├── components/ui/      # Radix UI 组件库
│   │   ├── hooks/              # 自定义 React hooks
│   │   └── lib/utils.js        # 工具函数
│   ├── vite.config.js          # Vite 配置，支持 @ 路径别名
│   └── package.json            # 使用 pnpm
├── task-motivation-backend/     # Node.js 后端
│   ├── server.js               # Express 服务器
│   ├── task_motivation.db      # SQLite 数据库
│   ├── README.md               # 后端 API 文档
│   └── package.json            # 使用 npm
└── release-package/            # 生产环境发布包
    └── backend/                # 后端发布版本
```

## Development Commands

### 前端开发 (task-motivation-app/)
```bash
cd task-motivation-app
pnpm install           # 安装依赖
pnpm dev               # 开发服务器 (端口 5173)
pnpm build             # 生产构建
pnpm lint              # ESLint 检查
pnpm preview           # 预览生产构建
```

### 后端开发 (task-motivation-backend/)
```bash
cd task-motivation-backend
npm install            # 安装依赖
npm start              # 启动服务器 (端口 3001)
npm run dev           # 同 npm start
```

## API 端点

### 自定义任务管理
- `GET /api/custom-tasks` - 获取所有自定义任务
- `GET /api/custom-tasks/search?q=关键词` - 搜索自定义任务（模糊匹配）
- `GET /api/custom-tasks/frequency?sort=created_at` - 获取任务使用频率
- `POST /api/custom-tasks` - 创建自定义任务
- `DELETE /api/custom-tasks/:id` - 删除自定义任务

### 每日任务管理
- `GET /api/daily-tasks?date=YYYY-MM-DD` - 获取指定日期的任务
- `POST /api/daily-tasks` - 创建每日任务记录
- `DELETE /api/daily-tasks/:id` - 删除每日任务记录

### 统计与分析
- `GET /api/stats` - 获取统计信息（总积分、任务数、活跃天数等）
- `GET /api/trend?days=7` - 获取趋势数据（默认7天）
- `GET /api/health` - 健康检查

## 数据库结构

### custom_tasks 表
- id: INTEGER PRIMARY KEY
- name: TEXT (任务名称)
- score: INTEGER (积分值)
- created_at: DATETIME (创建时间)

### daily_tasks 表
- id: INTEGER PRIMARY KEY
- name: TEXT (任务名称)
- score: INTEGER (积分值)
- date: TEXT (日期 YYYY-MM-DD)
- timestamp: TEXT (时间戳)
- created_at: DATETIME (创建时间)

## 技术栈详情

### 前端依赖
- **UI框架**: React 19.1 + Radix UI 全套组件
- **样式**: Tailwind CSS 4.1 + tw-animate-css
- **图表**: Recharts 2.15
- **图标**: Lucide React
- **路由**: React Router DOM 7.6
- **动画**: Framer Motion 12.15
- **主题**: next-themes 支持深色/浅色模式切换
- **表单**: react-hook-form + zod 验证
- **日期**: date-fns + react-day-picker

### 后端依赖
- **框架**: Express 4.18
- **数据库**: SQLite3 5.1
- **跨域**: cors 2.8

## 核心功能特性
- **任务模板**: 创建可重复使用的自定义任务模板
- **每日记录**: 记录每日完成的任务和积分
- **积分系统**: 基于任务难度设置积分值
- **趋势图表**: 7天/30天积分趋势可视化
- **搜索功能**: 支持中文模糊搜索任务
- **主题切换**: 深色/浅色模式无缝切换
- **数据管理**: JSON格式数据导出/导入
- **实时统计**: 总积分、任务总数、活跃天数

## 开发环境配置
- **前端端口**: 5173 (Vite 默认)
- **后端端口**: 3001 (可通过 PORT 环境变量配置)
- **API地址**: 开发环境使用 `192.168.31.158:3001`
- **数据库**: 首次启动后端时自动创建表结构
- **路径别名**: 支持 `@/` 指向 `src/` 目录

## 部署注意事项
- 生产环境 API 地址已配置为 Manus Computer 的代理地址
- 数据库文件 `task_motivation.db` 会在首次运行时自动创建
- 前端构建产物会输出到 `task-motivation-app/dist/`