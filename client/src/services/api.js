const BASE_URL = "https://collaborative-task-manager-0sbd.onrender.com/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getData = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { msg: await res.text() };

  if (!res.ok) {
    throw data;
  }

  return data;
};

export const registerUser = async (user) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(user),
  });
  return getData(res);
};

export const loginUser = async (user) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(user),
  });
  return getData(res);
};

export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: getHeaders(),
  });
  return getData(res);
};

export const getFilteredTasks = async (filters) => {
  const params = new URLSearchParams();

  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });

  const res = await fetch(`${BASE_URL}/tasks?${params.toString()}`, {
    headers: getHeaders(),
  });
  return getData(res);
};

export const getTaskStats = async () => {
  const res = await fetch(`${BASE_URL}/tasks/stats`, {
    headers: getHeaders(),
  });
  return getData(res);
};

export const addTask = async (task) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  return getData(res);
};

export const updateTaskStatus = async (id, task) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  return getData(res);
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return getData(res);
};

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/auth/users`, {
    headers: getHeaders(),
  });
  return getData(res);
};

export const getProjects = async () => {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: getHeaders(),
  });
  return getData(res);
};

export const addProject = async (project) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(project),
  });
  return getData(res);
};

export const inviteMember = async (id, member) => {
  const res = await fetch(`${BASE_URL}/projects/${id}/members`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(member),
  });
  return getData(res);
};

export const addComment = async (id, comment) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}/comments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(comment),
  });
  return getData(res);
};

export const toggleSubtask = async (id, subtaskId) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}/subtasks/${subtaskId}`, {
    method: "PUT",
    headers: getHeaders(),
  });
  return getData(res);
};
