import { defineConfig } from "vite";

// Paths are relative to the project root.
const SLUGS = ["roadia", "gripsou", "aurora", "tipe", "gravity"];

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: "index.html",
        ...Object.fromEntries(SLUGS.map((slug) => [slug, `projects/${slug}/index.html`])),
      },
    },
  },
});
