baseURL: "https://collaborative-task-manager-0sbd.onrender.com/api"

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
  const data = await res.json();

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
