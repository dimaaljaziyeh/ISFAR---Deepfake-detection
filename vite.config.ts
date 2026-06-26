import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  vite: {
    server: {
      host: "0.0.0.0",
    },
    preview: {
      host: "0.0.0.0",
      allowedHosts: [
        "isfar-deepfake-detection-production.up.railway.app",
      ],
    },
  },
});
