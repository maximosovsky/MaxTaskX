import React from 'react';

const TaskList = ({ tasks, completedTasks, onTaskComplete, currentTime }) => {
  const timedTasks = tasks.filter(task => task.type === 'timed');
  const generalTasks = tasks.filter(task => task.type === 'general');

  const isTaskCompleted = (taskId) => completedTasks.includes(taskId);
  const isCurrentTime = (taskTime) => taskTime === currentTime;

  const TaskItem = ({ task, showCompleteButton = false }) => (
    <div className={`task-item ${isTaskCompleted(task.id) ? 'completed' : ''}`}>
      <div className="flex items-center flex-1">
        {task.type === 'timed' && (
          <span className={`task-time ${isCurrentTime(task.time) ? 'text-red-600' : ''}`}>
            {task.time}
          </span>
        )}
        <span className="task-description">{task.description}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {task.type === 'timed' && isCurrentTime(task.time) && (
          <span className="status-badge status-warning">Now</span>
        )}
        {task.type === 'general' && isTaskCompleted(task.id) && (
          <span className="status-badge status-success">✓</span>
        )}
        {showCompleteButton && task.type === 'general' && !isTaskCompleted(task.id) && (
          <button 
            className="btn btn-success btn-sm"
            onClick={() => onTaskComplete(task.id)}
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Timed Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">⏰ Timed Tasks</h2>
          <span className="text-sm text-gray-500">{timedTasks.length} tasks</span>
        </div>
        
        {timedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No timed tasks configured. Click "Edit Tasks" to add some.
          </div>
        ) : (
          <div className="space-y-2">
            {timedTasks
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(task => (
                <TaskItem key={task.id} task={task} />
              ))
            }
          </div>
        )}
      </div>

      {/* General Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📋 General Tasks</h2>
          <span className="text-sm text-gray-500">
            {generalTasks.filter(t => isTaskCompleted(t.id)).length}/{generalTasks.length} completed
          </span>
        </div>
        
        {generalTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No general tasks configured. Click "Edit Tasks" to add some.
          </div>
        ) : (
          <div className="space-y-2">
            {generalTasks.map(task => (
              <TaskItem key={task.id} task={task} showCompleteButton={true} />
            ))}
          </div>
        )}
      </div>

      {/* Daily Progress */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">📈 Daily Progress</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">General tasks completed:</span>
            <span className="font-semibold">
              {generalTasks.filter(t => isTaskCompleted(t.id)).length} / {generalTasks.length}
            </span>
          </div>
          
          {generalTasks.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(generalTasks.filter(t => isTaskCompleted(t.id)).length / generalTasks.length) * 100}%` 
                }}
              ></div>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            Progress resets daily at midnight
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
