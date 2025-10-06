import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import SellerDashboard from "./pages/SellerDashboard";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="/cart" element={<Cart />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
