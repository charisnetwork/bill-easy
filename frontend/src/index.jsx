import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Scrolling over a focused number box must scroll the page, not change the value (2 → 1.99).
document.addEventListener("wheel", () => {
  const field = document.activeElement;
  if (field instanceof HTMLInputElement && field.type === "number") field.blur();
}, { passive: true });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
