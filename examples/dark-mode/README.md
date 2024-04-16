# Add Darkmode

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/astrolicious/astro-tips.dev/tree/main/examples/darkmode)

[astro-tips.dev article](https://astro-tips.dev/recipes/dark-mode/)

## Features

- View Transitions Compatible and uses [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- Allows for setting a default theme easily with a prop
- Dispatches a custom `theme-changed` event that can be listened for and gives access to `event.details.theme` and `event.details.systemTheme`
- Includes a [button](./src/components/ThemeToggle.astro) and [select](./src/components/ThemeToggle.astro) toggling component (which aren't necesary to use the `ThemeManager.astro` component)
- Exposes `theme` global for a nice API
  - `theme.getTheme()`
  - `theme.setTheme()`
  - `theme.getSystemTheme()`
  - `theme.getDefaultTheme()`