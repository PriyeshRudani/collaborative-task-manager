import { useCallback, useEffect, useState } from "react";
import {
  getFilteredTasks,
  getTaskStats,
  addTask,
  updateTaskStatus,
  deleteTask,
  getUsers,
  getProjects,
  addProject,
  inviteMember,
  addComment,
  toggleSubtask,
} from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState("table");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    project: "",
  });
  const [project, setProject] = useState({ name: "" });
  const [member, setMember] = useState({ projectId: "", email: "", role: "member" });
  const [comment, setComment] = useState({});
  const [task, setTask] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "todo",
    priority: "medium",
    project: "",
    assignedTo: "",
    labels: "",
    attachments: "",
    subtasks: "",
  });

  const fetchTasks = useCallback(async () => {
    const data = await getFilteredTasks(filters);
    setTasks(data);
  }, [filters]);

  const fetchStats = useCallback(async () => {
    const data = await getTaskStats();
    setStats(data);
  }, []);

  const fetchUsersAndProjects = async () => {
    setUsers(await getUsers());
    setProjects(await getProjects());
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    fetchTasks();
    fetchStats();
    fetchUsersAndProjects();

    const timer = setInterval(() => {
      fetchTasks();
      fetchStats();
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchTasks, fetchStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

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

    setTask({
      title: "",
      description: "",
      deadline: "",
      status: "todo",
      priority: "medium",
      project: "",
      assignedTo: "",
      labels: "",
      attachments: "",
      subtasks: "",
    });

    fetchTasks();
    fetchStats();
  };

  const handleStatusUpdate = async (id, status) => {
    await updateTaskStatus(id, { status });
    fetchTasks();
    fetchStats();
  };

  const handlePriorityUpdate = async (id, priority) => {
    await updateTaskStatus(id, { priority });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    fetchTasks();
    fetchStats();
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    if (!project.name) {
      alert("Project name required");
      return;
    }

    await addProject(project);
    setProject({ name: "" });
    fetchUsersAndProjects();
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!member.projectId || !member.email) {
      alert("Project and email required");
      return;
    }

    await inviteMember(member.projectId, {
      email: member.email,
      role: member.role,
    });

    setMember({ projectId: "", email: "", role: "member" });
    fetchUsersAndProjects();
  };

  const handleComment = async (e, id) => {
    e.preventDefault();

    if (!comment[id]) return;

    await addComment(id, { text: comment[id] });
    setComment({ ...comment, [id]: "" });
    fetchTasks();
  };

  const exportCSV = () => {
    const rows = tasks.map((item) => ({
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      deadline: item.deadline ? new Date(item.deadline).toLocaleString() : "",
      project: item.project ? item.project.name : "",
      assignedTo: item.assignedTo ? item.assignedTo.name : "",
    }));

    const header = Object.keys(rows[0] || { title: "", status: "" }).join(",");
    const body = rows
      .map((row) => Object.values(row).map((value) => `"${value || ""}"`).join(","))
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tasks.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const statusLabels = {
    todo: "Todo",
    "in progress": "In Progress",
    completed: "Completed",
  };

  const formatDeadline = (deadline, mode = "long") => {
    if (!deadline) return mode === "short" ? "-" : "No deadline";
    const date = new Date(deadline);
    return mode === "short" ? date.toLocaleDateString() : date.toLocaleString();
  };

  const renderTaskDetails = (item) => (
    <div className="task-details">
      {item.description && <p className="task-description">{item.description}</p>}

      <div className="detail-grid">
        <span>Due</span>
        <strong>{formatDeadline(item.deadline)}</strong>
        <span>Project</span>
        <strong>{item.project ? item.project.name : "Personal"}</strong>
        <span>Assigned</span>
        <strong>{item.assignedTo ? item.assignedTo.name : "Not assigned"}</strong>
      </div>

      <div className="label-row">
        {item.labels && item.labels.length ? (
          item.labels.map((label) => (
            <span className="label-chip" key={label}>{label}</span>
          ))
        ) : (
          <span className="muted-text">No labels</span>
        )}
      </div>

      {item.attachments && item.attachments.length > 0 && (
        <div className="mini-list">
          <b>Attachments</b>
          {item.attachments.map((file) => (
            <p key={file}>
              <a href={file} target="_blank" rel="noreferrer">
                {file}
              </a>
            </p>
          ))}
        </div>
      )}

      {item.subtasks && item.subtasks.length > 0 && (
        <div className="mini-list">
          <b>Subtasks</b>
          {item.subtasks.map((subtask) => (
            <label className="check-row" key={subtask._id}>
              <input
                type="checkbox"
                checked={subtask.done}
                onChange={async () => {
                  await toggleSubtask(item._id, subtask._id);
                  fetchTasks();
                }}
              />
              {subtask.title}
            </label>
          ))}
        </div>
      )}

      <form className="comment-form" onSubmit={(e) => handleComment(e, item._id)}>
        <input
          placeholder="Add comment"
          value={comment[item._id] || ""}
          onChange={(e) => setComment({ ...comment, [item._id]: e.target.value })}
        />
        <button type="submit">Comment</button>
      </form>

      {item.comments && item.comments.length > 0 && (
        <div className="mini-list">
          <b>Comments</b>
          {item.comments.map((msg) => (
            <p key={msg._id}>
              {msg.user ? msg.user.name : "User"}: {msg.text}
            </p>
          ))}
        </div>
      )}

      {item.activityLog && item.activityLog.length > 0 && (
        <div className="mini-list">
          <b>Activity</b>
          {item.activityLog.slice(-3).map((activity) => (
            <p key={activity._id}>{activity.message}</p>
          ))}
        </div>
      )}
    </div>
  );

  const renderTable = () => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((item) => (
            <tr key={item._id}>
              <td className="task-cell">
                <div className="task-title-row">
                  <b>{item.title}</b>
                  <span className={`status-badge ${item.status.replace(" ", "-")}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
                {renderTaskDetails(item)}
              </td>
              <td>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                >
                  <option value="todo">Todo</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td>
                <select
                  className={`priority-select ${item.priority}`}
                  value={item.priority}
                  onChange={(e) => handlePriorityUpdate(item._id, e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </td>
              <td>{formatDeadline(item.deadline, "short")}</td>
              <td>
                <button className="delete" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBoard = () => {
    const statuses = ["todo", "in progress", "completed"];

    return (
      <div className="board">
        {statuses.map((status) => (
          <div className="board-column" key={status}>
            <div className="column-header">
              <h3>{statusLabels[status]}</h3>
              <span>{tasks.filter((item) => item.status === status).length}</span>
            </div>
            {tasks
              .filter((item) => item.status === status)
              .map((item) => (
                <div className={`task-card ${item.priority}`} key={item._id}>
                  <div className="task-title-row">
                    <h4>{item.title}</h4>
                    <span className={`priority-pill ${item.priority}`}>{item.priority}</span>
                  </div>
                  {renderTaskDetails(item)}
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="calendar-list">
      {tasks
        .filter((item) => item.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .map((item) => (
          <div className="calendar-row" key={item._id}>
            <b>{formatDeadline(item.deadline, "short")}</b>
            <span>{item.title}</span>
            <span className={`status-badge ${item.status.replace(" ", "-")}`}>
              {statusLabels[item.status] || item.status}
            </span>
            <span className={`priority-pill ${item.priority}`}>{item.priority}</span>
          </div>
        ))}
    </div>
  );

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <div className="container">
        <div className="topbar app-header">
          <div>
            <p className="eyebrow">Team workspace</p>
            <h2>Collaborative Task Manager</h2>
          </div>
          <div className="header-actions">
            <button className="secondary" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><h3>Total</h3><p>{stats.total || 0}</p></div>
          <div className="stat-card"><h3>Todo</h3><p>{stats.todo || 0}</p></div>
          <div className="stat-card"><h3>In Progress</h3><p>{stats.inProgress || 0}</p></div>
          <div className="stat-card"><h3>Completed</h3><p>{stats.completed || 0}</p></div>
          <div className="stat-card urgent"><h3>Overdue</h3><p>{stats.overdue || 0}</p></div>
        </div>

        <div className="workspace-grid">
          <div className="card">
            <div className="section-heading">
              <span>Projects</span>
              <h3>Project Workspace</h3>
            </div>
            <form className="inline-form" onSubmit={handleProjectSubmit}>
              <input
                placeholder="Project name"
                value={project.name}
                onChange={(e) => setProject({ name: e.target.value })}
              />
              <button type="submit">Create Project</button>
            </form>

            <form className="form-grid invite-grid" onSubmit={handleInvite}>
              <select
                value={member.projectId}
                onChange={(e) => setMember({ ...member, projectId: e.target.value })}
              >
                <option value="">Select Project</option>
                {projects.map((item) => (
                  <option value={item._id} key={item._id}>{item.name}</option>
                ))}
              </select>
              <input
                placeholder="Member email"
                value={member.email}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
              />
              <select
                value={member.role}
                onChange={(e) => setMember({ ...member, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button type="submit">Invite</button>
            </form>
          </div>

          <div className="card">
            <div className="section-heading">
              <span>New work</span>
              <h3>Create Task</h3>
            </div>
            <form className="form-grid task-form" onSubmit={handleSubmit}>
              <input name="title" placeholder="Title" value={task.title} onChange={handleChange} />
              <input name="description" placeholder="Description" value={task.description} onChange={handleChange} />
              <input type="datetime-local" name="deadline" value={task.deadline} onChange={handleChange} />
              <select name="status" value={task.status} onChange={handleChange}>
                <option value="todo">Todo</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select name="priority" value={task.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select name="project" value={task.project} onChange={handleChange}>
                <option value="">Personal Task</option>
                {projects.map((item) => (
                  <option value={item._id} key={item._id}>{item.name}</option>
                ))}
              </select>
              <select name="assignedTo" value={task.assignedTo} onChange={handleChange}>
                <option value="">Assign To</option>
                {users.map((item) => (
                  <option value={item._id} key={item._id}>{item.name}</option>
                ))}
              </select>
              <input name="labels" placeholder="Labels comma separated" value={task.labels} onChange={handleChange} />
              <input name="subtasks" placeholder="Subtasks comma separated" value={task.subtasks} onChange={handleChange} />
              <input name="attachments" placeholder="Attachment links comma separated" value={task.attachments} onChange={handleChange} />
              <button className="submit-wide" type="submit">Add Task</button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="section-heading">
            <span>Find tasks</span>
            <h3>Search and Filter</h3>
          </div>
          <div className="filter-grid">
            <input
              placeholder="Search title"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="todo">Todo</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
              <option value="">All Projects</option>
              {projects.map((item) => (
                <option value={item._id} key={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="topbar">
            <div className="section-heading">
              <span>{tasks.length} visible</span>
              <h3>Tasks</h3>
            </div>
            <div className="view-actions">
              <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Table</button>
              <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
              <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>Calendar</button>
              <button className="secondary" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>

          {view === "table" && renderTable()}
          {view === "board" && renderBoard()}
          {view === "calendar" && renderCalendar()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
