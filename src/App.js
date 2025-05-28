import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import TaskEditor from './components/TaskEditor';
import TaskList from './components/TaskList';
import WorkingMode from './components/WorkingMode';
import ReminderPopup from './components/ReminderPopup';
import Leaderboard from './components/Leaderboard';
import { playMonetSound, showConfetti } from './utils/animations';
import { startReminderSystem } from './utils/reminderSystem';
import { loadTasks, saveTasks } from './utils/storage';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [workingMode, setWorkingMode] = useState({ active: false, until: null });
  const [showEditor, setShowEditor] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderData, setReminderData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tokens, setTokens] = useState(0);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
    },
    onError: (error) => console.log('Login Failed:', error)
  });

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
    setCompletedTasks(prev => [...prev, taskId]);
    setTokens(prev => prev + 1);
    playMonetSound();
    showConfetti();

    try {
      await fetch('/api/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
    } catch (error) {
      console.error('Failed to complete task:', error);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Reminder</h1>
          {!user ? (
            <button onClick={() => login()} className="btn btn-primary">
              Sign in with Google
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span>🪙 {tokens} tokens</span>
              <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
            </div>
          )}
        </header>

        <WorkingMode workingMode={workingMode} onToggle={handleWorkingModeToggle} />
        
        <main className="space-y-6">
          <TaskList 
            tasks={tasks}
            completedTasks={completedTasks}
            onTaskComplete={handleTaskComplete}
          />
          
          <Leaderboard />
        </main>

        {showEditor && (
          <TaskEditor
            tasks={tasks}
            onSave={handleTasksSave}
            onClose={() => setShowEditor(false)}
          />
        )}

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