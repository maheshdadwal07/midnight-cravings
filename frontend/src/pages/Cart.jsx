// src/pages/Cart.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart({ cart, increaseQty, decreaseQty, removeItem, handlePayment }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={{ width: "25%", borderLeft: "1px solid #ccc", padding: "20px" }}>
      <h3>Cart</h3>

      <AnimatePresence>
        {cart.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            style={{
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f9f9f9",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            <div>
              <div>{item.name} - ₹{item.price}</div>
              <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => increaseQty(item.id)}>+</button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "red",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

{/* Subtotal Section */}
<div style={{ marginTop: "20px", marginBottom: "10px" }}>
  {/* Subtotal row */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
    <div style={{ fontSize: "14px", color: "gray" }}>Subtotal</div>
    <div style={{ fontSize: "22px", fontWeight: "bold", color: "red" }}>
      ₹ {total.toFixed(2)}
    </div>
  </div>

  {/* Exclusive of taxes note */}
  <div style={{ fontSize: "12px", color: "gray", marginTop: "3px" }}>
    *exclusive of taxes
  </div>
</div>



      {/* Checkout Button */}
      <motion.button
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "12px 0",
          background: "red",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
        whileHover={{ scale: 1.03, boxShadow: "0px 0px 10px rgba(255,0,0,0.7)" }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePayment}
      >
        Checkout ₹ {total.toFixed(2)}
      </motion.button>
    </div>
  );
}
