import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard</h2>
      <div className="space-y-4">
        {leaderboardData.map((user, index) => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
            <span className="text-lg font-bold">{index + 1}</span>
            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.tokens} tokens</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;