import React from 'react';

const WorkingMode = ({ workingMode, onToggle }) => {
  const isActive = workingMode.active && workingMode.until && new Date(workingMode.until) > new Date();
  
  const getTimeUntil = () => {
    if (!workingMode.until) return '';
    const until = new Date(workingMode.until);
    const now = new Date();
    
    if (until <= now) return '';
    
    return until.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleToggle = () => {
    onToggle(!isActive);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="toggle">
          <input 
            type="checkbox" 
            checked={isActive}
            onChange={handleToggle}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="text-sm font-medium">
          🔧 Working Mode
        </span>
      </div>
      
      {isActive && (
        <div className="text-xs text-orange-600 font-medium">
          Active until {getTimeUntil()}
        </div>
      )}
    </div>
  );
};

export default WorkingMode;
