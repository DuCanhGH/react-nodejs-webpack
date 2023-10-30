import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export const Component = () => <p>Welcome</p>;

export const ErrorBoundary = () => {
  const error = useRouteError();
  return (
    <div>
      {isRouteErrorResponse(error) && error.status === 404
        ? "Page not found!"
        : "An error occurred :("}
    </div>
  );
};
