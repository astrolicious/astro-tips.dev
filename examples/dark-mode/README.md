# Add Darkmode

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/astrolicious/astro-tips.dev/tree/main/examples/dark-mode)

[astro-tips.dev article](https://astro-tips.dev/recipes/dark-mode/)

## Features

- View Transitions Compatible
- Allows for setting a default theme easily with a prop
- Includes [button](./src/components/ThemeToggle.astro) and [select](./src/components/ThemeToggle.astro) [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) (which aren't necesary to use the script in `ThemeManager.astro`)
- Exposes `theme` global for a nice API
  - `theme.getTheme()`
  - `theme.setTheme()`
  - `theme.getSystemTheme()`
  - `theme.getDefaultTheme()`
- Dispatches a custom `theme-changed` event that gives access to:
  - `event.details.theme`
  - `event.details.systemTheme`
  - `event.details.defaultTheme`
