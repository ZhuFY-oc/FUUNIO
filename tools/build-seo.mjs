import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://fuunio.com';
const TODAY = new Date().toISOString().slice(0, 10);
const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');

function extractArray(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error('未找到 ' + marker);
  const from = text.indexOf('[', start);
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']' && --depth === 0) return text.slice(from, i + 1);
  }
  throw new Error('数组括号不匹配');
}

const games = new Function('return ' + extractArray(src, 'const GAMES_DATA'))();
if (!Array.isArray(games) || games.length < 10) throw new Error('GAMES_DATA 解析失败');

// 简介：抓取脚本里形如  "游戏名": "描述",  的键值行，按游戏名匹配
const descMap = Object.create(null);
for (const line of src.split('\n')) {
  const m = line.match(/^\s*"([^"]{1,48})":\s*"([^"\\]{6,300})",?\s*$/);
  if (m && !descMap[m[1]]) descMap[m[1]] = m[2];
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CAT = { io: 'io 对战', casual: '休闲', action: '动作', shooting: '射击', survival: '生存', strategy: '策略', puzzle: '益智', racing: '竞速' };

const head = (title, desc, url, cover, jsonld) => `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="FUUNIO">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${cover}">
<meta property="og:url" content="${url}">
<link rel="icon" href="/assets/favicon.png">
<script type="application/ld+json">${jsonld}</script>
<style>
:root{--ink:#1c1c1a;--muted:#6d6b64;--line:#e6e4dc;--bg:#faf9f6}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,"Microsoft YaHei",sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
.wrap{max-width:760px;margin:0 auto;padding:36px 22px 72px}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:22px}
.brand{font-weight:800;letter-spacing:.14em;font-size:14px;text-decoration:none;color:var(--ink)}
a.back{font-size:13px;color:var(--muted);text-decoration:none}
a.back:hover{color:var(--ink)}
h1{font-size:30px;line-height:1.25;margin:0 0 8px;letter-spacing:-.01em}
.meta{font-size:13px;color:var(--muted);margin-bottom:18px}
.cover{width:100%;max-height:340px;object-fit:cover;border-radius:14px;border:1px solid var(--line);display:block;margin:0 0 20px}
.btn{display:inline-block;background:var(--ink);color:#fff;padding:13px 30px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px}
.btn:hover{opacity:.86}
.desc{font-size:16px;line-height:1.95;color:#33322e;margin:22px 0 6px}
.tags{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 0}
.tag{font-size:12.5px;background:#efece5;color:#4a4842;padding:5px 12px;border-radius:999px}
h2{font-size:17px;margin:36px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.rel{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.rel a{font-size:13.5px;color:#33322e;background:#fff;border:1px solid var(--line);border-radius:10px;padding:11px 12px;text-decoration:none;text-align:center}
.rel a:hover{border-color:#c9c6bd}
.note{font-size:12.5px;color:var(--muted);line-height:1.9;margin-top:44px;border-top:1px solid var(--line);padding-top:14px}
</style></head><body><div class="wrap">
<div class="top"><a class="brand" href="/">FUUNIO</a><a class="back" href="/games/">← 全部游戏</a></div>
`;

const foot = `<div class="note">本站为网页游戏导航平台，不存储、不托管任何游戏文件。游戏版权归各原作者所有，如有异议请邮件联系 fuunio@qq.com，我们将及时处理。<br><a href="/" style="color:inherit">返回 FUUNIO 首页</a> · <a href="/games/" style="color:inherit">全部游戏</a></div>
</div></body></html>`;

const urls = [];
for (const g of games) {
  const name = g.name || ('游戏 ' + g.id);
  const cat = CAT[g.category] || '';
  const tags = (g.tags || []).filter(Boolean);
  const desc = descMap[name] ||
    `《${name}》是一款${tags.join('、') || cat}类网页游戏，无需下载安装，打开浏览器即可直接游玩。`;
  const url = `${SITE}/games/${g.id}/`;
  const cover = `${SITE}/${String(g.cover || '').replace(/^\//, '')}`;
  const title = `${name} - 在线玩，免登录 | FUUNIO`;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name,
    url,
    image: cover,
    genre: tags.join(', ') || cat,
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' }
  });

  const rel = games.filter(x => x.category === g.category && x.id !== g.id).slice(0, 6);

  const html = head(title, desc.slice(0, 150), url, cover, jsonld) +
    `<h1>${esc(name)}</h1>
<div class="meta">${esc(cat)}游戏 · 免登录 · 即点即玩</div>
<img class="cover" src="/${String(g.cover || '').replace(/^\//, '')}" alt="${esc(name)} 封面" loading="lazy">
<a class="btn" href="${esc(g.url)}" target="_blank" rel="noopener nofollow">立即开玩 →</a>
<p class="desc">${esc(desc)}</p>
<div class="tags">${tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('')}</div>
${rel.length ? '<h2>同类游戏</h2><div class="rel">' + rel.map(x => '<a href="/games/' + x.id + '/">' + esc(x.name) + '</a>').join('') + '</div>' : ''}
` + foot;

  const dir = path.join(ROOT, 'games', String(g.id));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  urls.push(url);
}

// 列表页
fs.mkdirSync(path.join(ROOT, 'games'), { recursive: true });
const listHtml = `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>全部游戏（${games.length} 款）- FUUNIO</title>
<meta name="description" content="FUUNIO 收录的全部网页游戏，共 ${games.length} 款，免登录、免下载，打开浏览器即可游玩。">
<link rel="canonical" href="${SITE}/games/">
<meta property="og:title" content="全部游戏 - FUUNIO"><meta property="og:url" content="${SITE}/games/">
<style>body{margin:0;font-family:system-ui,"Microsoft YaHei",sans-serif;background:#faf9f6;color:#1c1c1a}
.wrap{max-width:860px;margin:0 auto;padding:36px 22px 80px}
h1{font-size:26px;margin:0 0 6px}.sub{color:#6d6b64;font-size:14px;margin:0 0 24px}
ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
li a{display:block;background:#fff;border:1px solid #e6e4dc;border-radius:10px;padding:12px;text-decoration:none;color:#1c1c1a;font-size:14px}
li span{display:block;font-size:12px;color:#8a8880;margin-top:4px}
.back{font-size:13px;color:#6d6b64;text-decoration:none}</style></head><body><div class="wrap">
<h1>全部游戏</h1><p class="sub">共 ${games.length} 款，按分类整理，免登录即点即玩。</p>
<ul>${games.map(g => '<li><a href="/games/' + g.id + '/">' + esc(g.name) + '<span>' + esc(CAT[g.category] || '') + ' · ' + esc((g.tags || []).join('、')) + '</span></a></li>').join('')}</ul>
<p style="margin-top:28px"><a class="back" href="/">← 返回 FUUNIO 首页</a></p>
</div></body></html>`;
fs.writeFileSync(path.join(ROOT, 'games', 'index.html'), listHtml);

// sitemap
const all = [SITE + '/', SITE + '/games/', ...urls];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  all.map((u, i) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>${i === 0 ? '1.0' : i === 1 ? '0.9' : '0.8'}</priority></url>`).join('\n') +
  '\n</urlset>\n');

// robots
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n');

// noscript 片段（供 index.html 引用）
const noscript = '<noscript>\n  <div style="max-width:960px;margin:40px auto;padding:0 20px;font-family:system-ui,sans-serif">\n    <h2>全部游戏（' + games.length + ' 款）</h2>\n    <ul>' +
  games.map(g => '<li><a href="/games/' + g.id + '/">' + esc(g.name) + '</a></li>').join('') +
  '</ul>\n    <p><a href="/games/">查看完整游戏目录</a></p>\n  </div>\n</noscript>';
fs.writeFileSync(path.join(ROOT, 'tools', 'noscript-games.html'), noscript);

console.log('游戏数: ' + games.length + ' | 详情页: ' + urls.length + ' | sitemap URL: ' + all.length + ' | 有简介: ' + Object.keys(descMap).length);
