// 统一API请求模块
const API_BASE = 'https://moonlight-blog-api.<你的 workers 子域>.workers.dev'; // TODO: 替换为你的真实Workers子域

export async function getCSRFToken() {
  const res = await fetch(`${API_BASE}/admin/api/auth/csrf`, {
    credentials: 'include'
  });
  return res.json();
}

export async function login(username, password, csrf_token) {
  const res = await fetch(`${API_BASE}/admin/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, csrf_token })
  });
  return res.json();
}

export async function getArticles() {
  const res = await fetch(`${API_BASE}/api/articles`);
  return res.json();
} 