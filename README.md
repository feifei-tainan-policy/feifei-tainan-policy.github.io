# 妃妃市長 6 大政策｜接棒台南

這是目前「妃妃市長 6 大政策」ChatGPT Site 的獨立版專案，保留正式版的文字、圖片、人物首頁影片、6 大政策切換、政策說明、影片播放器、全螢幕展示、桌機版與手機版版型。

專案不使用 ChatGPT Sites 專屬登入、Server Runtime、資料庫、API 或路由功能，可以直接在一般電腦執行，也可以部署到 GitHub Pages、Cloudflare Pages、Netlify、Vercel 或任何靜態網站空間。

- 正式網址：<https://feifei-tainan-policy.com/>（自訂網域，由 `public/CNAME` 指定）
- GitHub Pages 預設網址：<https://feifei-tainan-policy.github.io/>（會自動轉址到正式網址）
- GitHub Repository：<https://github.com/feifei-tainan-policy/feifei-tainan-policy.github.io>
- 早期 ChatGPT Site 參考版本（已非最新）：<https://feifei-tainan-policy-gallery.thewillie-35.chatgpt.site>

## 技術規格

- Vite 8
- React 19
- TypeScript 5
- Tailwind CSS 4
- 響應式桌機、平板、手機版
- 純靜態輸出
- GitHub Actions 自動部署 GitHub Pages

## 快速開始

需求：

- Node.js 22.13 以上，建議 Node.js 24
- npm

安裝：

```bash
npm ci
```

本機開發：

```bash
npm run dev
```

完整檢查：

```bash
npm run check
```

正式建置：

```bash
npm run build
```

預覽正式輸出：

```bash
npm run preview
```

建置結果位於 `dist/`。

## 專案結構

```text
.
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── public/
│   ├── assets/
│   │   ├── feifei-brand.jpg
│   │   ├── feifei-hero.mp4
│   │   └── feifei-ip-board.png
│   ├── posters/
│   ├── videos/
│   ├── .nojekyll
│   └── favicon.svg
├── scripts/
│   └── verify-build.mjs
├── src/
│   ├── data/
│   │   ├── policies.ts
│   │   └── site.ts
│   ├── lib/
│   │   └── assets.ts
│   ├── types/
│   │   └── policy.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 修改 6 大政策

政策文字、顏色、影片與海報路徑全部集中在：

```text
src/data/policies.ts
```

每筆政策包含：

- `id`
- `number`
- `shortTitle`
- `title`
- `english`
- `summary`
- `points`
- `accent`
- `tint`
- `youtubeId`（選填，設定後優先於 `videoPath`）
- `videoPath`
- `posterPath`

播放來源的優先順序是 `youtubeId` → `videoPath` → 佔位版型。設定 `youtubeId`
時會先顯示 `posterPath` 的封面與播放鍵，使用者點擊後才載入 YouTube 播放器，
避免未播放就載入第三方程式碼與 cookie。兩者皆未設定的政策會顯示 16:9 的
「COMING SOON」版型。

目前已上線影片（皆由 YouTube 播放）：

- 01 科技
- 02 農漁
- 03 觀光
- 04 福利
- 05 交通

目前保留預告版：

- 06 姐姐

文化與美食已於 2026-10-06 自規劃中移除，不再列為政策項目。

## 替換首頁圖片與影片

首頁、Logo 與其他共用素材路徑集中在：

```text
src/data/site.ts
```

可替換設定：

- `brandImage`
- `heroVideo`
- `heroPoster`
- `ipBoardImage`
- `legacySisterPoster`
- `favicon`

素材放在 `public/` 後，設定值請使用相對於 `public/` 的路徑，不要加開頭斜線。

正確：

```ts
videoPath: "videos/technology.mp4"
```

不建議：

```ts
videoPath: "/videos/technology.mp4"
```

`src/lib/assets.ts` 會自動加上 GitHub Pages 的 Repository 子目錄，也支援直接填入外部 HTTPS 圖片或影片網址。

## 影片建議規格

- MP4
- H.264 視訊
- AAC 音訊
- 16:9
- 1280×720 或 1920×1080
- 建議加入 Fast Start
- 單檔請保持在 GitHub 的 100 MB 上傳限制以下

目前完整媒體約 79 MB，單一最大影片約 31 MB，可以直接放在 GitHub Repository 與 GitHub Pages。

4K 母檔請上傳到 YouTube，不要放進 Repository：單檔超過 100 MB 會被 GitHub 拒絕，
且 GitHub Pages 每月流量軟性上限為 100 GB。

## GitHub Pages 部署

部署設定已放在：

```text
.github/workflows/deploy-pages.yml
```

推送到 `main` 後會自動：

1. 安裝依賴
2. 執行 TypeScript 檢查
3. 建置正式網站
4. 驗證文字與全部媒體檔案
5. 上傳並部署 GitHub Pages

Repository 第一次部署時：

1. 進入 GitHub Repository。
2. 開啟 `Settings`。
3. 選擇 `Pages`。
4. 在 `Build and deployment` 將 `Source` 設為 `GitHub Actions`。
5. 到 `Actions` 查看 `Deploy GitHub Pages`。

本專案部署為使用者網站（Repository 名稱即 `feifei-tainan-policy.github.io`），
因此 `vite.config.ts` 的正式 Base Path 是根目錄：

```text
/
```

如果 Repository 改名，請同步修改：

- `vite.config.ts` 的 `repositoryBasePath`
- `.github/workflows/deploy-pages.yml` 的 `VITE_BASE_PATH`
- `.env.example`
- README 內的 GitHub Pages 網址

## 版本切換

網站有兩個並存的內容版本，可以隨時互換：

| 版本 | 標籤／分支 | 內容 |
| --- | --- | --- |
| **純影片版**（目前線上） | `v2.0-video-only` · `main` | 影片舞台 + 右側短條列，影片下方直接是頁尾 |
| **含政策文字版** | `v1.2-with-brief` · `with-brief` | 多一個「政策重點・文字版」閱讀區，由 8 份新聞稿濃縮，隨政策切換 |

兩個版本的影片、順序、配色完全相同，差別只在有沒有文字重點區。

切換到含政策文字版：

```bash
git checkout with-brief -- src/ scripts/
npm run check
git commit -am "切換為含政策文字版"
git push
```

切回純影片版：

```bash
git checkout v2.0-video-only -- src/ scripts/
npm run check
git commit -am "切換為純影片版"
git push
```

文字重點的內容放在 `src/data/briefs.ts`（已定稿的 6 項）與
`src/data/briefs.draft.ts`（文化、美食的草稿，刻意不被 import，
因此不會進入打包結果）。這兩個檔案在純影片版中仍保留在 repo 裡，
只是沒有被引用。

## 後續更新流程

本專案已推送至 `main`，並由 GitHub Actions 自動部署。日常更新：

```bash
git add .
git commit -m "更新政策內容"
git push
```

推送到 `main` 後會自動觸發 `Deploy GitHub Pages`，完成後即反映到 <https://feifei-tainan-policy.com/>。

> 注意：`public/CNAME` 內容為 `feifei-tainan-policy.com`，請勿刪除。
> 本專案使用 GitHub Actions 部署，若該檔案遺失，GitHub Pages 的自訂網域設定會在下次部署時被清空。

多人協作時請改用分支與 Pull Request 流程，不要使用 `git push --force`。

## 自訂網域

切換到自訂網域根目錄時，把 Base Path 改為 `/`：

```text
VITE_BASE_PATH=/
```

接著在 GitHub `Settings → Pages → Custom domain` 填入核定網域，完成 DNS 設定後開啟 `Enforce HTTPS`。

## 驗證內容

`npm run verify` 會檢查：

- `dist/index.html`
- 6 大政策重要文字
- 3 支正式政策影片
- 未上映影片沒有混入部署結果
- 首頁人物影片
- 全部海報與圖片
- 原始素材與建置素材的檔案大小
- 輸出中沒有 ChatGPT Sites 專屬登入依賴

## 台南政策島（/island）

<https://feifei-tainan-policy.com/island> 是一座 3D 互動政策島：中央「一個大台南」加上 6 大政策島，
曾文溪把島群分成溪北與溪南。點島或用右側清單可以看細項、依據與政策影片，「串聯線」顯示政策之間的關係。

- 位置：`public/island/`，原生 ES Modules，不經過 Vite 打包，`npm run build` 時原樣複製到 `dist/island/`
- 3D 引擎：Three.js r160，放在 `public/island/vendor/`（MIT 授權），不依賴 CDN，iOS 15 以上可用
- **改內容只要改 `public/island/js/data.js`**：島、細項、串聯線、「台南人的一天」時段與自動導覽都在這裡，程式完全由這份資料驅動
- 細項的狀態標籤（已升格、可行性評估已核定、對標六都補齊…）只在新聞稿有明確寫到時使用，定義在 `TAGS`
- 文化與美食已自規劃移除，不另設島；府城古蹟與必比登美食依「五大觀光軸」新聞稿放在觀光島
- 網址參數：`#technology`、`#tech-sci`、`#F1` 可直接開啟指定的島、細項或串聯線；`?quality=low|medium|high` 可強制畫質
- 左下角有全螢幕鈕（仿 `ai2.html`），鍵盤 F 也可切換
- 手機版（≤ 800px）用底部抽屜，橫放手機用右側面板；畫質依裝置自動分級，並依實際幀時間自動調整解析度

本機預覽：`npm run build && npm run preview`，再開啟 `/island/`。

### 競選總部觸控展示機（`?kiosk=1`）

依 24 吋橫放觸控螢幕（Windows＋Chrome，1920×1080）設計，HDMI 同步輸出到 LED 電視牆時看到的是同一個畫面。
用 `全螢幕開啟台南政策島.bat` 啟動（Chrome `--kiosk`：沒有網址列與工作列，Esc 也不會離開；關閉請按 Alt+F4）。

- 字級、按鈕、標籤放大一級，畫質固定為高畫質
- 鎖住所有會離開政策島的連結，搜尋框隱藏（展示機沒有實體鍵盤）
- 停用長按選單、選字、拖曳圖片與整頁縮放；雙指只縮放 3D 地圖
- 開啟時自動導覽並循環；閒置 60 秒重置（關影片、收面板、回全景、重新導覽），影片播放中放寬到 4 分鐘；`&idle=90` 可改秒數
- 影片點了就播，播完自動關閉回到政策島
- 螢幕保持常亮；離線快取（`sw.js`），總部網路斷線時政策島仍可顯示，影片需要網路
- 有新版本時會在閒置時自動重新整理；要停用離線快取請開 `?kiosk=1&nosw=1`
- 全螢幕鈕：沒有用 `--kiosk` 開時，點一下進入全螢幕；全螢幕中要長按 1.2 秒才會離開，被意外退出時下一次觸控自動回到全螢幕

改版政策島時，請同步更新 `public/island/sw.js` 的 `VERSION` 與 `index.html` 的 `?v=` 版本號，展示機才會換成新版。

## 版權與安全

- 權利說明：[`COPYRIGHT.md`](COPYRIGHT.md)
- 安全說明：[`SECURITY.md`](SECURITY.md)
