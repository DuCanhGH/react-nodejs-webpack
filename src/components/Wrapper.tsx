import type { ReactNode } from "react";
import { useEffect } from "react";

import { startLoading, stopLoading } from "./Link";

export const Wrapper = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    stopLoading();
    return () => {
      startLoading();
    };
  }, []);

  return <>{children}</>;
};
