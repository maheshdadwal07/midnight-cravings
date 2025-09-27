import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const hostel = localStorage.getItem("selectedHostel");

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="text-red-600 font-extrabold tracking-tight"
        >
          Midnight<span className="text-gray-900">Cravings</span>
        </button>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {/* Hostel info */}
          {hostel && (
            <span className="hidden sm:inline text-sm text-gray-600">
              Hostel: <b className="text-gray-800">{hostel}</b>
            </span>
          )}

          {/* Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm flex items-center gap-1"
          >
            🛒 Cart
          </button>

          {/* Seller Button */}
          <button
            onClick={() =>
              alert("Seller login will be enabled in Evaluation 2")
            }
            className="px-3 py-1.5 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition text-sm"
          >
            Seller
          </button>
        </div>
      </div>
    </header>
  );
}
