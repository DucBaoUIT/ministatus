import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import StatusPage from "./pages/StatusPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminIncidents from "./pages/admin/AdminIncidents";
import AdminRuntime from "./pages/admin/AdminRuntime";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="incidents" element={<AdminIncidents />} />
          <Route path="runtime" element={<AdminRuntime />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
