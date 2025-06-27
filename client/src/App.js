import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register"; // Component name and file match
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import ProfileSettings from "./pages/ProfileSettings";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <div className="text-center p-4 bg-blue-500 text-white">
            <h1 className="text-2xl font-bold">Campus Marketplace</h1>
            <p>Welcome to the campus app 🛍️</p>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={ <PrivateRoute>  <Profile /> </PrivateRoute>
  }
/>
<Route path="/settings" element={
  <PrivateRoute>
    <ProfileSettings />
  </PrivateRoute>
} />
      </Routes>
    </Router>
  );
}

export default App;
