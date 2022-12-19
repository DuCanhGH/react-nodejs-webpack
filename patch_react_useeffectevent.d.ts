declare global {
  declare module "react" {
    export const experimental_useEffectEvent: typeof import("react").experimental_useEvent;
  }
}
