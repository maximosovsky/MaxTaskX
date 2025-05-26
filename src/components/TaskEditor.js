import React, { useState, useEffect } from 'react';

const TaskEditor = ({ tasks, onSave, onClose }) => {
  const [rawText, setRawText] = useState('');

  useEffect(() => {
    // Convert tasks back to raw text format
    const taskLines = tasks.map(task => {
      if (task.type === 'timed') {
        return `${task.time} ${task.description}`;
      } else {
        return task.description;
      }
    });
    setRawText(taskLines.join('\n'));
  }, [tasks]);

  const handleSave = () => {
    onSave(rawText);
    onClose();
  };

  const formatExample = `Example format:
09:00 drink water
15:30 check emails
read 15 minutes
exercise
call mom`;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">✏️ Edit Tasks</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Task Format:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Timed tasks:</strong> HH:MM description (e.g., "09:00 drink water")</div>
              <div><strong>General tasks:</strong> Just description (e.g., "read 15 minutes")</div>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tasks (one per line):
          </label>
          <textarea
            className="input textarea"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={formatExample}
            rows={12}
          />
          <div className="text-xs text-gray-500 mt-2">
            General tasks reset daily. Completed status is tracked per day.
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary flex-1" onClick={handleSave}>
            💾 Save Tasks
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">💡 How it works:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Timed tasks appear as reminders at specific times</li>
            <li>• General tasks appear in every reminder until completed</li>
            <li>• All general task completions reset at midnight</li>
            <li>• Reminders happen every 30 minutes from 9:00 to 22:00</li>
            <li>• Working mode disables reminders for 1 hour</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
