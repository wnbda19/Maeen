import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./app/design.css";
import { registerOffline } from "./pwa/register";
import { ErrorBoundary } from "./components/ErrorBoundary";
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
registerOffline();
