// src/pages/Shop.jsx
import React, { useState } from "react";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

const dummyProducts = [
  { id: 1, name: "Maggie", price: 10, category: "Snacks", sub: "Maggie" },
  { id: 2, name: "Biscuits", price: 5, category: "Snacks", sub: "Biscuits" },
  { id: 3, name: "Namkeen", price: 15, category: "Snacks", sub: "Namkeen" },
  { id: 4, name: "Chips", price: 10, category: "Snacks", sub: "Chips" },
  { id: 5, name: "Coke", price: 25, category: "Drinks", sub: "Cold Drinks" },
  { id: 6, name: "Pepsi", price: 25, category: "Drinks", sub: "Cold Drinks" },
];

const categories = ["All", "Snacks", "Drinks", "Meals"];

const Shop = () => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Filter products based on selected category
  const filteredProducts =
    selectedCategory === "All"
      ? dummyProducts
      : dummyProducts.filter((p) => p.category === selectedCategory);

  // 🔥 Razorpay frontend-only checkout
  const handlePayment = () => {
    if (total <= 0) {
      alert("Cart is empty, add items first!");
      return;
    }

    const options = {
      key: "rzp_test_R9cMqNbCbhzInI", // replace with your Razorpay Test Key ID
      amount: total * 100, // amount in paise
      currency: "INR",
      name: "Midnight Cravings",
      description: "Snack Purchase",
      handler: function (response) {
        alert("✅ Payment Successful!\nPayment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "Student",
        email: "student@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#ff0000",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fff" }}>
      {/* Sidebar Categories */}
      <div style={{ width: "15%", borderRight: "1px solid #ccc", padding: "20px" }}>
        <h3>Categories</h3>
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              marginTop: "10px",
              cursor: "pointer",
              fontWeight: selectedCategory === cat ? "bold" : "normal",
              color: selectedCategory === cat ? "red" : "black",
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Main Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Categories + Seller Login */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            borderBottom: "1px solid #ccc",
            background: "#fafafa",
          }}
        >
          {/* Categories in center */}
          <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  margin: "0 10px",
                  padding: "8px 14px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: selectedCategory === cat ? "red" : "white",
                  color: selectedCategory === cat ? "white" : "black",
                  fontWeight: selectedCategory === cat ? "bold" : "normal",
                  transition: "0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Seller Login button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 10px rgba(0,0,255,0.5)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              marginLeft: "20px",
              padding: "8px 16px",
              background: "linear-gradient(45deg, #007bff, #0056b3)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => alert("🚧 Seller Login Coming Soon!")}
          >
            👨‍💼 Seller Login
          </motion.button>
        </div>

        {/* Products */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            overflowY: "auto",
          }}
        >
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} addToCart={addToCart} />
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  fontSize: "18px",
                  color: "gray",
                }}
              >
                No items available in this category 🚫
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart */}
      <div style={{ width: "25%", borderLeft: "1px solid #ccc", padding: "20px" }}>
        <h3>Cart</h3>
        <AnimatePresence>
          {cart.map((item, idx) => (
            <motion.div
              key={idx}
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
              <span>
                {item.name} - ₹{item.price}
              </span>
              <button
                onClick={() => removeFromCart(idx)}
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
        <h4>Total: ₹{total}</h4>

        {/* Animated Pay Button */}
        <motion.button
          style={payBtnStyle}
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(255,0,0,0.6)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          💳 Pay Now
        </motion.button>
      </div>
    </div>
  );
};

const payBtnStyle = {
  marginTop: "20px",
  padding: "12px 18px",
  background: "linear-gradient(45deg, #ff0000, #cc0000)",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default Shop;
