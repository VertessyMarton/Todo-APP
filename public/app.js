const authPanel = document.getElementById("authPanel");
const appPanel = document.getElementById("appPanel");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authToggleBtn = document.getElementById("authToggleBtn");
const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const todoList = document.getElementById("todoList");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
const statusMessage = document.getElementById("statusMessage");

const tokenKey = "todo_api_token";
const usernameKey = "todo_api_username";

let authMode = "login";

function readAuth() {
  return {
    token: localStorage.getItem(tokenKey),
    username: localStorage.getItem(usernameKey),
  };
}

function setStatus(message, kind = "ok") {
  statusMessage.textContent = message;
  statusMessage.className = `status ${kind}`;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status";
}

function setAuthMode(mode) {
  authMode = mode;
  if (mode === "login") {
    authSubmitBtn.textContent = "Login";
    authToggleBtn.textContent = "Need an account? Register";
  } else {
    authSubmitBtn.textContent = "Register";
    authToggleBtn.textContent = "Already have an account? Login";
  }
}

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorMessage = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(errorMessage);
  }

  return data;
}

function renderTodos(todos, token) {
  todoList.innerHTML = "";

  if (!todos.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "todo-item";
    emptyItem.textContent = "No tasks yet. Add one above.";
    todoList.appendChild(emptyItem);
    return;
  }

  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(todo.completed);

    const text = document.createElement("span");
    text.textContent = todo.task;
    if (checkbox.checked) {
      text.classList.add("done");
    }

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";

    checkbox.addEventListener("change", async () => {
      try {
        await api(`/todos/${todo.id}`, {
          method: "PUT",
          body: { completed: checkbox.checked },
          token,
        });
        text.classList.toggle("done", checkbox.checked);
      } catch (err) {
        checkbox.checked = !checkbox.checked;
        setStatus(err.message, "error");
      }
    });

    del.addEventListener("click", async () => {
      try {
        await api(`/todos/${todo.id}`, { method: "DELETE", token });
        li.remove();
        if (!todoList.children.length) {
          renderTodos([], token);
        }
      } catch (err) {
        setStatus(err.message, "error");
      }
    });

    li.append(checkbox, text, del);
    todoList.appendChild(li);
  }
}

async function loadTodos(token) {
  const data = await api("/todos", { token });
  renderTodos(data.todos || [], token);
}

function setAuthenticatedView(username) {
  authPanel.classList.add("hidden");
  appPanel.classList.remove("hidden");
  welcomeText.textContent = `${username}'s Todos`;
}

function setLoggedOutView() {
  appPanel.classList.add("hidden");
  authPanel.classList.remove("hidden");
  authForm.reset();
  todoList.innerHTML = "";
}

authToggleBtn.addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "register" : "login");
  clearStatus();
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus();

  const formData = new FormData(authForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    setStatus("Username and password are required.", "error");
    return;
  }

  try {
    if (authMode === "register") {
      await api("/auth/register", {
        method: "POST",
        body: { username, password },
      });
      setStatus("Registration complete. You can now log in.", "ok");
      setAuthMode("login");
      return;
    }

    const data = await api("/auth/login", {
      method: "POST",
      body: { username, password },
    });

    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(usernameKey, username);

    setAuthenticatedView(username);
    await loadTodos(data.token);
    setStatus("Logged in.", "ok");
  } catch (err) {
    setStatus(err.message, "error");
  }
});

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus();

  const token = readAuth().token;
  const task = taskInput.value.trim();

  if (!token) {
    setStatus("Session expired. Please log in again.", "error");
    setLoggedOutView();
    return;
  }

  if (!task) {
    setStatus("Task cannot be empty.", "error");
    return;
  }

  try {
    await api("/todos", {
      method: "POST",
      body: { task },
      token,
    });
    taskInput.value = "";
    await loadTodos(token);
  } catch (err) {
    setStatus(err.message, "error");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(usernameKey);
  setLoggedOutView();
  setStatus("Logged out.", "ok");
});

(async function init() {
  const { token, username } = readAuth();
  setAuthMode("login");

  if (!token || !username) {
    setLoggedOutView();
    return;
  }

  try {
    setAuthenticatedView(username);
    await loadTodos(token);
  } catch {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(usernameKey);
    setLoggedOutView();
    setStatus("Session expired. Please log in.", "error");
  }
})();
