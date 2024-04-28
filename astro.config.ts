import { defineConfig } from "astro/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import starlight from "@astrojs/starlight";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  site: process.env.DEPLOY_URL ?? "https://astro-tips.dev",
  redirects: {
    "/recipes/how-to-add-gsap": "/tips/how-to-add-gsap",
  },
  experimental: {
    contentCollectionJsonSchema: true,
  },
  integrations: [
    starlight({
      title: "Astro Tips",
      social: {
        github: "https://github.com/astrolicious/astro-tips.dev",
        discord: "https://chat.astrolicious.dev/",
      },
      sidebar: [
        {
          label: "Home",
          link: "/",
        },
        {
          label: "Contributing",
          link: "/contributing/",
        },
        {
          label: "Recipes",
          autogenerate: {
            directory: "recipes",
          },
        },
        {
          label: "Tips",
          autogenerate: {
            directory: "tips",
          },
        },
        {
          label: "Resources",
          badge: "New",
          autogenerate: {
            directory: "resources",
          },
        },
      ],
      components: {
        PageTitle: "./src/components/starlight/PageTitle.astro",
        MarkdownContent: "./src/components/starlight/MarkdownContent.astro",
      },
    }),
    db(),
  ],
  vite: {
    resolve: {
      alias: {
        "~": resolve(dirname(fileURLToPath(import.meta.url)), "./src"),
      },
    },
  },
});
