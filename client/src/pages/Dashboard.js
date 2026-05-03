import { useEffect, useState } from "react";
import {
  getTasks,
  getTaskStats,
  addTask,
  updateTaskStatus,
  deleteTask,
} from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [task, setTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const fetchTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const fetchStats = async () => {
    const data = await getTaskStats();
    setStats(data);
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.title) {
      alert("Title required");
      return;
    }

    await addTask(task);

    setTask({ title: "", description: "", deadline: "" });

    fetchTasks();
    fetchStats();
  };

  const handleUpdate = async (id, status) => {
    await updateTaskStatus(id, {
      status: status === "pending" ? "completed" : "pending",
    });

    fetchTasks();
    fetchStats();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);

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

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={task.title}
            onChange={handleChange}
          />

          <input
            name="description"
            placeholder="Description"
            value={task.description}
            onChange={handleChange}
          />

          <input
            type="datetime-local"
            name="deadline"
            value={task.deadline}
            onChange={handleChange}
          />

          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="card">
        <h3>Tasks</h3>

        <table border="1">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleString()
                    : "No deadline"}
                </td>
                <td>{task.status}</td>
                <td>
                  <button onClick={() => handleUpdate(task._id, task.status)}>
                    Toggle
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
