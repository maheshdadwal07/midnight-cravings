// src/pages/Shop.jsx
import { useLocation } from "react-router-dom";

export default function Shop() {
  const location = useLocation();
  const hostel = location.state?.hostel || "Unknown Hostel";

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Welcome to {hostel} Shop 🏪
      </h1>
      <p className="text-gray-700">Here products will be listed...</p>
    </div>
  );
}
