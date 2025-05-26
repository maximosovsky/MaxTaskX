// Task parsing utilities
export function parseTaskLine(line) {
  const timeRegex = /^(\d{1,2}):(\d{2})\s+(.+)$/;
  const match = line.trim().match(timeRegex);
  
  if (match) {
    const [, hours, minutes, description] = match;
    return {
      type: 'timed',
      time: `${hours.padStart(2, '0')}:${minutes}`,
      description: description.trim(),
      id: `timed_${hours}_${minutes}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

export function parseTasks(rawText) {
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

export function tasksToRawText(tasks) {
  return tasks.map(task => {
    if (task.type === 'timed') {
      return `${task.time} ${task.description}`;
    } else {
      return task.description;
    }
  }).join('\n');
}

export function isInReminderTimeRange() {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 9 && hours < 22;
}

export function shouldTriggerReminder(tasks, completedTasks) {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Check for current timed tasks
  const currentTimedTasks = tasks.filter(task => 
    task.type === 'timed' && task.time === currentTime
  );
  
  // Check for incomplete general tasks
  const incompleteGeneralTasks = tasks.filter(task => 
    task.type === 'general' && !completedTasks.includes(task.id)
  );
  
  return currentTimedTasks.length > 0 || incompleteGeneralTasks.length > 0;
}
