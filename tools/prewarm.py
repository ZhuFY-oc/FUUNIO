#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fuunio 静态资源预热脚本

把站点用到的静态资源（封面图 / JS / CSS / 字体 / 图标）在 CDN 边缘节点上提前拉一遍，
让第一位真实访客命中缓存，而不是自己去源站（GitHub Pages）慢慢拉。

用法：
    python tools/prewarm.py                    # 预热 https://fuunio.com 全部资源
    python tools/prewarm.py --limit 30         # 只预热前 30 个（试跑）
    python tools/prewarm.py --dry-run          # 只打印清单，不发请求
    python tools/prewarm.py --base https://example.com --concurrency 12

依赖：仅标准库（Python 3.8+）。
"""
import argparse
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

UA = {"User-Agent": "fuunio-prewarm/1.0 (+https://fuunio.com)"}
ASSET_RE = re.compile(r"assets/[\w./\-]+\.(?:webp|png|jpg|jpeg|svg|woff2|css|js)", re.I)
TAG_RE = re.compile(r'(?:src|href)="([^"]+?\.(?:js|css|webp|png|woff2|svg)(?:\?[^"]*)?)"', re.I)


def get(url, timeout=45):
    req = Request(url, headers=UA)
    with urlopen(req, timeout=timeout) as r:
        return r.read(), dict(r.headers)


def collect(base):
    """返回 (资源 URL 列表, JS 里发现的资源数)"""
    urls, seen = [], set()

    def add(u):
        u = urljoin(base, u)
        if u not in seen:
            seen.add(u)
            urls.append(u)

    html, _ = get(urljoin(base, "index.html"))
    html = html.decode("utf-8", "ignore")

    # 1) HTML 里直接引用的（带版本号查询串，缓存键必须一致）
    for m in TAG_RE.finditer(html):
        add(m.group(1))

    # 2) script.js 里引用的素材（封面、图标、字体等）
    js_url = next((u for u in urls if u.split("?")[0].endswith("script.js")), None)
    js_hits = 0
    if js_url:
        try:
            js, _ = get(js_url)
            for m in ASSET_RE.finditer(js.decode("utf-8", "ignore")):
                add(m.group(0))
                js_hits += 1
        except (HTTPError, URLError) as e:
            print("  ! script.js 读取失败: %s" % e, file=sys.stderr)

    return urls, js_hits


def warm(url, index, total):
    started = time.time()
    try:
        _, headers = get(url)
        status = (headers.get("cf-cache-status") or headers.get("x-proxy-cache") or "?").upper()
        return url, status, time.time() - started, None
    except (HTTPError, URLError, OSError) as e:
        return url, "ERROR", time.time() - started, str(e)[:80]


def main():
    ap = argparse.ArgumentParser(description="Fuunio 静态资源预热")
    ap.add_argument("--base", default="https://fuunio.com", help="站点根地址")
    ap.add_argument("--limit", type=int, default=0, help="只处理前 N 个资源（0 表示全部）")
    ap.add_argument("--concurrency", type=int, default=8, help="并发数，默认 8")
    ap.add_argument("--dry-run", action="store_true", help="只打印清单，不发请求")
    args = ap.parse_args()
    base = args.base.rstrip("/") + "/"

    print("站点: %s" % base)
    urls, js_hits = collect(base)
    if args.limit:
        urls = urls[:args.limit]
    print("资源数: %d（其中 %d 个来自 script.js 引用）" % (len(urls), js_hits))

    if args.dry_run:
        for u in urls:
            print(" ", u)
        return 0

    started = time.time()
    counts = {}
    errors = []
    done = 0
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futures = [pool.submit(warm, u, i, len(urls)) for i, u in enumerate(urls)]
        for fut in as_completed(futures):
            url, status, cost, err = fut.result()
            done += 1
            counts[status] = counts.get(status, 0) + 1
            if err:
                errors.append((url, err))
            if done % 25 == 0 or done == len(urls):
                print("  进度 %d/%d" % (done, len(urls)), flush=True)

    elapsed = time.time() - started
    print("")
    print("完成：%d 个资源，耗时 %.1f 秒" % (len(urls), elapsed))
    for k in sorted(counts, key=lambda x: -counts[x]):
        print("  %-12s %d" % (k, counts[k]))
    if errors:
        print("失败 %d 个，前 5 条：" % len(errors))
        for u, e in errors[:5]:
            print("  - %s  %s" % (u, e))
    return 0


if __name__ == "__main__":
    sys.exit(main())
