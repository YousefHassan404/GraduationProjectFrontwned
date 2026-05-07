import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [
        path.resolve(__dirname),        // ✅ السماح بمجلد المشروع (root)
        path.resolve(__dirname, "client"),
        path.resolve(__dirname, "shared"),
      ],
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem}",
        "**/.git/**",
        "server/**",
      ],
    },
  },

  build: {
    outDir: "dist/spa",
  },

  plugins: [
    react(),
    expressPlugin(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // يعمل في وضع dev فقط
    async configureServer(viteServer) {
      // Dynamic import to avoid build-time resolution issues
      const { createServer } = await import("./server/index.js");
      const app = createServer();

      // ربط Express مع Vite
      viteServer.middlewares.use(app);
    },
  };
}
