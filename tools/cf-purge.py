# -*- coding: utf-8 -*-
"""部署后清理 Cloudflare 缓存并预热。

用法：
  python tools/cf-purge.py                 # 清 script.js / styles.css 并预热
  python tools/cf-purge.py <url> [...]     # 清指定 URL 并预热
  python tools/cf-purge.py --all           # 全量清除（不预热）
"""
import json, os, sys, time, urllib.request, urllib.error

CONF = os.path.join(os.path.expanduser('~'), '.cf-fuunio-purge.json')
DEFAULT = ['https://fuunio.com/script.js', 'https://fuunio.com/styles.css']


def load():
    with open(CONF, encoding='utf-8') as f:
        return json.load(f)


def purge(urls=None):
    c = load()
    body = {'files': urls} if urls else {'purge_everything': True}
    url = 'https://api.cloudflare.com/client/v4/zones/%s/purge_cache' % c['zone_id']
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='POST')
    req.add_header('Authorization', 'Bearer ' + c['token'])
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {'http_error': e.code, 'body': e.read().decode()[:400]}


def warm(urls):
    """清完后立刻自己请求一次，把缓存重新填满，避免第一个访客遇到冷启动。"""
    for u in urls:
        t0 = time.time()
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'fuunio-warm/1.0'})
            with urllib.request.urlopen(req, timeout=90) as r:
                r.read()
            print('  warm %s -> %s %.2fs' % (u, r.status, time.time() - t0))
        except Exception as e:
            print('  warm %s -> 失败 %s' % (u, e))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a]
    if '--all' in args:
        res = purge(None)
        print(json.dumps(res, ensure_ascii=False)[:200])
        sys.exit(0 if res.get('success') else 1)
    targets = args or DEFAULT
    res = purge(targets)
    print('purge:', 'ok' if res.get('success') else json.dumps(res, ensure_ascii=False)[:300])
    if res.get('success'):
        warm(targets)
    sys.exit(0 if res.get('success') else 1)
