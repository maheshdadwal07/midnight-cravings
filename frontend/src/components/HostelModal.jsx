// src/components/HostelModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HostelModal({ onClose }) {
  const navigate = useNavigate();
  const [selectedHostel, setSelectedHostel] = useState("");

  const hostels = [
    "Hostel A1",
    "Hostel A2",
    "Hostel B",
    "Hostel C",
    "Girls Hostel",
    "PG Hostel",
  ];

  const handleEnterShop = () => {
    if (!selectedHostel) return;
    // Pass hostel in route state
    navigate("/shop", { state: { hostel: selectedHostel } });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blur background */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/40"
        onClick={onClose}
      ></div>

      {/* Modal box */}
      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-80 z-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
          Choose Your Hostel
        </h2>
        <select
          className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
        >
          <option value="">-- Select Hostel --</option>
          {hostels.map((h, idx) => (
            <option key={idx} value={h}>
              {h}
            </option>
          ))}
        </select>
        <button
          onClick={handleEnterShop}
          className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
        >
          Enter Shop
        </button>
      </div>
    </div>
  );
}
