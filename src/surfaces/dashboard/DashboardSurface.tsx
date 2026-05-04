import React, { useState, useEffect } from 'react';

export function DashboardSurface() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    fetch('/api/board')  // Hivemind serves this
      .then(res => res.json())
      .then(setBoard);
  }, []);

  if (!board) return <div>Loading...</div>;

  return (
    <div className="h-full bg-black text-green-400 p-4 font-mono">
      <h1 className="text-xl font-bold mb-4">📊 uCode Progress Dashboard</h1>
      
      <div className="grid grid-cols-5 gap-2 mb-8">
        {board.columns.map(col => (
          <div key={col} className="text-center">
            <div className="font-bold">{col}</div>
            <div className="text-2xl">
              {board.tasks.filter(t => t.status === col).length}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-green-700 rounded p-4">
        <h2 className="font-bold mb-2">🎯 Next Actions</h2>
        <ul className="space-y-2">
          {board.tasks
            .filter(t => t.status === 'planning' || t.status === 'in-progress')
            .map(task => (
              <li key={task.id} className="flex justify-between">
                <span>{task.title}</span>
                <span className="text-yellow-400">{task.status}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}