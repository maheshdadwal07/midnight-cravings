// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';

import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AddProduct from './components/AddProduct.jsx';
function App() {
  return (
    <Router>
      <Navbar />
       <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/settings" element={
          <PrivateRoute>
            <ProfileSettings />
          </PrivateRoute>
        } />

        <Route path="/add-product" element={
          <PrivateRoute>
            <AddProduct />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
