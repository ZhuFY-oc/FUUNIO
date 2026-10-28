# Fuunio (fuunio.com)

纯静态站点：无需构建，直接把整个目录发布到 GitHub Pages 即可。index.html / styles.css / script.js 与 assets/ 需保持在同一目录。

## 目录结构

- `index.html` —— 页面骨架、SEO / 社交分享 meta、全局导航
- `styles.css` —— 全部样式（含响应式与福福桌宠、动作列表菜单）
- `script.js` —— 游戏数据（GAMES_DATA）、三语文案、Supabase 统计、页面交互、福福动作系统
- `assets/games/` —— 86 张游戏封面（自托管，原为 bot.i.l.cd 外链）
- `assets/fufu/` —— 福福形象与动作精灵图：`idle` / `waving` / `spritesheet`（基础）+ `eating` / `outdoor` / `emotion` / `emotion2` / `social` / `daily`（扩展）
- `assets/fonts/` —— 自托管的 Inter / Orbitron 字体（不再依赖 Google Fonts）
- `assets/vendor/fontawesome/` —— Font Awesome 图标子集（仅 12 个图标 + fa-solid 字体）
- `assets/logo.webp`、`favicon.png`、`apple-touch-icon.png` —— 站点图标（本地托管）
- `CNAME` —— 自定义域名 fuunio.com

## 日常维护

- **加游戏**：在 `script.js` 的 `GAMES_DATA` 里加一行（id 不要重复），封面图放到 `assets/games/`，然后 `cover:'assets/games/xxx.webp'`。
- **改文案**：中文/英文/日文分别在 `script.js` 的 `LANG.zh / LANG.en / LANG.ja` 中。
- **发版**：改完把 `index.html` 里 `styles.css?v=`、`script.js?v=` 的版本号改一下，避免访客浏览器缓存旧文件。

## 福福动作系统

- 动作表在 `script.js` 的 `FUFU_ACTIONS`，每格 192×208；一个动作占精灵图的一行，帧数写在 `frames`。
- 左键点击福福随机播放一个动作（按**帧数加权**，帧数越多出现越频繁）；右键 / 长按打开动作列表，可直接指定动作，列表顶部的“随便来一个”也是加权随机。
- 福福可以按住拖到页面任意位置，松开后位置会记在 localStorage（key: fufuPetPosition），刷新后还原。
- 光标移动时福福的头会按 16 方向转向光标（以头部为圆心）；光标停在福福身上时立刻切到待机呼吸动画，离开后恢复跟随。
- 每个动作的菜单名称与专属气泡在 `FUFU_ACTION_META`（`label` / `group` / `line`）。
- 动作播放期间不会被打断（`actionLock`），手动从菜单选择才会强制切换。

**加一个新动作**：

1. 把动作切成 192×208 一格、透明底的精灵图（一行一个动作），放进 `assets/fufu/`；
2. `styles.css` 加 `.fufu-sprite.is-<sheet> { background-image:url(...); background-size:<列数*192>px <行数*208>px; }`；
3. `FUFU_ACTIONS` 加 `{ sheet:'<sheet>', row, frames, duration, frameDelay, loop:false }`；
4. `FUFU_ACTION_META` 补 `{ label, group, line }`；
5. 名字加进 `FUFU_CLICK_ACTIONS`，在 `setFufuSheet()` 里补一行 class 切换，并在 `initFufuInteractions()` 的预载里加一张 `Image`。

## 性能说明

- 游戏封面全部使用 `loading="lazy"`，首屏只加载可见卡片。
- 封面、字体、图标、logo 全部自托管，页面不再依赖图片床 / Google Fonts / cdnjs。
- 图片已压缩：福福三张基础图合计约 790KB（原约 2.2MB）；封面统一压到最长 1200px。
- 六套扩展动作图共约 3.2MB，首屏不加载：`window.load` 后后台预载，点击时才真正用到。
