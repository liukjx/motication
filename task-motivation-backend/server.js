const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库初始化
const dbPath = path.join(__dirname, 'task_motivation.db');
const db = new sqlite3.Database(dbPath);

// 创建表
db.serialize(() => {
  // 自定义任务表
  db.run(`CREATE TABLE IF NOT EXISTS custom_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 每日任务记录表
  db.run(`CREATE TABLE IF NOT EXISTS daily_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    date TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API 路由

// 获取所有自定义任务
app.get('/api/custom-tasks', (req, res) => {
  db.all('SELECT * FROM custom_tasks ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 搜索自定义任务
app.get('/api/custom-tasks/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    // 如果没有搜索词，返回所有任务
    db.all('SELECT * FROM custom_tasks ORDER BY created_at DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
    return;
  }

  // 使用 LIKE 进行模糊搜索，支持中文
  const searchTerm = `%${q.trim()}%`;
  db.all('SELECT * FROM custom_tasks WHERE name LIKE ? ORDER BY created_at DESC', [searchTerm], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 创建自定义任务
app.post('/api/custom-tasks', (req, res) => {
  const { name, score } = req.body;
  
  if (!name || !score) {
    res.status(400).json({ error: '任务名称和分数不能为空' });
    return;
  }

  db.run('INSERT INTO custom_tasks (name, score) VALUES (?, ?)', [name, score], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, score });
  });
});

// 删除自定义任务
app.delete('/api/custom-tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM custom_tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    res.json({ message: '任务删除成功' });
  });
});

// 获取所有每日任务
app.get('/api/daily-tasks', (req, res) => {
  const { date } = req.query;
  
  let query = 'SELECT * FROM daily_tasks';
  let params = [];
  
  if (date) {
    query += ' WHERE date = ?';
    params.push(date);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 创建每日任务
app.post('/api/daily-tasks', (req, res) => {
  const { name, score, date, timestamp } = req.body;
  
  if (!name || !score || !date || !timestamp) {
    res.status(400).json({ error: '所有字段都不能为空' });
    return;
  }

  db.run('INSERT INTO daily_tasks (name, score, date, timestamp) VALUES (?, ?, ?, ?)', 
    [name, score, date, timestamp], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, score, date, timestamp });
  });
});

// 删除每日任务
app.delete('/api/daily-tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM daily_tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    res.json({ message: '任务删除成功' });
  });
});

// 获取统计数据
app.get('/api/stats', (req, res) => {
  const queries = {
    totalScore: 'SELECT SUM(score) as total FROM daily_tasks',
    totalTasks: 'SELECT COUNT(*) as total FROM daily_tasks',
    uniqueDays: 'SELECT COUNT(DISTINCT date) as total FROM daily_tasks'
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      results[key] = row.total || 0;
      completed++;
      
      if (completed === Object.keys(queries).length) {
        results.avgScorePerDay = results.uniqueDays > 0 ? 
          Math.round(results.totalScore / results.uniqueDays) : 0;
        res.json(results);
      }
    });
  });
});

// 获取趋势数据
app.get('/api/trend', (req, res) => {
  const { days = 7 } = req.query;
  
  db.all(`
    SELECT date, SUM(score) as score 
    FROM daily_tasks 
    WHERE date >= date('now', '-${days} days')
    GROUP BY date 
    ORDER BY date
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取自定义任务使用频率统计
app.get('/api/custom-tasks/frequency', (req, res) => {
  const { sort = 'created_at' } = req.query;
  
  let orderBy = 'created_at DESC';
  switch(sort) {
    case 'score':
      orderBy = 'score DESC, created_at DESC';
      break;
    case 'frequency':
      orderBy = 'usage_count DESC, created_at DESC';
      break;
    case 'created_at':
    default:
      orderBy = 'created_at DESC';
      break;
  }
  
  const query = `
    SELECT 
      ct.*,
      COALESCE(dt.usage_count, 0) as usage_count
    FROM custom_tasks ct
    LEFT JOIN (
      SELECT name, COUNT(*) as usage_count
      FROM daily_tasks
      GROUP BY name
    ) dt ON ct.name = dt.name
    ORDER BY ${orderBy}
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  db.close((err) => {
    if (err) {
      console.error('关闭数据库时出错:', err.message);
    } else {
      console.log('数据库连接已关闭');
    }
    process.exit(0);
  });
});

