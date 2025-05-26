import React from 'react';

const ReminderPopup = ({ reminderData, onComplete, onSnooze, onClose }) => {
  const { currentTimedTasks, incompleteGeneralTasks } = reminderData;
  const hasTasksToShow = currentTimedTasks.length > 0 || incompleteGeneralTasks.length > 0;

  if (!hasTasksToShow) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⏰</div>
          <h2 className="text-2xl font-bold text-gray-900">Task Reminder</h2>
          <div className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Current Timed Tasks */}
          {currentTimedTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🎯 Current Tasks
              </h3>
              <div className="space-y-2">
                {currentTimedTasks.map(task => (
                  <div key={task.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-red-700">{task.time}</span>
                      <span className="text-gray-900">{task.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incomplete General Tasks */}
          {incompleteGeneralTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📋 Pending Tasks
              </h3>
              <div className="space-y-2">
                {incompleteGeneralTasks.map(task => (
                  <div key={task.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <span className="text-gray-900">{task.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            className="btn btn-success flex-1"
            onClick={onComplete}
          >
            ✅ Mark Completed
          </button>
          <button 
            className="btn btn-warning flex-1"
            onClick={onSnooze}
          >
            🔁 Snooze 5min
          </button>
        </div>

        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Completing will mark all pending general tasks as done
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup;
