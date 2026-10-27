// 把政策島的一個版本複製到另一個網域（同步複本），例如 island → https://yes100.ai/island/。
//
// 用法：node scripts/island-mirror.mjs <來源資料夾> <輸出的網站根目錄> <新網址>
//   例：node scripts/island-mirror.mjs island ../yes100.ai https://yes100.ai/island/
//   - 整個資料夾複製到 <輸出>/<新網址的資料夾>/（舊的先清掉）
//   - og:url、og:image 這些完整網址換成新網址；canonical 保留原站，搜尋引擎以原站為主
//   - 回首頁的連結（「回到 6 大政策影片」）改成原站首頁
//   - 用到的網站根目錄檔案（/favicon.ico、/posters/…）一起複製，找不到就報錯
// GitHub Actions 的 Sync island to yes100.ai 會在官網部署成功後自動執行。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [folder, outRoot, target] = process.argv.slice(2);
if (!folder || !outRoot || !/^https:\/\/[^/]+\/[\w-]+\/$/.test(target || "")) {
  console.error("用法：node scripts/island-mirror.mjs <來源資料夾，例如 island> <輸出的網站根目錄> <新網址，例如 https://yes100.ai/island/>");
  process.exit(1);
}
const SITE = "https://feifei-tainan-policy.com";
const pub = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const src = path.join(pub, folder);
if (!fs.existsSync(path.join(src, "index.html"))) {
  console.error(`找不到 public/${folder}/index.html`);
  process.exit(1);
}
const dest = path.join(outRoot, new URL(target).pathname);
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const from = `${SITE}/${folder}/`;
const rootFiles = new Set();
let edited = 0;
for (const file of walk(dest).filter((f) => /\.(html|js|css|json|webmanifest)$/.test(f))) {
  const rel = path.relative(dest, file).split(path.sep).join("/");
  const before = fs.readFileSync(file, "utf8");
  let s = before.split(from).join(target);
  if (rel === "index.html") s = s.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${from}"`);
  s = s.replace(/href=(["'])\/\1/g, `href=$1${SITE}/$1`);
  if (!rel.startsWith("vendor/")) {
    for (const m of s.matchAll(/["'(`]\/(\w[\w./-]*\.(?:png|jpe?g|webp|gif|svg|ico|mp4|webm|json|webmanifest|css|js))["')`?#]/g)) rootFiles.add(m[1]);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    edited++;
  }
}

const missing = [...rootFiles].filter((f) => !fs.existsSync(path.join(pub, f)));
if (missing.length) {
  console.error(`public/${folder} 用到網站根目錄的檔案，但 public/ 裡找不到：${missing.map((f) => "/" + f).join("、")}`);
  process.exit(1);
}
for (const f of rootFiles) {
  fs.mkdirSync(path.dirname(path.join(outRoot, f)), { recursive: true });
  fs.copyFileSync(path.join(pub, f), path.join(outRoot, f));
}

// 除了 canonical，不應該還留著原站這個版本的網址
const left = walk(dest).filter((f) => /\.(html|js|css)$/.test(f))
  .flatMap((f) => fs.readFileSync(f, "utf8").split(from).length - 1 - (path.relative(dest, f) === "index.html" ? 1 : 0) > 0 ? [path.relative(dest, f)] : []);
if (left.length) {
  console.error(`還有原站網址沒換掉：${left.join("、")}`);
  process.exit(1);
}
console.log(`public/${folder} → ${target}：改了 ${edited} 個檔案的網址，另外複製 ${[...rootFiles].sort().map((f) => "/" + f).join("、")}`);
