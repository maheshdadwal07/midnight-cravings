// src/components/HostelModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const hostels = [
  { name: "Archimedes", options: ["A", "B"] },
  { name: "Magellan", options: [] },
  { name: "Aristotle", options: [] },
  { name: "Armstrong", options: [] },
  { name: "Marco Polo", options: [] },
  { name: "Franklin", options: ["A", "B"] },
];

const HostelModal = ({ onSelectHostel, onClose }) => {
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleHostelClick = (hostel, option = null) => {
    const hostelName = option ? `${hostel} (${option})` : hostel;
    setSelectedHostel(hostelName);
    setShowConfetti(true);

    // 3 sec confetti, then trigger parent callback
    setTimeout(() => {
      setShowConfetti(false);
      onSelectHostel(hostelName);
    }, 3000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={overlayStyle}
      >
        {/* Confetti Celebration */}
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}

        {/* Main Pop Card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={cardStyle}
        >
          <h2 style={{ marginBottom: "25px", color: "#ff0000" }}>
            🎓 Choose Your Hostel
          </h2>

          <div style={buttonContainerStyle}>
            {hostels.map((hostel) =>
              hostel.options.length > 0 ? (
                hostel.options.map((opt) => (
                  <motion.button
                    key={`${hostel.name}-${opt}`}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "#ff0000",
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleHostelClick(hostel.name, opt)}
                    style={buttonStyle}
                  >
                    {hostel.name} ({opt})
                  </motion.button>
                ))
              ) : (
                <motion.button
                  key={hostel.name}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "#ff0000",
                    color: "#fff",
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleHostelClick(hostel.name)}
                  style={buttonStyle}
                >
                  {hostel.name}
                </motion.button>
              )
            )}
          </div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#333", color: "#fff" }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} // ✅ sirf onClose call karega
            style={closeButtonStyle}
          >
            ✖ Close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// 🎨 Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const cardStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "20px",
  width: "80%",
  maxWidth: "700px",
  textAlign: "center",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  position: "relative",
};

const buttonContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "12px",
};

const buttonStyle = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "2px solid #ff0000",
  background: "#fff",
  color: "#ff0000",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.2s",
};

const closeButtonStyle = {
  marginTop: "25px",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#ff0000",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default HostelModal;
