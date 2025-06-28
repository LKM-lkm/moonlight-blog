import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 动态 API 路由示例
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/hello') {
        return new Response(JSON.stringify({ msg: "Hello from Worker API!" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response('API Not Found', { status: 404 });
    }

    // 静态资源分发
    return env.ASSETS.fetch(request);
  }
}; 