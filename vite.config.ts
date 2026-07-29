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
    },
    server: {
      host: true,
    },
  };
});
