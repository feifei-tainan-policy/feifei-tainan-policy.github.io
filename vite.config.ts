import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const repositoryBasePath = "/";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base =
    env.VITE_BASE_PATH ||
    (command === "serve" ? "/" : repositoryBasePath);

  return {
    base,
    plugins: [react()],
    build: {
      outDir: "dist",
      sourcemap: true,
      // 壓縮 CSS 時不要把 @media (max-width) 轉成 Level 4 範圍語法
      // (width<=1080px)。該語法需 Chrome 104+／Safari 16.4+，舊瀏覽器
      //（含 LINE 內建瀏覽器）會整段忽略，導致手機版版型全部失效。
      cssTarget: ["chrome87", "edge88", "firefox78", "safari14"],
    },
    server: {
      // 只綁本機回送介面，避免同網段其他裝置連入（網站尚未公開）
      host: "127.0.0.1",
    },
  };
});
