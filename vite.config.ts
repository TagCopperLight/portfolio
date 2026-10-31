import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { imageSize } from "image-size";
import { Marked, type Tokens } from "marked";
import { defineConfig, type Plugin } from "vite";

// Paths are relative to the project root.
const SLUGS = ["orbitml", "roadia", "gripsou", "aurora", "tipe", "gravity"];

// An image alone on its line becomes a figure; its title is the caption.
const marked = new Marked({
  renderer: {
    paragraph({ tokens }) {
      if (tokens.length !== 1 || tokens[0].type !== "image") return false;
      const { href, text, title } = tokens[0] as Tokens.Image;
      const { width, height } = imageSize(readFileSync(`public${href}`));
      const caption = title ? `<figcaption>${title}</figcaption>` : "";
      return `<figure><img class="shot" src="${href}" width="${width}" height="${height}" alt="${text}" loading="lazy" />${caption}</figure>\n`;
    },
  },
});

// [1] in the text links to the paragraph that starts with [1], the bibliography entry.
// Ids carry the file name: both languages sit on the page, and one of them is hidden.
function citations(html: string, file: string): string {
  return html
    .replace(/(?<!<p>)\[(\d+)\]/g, `<sup><a href="#${file}-$1">[$1]</a></sup>`)
    .replace(/<p>\[(\d+)\]/g, `<p id="${file}-$1">[$1]`);
}

// Replaces <!-- path/to/file.md --> in the HTML with that file, rendered.
function markdown(): Plugin {
  return {
    name: "markdown",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(/<!-- (\S+\.md) -->/g, (_, path: string) =>
          citations(marked.parse(readFileSync(path, "utf8"), { async: false }), basename(path, ".md")),
        ),
    },
    handleHotUpdate({ file, server }) {
      if (!file.endsWith(".md")) return;
      server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}

export default defineConfig({
  plugins: [markdown()],
  build: {
    rolldownOptions: {
      input: {
        main: "index.html",
        ...Object.fromEntries(SLUGS.map((slug) => [slug, `projects/${slug}/index.html`])),
      },
    },
  },
});
