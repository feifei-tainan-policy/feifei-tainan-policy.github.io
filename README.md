# 妃妃市長 8 大政策｜接棒台南

這是目前「妃妃市長 8 大政策」ChatGPT Site 的獨立版專案，保留正式版的文字、圖片、人物首頁影片、8 大政策切換、政策說明、影片播放器、全螢幕展示、桌機版與手機版版型。

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

## 修改 8 大政策

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
- `videoPath`
- `posterPath`

有 `videoPath` 的政策會顯示播放器與「影片已上線」；沒有影片路徑的政策會保留目前的 16:9「政策影片即將上線」版型。

目前已上線影片：

- 01 科技
- 02 農漁牧
- 06 福利
- 08 姐姐

目前保留預告版：

- 03 觀光
- 04 文化
- 05 美食
- 07 交通

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

目前完整媒體約 53 MB，單一最大影片約 18 MB，可以直接放在 GitHub Repository 與 GitHub Pages。

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
- 8 大政策重要文字
- 4 支正式政策影片
- 首頁人物影片
- 全部海報與圖片
- 原始素材與建置素材的檔案大小
- 輸出中沒有 ChatGPT Sites 專屬登入依賴

## 版權與安全

- 權利說明：[`COPYRIGHT.md`](COPYRIGHT.md)
- 安全說明：[`SECURITY.md`](SECURITY.md)
