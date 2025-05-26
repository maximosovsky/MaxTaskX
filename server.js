const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// In-memory storage for tasks and state
let appState = {
  tasksRaw: '',
  completedGeneralTasks: [],
  workingModeUntil: null,
  lastReset: new Date().toDateString()
};

// Task parsing utility
function parseTaskLine(line) {
  const timeRegex = /^(\d{1,2}):(\d{2})\s+(.+)$/;
  const match = line.trim().match(timeRegex);
  
  if (match) {
    const [, hours, minutes, description] = match;
    return {
      type: 'timed',
      time: `${hours.padStart(2, '0')}:${minutes}`,
      description: description.trim(),
      id: `timed_${hours}_${minutes}_${Date.now()}`
    };
  } else if (line.trim()) {
    return {
      type: 'general',
      description: line.trim(),
      id: `general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  return null;
}

function parseTasks(rawText) {
  const lines = rawText.split('\n');
  const tasks = [];
  
  lines.forEach(line => {
    const task = parseTaskLine(line);
    if (task) {
      tasks.push(task);
    }
  });
  
  return tasks;
}

function shouldResetDaily() {
  const today = new Date().toDateString();
  return appState.lastReset !== today;
}

function resetDailyTasks() {
  appState.completedGeneralTasks = [];
  appState.lastReset = new Date().toDateString();
}

// API Routes
app.get('/api/tasks', (req, res) => {
  if (shouldResetDaily()) {
    resetDailyTasks();
  }
  
  const tasks = parseTasks(appState.tasksRaw);
  res.json({
    tasks,
    completedGeneralTasks: appState.completedGeneralTasks,
    workingModeUntil: appState.workingModeUntil
  });
});

app.post('/api/tasks', (req, res) => {
  const { tasksRaw } = req.body;
  appState.tasksRaw = tasksRaw || '';
  res.json({ success: true });
});

app.post('/api/complete-task', (req, res) => {
  const { taskId } = req.body;
  if (!appState.completedGeneralTasks.includes(taskId)) {
    appState.completedGeneralTasks.push(taskId);
  }
  res.json({ success: true });
});

app.post('/api/working-mode', (req, res) => {
  const { enabled } = req.body;
  if (enabled) {
    const now = new Date();
    const until = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    appState.workingModeUntil = until.toISOString();
  } else {
    appState.workingModeUntil = null;
  }
  res.json({ workingModeUntil: appState.workingModeUntil });
});

app.get('/api/reminder-check', (req, res) => {
  if (shouldResetDaily()) {
    resetDailyTasks();
  }
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const tasks = parseTasks(appState.tasksRaw);
  
  // Check if working mode is active
  const workingModeActive = appState.workingModeUntil && new Date(appState.workingModeUntil) > now;
  
  // Find current timed tasks
  const currentTimedTasks = tasks.filter(task => 
    task.type === 'timed' && task.time === currentTime
  );
  
  // Find incomplete general tasks
  const incompleteGeneralTasks = tasks.filter(task => 
    task.type === 'general' && !appState.completedGeneralTasks.includes(task.id)
  );
  
  // Should show reminder?
  const shouldShowReminder = !workingModeActive && 
    (currentTimedTasks.length > 0 || incompleteGeneralTasks.length > 0);
  
  res.json({
    shouldShowReminder,
    currentTimedTasks,
    incompleteGeneralTasks,
    workingModeActive,
    workingModeUntil: appState.workingModeUntil
  });
});

// Serve React app for any non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
