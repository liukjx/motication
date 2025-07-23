import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, Calendar, Star, BarChart3, Moon, Sun, Download, Upload, Loader2, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

// API基础URL
const API_BASE_URL = 'http://192.168.31.158:3001/api';

// API调用函数
const api = {
  // 自定义任务
  getCustomTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/custom-tasks`);
    if (!response.ok) throw new Error('获取自定义任务失败');
    return response.json();
  },
  
  getCustomTasksWithFrequency: async (sort = 'created_at') => {
    const response = await fetch(`${API_BASE_URL}/custom-tasks/frequency?sort=${sort}`);
    if (!response.ok) throw new Error('获取自定义任务频率失败');
    return response.json();
  },
  
  createCustomTask: async (task) => {
    const response = await fetch(`${API_BASE_URL}/custom-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('创建自定义任务失败');
    return response.json();
  },
  
  deleteCustomTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/custom-tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('删除自定义任务失败');
    return response.json();
  },
  
  // 搜索自定义任务
  searchCustomTasks: async (query) => {
    const response = await fetch(`${API_BASE_URL}/custom-tasks/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('搜索自定义任务失败');
    return response.json();
  },
  
  // 每日任务
  getDailyTasks: async (date) => {
    const url = date ? `${API_BASE_URL}/daily-tasks?date=${date}` : `${API_BASE_URL}/daily-tasks`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取每日任务失败');
    return response.json();
  },
  
  createDailyTask: async (task) => {
    const response = await fetch(`${API_BASE_URL}/daily-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('创建每日任务失败');
    return response.json();
  },
  
  deleteDailyTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('删除每日任务失败');
    return response.json();
  },
  
  // 统计数据
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('获取统计数据失败');
    return response.json();
  },
  
  getTrend: async (days = 7) => {
    const response = await fetch(`${API_BASE_URL}/trend?days=${days}`);
    if (!response.ok) throw new Error('获取趋势数据失败');
    return response.json();
  }
};

function App() {
  // 状态管理
  const [customTasks, setCustomTasks] = useState([]);
  const [filteredCustomTasks, setFilteredCustomTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTasksLayout, setCustomTasksLayout] = useState('grid'); // 'grid' or 'list'
  const [customTasksSort, setCustomTasksSort] = useState('created_at'); // 'created_at', 'score', 'frequency'
  const [dailyTasks, setDailyTasks] = useState([]);
  const [stats, setStats] = useState({ totalScore: 0, totalTasks: 0, uniqueDays: 0, avgScorePerDay: 0 });
  const [trendData, setTrendData] = useState([]);
  const [trendDays, setTrendDays] = useState(30);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskScore, setNewTaskScore] = useState('');
  const [newCustomTaskName, setNewCustomTaskName] = useState('');
  const [newCustomTaskScore, setNewCustomTaskScore] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddCustomTask, setShowAddCustomTask] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 模糊搜索函数
  const filterTasks = (tasks, query) => {
    if (!query.trim()) return tasks;
    
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.name.toLowerCase().includes(lowerQuery)
    );
  };

  // 处理搜索输入
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredCustomTasks(filterTasks(customTasks, query));
  };

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [dailyTasksData, statsData, trendDataResult] = await Promise.all([
        api.getDailyTasks(),
        api.getStats(),
        api.getTrend(trendDays)
      ]);
      
      setDailyTasks(dailyTasksData);
      setStats(statsData);
      setTrendData(trendDataResult.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('zh-CN', { 
          month: 'short', 
          day: 'numeric',
          ...(trendDays === 30 && { month: 'numeric', day: 'numeric' })
        })
      })));
      
      // 单独加载自定义任务
      await loadCustomTasks();
    } catch (err) {
      setError(err.message);
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 独立加载自定义任务
  const loadCustomTasks = async () => {
    try {
      const customTasksData = await api.getCustomTasksWithFrequency(customTasksSort);
      setCustomTasks(customTasksData);
      setFilteredCustomTasks(filterTasks(customTasksData, searchQuery));
    } catch (err) {
      setError(err.message);
      console.error('加载自定义任务失败:', err);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadData();
    
    // 从localStorage加载主题设置和偏好
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedLayout = localStorage.getItem('customTasksLayout');
    const savedSort = localStorage.getItem('customTasksSort');
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    if (savedLayout) {
      setCustomTasksLayout(savedLayout);
    }
    if (savedSort) {
      setCustomTasksSort(savedSort);
    }
  }, [trendDays]);

  // 主题切换和偏好保存
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('customTasksLayout', customTasksLayout);
  }, [customTasksLayout]);

  useEffect(() => {
    localStorage.setItem('customTasksSort', customTasksSort);
    // 只在排序变化时刷新自定义任务，不刷新整个页面
    loadCustomTasks();
  }, [customTasksSort]);

  // 当customTasks或搜索查询更新时，重新过滤
  useEffect(() => {
    setFilteredCustomTasks(filterTasks(customTasks, searchQuery));
  }, [customTasks, searchQuery]);

  // 计算当日总分
  const getTodayScore = () => {
    return dailyTasks
      .filter(task => task.date === currentDate)
      .reduce((total, task) => total + task.score, 0);
  };

  // 获取当日任务
  const getTodayTasks = () => {
    return dailyTasks.filter(task => task.date === currentDate);
  };

  // 添加手动任务
  const addManualTask = async () => {
    if (!newTaskName.trim() || !newTaskScore) return;
    
    try {
      const task = {
        name: newTaskName.trim(),
        score: parseInt(newTaskScore),
        date: currentDate,
        timestamp: new Date().toLocaleTimeString()
      };
      
      await api.createDailyTask(task);
      setNewTaskName('');
      setNewTaskScore('');
      await loadData(); // 重新加载数据
    } catch (err) {
      setError(err.message);
    }
  };

  // 添加自定义任务
  const addCustomTask = async () => {
    if (!newCustomTaskName.trim() || !newCustomTaskScore) return;
    
    try {
      const task = {
        name: newCustomTaskName.trim(),
        score: parseInt(newCustomTaskScore)
      };
      
      await api.createCustomTask(task);
      setNewCustomTaskName('');
      setNewCustomTaskScore('');
      setShowAddCustomTask(false);
      await loadData(); // 重新加载数据
    } catch (err) {
      setError(err.message);
    }
  };

  // 点击自定义任务添加到今日
  const addCustomTaskToToday = async (customTask) => {
    try {
      const task = {
        name: customTask.name,
        score: customTask.score,
        date: currentDate,
        timestamp: new Date().toLocaleTimeString()
      };
      
      await api.createDailyTask(task);
      await loadData(); // 重新加载数据
    } catch (err) {
      setError(err.message);
    }
  };

  // 删除任务
  const deleteTask = async (id) => {
    try {
      await api.deleteDailyTask(id);
      await loadData(); // 重新加载数据
    } catch (err) {
      setError(err.message);
    }
  };

  // 删除自定义任务
  const deleteCustomTask = async (id) => {
    try {
      await api.deleteCustomTask(id);
      await loadData(); // 重新加载数据
    } catch (err) {
      setError(err.message);
    }
  };

  // 导出数据
  const exportData = () => {
    const data = {
      customTasks,
      dailyTasks,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-motivation-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.customTasks) setCustomTasks(data.customTasks);
        if (data.dailyTasks) setDailyTasks(data.dailyTasks);
        if (data.stats) setStats(data.stats);
        alert('数据导入成功！');
      } catch (err) {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'
    }`}>
      <div className="container mx-auto p-6">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="transition-all duration-300 hover:scale-110"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                className="transition-all duration-300 hover:scale-110"
              >
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-300 hover:scale-110"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    导入
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            任务激励系统
          </h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            克服拖延，记录成长，追踪进步
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

         {/* 日期选择器和当日分数 */}
         <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="text-blue-600" />
              <Input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-auto transition-all duration-300 focus:scale-105"
              />
              <div className="flex items-center gap-2 ml-auto">
                <Star className="text-yellow-500 animate-spin" style={{animationDuration: '3s'}} />
                <span className="text-2xl font-bold text-blue-600 transition-all duration-300">
                  {getTodayScore()}
                  </span>
                  <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>分</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalScore}</div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>总分数</div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalTasks}</div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>总任务数</div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.uniqueDays}</div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>活跃天数</div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.avgScorePerDay}</div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>日均分数</div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="space-y-6">

          {/* 上侧 趋势图 */}
          <div>
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-orange-600" />
                    近{trendDays}天趋势
                  </div>
                  <div className="flex gap-1">
                    <Button
                        variant={trendDays === 30 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTrendDays(30)}
                        className="transition-all duration-300 hover:scale-105"
                    >
                      30天
                    </Button>
                    <Button
                        variant={trendDays === 7 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTrendDays(7)}
                        className="transition-all duration-300 hover:scale-105"
                    >
                      7天
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="displayDate"
                            className={`text-xs ${darkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                        />
                        <YAxis className={`text-xs ${darkMode ? 'fill-gray-400' : 'fill-gray-600'}`} />
                        <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#374151' : '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: darkMode ? '#ffffff' : '#000000'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={`text-center py-8 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无历史数据</p>
                      <p className="text-sm">完成更多任务来查看{trendDays}天趋势图</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* 快速任务模块 - 100%宽度 */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="text-purple-600" />
                  快速任务
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={customTasksSort}
                    onChange={(e) => setCustomTasksSort(e.target.value)}
                    className="text-sm px-2 py-1 border rounded-md bg-background"
                  >
                    <option value="created_at">按时间</option>
                    <option value="score">按分数</option>
                    <option value="frequency">按频率</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomTasksLayout(customTasksLayout === 'grid' ? 'list' : 'grid')}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    {customTasksLayout === 'grid' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCustomTask(!showAddCustomTask)}
                    className="transition-all duration-300 hover:scale-110"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索任务..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 transition-all duration-300 focus:scale-105"
                />
              </div>

              {showAddCustomTask && (
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all duration-300 animate-in slide-in-from-top">
                  <Input
                    placeholder="自定义任务名称"
                    value={newCustomTaskName}
                    onChange={(e) => setNewCustomTaskName(e.target.value)}
                    className="transition-all duration-300 focus:scale-105"
                  />
                  <Input
                    type="number"
                    placeholder="分数"
                    value={newCustomTaskScore}
                    onChange={(e) => setNewCustomTaskScore(e.target.value)}
                    className="transition-all duration-300 focus:scale-105"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={addCustomTask} 
                      size="sm"
                      className="transition-all duration-300 hover:scale-105"
                      disabled={!newCustomTaskName.trim() || !newCustomTaskScore}
                    >
                      保存
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCustomTask(false)}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
              
              {filteredCustomTasks.length > 0 ? (
                <div className={customTasksLayout === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3' 
                  : 'space-y-2'
                }>
                  {filteredCustomTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 bg-white dark:bg-gray-700 rounded-lg border hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105 ${
                        customTasksLayout === 'grid' ? 'text-center' : 'flex items-center justify-between'
                      }`}
                      onClick={() => addCustomTaskToToday(task)}
                    >
                      <div className={customTasksLayout === 'grid' ? 'mb-2' : ''}>
                        <div className="font-medium text-sm">{task.name}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.score}分
                          {task.usage_count > 0 && (
                            <span className="ml-1">· {task.usage_count}次</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={customTasksLayout === 'grid' ? 'flex justify-center' : ''}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTask(task.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-110"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{searchQuery ? '没有找到匹配的任务' : '暂无自定义任务'}</p>
                  <p className="text-sm">{searchQuery ? '' : '点击 + 按钮添加常用任务'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 中间：今日任务列表 */}
          <div>
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-blue-600" />
                  今日任务 ({currentDate})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTodayTasks().map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border transition-all duration-300 hover:shadow-md animate-in slide-in-from-left"
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{task.timestamp}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          +{task.score}分
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-110"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {getTodayTasks().length === 0 && (
                    <div className={`text-center py-8 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>今天还没有完成任务</p>
                      <p className="text-sm">开始添加任务来获得分数吧！</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
}

export default App;

