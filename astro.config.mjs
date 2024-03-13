import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

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
          label: "Recipes",
          autogenerate: { directory: "recipes" },
        },
      ],
    }),
  ],
});
