import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const pages = [
  "index.html",
  "about.html",
  "services.html",
  "contact.html",
  "services/3pl-export-logistics.html",
  "services/food-and-beverage.html",
  "services/health-and-beauty.html",
  "services/outdoor-sports.html",
  "services/pet-supplies.html",
  "services/quality-control-services.html",
  "services/packing-services.html",
  "services/data-entry-services.html",
];

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, resolve(import.meta.dirname, page)])),
    },
  },
});
