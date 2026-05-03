import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const fetchStats = async () => {
    const res = await API.get("/tasks/stats");
    setStats(res.data);
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();

    if (!newTask.title) return alert("Title required");

    await API.post("/tasks", newTask);

    setNewTask({ title: "", description: "" });

    fetchTasks();
    fetchStats();
  };

  const updateTask = async (id, status) => {
    await API.put(`/tasks/${id}`, {
      status: status === "pending" ? "completed" : "pending",
    });

    fetchTasks();
    fetchStats();
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);

    fetchTasks();
    fetchStats();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <button className="secondary" onClick={logout}>
        Logout
      </button>

      <div className="card">
        <h3>Stats</h3>
        <p>Total: {stats.total || 0}</p>
        <p>Completed: {stats.completed || 0}</p>
        <p>Pending: {stats.pending || 0}</p>
      </div>

      <div className="card">
        <h3>Create Task</h3>

        <form onSubmit={createTask}>
          <input
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />

          <input
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />

          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="card">
        <h3>Tasks</h3>

        <ul>
          {tasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong> — {task.status}
              <br />
              <button onClick={() => updateTask(task._id, task.status)}>
                Toggle
              </button>
              <button className="delete" onClick={() => deleteTask(task._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
