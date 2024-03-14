import { defineMiddleware } from "astro:middleware";
import { cachedFetch } from "./utils/fetch"

export const onRequest = defineMiddleware(async ({ locals }, next) => {
  // Fetch the latest Astro version
  const data = await cachedFetch('https://registry.npmjs.org/astro/latest').then(r => r.json())
  if (!data.version) throw Error('Bad response from NPM registry', { cause: JSON.stringify(data, undefined, 2) })
  locals.astroLatest = data.version

  return next()
});
