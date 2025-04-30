// API基础URL
const API_BASE = '/api';

// 获取CSRF Token
export async function getCSRFToken() {
  const res = await fetch(`${API_BASE}/auth/csrf`, {
    credentials: 'include'
  });
  return res.json();
}

// 用户登录
export async function login(username, password, csrf_token) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, csrf_token })
  });
  return res.json();
}

// 用户登出
export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

// 获取当前用户信息
export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include'
  });
  return res.json();
}

export async function getArticles() {
  const res = await fetch(`${API_BASE}/api/articles`);
  return res.json();
} 