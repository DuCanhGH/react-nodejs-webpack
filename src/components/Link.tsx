import nProgress from "nprogress";
import type { MouseEventHandler } from "react";
import { forwardRef, useTransition } from "react";
import {
  type LinkProps,
  createPath,
  Link as RRLink,
  useLinkClickHandler,
  useLocation,
  useResolvedPath,
} from "react-router-dom";

nProgress.configure({
  showSpinner: true,
});

export const startLoading = () => {
  nProgress.start();
};

export const stopLoading = () => {
  nProgress.done();
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      replace,
      state,
      target,
      to,
      children,
      preventScrollReset,
      relative,
      onClick: ogOnClick,
      ...rest
    },
    ref,
  ) => {
    const [, startTransition] = useTransition();
    const internalOnClick = useLinkClickHandler(to, {
      replace,
      state,
      target,
      preventScrollReset,
      relative,
    });
    const location = useLocation();
    const path = useResolvedPath(to);
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
      e.preventDefault();
      if (createPath(location) !== createPath(path)) {
        startLoading();
      }
      startTransition(() => {
        internalOnClick(e);
        ogOnClick?.(e);
      });
    };
    return (
      <RRLink
        onClick={handleClick}
        ref={ref}
        to={to}
        replace={replace}
        state={state}
        target={target}
        preventScrollReset={preventScrollReset}
        relative={relative}
        {...rest}
      >
        {children}
      </RRLink>
    );
  },
);

export default Link;
