// src/components/ProductCard.jsx
import React from "react";
import { motion } from "framer-motion";

const ProductCard = ({ product, addToCart }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        padding: "16px",
        textAlign: "center",
        cursor: "pointer",
        transition: "0.3s",
      }}
    >
      {/* Product Image */}
      <div
        style={{
          width: "100%",
          height: "160px",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "12px",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Product Name */}
      <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "6px 0" }}>
        {product.name}
      </h3>

      {/* Price (yaha aa gaya sub name ki jagah) */}
      <p style={{ fontSize: "14px", fontWeight: "bold", color: "#e60023", margin: "4px 0" }}>
        ₹{product.price}
      </p>

      {/* Stars */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", margin: "6px 0" }}>
        <span style={{ color: "#ffb400" }}>⭐ ⭐ ⭐ ⭐ ⭐</span>
      </div>

      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => addToCart(product)}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          background: "linear-gradient(45deg, #ff4b2b, #ff416c)",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
          width: "100%",
        }}
      >
        ADD +
      </motion.button>
    </motion.div>
  );
};

export default ProductCard;
