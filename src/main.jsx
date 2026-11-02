
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

const path = window.location.pathname;

let RootPage = App;

if (path === "/admin") {
  RootPage = AdminLogin;
} else if (path === "/admin/dashboard") {
  RootPage = AdminDashboard;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootPage />
  </StrictMode>
);
