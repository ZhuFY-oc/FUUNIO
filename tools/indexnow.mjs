// 用 IndexNow 把 sitemap 里的 URL 推给 Bing / Yandex
import fs from 'node:fs';
const SITE = 'https://fuunio.com';
const KEY = fs.readFileSync(new URL('../indexnow.key', import.meta.url), 'utf8').trim();
const xml = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'fuunio.com', key: KEY, keyLocation: SITE + '/' + KEY + '.txt', urlList: urls })
});
console.log('状态:', res.status, '| URL 数:', urls.length);
