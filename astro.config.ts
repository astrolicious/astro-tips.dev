import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

// https://astro.build/config
export default defineConfig({
  site: process.env.DEPLOY_URL ?? "https://astro-tips.dev",
  integrations: [
    starlight({
      title: "Astro Tips",
      social: {
        github: "https://github.com/astrolicious/astro-tips.dev",
        discord: "https://astro.build/chat",
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
          autogenerate: { directory: "recipes" },
        },
        {
          label: "Tips",
          autogenerate: { directory: "tips" },
        },
      ],
      components: {
        PageTitle: "./src/components/starlight/PageTitle.astro",
        MarkdownContent: "./src/components/starlight/MarkdownContent.astro",
      },
      expressiveCode: {
        plugins: [pluginLineNumbers()],
      },
    }),
  ],
});
