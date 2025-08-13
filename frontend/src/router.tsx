import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Status from "./pages/Status";
import Result from "./pages/Result";
import ErrorPage from "./pages/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "status/:jobId", element: <Status /> },
      { path: "result/:jobId", element: <Result /> }
    ],
  },
]);
