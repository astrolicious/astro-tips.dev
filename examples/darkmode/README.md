# Add Darkmode

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/astrolicious/astro-tips.dev/tree/main/examples/darkmode)

[astro-tips.dev article](https://astro-tips.dev/recipes/darkmode/)

## Features

- View Transitions Compatible ( but not required )
- Uses [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) for nice DX and easy view transitions compatibility
- Allows for setting a default theme easily with a prop
- Dispatches a custom `theme-changed` event that can be listened for and gives access to `event.details.theme` and `event.details.systemTheme`
- Includes a [button](./src/components/ThemeToggle.astro) and [select](./src/components/ThemeToggle.astro) toggling component (which aren't necesary to use the `ThemeManager.astro` component)
- Exposes `theme` global for a nice API
  - `theme.getTheme()`
  - `theme.setTheme()`
  - `theme.getSystemTheme()`