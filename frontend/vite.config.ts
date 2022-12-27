import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import nodePolyfills from "vite-plugin-node-stdlib-browser";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2020"
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020"
    }
  },
  plugins: [nodePolyfills(), vue()]
});
