// 政策島改版時更新版本號，讓瀏覽器與總部觸控機的離線快取一定換成新檔案。
//
// 用法：node scripts/island-version.mjs island2 [20261026]（同一天再改版用 20261026-2）
//   - index.html 的 ?v= 版本號，以及 canonical、og:url、og:image 裡的資料夾名稱
//   - js/*.js 之間的 import（./ui.js → ./ui.js?v=…），避免新舊檔案混用
//   - sw.js 的 V（離線快取名稱）
// 版本號省略時用今天的日期。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const folder = process.argv[2];
const version = process.argv[3] || new Date().toISOString().slice(0, 10).replace(/-/g, "");
if (!folder || !/^\d{8}(-\d+)?$/.test(version)) {
  console.error("用法：node scripts/island-version.mjs <資料夾，例如 island2> [日期版本，例如 20261026 或 20261026-2]");
  process.exit(1);
}
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", folder);
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error(`找不到 public/${folder}/index.html`);
  process.exit(1);
}

const edit = (file, fn) => {
  const p = path.join(root, file);
  const before = fs.readFileSync(p, "utf8");
  const after = fn(before);
  if (after !== before) fs.writeFileSync(p, after);
  return after !== before;
};

const changed = [];
// canonical、og:url、og:image 這些完整網址也換成這個資料夾
if (edit("index.html", (s) => s.replace(/\?v=\d{8}(?:-\d+)?/g, `?v=${version}`).replace(/(feifei-tainan-policy\.com\/)island\w*\//g, `$1${folder}/`))) changed.push("index.html");
for (const f of fs.readdirSync(path.join(root, "js")).filter((f) => f.endsWith(".js"))) {
  const ok = edit(path.join("js", f), (s) =>
    s.replace(/((?:from|import)\s*\(?\s*["']\.\/[\w-]+\.js)(?:\?v=\d{8}(?:-\d+)?)?(["'])/g, `$1?v=${version}$2`));
  if (ok) changed.push("js/" + f);
}
if (edit("sw.js", (s) => s.replace(/const V = "\d{8}(?:-\d+)?";/, `const V = "${version}";`))) changed.push("sw.js");

// sw.js 要列出每一支程式，少列的話離線時會缺檔
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const missing = fs.readdirSync(path.join(root, "js")).filter((f) => f.endsWith(".js") && !sw.includes(`"${f.replace(/\.js$/, "")}"`));
if (missing.length) {
  console.error(`sw.js 的 JS 清單少了：${missing.join("、")}`);
  process.exit(1);
}
console.log(`public/${folder} 版本 ${version}：${changed.length ? changed.join("、") : "沒有需要更新的檔案"}`);
