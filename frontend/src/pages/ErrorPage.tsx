import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  let message = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  }
  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Error</div>
      <div className="text-gray-700">{message}</div>
      <Link to="/" className="inline-block px-3 py-1.5 rounded bg-gray-800 text-white">Back</Link>
    </div>
  );
}
