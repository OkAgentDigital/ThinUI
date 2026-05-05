import React, { useState, useEffect, useCallback } from 'react';

/**
 * KanbanSurface — Three-lane Kanban board for GiftWrapper.
 *
 * Fetches task data from the MCP task server (port 30001) and displays
 * a drag-drop Kanban board for dev, publishing, and user lanes.
 *
 * API endpoints (served by task_mcp_server.py):
 *   POST /mcp — tools/call with task_kanban_board, task_list, task_update
 */

interface Card {
  id: string;
  title: string;
  status: string;
  lane: string;
  priority: string;
  assignee: string | null;
  due_date: string | null;
  tags: string[];
  created: string;
  updated: string;
}

interface KanbanData {
  lane: string;
  columns: string[];
  cards: Record<string, Card[]>;
}

const LANES = ['dev', 'publishing', 'user'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-gray-500 text-white',
};

const LANE_LABELS: Record<string, string> = {
  dev: '🛠 Dev',
  publishing: '📦 Publishing',
  user: '👤 User',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: '📋 Backlog',
  'in-progress': '⚡ In Progress',
  review: '🔍 Review',
  done: '✅ Done',
};

async function callMcpTool(tool: string, args: Record<string, any>): Promise<any> {
  const response = await fetch('http://localhost:30001/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'tools/call',
      params: { name: tool, arguments: args },
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const content = data.content?.[0]?.text;
  return content ? JSON.parse(content) : data;
}

export function KanbanSurface() {
  const [activeLane, setActiveLane] = useState<string>('dev');
  const [board, setBoard] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    lane: 'dev',
    priority: 'medium',
    description: '',
  });

  const loadBoard = useCallback(async (lane: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callMcpTool('task_kanban_board', { lane });
      if (result.success) {
        setBoard(result.data);
      } else {
        setError(result.error || 'Failed to load board');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard(activeLane);
  }, [activeLane, loadBoard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadBoard(activeLane), 30000);
    return () => clearInterval(interval);
  }, [activeLane, loadBoard]);

  const handleDragStart = (card: Card) => {
    setDraggedCard(card);
  };

  const handleDrop = async (targetStatus: string) => {
    if (!draggedCard || draggedCard.status === targetStatus) {
      setDraggedCard(null);
      return;
    }

    try {
      await callMcpTool('task_update', {
        task_id: draggedCard.id,
        field: 'status',
        value: targetStatus,
      });
      // Reload board
      await loadBoard(activeLane);
    } catch (err: any) {
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setDraggedCard(null);
    }
  };

  const handleCreateTask = async () => {
    if (!createForm.title.trim()) return;
    try {
      await callMcpTool('task_create', {
        title: createForm.title,
        lane: createForm.lane,
        priority: createForm.priority,
        description: createForm.description,
      });
      setShowCreateForm(false);
      setCreateForm({ title: '', lane: 'dev', priority: 'medium', description: '' });
      await loadBoard(activeLane);
    } catch (err: any) {
      setError(`Failed to create task: ${err.message}`);
    }
  };

  const getCardCount = (status: string): number => {
    if (!board) return 0;
    return board.cards[status]?.length || 0;
  };

  return (
    <div className="h-full bg-gray-900 text-gray-100 p-4 font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📋 Three-Lane Kanban</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
          >
            {showCreateForm ? '✕ Cancel' : '+ New Task'}
          </button>
          <button
            onClick={() => loadBoard(activeLane)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Lane Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-700">
        {LANES.map(lane => (
          <button
            key={lane}
            onClick={() => setActiveLane(lane)}
            className={`px-4 py-2 text-sm rounded-t ${
              activeLane === lane
                ? 'bg-gray-800 text-white border border-gray-700 border-b-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {LANE_LABELS[lane]}
            <span className="ml-2 text-xs text-gray-500">
              ({['backlog', 'in-progress', 'review', 'done'].reduce((sum, s) => sum + getCardCount(s), 0)})
            </span>
          </button>
        ))}
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-gray-800 rounded border border-gray-700">
          <h3 className="font-bold mb-2">Create New Task</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Task title (required)"
              value={createForm.title}
              onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
            <div className="flex gap-2">
              <select
                value={createForm.lane}
                onChange={e => setCreateForm(f => ({ ...f, lane: e.target.value }))}
                className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
              >
                {LANES.map(l => (
                  <option key={l} value={l}>{LANE_LABELS[l]}</option>
                ))}
              </select>
              <select
                value={createForm.priority}
                onChange={e => setCreateForm(f => ({ ...f, priority: e.target.value }))}
                className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white text-sm"
              rows={2}
            />
            <button
              onClick={handleCreateTask}
              disabled={!createForm.title.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:opacity-50"
            >
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="animate-spin mr-2">⏳</div>
          Loading board...
        </div>
      ) : board ? (
        <div className="grid grid-cols-4 gap-3" style={{ minHeight: '60vh' }}>
          {board.columns.map(col => (
            <div
              key={col}
              className="bg-gray-800 rounded-lg p-3"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{STATUS_LABELS[col] || col}</h3>
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                  {board.cards[col]?.length || 0}
                </span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {(board.cards[col] || []).map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card)}
                    className={`p-3 rounded cursor-grab active:cursor-grabbing transition-all ${
                      draggedCard?.id === card.id
                        ? 'opacity-50 ring-2 ring-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium flex-1">{card.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[card.priority] || ''}`}>
                        {card.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      {card.assignee && <span>👤 {card.assignee}</span>}
                      {card.due_date && <span>📅 {card.due_date}</span>}
                      {card.tags?.length > 0 && (
                        <span className="truncate">
                          🏷️ {card.tags.slice(0, 2).join(', ')}
                          {card.tags.length > 2 && '…'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty column placeholder */}
                {(!board.cards[col] || board.cards[col].length === 0) && (
                  <div className="text-center text-gray-600 text-xs py-8 border-2 border-dashed border-gray-700 rounded">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
          No board data available. Is the MCP task server running on port 30001?
        </div>
      )}

      {/* Footer Stats */}
      {board && (
        <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500 flex gap-4">
          <span>Lane: <strong>{activeLane}</strong></span>
          <span>Total: <strong>{board.columns.reduce((sum, col) => sum + (board.cards[col]?.length || 0), 0)}</strong></span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
}

export default KanbanSurface;
