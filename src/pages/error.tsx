import { isRouteErrorResponse,useRouteError } from "react-router-dom";

const RootErrorBoundary = () => {
  const error = useRouteError();
  return (
    <div>
      {isRouteErrorResponse(error) && error.status === 404
        ? "Page not found!"
        : "An error occurred :("}
    </div>
  );
};

export default RootErrorBoundary;
