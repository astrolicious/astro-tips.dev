# Astro Tips

This is a community driven collection of recipes, quick tips and external community resources

## How to help

1. Make an issue if you have an idea for a tip or have found a useful resource you think would help others
2. Close an issue with a PR
3. [Join the Discord](https://chat.astrolicious.dev/)

### Editor support (JSON Schemas)

Run `pnpm install` and `pnpm astro sync` (or `pnpm dev`) to generate collection JSON Schemas in `.astro/collections/`. VS Code is pre-configured in `.vscode/settings.json` to use these schemas for autocompletion and validation in `src/content/resources.json`, `src/content/tags.json`, and `src/content/authors/*.json`, as well as MDX frontmatter via Astro Content Intellisense.

### Adding yourself as an author

1. Create a JSON file in `src/content/authors/<your-slug>.json` (for example `src/content/authors/jane-doe.json`):

```json
{
  "name": "Jane Doe",
  "github": "janedoe",
  "bio": "Short bio or tagline",
  "website": "https://janedoe.dev",
  "socials": {
    "bluesky": "https://bsky.app/profile/janedoe.dev"
  }
}
```

Only `name` is required. Setting `github` automatically populates your GitHub link and avatar (unless you provide a custom `avatar` URL). Supported `socials` keys: `bluesky`, `x`, `mastodon`, `linkedin`, `youtube`, `discord`, `twitch`, `threads`, `instagram`, `gitlab`, `codeberg`, `codepen`, and `rss`.

2. Reference your author ID (the filename without `.json`) in the `authors` array of any tip/recipe frontmatter or `src/content/resources.json` entry. Multiple authors are supported:

```yaml
authors:
  - jane-doe
  - co-author
```

## Goals

- Provide best practice solutions to common problems related building sites with Astro
- Provide in depth recipes where they are warranted
- Provide quick tips where they are warranted

## Non-goals

- Replace Astro Docs or package's official resources
- Provide incomplete solutions
