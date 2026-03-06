import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import {
  Plus,
  CheckCircle,
  Calendar,
  Briefcase,
  Zap,
  ArrowRight,
  MoreVertical,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

/* ---------- MOCK OFFICER ---------- */
const mockOfficer = {
  firstName: "Manish",
  lastName: "Kumar",
  department: "Sanitation"
};

/* ---------- MOCK TASKS ---------- */
const mockTasks = [
  {
    id: "T1",
    title: "Drainage Cleaning",
    description: "Clear blocked drainage near Sector 4 market",
    priority: "High",
    assignedTo: "Rahul",
    status: "Todo"
  },
  {
    id: "T2",
    title: "Waste Pickup",
    description: "Collect garbage backlog in Zone 2",
    priority: "Medium",
    assignedTo: "Amit",
    status: "In Progress"
  },
  {
    id: "T3",
    title: "Road Repair",
    description: "Fix potholes on Main Road",
    priority: "Low",
    assignedTo: "Team C",
    status: "Completed"
  }
];

const TaskBoard = () => {
  const { user } = useAuth();
  const [officer, setOfficer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignedTo: ""
  });

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        // Fetch tasks filtered by department
        const API_BASE = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
        
        // Properly encode the department parameter
        const params = new URLSearchParams();
        if (user.department) {
          params.append('department', user.department);
        }
        
        const url = `${API_BASE}/api/tasks${params.toString() ? '?' + params.toString() : ''}`;
        console.log('Fetching tasks from:', url);
        console.log('Department filter:', user.department);
        
        const res = await fetch(url);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch tasks:', errorData);
          throw new Error(errorData.error || 'Failed to load tasks');
        }
        
        const data = await res.json();
        console.log('Tasks loaded:', data);
        const taskList = data.tasks || [];
        setTasks(taskList.map(t => ({
          id: t.taskId || t.id,
          title: t.title,
          description: t.description,
          priority: t.priority || 'Medium',
          assignedTo: t.assignedTo || 'Unassigned',
          status: t.status || 'Todo'
        })));
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    // Set officer info
    setOfficer({
      firstName: user.firstName || user.name?.split(' ')[0] || 'Admin',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      department: user.department || 'Operations'
    });

    fetchTasks();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      const API_BASE = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedTo: newTask.assignedTo,
        department: officer.department,
        createdBy: user.sub,
        status: "Todo"
      };

      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });

      if (res.ok) {
        const created = await res.json();
        const task = {
          id: created.taskId || Date.now().toString(),
          ...newTask,
          status: "Todo"
        };
        setTasks((prev) => [task, ...prev]);
        toast.success("Assignment Created");
        setShowAddModal(false);
        setNewTask({
          title: "",
          description: "",
          priority: "Medium",
          assignedTo: ""
        });
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error("Failed to create assignment");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const API_BASE = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        toast.success(`Task moved to ${newStatus}`);
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error("Failed to update task status");
    }
  };

  const columns = [
    { id: "Todo", label: "Backlog", icon: <Briefcase size={16} /> },
    { id: "In Progress", label: "In Action", icon: <Zap size={16} /> },
    { id: "Completed", label: "Finalized", icon: <CheckCircle size={16} /> }
  ];

  if (!officer || loading) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Loading Tasks...
        </p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase flex items-center gap-3">
              Strategic Ops
              <span className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-black text-blue-600">
                {officer.department}
              </span>
            </h1>
            <p className="text-sm text-slate-500">
              Coordinate field assignments
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase"
          >
            <Plus size={18} /> Deploy Assignment
          </button>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-slate-50 rounded-[2.5rem] border p-6 min-h-[600px]"
            >
              <div className="flex justify-between mb-8">
                <h3 className="font-black uppercase text-xs">
                  {column.label}
                </h3>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black">
                  {tasks.filter((t) => t.status === column.id).length}
                </span>
              </div>

              <div className="space-y-4">
                {tasks
                  .filter((t) => t.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-5 rounded-3xl border shadow-sm"
                    >
                      <div className="mb-2">
                        <span className="text-[8px] font-black uppercase">
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm mb-2">
                        {task.title}
                      </h4>

                      <p className="text-xs text-slate-500 mb-4">
                        {task.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">
                          {task.assignedTo}
                        </span>

                        <div className="flex gap-1">
                          {column.id !== "Todo" && (
                            <button
                              onClick={() =>
                                updateTaskStatus(
                                  task.id,
                                  column.id === "Completed"
                                    ? "In Progress"
                                    : "Todo"
                                )
                              }
                            >
                              <ArrowRight size={14} className="rotate-180" />
                            </button>
                          )}

                          {column.id !== "Completed" && (
                            <button
                              onClick={() =>
                                updateTaskStatus(
                                  task.id,
                                  column.id === "Todo"
                                    ? "In Progress"
                                    : "Completed"
                                )
                              }
                            >
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-3xl p-8">
              <h3 className="text-xl font-black uppercase mb-6">
                New Assignment
              </h3>

              <form onSubmit={handleAddTask} className="space-y-4">
                <input
                  required
                  placeholder="Title"
                  className="w-full border p-3 rounded-xl"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />

                <textarea
                  required
                  placeholder="Description"
                  className="w-full border p-3 rounded-xl"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      description: e.target.value
                    })
                  }
                />

                <input
                  required
                  placeholder="Assigned To"
                  className="w-full border p-3 rounded-xl"
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      assignedTo: e.target.value
                    })
                  }
                />

                <select
                  className="w-full border p-3 rounded-xl"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value
                    })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TaskBoard;