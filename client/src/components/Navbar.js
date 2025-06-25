import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isLoggedIn = localStorage.getItem("token");

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">
        <Link to="/">Campus Marketplace</Link>
      </h1>

      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
