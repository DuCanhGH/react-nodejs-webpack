import type { experimental_useEvent } from "react";

declare module "react" {
  export const experimental_useEffectEvent: typeof experimental_useEvent;
}
