# 任务激励系统后端API

## 数据库设计

### 表结构

#### 1. custom_tasks (自定义任务表)
```sql
CREATE TABLE custom_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. daily_tasks (每日任务记录表)
```sql
CREATE TABLE daily_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    date TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API接口文档

### 自定义任务管理

#### 获取所有自定义任务
- **GET** `/api/custom-tasks`
- **响应**: `[{id, name, score, created_at}]`

#### 搜索自定义任务
- **GET** `/api/custom-tasks/search?q=搜索词`
- **参数**: 
  - `q`: 搜索关键词（可选，为空时返回所有任务）
- **响应**: `[{id, name, score, created_at}]`
- **说明**: 支持模糊搜索，使用 SQL LIKE 操作符进行匹配

#### 创建自定义任务
- **POST** `/api/custom-tasks`
- **请求体**: `{name: string, score: number}`
- **响应**: `{id, name, score}`

#### 删除自定义任务
- **DELETE** `/api/custom-tasks/:id`
- **响应**: `{message: string}`

### 每日任务管理

#### 获取每日任务
- **GET** `/api/daily-tasks?date=YYYY-MM-DD`
- **响应**: `[{id, name, score, date, timestamp, created_at}]`

#### 创建每日任务
- **POST** `/api/daily-tasks`
- **请求体**: `{name: string, score: number, date: string, timestamp: string}`
- **响应**: `{id, name, score, date, timestamp}`

#### 删除每日任务
- **DELETE** `/api/daily-tasks/:id`
- **响应**: `{message: string}`

### 统计数据

#### 获取统计信息
- **GET** `/api/stats`
- **响应**: `{totalScore, totalTasks, uniqueDays, avgScorePerDay}`

#### 获取趋势数据
- **GET** `/api/trend?days=7`
- **响应**: `[{date, score}]`

### 系统

#### 健康检查
- **GET** `/api/health`
- **响应**: `{status: "OK", timestamp: string}`

## 启动方式

```bash
npm start
```

服务器将在 http://0.0.0.0:3001 启动

## 搜索功能说明

新增的搜索功能支持：
- 模糊匹配任务名称
- 中文搜索支持
- 空搜索词时返回所有任务
- 按创建时间倒序排列结果

