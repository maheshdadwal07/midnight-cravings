// src/components/HostelModal.jsx
import React, { useState } from "react";

const dummyProducts = [
  { id: 1, name: "Maggie", price: 10 },
  { id: 2, name: "Biscuits", price: 5 },
  { id: 3, name: "Namkeen", price: 15 },
  { id: 4, name: "Chips", price: 10 },
];

const hostels = [
  { name: "Archimedes", options: ["A", "B"] },
  { name: "Magellan", options: [] },
  { name: "Aristotle", options: [] },
  { name: "Armstrong", options: [] },
  { name: "Marco Polo", options: [] },
  { name: "Franklin", options: ["A", "B"] },
];

const HostelModal = ({ onSelectHostel }) => {
  const [selectedHostel, setSelectedHostel] = useState(null);

  const handleHostelClick = (hostel, option = null) => {
    const hostelName = option ? `${hostel} (${option})` : hostel;
    setSelectedHostel(hostelName);
    onSelectHostel(hostelName); // send selection to parent
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          minWidth: "300px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Choose Hostel</h2>
        {hostels.map((hostel) =>
          hostel.options.length > 0 ? (
            hostel.options.map((opt) => (
              <button
                key={`${hostel.name}-${opt}`}
                onClick={() => handleHostelClick(hostel.name, opt)}
                style={{
                  margin: "5px",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ff0000",
                  background: "#fff",
                  color: "#ff0000",
                  cursor: "pointer",
                }}
              >
                {hostel.name} ({opt})
              </button>
            ))
          ) : (
            <button
              key={hostel.name}
              onClick={() => handleHostelClick(hostel.name)}
              style={{
                margin: "5px",
                padding: "10px 15px",
                borderRadius: "8px",
                border: "1px solid #ff0000",
                background: "#fff",
                color: "#ff0000",
                cursor: "pointer",
              }}
            >
              {hostel.name}
            </button>
          )
        )}

        {selectedHostel && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h3>Available Snacks for {selectedHostel}:</h3>
            <ul>
              {dummyProducts.map((product) => (
                <li key={product.id}>
                  {product.name} - ₹{product.price}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelModal;
