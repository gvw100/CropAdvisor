import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import AdvisoryPage from "./dashboard/AdvisoryPage.tsx";
import "leaflet/dist/leaflet.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/advisory", element: <AdvisoryPage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
