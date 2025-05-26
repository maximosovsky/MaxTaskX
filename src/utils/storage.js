// Local storage utilities for tasks
const TASKS_KEY = 'task_reminder_tasks';
const COMPLETED_KEY = 'task_reminder_completed';
const WORKING_MODE_KEY = 'task_reminder_working_mode';
const LAST_RESET_KEY = 'task_reminder_last_reset';

export function saveTasks(tasksRaw) {
  try {
    localStorage.setItem(TASKS_KEY, tasksRaw);
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function loadTasks() {
  try {
    const tasksRaw = localStorage.getItem(TASKS_KEY) || '';
    return parseTasksFromRaw(tasksRaw);
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}

export function saveCompletedTasks(completedTaskIds) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedTaskIds));
  } catch (error) {
    console.error('Failed to save completed tasks to localStorage:', error);
  }
}

export function loadCompletedTasks() {
  try {
    const completed = localStorage.getItem(COMPLETED_KEY);
    return completed ? JSON.parse(completed) : [];
  } catch (error) {
    console.error('Failed to load completed tasks from localStorage:', error);
    return [];
  }
}

export function saveWorkingMode(workingModeData) {
  try {
    localStorage.setItem(WORKING_MODE_KEY, JSON.stringify(workingModeData));
  } catch (error) {
    console.error('Failed to save working mode to localStorage:', error);
  }
}

export function loadWorkingMode() {
  try {
    const workingMode = localStorage.getItem(WORKING_MODE_KEY);
    return workingMode ? JSON.parse(workingMode) : { active: false, until: null };
  } catch (error) {
    console.error('Failed to load working mode from localStorage:', error);
    return { active: false, until: null };
  }
}

export function shouldResetDaily() {
  const lastReset = localStorage.getItem(LAST_RESET_KEY);
  const today = new Date().toDateString();
  return !lastReset || lastReset !== today;
}

export function markDailyReset() {
  const today = new Date().toDateString();
  localStorage.setItem(LAST_RESET_KEY, today);
}

export function resetDailyData() {
  if (shouldResetDaily()) {
    saveCompletedTasks([]);
    markDailyReset();
    return true;
  }
  return false;
}

// Helper function to parse tasks from raw text
function parseTasksFromRaw(rawText) {
  const lines = rawText.split('\n');
  const tasks = [];
  
  lines.forEach((line, index) => {
    const timeRegex = /^(\d{1,2}):(\d{2})\s+(.+)$/;
    const match = line.trim().match(timeRegex);
    
    if (match) {
      const [, hours, minutes, description] = match;
      tasks.push({
        type: 'timed',
        time: `${hours.padStart(2, '0')}:${minutes}`,
        description: description.trim(),
        id: `timed_${hours}_${minutes}_${index}`
      });
    } else if (line.trim()) {
      tasks.push({
        type: 'general',
        description: line.trim(),
        id: `general_${index}_${line.trim().replace(/\s+/g, '_').toLowerCase()}`
      });
    }
  });
  
  return tasks;
}
