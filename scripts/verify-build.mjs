import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const dist = new URL("./dist/", root);
const sourcePublic = new URL("./public/", root);

const requiredPublicFiles = [
  "assets/feifei-brand.jpg",
  "assets/feifei-hero.mp4",
  "assets/feifei-ip-board.png",
  "posters/agriculture.jpg",
  "posters/technology.jpg",
  "posters/tourism.jpg",
  "videos/agriculture.mp4",
  "videos/technology.mp4",
  "videos/tourism.mp4",
  "favicon.svg",
]

for (const relativePath of requiredPublicFiles) {
  const sourcePath = new URL(relativePath, sourcePublic);
  const builtPath = new URL(relativePath, dist);

  assert(existsSync(sourcePath), `Missing source asset: ${relativePath}`);
  assert(existsSync(builtPath), `Missing built asset: ${relativePath}`);
  assert.equal(
    statSync(builtPath).size,
    statSync(sourcePath).size,
    `Built asset size differs: ${relativePath}`,
  );
}

const indexPath = new URL("index.html", dist);
assert(existsSync(indexPath), "dist/index.html was not generated");

const html = readFileSync(indexPath, "utf8");
assert.match(html, /<div id="root"><\/div>/);
assert.match(html, /妃妃市長8大政策｜接棒台南/);
assert.doesNotMatch(html, /chatgpt-auth|oai-authenticated-user/i);

const unreleased = ["videos/welfare.mp4", "videos/sister-v2.mp4"];
for (const relativePath of unreleased) {
  assert(
    !existsSync(new URL(relativePath, dist)),
    `未上映影片不應出現在部署結果中: ${relativePath}`,
  );
}

const bundleDirectory = fileURLToPath(new URL("assets/", dist));
const bundleText = readdirSync(bundleDirectory)
  .filter((name) => name.endsWith(".js"))
  .map((name) => readFileSync(join(bundleDirectory, name), "utf8"))
  .join("\n");

for (const marker of [
  "台南400年第一位女市長",
  "8 大政策，妃妃市長從點線面串聯大台南",
  "科技妃妃市長",
  "農漁牧妃妃市長",
  "觀光妃妃市長",
  "文化妃妃市長",
  "美食妃妃市長",
  "福利妃妃市長",
  "交通妃妃市長",
  "姐姐妃妃市長",
]) {
  assert(bundleText.includes(marker), `Missing content marker: ${marker}`);
}

console.log("Build verification passed.");
