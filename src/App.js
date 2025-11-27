import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./config/proj-config.js";

import React from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import AuthProvider from "./auth/context/auth-provider";
import { AuthConsumer } from "./auth/context/auth-consumer";
import GuestGuard from "./auth/guards/guest-guard";
import AuthGuard from "./auth/guards/auth-guard";
import Home from "./pages/Home/Home";
import MapPage from "./pages/map/map-page";
import DashboardLayout from "./layouts/dashbord-layout.js";
import UsersPage from "./pages/dashboard/users-page.js";

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


function App() {
  return (
    <AuthProvider>
      <AuthConsumer>
        <Router>
          <Routes>
            {/* Guest Guard  */}
            <Route element={<GuestGuard />}>
              <Route path="/" element={<Home />} />
            </Route>
            {/* Guest Guard  */}

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/mapcomponent" element={<MapPage />} />
            </Route>
            {/* Protected Routes */}

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/users" element={<UsersPage />} />
            </Route>


          </Routes>
        </Router>
      </AuthConsumer>
    </AuthProvider>
  );
}

export default App;
