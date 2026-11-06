import fs from 'node:fs';
const p = 'index.html';
let html = fs.readFileSync(p, 'utf8');
if (html.includes('id="seoNoscript"')) { console.log('已存在，跳过'); process.exit(0); }

const noscript = fs.readFileSync('tools/noscript-games.html', 'utf8')
  .replace('<noscript>', '<noscript id="seoNoscript">');

const anchor = '    <footer class="footer">';
if (!html.includes(anchor)) throw new Error('找不到 footer 锚点');
html = html.replace(anchor, noscript + '\n\n' + anchor);

const linkAnchor = '<button class="footer-top" id="footerTopBtn"';
if (!html.includes(linkAnchor)) throw new Error('找不到 footer-top 锚点');
html = html.replace(linkAnchor,
  '<a class="footer-games-link" href="/games/" style="font-size:12.5px;color:#8a8880;text-decoration:none;margin-right:14px;letter-spacing:.04em">全部游戏</a>\n\n            ' + linkAnchor);

fs.writeFileSync(p, html);
console.log('已插入 noscript 与页脚链接，文件行数:', html.split('\n').length);
