import { Router } from 'itty-router';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';
import { compare } from 'bcryptjs';

// 创建路由器
const router = Router();

// CORS预检请求处理
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = ['https://likems-blog.pages.dev', 'http://localhost:9000'];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}

// 处理预检请求
router.options('*', (request) => new Response(null, { 
  headers: getCorsHeaders(request)
}));

// 生成CSRF Token
router.get('/admin/api/auth/csrf', async (request, env) => {
  const token = crypto.randomUUID();
  
  // 存储CSRF Token到KV，设置5分钟过期
  await env.SESSIONS.put(`csrf:${token}`, 'valid', { expirationTtl: 300 });
  
  return new Response(JSON.stringify({
    success: true,
    token: token
  }), {
    headers: {
      ...getCorsHeaders(request),
      'Content-Type': 'application/json'
    }
  });
});

// 处理登录请求
router.post('/admin/api/auth/login', async (request, env) => {
  try {
    const data = await request.json();
    
    // 验证必要字段
    if (!data.username || !data.password || !data.csrf_token) {
      throw new Error('缺少必要的登录信息');
    }
    
    // 验证CSRF Token
    const isValidCsrf = await env.SESSIONS.get(`csrf:${data.csrf_token}`);
    if (!isValidCsrf) {
      throw new Error('无效的CSRF Token');
    }
    
    // 验证用户名和密码
    if (data.username !== env.ADMIN_USERNAME || 
        !(await compare(data.password, env.ADMIN_PASSWORD_HASH))) {
      throw new Error('用户名或密码错误');
    }
    
    // 生成JWT Token
    const token = await sign({
      sub: env.ADMIN_USERNAME,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时过期
    }, env.JWT_SECRET);
    
    // 删除已使用的CSRF Token
    await env.SESSIONS.delete(`csrf:${data.csrf_token}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: '登录成功',
      token: token
    }), {
      headers: {
        ...getCorsHeaders(request),
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=86400; Domain=.pages.dev`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || '登录失败，请稍后重试'
    }), {
      status: 400,
      headers: {
        ...getCorsHeaders(request),
        'Content-Type': 'application/json'
      }
    });
  }
});

// 获取文章列表
router.get('/api/articles', async (request, env) => {
  // 这里用 mock 数据，后续可接入 D1/KV
  const articles = [
    { id: 1, title: "Moonlight 博客上线啦", content: "欢迎访问！" },
    { id: 2, title: "前后端分离实践", content: "本博客已全面前后端分离，欢迎体验！" }
  ];
  return new Response(JSON.stringify(articles), {
    headers: {
      ...getCorsHeaders(request),
      'Content-Type': 'application/json'
    }
  });
});

// 404处理
router.all('*', (request) => new Response('Not Found', { 
  status: 404,
  headers: getCorsHeaders(request)
}));

// 导出Worker处理函数
export default {
  async fetch(request, env, ctx) {
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: '服务器内部错误'
      }), {
        status: 500,
        headers: {
          ...getCorsHeaders(request),
          'Content-Type': 'application/json'
        }
      });
    }
  }
}; 