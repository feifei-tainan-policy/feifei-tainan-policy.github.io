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
- 06 姐姐

六支政策影片已全部上線。

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

## 台南政策島新版本（/island2）

<https://feifei-tainan-policy.com/island2/> 是加上互動功能的新版本，放在 `public/island2/`。
`/island` 維持原本的版本不動，兩個版本可以並存、分開修改。總部觸控機要試新版，開
`https://feifei-tainan-policy.com/island2/?kiosk=1`。

island2 新增：

- **集章卡**：自己點進一座島（或島上的細項）就蓋一個章，工具列「集章」看進度；7 座島集滿可以存成「我的台南集章卡」圖片。
  網頁版記在這台裝置的瀏覽器；總部觸控機只記在記憶體，閒置重置時歸零，集滿後掃 QR code 在手機上領集章卡
- **「你是哪一種台南人？」測驗**：6 題生活情境題，算出 6 種類型之一與最有關的 3 項政策，可以「帶我去看」（鏡頭依序飛過去）、
  存成圖片、分享結果。題目、選項加分與類型文字都在 `js/data.js` 的 `quiz`；結果只會出現島上既有的細項，題目不問住哪一區
- **分享**：卡片上的「分享」在手機叫出內建分享選單（LINE、臉書…），電腦複製連結。分享網址是 `s/<島>/`，
  傳到 LINE、臉書會顯示那座島自己的預覽圖（`img/og/<島>.jpg`）
- **總部觸控機掃碼帶走**：側欄下方常駐 QR code（導覽時是「手機也能玩」，選到哪一項就換成那一項），卡片上的「帶走這一項」會放大 QR code
- **網友意見（LINE 官方帳號）**：在 `js/data.js` 的 `opinion.lineId` 填上 `@` 開頭的帳號 ID，卡片上才會出現「我有話想說」，
  點了打開和競辦的 LINE 對話，訊息先帶好「我對「○○」的想法：」；總部觸控機改成掃 QR code。沒填之前不會顯示
- 網址參數：`#quiz` 直接開測驗、`#quiz=<類型>.<細項>…` 開測驗結果、`#stamps` 開集章卡

改版或複製成新版本（例如 `island3`）時：

```bash
cp -R public/island2 public/island3                 # 複製成新版本資料夾（程式裡的路徑會跟著資料夾走）
node scripts/island-version.mjs island3 20261101     # 更新 ?v=、模組 import、離線快取版本號與分享網址（同一天再改版用 20261101-2）
node scripts/island-share-pages.mjs island3          # 重新產生分享頁（s/）
```

`island-version.mjs` 也會把 `index.html` 裡 `canonical`、`og:url`、`og:image` 的資料夾名稱換成新的。

### island3（/island3）

<https://feifei-tainan-policy.com/island3/> 是 island2 再加上下面這些功能（總部觸控機：`/island3/?kiosk=1`）：

- **台南人的一天可以點**：點畫面下方的時段條，列出一天 8 個時段；點一個時段，時間會停在那一段、鏡頭帶到相關政策並標出名稱。
  「播放一整天」會自動走過 8 個時段。時段與政策的對應在 `js/data.js` 的 `dayCycle`
- **問妃妃**：點左下角的妃妃（或妃妃角色卡上的按鈕），用點選的方式問問題，不開放打字。答案由島上的細項組成（出自新聞稿），
  福利類照樣標出「對標六都補齊」。問題清單在 `js/data.js` 的 `ask`
- **我的角色**：工具列「角色」可以捏一個小人（身分、衣服、頭髮、膚色、帽子、手上的東西、名字），指定他走到哪座島，鏡頭會跟著走。
  網頁版記在瀏覽器；總部觸控機沒有名字欄，閒置重置時收掉
- **小彩蛋**：島上藏著 6 樣台南物產，鏡頭拉近才看得到，點到就收集，集章卡下方看進度。點騎單車的妃妃、姐姐的小熊會跳一下並說話，
  台詞在 `js/data.js` 的 `lines`，只用競選口號與新聞稿裡的話；物產位置與說明在 `eggs`
- **小遊戲「四季農漁接接樂」**：30 秒接住芒果、洋香瓜、稻米、虱目魚，躲開颱風。從農漁島卡片、妃妃角色卡或問妃妃打開
- **流量統計（Google Analytics 4）**：`js/data.js` 的 `analytics.gaId` 填上 `G-` 開頭的評估 ID 才會啟動，沒填不送任何資料。
  記錄民眾自己點的島、細項、串聯線（自動導覽不算），以及測驗、集章、分享、LINE、問妃妃、彩蛋、小遊戲、角色、台南人的一天等動作；
  每個事件都帶 `island_version`（版本資料夾）與 `kiosk`（是不是總部觸控機），報表可以分開看
- **來站計數器**：早期網頁的「您是第 N 位訪客」，電腦版在清單底部、手機在妃妃上方。數字存在免費的
  [Abacus](https://jasoncameron.dev/abacus/) 計數服務（不用註冊），每個網域各算各的；同一個瀏覽器 30 分鐘內重新整理只算一次，
  總部觸控機不計也不顯示，服務連不上時整塊不出現。設定在 `js/data.js` 的 `visits`，`api` 改成 `""` 就收起來
預覽圖 `img/og/*.jpg` 是用 3D 場景實際拍下來的，改了島上的內容想更新預覽圖，再請工程端重拍。

## 版權與安全

- 權利說明：[`COPYRIGHT.md`](COPYRIGHT.md)
- 安全說明：[`SECURITY.md`](SECURITY.md)
