import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * 处理所有站点请求的主函数
 */
async function handleRequest(event) {
  const request = event.request
  const url = new URL(request.url)

  try {
    // 静态资源处理
    let options = {}
    
    // 检查路径是否为API请求
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request)
    }
    
    // 检查页面访问，如果路径没有具体文件名，则默认提供index.html
    if (url.pathname.endsWith('/')) {
      options.mapRequestToAsset = req => {
        const url = new URL(req.url)
        url.pathname = url.pathname.concat('index.html')
        return mapRequestToAsset(new Request(url.toString(), req))
      }
    }
    
    // 从KV存储获取资源
    const page = await getAssetFromKV(event, options)
    
    // 允许资源缓存1天
    const response = new Response(page.body, page)
    response.headers.set('Cache-Control', 'public, max-age=86400')
    return response
  } catch (e) {
    // 如果资源不存在，返回404页面
    return new Response(`资源未找到: ${url.pathname}`, {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      }
    })
  }
}

/**
 * 处理API请求的函数
 */
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const method = request.method
  
  // 登录API
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    return handleLogin(request)
  }
  
  // 用户信息API
  if (url.pathname === '/api/auth/me' && method === 'GET') {
    return handleGetCurrentUser(request)
  }
  
  // 统计API
  if (url.pathname === '/api/stats/overall' && method === 'GET') {
    return handleGetOverallStats(request)
  }
  
  if (url.pathname === '/api/stats/trends' && method === 'GET') {
    return handleGetTrends(request)
  }
  
  if (url.pathname === '/api/stats/popular' && method === 'GET') {
    return handleGetPopularArticles(request)
  }
  
  if (url.pathname === '/api/stats/categories' && method === 'GET') {
    return handleGetCategoryStats(request)
  }
  
  if (url.pathname === '/api/stats/tags' && method === 'GET') {
    return handleGetTagStats(request)
  }
  
  // 文章API
  if (url.pathname === '/api/articles' && method === 'GET') {
    return handleGetArticles(request)
  }
  
  if (url.pathname.match(/^\/api\/articles\/\d+$/) && method === 'GET') {
    const id = url.pathname.split('/').pop()
    return handleGetArticle(request, id)
  }
  
  // 聊天机器人API - 机械式问答形式
  if (url.pathname === '/api/chatbot/query' && method === 'POST') {
    return handleChatbotQuery(request)
  }
  
  // 默认API响应
  return new Response(JSON.stringify({
    status: 'error',
    message: 'API路径不存在'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 处理登录请求
 */
async function handleLogin(request) {
  // 在实际应用中应该验证用户凭据
  // 这里我们使用硬编码的用户名和密码
  try {
    const data = await request.json()
    
    // 仅接受Likem/lkm123的组合
    if (data.email === 'Likem' && data.password === 'lkm123') {
      return new Response(JSON.stringify({
        status: 'success',
        data: {
          token: 'mock-token-12345',
          user: {
            id: '1',
            username: 'Likem',
            email: 'admin@example.com',
            role: 'admin'
          }
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({
        status: 'error',
        message: '用户名或密码错误'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: '请求处理失败'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * 获取当前用户信息
 */
async function handleGetCurrentUser(request) {
  // 在实际应用中应该验证token
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      user: {
        id: '1',
        username: 'Likem',
        email: 'admin@example.com',
        role: 'admin',
        avatar: '/assets/img/avatar.jpg',
        bio: '初三学生，热爱技术和创新，专注于人工智能、云计算和大数据领域的研究与应用。'
      }
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取总体统计数据
 */
async function handleGetOverallStats(request) {
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      totalArticles: 24,
      totalViews: 12500,
      totalComments: 348,
      totalLikes: 892
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取趋势数据
 */
async function handleGetTrends(request) {
  const url = new URL(request.url)
  const period = url.searchParams.get('period') || 'month'
  
  let trends = []
  
  if (period === 'week') {
    trends = [
      { date: '2025-04-06', views: 320, comments: 12, likes: 45 },
      { date: '2025-04-07', views: 450, comments: 18, likes: 56 },
      { date: '2025-04-08', views: 280, comments: 9, likes: 32 },
      { date: '2025-04-09', views: 390, comments: 14, likes: 48 },
      { date: '2025-04-10', views: 520, comments: 22, likes: 67 },
      { date: '2025-04-11', views: 610, comments: 28, likes: 75 },
      { date: '2025-04-12', views: 480, comments: 20, likes: 60 }
    ]
  } else if (period === 'month') {
    // 生成30天的数据
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dateStr = date.toISOString().split('T')[0]
      
      trends.push({
        date: dateStr,
        views: Math.floor(Math.random() * 600) + 200,
        comments: Math.floor(Math.random() * 30) + 5,
        likes: Math.floor(Math.random() * 80) + 20
      })
    }
  } else if (period === 'year') {
    // 生成12个月的数据
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      const dateStr = date.toISOString().substring(0, 7) // YYYY-MM
      
      trends.push({
        date: dateStr,
        views: Math.floor(Math.random() * 15000) + 5000,
        comments: Math.floor(Math.random() * 400) + 100,
        likes: Math.floor(Math.random() * 600) + 200
      })
    }
  }
  
  return new Response(JSON.stringify({
    status: 'success',
    data: trends
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取热门文章
 */
async function handleGetPopularArticles(request) {
  return new Response(JSON.stringify({
    status: 'success',
    data: [
      { id: 1, title: '如何提高编程效率', views: 823, comments: 45, likes: 112 },
      { id: 2, title: '现代Web开发技术概览', views: 756, comments: 38, likes: 98 },
      { id: 3, title: '人工智能在日常生活中的应用', views: 645, comments: 29, likes: 87 },
      { id: 4, title: '学习新语言的有效方法', views: 578, comments: 24, likes: 76 },
      { id: 5, title: '如何保持工作与生活的平衡', views: 512, comments: 18, likes: 65 },
      { id: 6, title: '未来科技的发展趋势', views: 487, comments: 15, likes: 59 },
      { id: 7, title: '程序员必备的10个工具', views: 432, comments: 21, likes: 53 },
      { id: 8, title: '数据可视化的重要性', views: 398, comments: 17, likes: 48 },
      { id: 9, title: '如何提高团队协作效率', views: 365, comments: 14, likes: 42 },
      { id: 10, title: '学习编程的最佳路径', views: 321, comments: 12, likes: 38 }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取分类统计
 */
async function handleGetCategoryStats(request) {
  return new Response(JSON.stringify({
    status: 'success',
    data: [
      { name: '技术', count: 12 },
      { name: '生活', count: 8 },
      { name: '学习', count: 6 },
      { name: '工作', count: 5 },
      { name: '其他', count: 3 }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取标签统计
 */
async function handleGetTagStats(request) {
  return new Response(JSON.stringify({
    status: 'success',
    data: [
      { name: 'JavaScript', count: 9 },
      { name: 'Python', count: 7 },
      { name: 'Web开发', count: 6 },
      { name: '数据科学', count: 5 },
      { name: '人工智能', count: 4 },
      { name: '前端', count: 4 },
      { name: '后端', count: 3 },
      { name: '云计算', count: 3 },
      { name: '移动开发', count: 2 },
      { name: '区块链', count: 2 },
      { name: '机器学习', count: 4 },
      { name: '深度学习', count: 3 },
      { name: '自然语言处理', count: 2 },
      { name: '算法', count: 5 },
      { name: '数据库', count: 3 }
    ]
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取文章列表
 */
async function handleGetArticles(request) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  
  const articles = []
  const totalArticles = 24
  
  // 模拟分页
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalArticles)
  
  for (let i = startIndex; i < endIndex; i++) {
    articles.push({
      id: i + 1,
      title: `文章标题 ${i + 1}`,
      summary: `这是文章 ${i + 1} 的摘要，描述了文章的主要内容...`,
      author: 'Likem',
      date: new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0],
      category: i % 5 === 0 ? '技术' : 
               i % 5 === 1 ? '生活' : 
               i % 5 === 2 ? '学习' : 
               i % 5 === 3 ? '工作' : '其他',
      tags: ['标签1', '标签2', '标签3'].slice(0, (i % 3) + 1),
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 50) + 5,
      status: i % 3 === 0 ? '草稿' : '已发布'
    })
  }
  
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      articles,
      pagination: {
        page,
        pageSize,
        total: totalArticles,
        totalPages: Math.ceil(totalArticles / pageSize)
      }
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 获取文章详情
 */
async function handleGetArticle(request, id) {
  return new Response(JSON.stringify({
    status: 'success',
    data: {
      id: parseInt(id),
      title: `文章标题 ${id}`,
      content: `<p>这是文章 ${id} 的详细内容。</p><p>这里是第二段。</p><p>这里是第三段...</p>`,
      author: 'Likem',
      date: new Date(Date.now() - (parseInt(id) * 86400000)).toISOString().split('T')[0],
      category: parseInt(id) % 5 === 0 ? '技术' : 
                parseInt(id) % 5 === 1 ? '生活' : 
                parseInt(id) % 5 === 2 ? '学习' : 
                parseInt(id) % 5 === 3 ? '工作' : '其他',
      tags: ['标签1', '标签2', '标签3'].slice(0, (parseInt(id) % 3) + 1),
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 50) + 5,
      status: parseInt(id) % 3 === 0 ? '草稿' : '已发布'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * 处理聊天机器人查询 - 机械式问答
 */
async function handleChatbotQuery(request) {
  try {
    const data = await request.json()
    const query = (data.query || '').toLowerCase().trim()
    
    // 预设问答对
    const qaPairs = [
      {
        keywords: ['你好', '嗨', 'hello', 'hi'],
        response: '你好！我是Moonlight博客的聊天机器人助手。有什么我可以帮助你的吗？'
      },
      {
        keywords: ['你是谁', '你叫什么', '你的名字'],
        response: '我是Moonlight博客的聊天机器人助手，我的名字是Moonlight助手。'
      },
      {
        keywords: ['博客', '网站', '关于'],
        response: '这是一个由名创建的个人博客网站，主要分享技术、生活和学习方面的内容。'
      },
      {
        keywords: ['联系', '邮箱', '邮件', '联络'],
        response: '你可以通过邮箱 moonlight@example.com 联系博客的主人。'
      },
      {
        keywords: ['技术', '编程', '开发'],
        response: '这个博客涵盖了多种技术主题，包括Web开发、人工智能、数据科学等。你可以在文章分类中找到更多相关内容。'
      },
      {
        keywords: ['人工智能', 'ai', '机器学习'],
        response: '博客中有多篇关于人工智能和机器学习的文章，覆盖了基础知识和实际应用。'
      },
      {
        keywords: ['python', 'javascript', 'java', '编程语言'],
        response: '博客中包含多种编程语言的教程和项目分享，主要有JavaScript、Python和Java相关内容。'
      },
      {
        keywords: ['更新', '频率', '多久'],
        response: '博客通常每周更新1-2篇文章，主要在周末发布。'
      },
      {
        keywords: ['订阅', '关注'],
        response: '你可以通过主页底部的邮件订阅功能，获取博客的最新更新。'
      },
      {
        keywords: ['作者', '博主', '名'],
        response: '博客的作者是名，一名初三学生，热爱技术和创新，专注于人工智能、云计算和大数据领域的研究与应用。'
      },
      {
        keywords: ['谢谢', '感谢', 'thanks'],
        response: '不客气！如果还有其他问题，随时可以问我。'
      }
    ]
    
    // 尝试匹配问题
    for (const qa of qaPairs) {
      if (qa.keywords.some(keyword => query.includes(keyword))) {
        return new Response(JSON.stringify({
          status: 'success',
          data: {
            response: qa.response,
            timestamp: new Date().toISOString()
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    // 默认回复
    return new Response(JSON.stringify({
      status: 'success',
      data: {
        response: '抱歉，我不太理解你的问题。你可以尝试询问关于博客、文章或者作者的相关信息。',
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: '请求处理失败'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 为所有请求注册事件监听器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
}) 