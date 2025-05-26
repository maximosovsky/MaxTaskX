import React, { useState, useEffect } from 'react';
import TaskEditor from './components/TaskEditor';
import TaskList from './components/TaskList';
import WorkingMode from './components/WorkingMode';
import ReminderPopup from './components/ReminderPopup';
import { loadTasks, saveTasks } from './utils/storage';
import { startReminderSystem } from './utils/reminderSystem';

function App() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [workingMode, setWorkingMode] = useState({ active: false, until: null });
  const [showEditor, setShowEditor] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderData, setReminderData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Start reminder system
  useEffect(() => {
    const cleanup = startReminderSystem(handleReminderTrigger);
    return cleanup;
  }, []);

  const loadInitialData = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data.tasks);
      setCompletedTasks(data.completedGeneralTasks);
      
      if (data.workingModeUntil) {
        const until = new Date(data.workingModeUntil);
        setWorkingMode({
          active: until > new Date(),
          until: until
        });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Load from localStorage as fallback
      const localTasks = loadTasks();
      setTasks(localTasks);
    }
  };

  const handleTasksSave = async (rawTasks) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasksRaw: rawTasks })
      });
      
      // Save to localStorage as backup
      saveTasks(rawTasks);
      
      // Reload tasks
      loadInitialData();
    } catch (error) {
      console.error('Failed to save tasks:', error);
      // Save to localStorage as fallback
      saveTasks(rawTasks);
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      await fetch('/api/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      
      setCompletedTasks(prev => [...prev, taskId]);
    } catch (error) {
      console.error('Failed to complete task:', error);
      setCompletedTasks(prev => [...prev, taskId]);
    }
  };

  const handleWorkingModeToggle = async (enabled) => {
    try {
      const response = await fetch('/api/working-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      const data = await response.json();
      
      if (data.workingModeUntil) {
        const until = new Date(data.workingModeUntil);
        setWorkingMode({ active: true, until });
      } else {
        setWorkingMode({ active: false, until: null });
      }
    } catch (error) {
      console.error('Failed to toggle working mode:', error);
    }
  };

  const handleReminderTrigger = (reminderInfo) => {
    if (reminderInfo.shouldShowReminder) {
      setReminderData(reminderInfo);
      setShowReminder(true);
    }
  };

  const handleReminderComplete = () => {
    if (reminderData) {
      // Complete all general tasks shown in the reminder
      reminderData.incompleteGeneralTasks.forEach(task => {
        handleTaskComplete(task.id);
      });
    }
    setShowReminder(false);
    setReminderData(null);
  };

  const handleReminderSnooze = () => {
    setShowReminder(false);
    // Schedule another reminder in 5 minutes
    setTimeout(() => {
      if (reminderData) {
        setShowReminder(true);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  const getCurrentTimeFormatted = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimedTasksForCurrentTime = () => {
    const currentTimeStr = getCurrentTimeFormatted();
    return tasks.filter(task => task.type === 'timed' && task.time === currentTimeStr);
  };

  const getIncompleteGeneralTasks = () => {
    return tasks.filter(task => 
      task.type === 'general' && !completedTasks.includes(task.id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container">
        <header className="py-6 border-b border-gray-200 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Task Reminder</h1>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Current time: <span className="font-mono font-semibold">{getCurrentTimeFormatted()}</span>
            </div>
            <div className="flex items-center gap-4">
              <WorkingMode 
                workingMode={workingMode}
                onToggle={handleWorkingModeToggle}
              />
              <button 
                className="btn btn-primary"
                onClick={() => setShowEditor(true)}
              >
                ✏️ Edit Tasks
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {/* Current Status */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">📊 Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getTimedTasksForCurrentTime().length}
                </div>
                <div className="text-sm text-gray-600">Current Timed Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {getIncompleteGeneralTasks().length}
                </div>
                <div className="text-sm text-gray-600">Incomplete General Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.type === 'general' && completedTasks.includes(t.id)).length}
                </div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
            </div>
          </div>

          {/* Task Lists */}
          <TaskList 
            tasks={tasks}
            completedTasks={completedTasks}
            onTaskComplete={handleTaskComplete}
            currentTime={getCurrentTimeFormatted()}
          />
        </main>

        {/* Task Editor Modal */}
        {showEditor && (
          <TaskEditor 
            tasks={tasks}
            onSave={handleTasksSave}
            onClose={() => setShowEditor(false)}
          />
        )}

        {/* Reminder Popup */}
        {showReminder && reminderData && (
          <ReminderPopup 
            reminderData={reminderData}
            onComplete={handleReminderComplete}
            onSnooze={handleReminderSnooze}
            onClose={() => setShowReminder(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
