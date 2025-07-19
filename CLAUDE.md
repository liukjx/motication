# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

后续任务回复使用中文

## Project Overview
This is a task motivation system with a React frontend and Node.js backend. The system helps users track daily tasks and maintain motivation through a scoring system.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Radix UI components
- **Backend**: Node.js + Express + SQLite3
- **Database**: SQLite with two main tables (`custom_tasks`, `daily_tasks`)

## Directory Structure
```
task-motivation/
├── task-motivation-app/          # React frontend
│   ├── src/
│   │   ├── components/ui/       # Radix UI components
│   │   ├── App.jsx             # Main application
│   │   └── lib/utils.js        # Utility functions
│   ├── package.json            # Uses pnpm as package manager
│   └── vite.config.js          # Vite configuration
├── task-motivation-backend/     # Node.js backend
│   ├── server.js               # Express server with SQLite
│   ├── task_motivation.db      # SQLite database
│   └── package.json
└── package.json                # Root package.json
```

## Development Commands

### Frontend (task-motivation-app/)
```bash
cd task-motivation-app
pnpm install           # Install dependencies
pnpm dev               # Start development server
pnpm build             # Build for production
pnpm lint              # Run ESLint
pnpm preview           # Preview production build
```

### Backend (task-motivation-backend/)
```bash
cd task-motivation-backend
npm install            # Install dependencies
npm start              # Start backend server on port 3001
npm run dev            # Same as npm start
```

## API Endpoints

### Custom Tasks
- `GET /api/custom-tasks` - Get all custom tasks
- `GET /api/custom-tasks/search?q=query` - Search custom tasks
- `POST /api/custom-tasks` - Create custom task
- `DELETE /api/custom-tasks/:id` - Delete custom task

### Daily Tasks
- `GET /api/daily-tasks?date=YYYY-MM-DD` - Get daily tasks
- `POST /api/daily-tasks` - Create daily task
- `DELETE /api/daily-tasks/:id` - Delete daily task

### Statistics
- `GET /api/stats` - Get statistics (total score, tasks, etc.)
- `GET /api/trend?days=7` - Get trend data
- `GET /api/health` - Health check

## Key Features
- **Custom Tasks**: Reusable task templates with scores
- **Daily Tracking**: Record completed tasks with timestamps
- **Statistics**: Track total score, task count, active days
- **Trend Visualization**: 7-day trend chart using Recharts
- **Theme Support**: Dark/light mode toggle
- **Search**: Fuzzy search for custom tasks
- **Data Export/Import**: JSON format backup/restore

## Development Notes
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 3001 (configurable via PORT env var)
- Frontend uses `192.168.31.158:3001` for backend in development
- Database is automatically initialized on first backend start
- Uses Tailwind CSS v4 with dark mode support
- Radix UI components for consistent UI elements