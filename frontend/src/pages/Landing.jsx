// src/pages/Landing.jsx
import { useState } from "react";
import HostelModal from "../components/HostelModal";

export default function Landing() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-red-600 to-white">
      {/* Background overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-5xl font-extrabold drop-shadow-lg">
          Midnight Cravings
        </h1>
        <p className="mt-4 text-lg text-gray-100 drop-shadow">
          Satisfy your late night hunger 🍔🍟
        </p>
        <button
          onClick={() => setOpenModal(true)}
          className="mt-8 px-6 py-3 bg-white text-red-600 font-semibold rounded-2xl shadow-md hover:scale-105 transition-transform"
        >
          Enter
        </button>
      </div>

      {/* Hostel Modal */}
      {openModal && <HostelModal onClose={() => setOpenModal(false)} />}
    </div>
  );
}
