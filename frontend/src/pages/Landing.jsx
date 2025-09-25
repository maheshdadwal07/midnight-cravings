// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HostelModal from "../components/HostelModal"; // make sure you create this component

const Landing = () => {
  const navigate = useNavigate();
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState("");

  const handleEnterClick = () => {
    setShowHostelModal(true);
  };

  const handleHostelSelect = (hostel) => {
    setSelectedHostel(hostel);
    setShowHostelModal(false);
    navigate("/shop"); // redirect to shop/products page
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: showHostelModal ? "blur(5px)" : "none", // blur when modal is open
          transition: "filter 0.3s ease-in-out",
        }}
      >
        <source src="1.mp4" type="video/mp4" />
      </video>

      {/* Clickable Text */}
      <div
        onClick={handleEnterClick}
        style={{
          position: "absolute",
          bottom: "40px",
          width: "100%",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          🍔 Enter Midnight Cravings
        </h1>
      </div>

      {/* Hostel Modal */}
      {showHostelModal && <HostelModal onSelectHostel={handleHostelSelect} />}
    </div>
  );
};

export default Landing;
