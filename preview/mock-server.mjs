/**
 * ⚠️ 仅供前端预览使用的 Mock 服务（端口 8080）
 * 真实后端请使用 backend/ 目录下的 Spring Boot 4 工程（同样监听 8080）。
 * 用法：node preview/mock-server.mjs
 *
 * 接口与 Java 后端完全一致：
 *   GET  /api/health
 *   GET  /api/categories
 *   GET  /api/destinations?category=&keyword=&page=&size=
 *   GET  /api/destinations/featured
 *   GET  /api/destinations/:id
 *   POST /api/chat/stream   (SSE 流式输出)
 */
import http from 'node:http';
import { DESTINATIONS } from './data.mjs';

const PORT = 8080;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function toSummary(d) {
  const { description, highlights, foods, bestSeason, avgCost, ...rest } = d;
  return rest;
}

/** 根据关键词生成不同的模拟回复（Java 后端无 KEY 时同样逻辑） */
function buildMockReply(message) {
  const m = message || '';
  if (/成都|重庆|川渝|火锅/.test(m)) {
    return '🌶️ 川渝之行小粉给你安排～\n\n【成都 3 日美食路线】\nDay1：宽窄巷子 → 人民公园鹤鸣茶社 → 锦里夜色\nDay2：大熊猫基地（8:30 开园就冲！）→ 太古里 → 火锅晚宴\nDay3：都江堰半日游 → 返程前撸一顿串串\n\n💰 人均预算约 1500 元（不含大交通）\n🐼 小贴士：熊猫基地一定赶早，看到滚滚吃早餐的概率最高！';
  }
  if (/大理|云南|洱海|丽江/.test(m)) {
    return '🌅 大理是治愈系天花板！\n\n【大理 3 日慢生活】\nDay1：大理古城闲逛 → 人民路民谣酒吧\nDay2：租小电驴环洱海（S 湾看日出 → 喜洲稻田 → 双廊发呆）\nDay3：苍山索道 → 寂照庵吃素斋 → 带一扎染手作回家\n\n💰 人均约 1200 元｜🛵 环海电驴一天 60 元左右\n📷 洱海拍照记得穿浅色长裙，出片率翻倍！';
  }
  if (/西安|兵马俑|长安/.test(m)) {
    return '🏯 长安十二时辰安排上！\n\n【西安 3 日穿越之旅】\nDay1：陕西历史博物馆 → 大雁塔 → 大唐不夜城夜游\nDay2：兵马俑（半天）→ 华清池 → 回民街夜市\nDay3：明城墙骑行（傍晚最美）→ 洒金桥小吃街扫街\n\n💰 人均约 1400 元\n🎫 兵马俑和博物馆都要提前 3-7 天在官方公众号预约！';
  }
  if (/三亚|海岛|海边|潜水/.test(m)) {
    return '🏝️ 三亚度假模式启动！\n\n【三亚 4 日躺平计划】\nDay1：亚龙湾沙滩 + 日落\nDay2：蜈支洲岛一日游（潜水 + 环岛电瓶车）\nDay3：后海村学冲浪 → 椰梦长廊骑行\nDay4：第一市场海鲜加工 → 返程\n\n💰 人均约 2500 元（淡季）\n🤿 蜈支洲岛潜水建议提前一天线上购票，便宜 20% 左右';
  }
  return '收到！小粉帮你参谋参谋 😊\n\n最近这几个地方人气很高：\n🐼 成都 — 美食 + 熊猫，慢生活首选\n🌅 大理 — 苍山洱海，治愈系风光\n🏯 西安 — 千年古都，历史迷天堂\n🏝️ 三亚 — 阳光沙滩，度假放松\n🐫 敦煌 — 大漠孤烟，丝路艺术\n\n告诉我你的出发城市、天数和预算，小粉帮你定制详细行程哦～';
}

async function handleChatStream(req, res) {
  let body = '';
  for await (const chunk of req) body += chunk;
  let message = '';
  try {
    const parsed = JSON.parse(body || '{}');
    message = parsed.message || '';
  } catch {
    /* 忽略非法 JSON */
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const reply = buildMockReply(message);
  // 按小块流式输出，模拟打字机效果
  for (let i = 0; i < reply.length; i += 3) {
    send({ type: 'delta', content: reply.slice(i, i + 3) });
    await sleep(35);
  }
  send({ type: 'done' });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ---- 健康检查 ----
  if (req.method === 'GET' && path === '/api/health') {
    return json(res, 200, { ok: true, mode: 'mock', app: 'pink-travel' });
  }

  // ---- 分类 ----
  if (req.method === 'GET' && path === '/api/categories') {
    return json(res, 200, [...new Set(DESTINATIONS.map((d) => d.category))]);
  }

  // ---- 精选 ----
  if (req.method === 'GET' && path === '/api/destinations/featured') {
    return json(res, 200, DESTINATIONS.filter((d) => d.featured).map(toSummary));
  }

  // ---- 列表 ----
  if (req.method === 'GET' && path === '/api/destinations') {
    const category = url.searchParams.get('category') || '';
    const keyword = (url.searchParams.get('keyword') || '').trim();
    const page = Math.max(0, Number(url.searchParams.get('page') || 0));
    const size = Math.max(1, Number(url.searchParams.get('size') || 10));

    let list = DESTINATIONS;
    if (category) list = list.filter((d) => d.category === category);
    if (keyword) {
      list = list.filter((d) =>
        [d.name, d.city, d.province, d.summary, ...d.tags].some((s) => s.includes(keyword)),
      );
    }
    const total = list.length;
    const pageList = list.slice(page * size, page * size + size).map(toSummary);
    return json(res, 200, { list: pageList, total });
  }

  // ---- 详情 ----
  const detailMatch = path.match(/^\/api\/destinations\/(\d+)$/);
  if (req.method === 'GET' && detailMatch) {
    const d = DESTINATIONS.find((x) => x.id === Number(detailMatch[1]));
    if (!d) return json(res, 404, { error: '目的地不存在' });
    return json(res, 200, d);
  }

  // ---- AI 流式对话 ----
  if (req.method === 'POST' && path === '/api/chat/stream') {
    return handleChatStream(req, res);
  }

  json(res, 404, { error: `Not Found: ${req.method} ${path}` });
});

server.listen(PORT, () => {
  console.log(`[mock] 粉色旅记 Mock 服务已启动: http://localhost:${PORT}`);
  console.log('[mock] 与 Java 后端接口完全一致，仅供前端预览使用');
});
