# A React app that uses React 18's new renderToPipeableStream, hydrateRoot, Webpack and SWC.

## Got this set up during my free time xD

## Supported: Sass, SCSS, Typescript, CSS Modules and of course, SSR.

## I can't believe this thing evolved from an app created with NodeJS REPL into this...

## Note:

- JSX Runtime is already enabled.
- Before you run `npm run dev` for the first time, create dist/server.js (an empty one is okay enough).
- You can try setting up HMR, I can't do that myself. For now, when you change your code, you gotta reload the page to see those changes.
- You have to restart the process when you change your tsconfig.json :(
- If you import files that don't have exports, for example, polyfills, make sure to add them to the sideEffects array in package.json.
