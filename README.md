# A React app that uses React 18's new renderToPipeableStream, hydrateRoot, Webpack and SWC.

## Remix, but somewhat Next.js?

## Got this set up during my free time xD

## Supported: Sass, SCSS, Typescript, CSS Modules and of course, SSR.

## I can't believe this thing evolved from an app created with NodeJS REPL into this...

## Note:

- HMR and JSX Runtime are already enabled.
- Before you run `npm run dev` for the first time, create dist/server.js (an empty one is okay enough).
- You have to restart the process when you change your tsconfig.json :(
- If you import files that don't have exports, for example, polyfills, make sure to add them to the sideEffects array in package.json.
- This is just something I made for fun, please don't use in production. In my opinion, you should go for something like a framework like Next.js, Remix or a build tool like Vite instead.
