import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">
        <Link to="/">Campus Marketplace</Link>
      </h1>

      <div className="space-x-4">
        {!token ? (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/add-product" className="hover:underline">

             Add Product
            </Link>
            <Link to="/settings" className="hover:underline">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="hover:underline text-white"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
