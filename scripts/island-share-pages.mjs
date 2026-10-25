// 產生政策島的分享頁：每座島（與測驗）各一頁，傳到 LINE、臉書時顯示那座島的標題與預覽圖，
// 點開後立刻轉到政策島並打開那一項（網址 # 後面的部分會一起帶過去）。
//
// 用法：node scripts/island-share-pages.mjs island2
// 產生：public/<資料夾>/s/<島或 quiz>/index.html
// 預覽圖 public/<資料夾>/img/og/<島或 quiz>.jpg（1200×630）要另外放好；沒有的話改用整座島的 og.jpg。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const folder = process.argv[2];
if (!folder) {
  console.error("用法：node scripts/island-share-pages.mjs <資料夾，例如 island2>");
  process.exit(1);
}
const SITE = "https://feifei-tainan-policy.com";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", folder);
const { DATA } = await import(pathToFileURL(path.join(root, "js", "data.js")).href);

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pages = [
  ...DATA.islands.map((isl) => ({
    id: isl.id,
    title: `${isl.num ? isl.num + " " : ""}${isl.policy}｜台南政策島`,
    desc: `${isl.title}：${isl.lead}`,
    hash: isl.id,
  })),
  { id: "quiz", title: `${DATA.quiz.title}｜台南政策島`, desc: DATA.quiz.lead, hash: "quiz" },
];

for (const p of pages) {
  const ogFile = path.join(root, "img", "og", `${p.id}.jpg`);
  const image = fs.existsSync(ogFile) ? `${SITE}/${folder}/img/og/${p.id}.jpg` : `${SITE}/${folder}/img/og.jpg`;
  const url = `${SITE}/${folder}/s/${p.id}/`;
  const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_TW">
<meta property="og:site_name" content="妃妃市長6大政策｜接棒台南">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${image}">
<script>location.replace("../../" + (location.hash || "#${p.hash}"));</script>
</head>
<body style="font-family:sans-serif;padding:24px">
<p><a href="../../#${p.hash}">前往台南政策島 →</a></p>
</body>
</html>
`;
  const dir = path.join(root, "s", p.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}
console.log(`public/${folder}/s/：${pages.map((p) => p.id).join("、")}`);
