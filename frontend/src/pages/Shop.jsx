// src/pages/Shop.jsx
import React, { useState } from "react";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Cart from "./Cart";
import Navbar from "../components/Navbar"; // ✅ Navbar import

const dummyProducts = [
  { id: 1, name: "Maggie", price: 10, category: "Snacks", image: "/images/maggie.jpg" },
  { id: 2, name: "Biscuits", price: 5, category: "Snacks", image: "/images/biscuits.jpg" },
  { id: 3, name: "Namkeen", price: 15, category: "Snacks", image: "/images/namkeen.jpg" },
  { id: 4, name: "Chips", price: 10, category: "Snacks", image: "/images/chips.jpg" },
  { id: 5, name: "Coke", price: 25, category: "Drinks", image: "/images/coke.jpg" },
  { id: 6, name: "Pepsi", price: 25, category: "Drinks", image: "/images/pepsi.jpg" },
];

const categories = ["All", "Snacks", "Drinks", "Meals"];

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ Cart functions
  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const increaseQty = (id) =>
    setCart(cart.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));

  const decreaseQty = (id) =>
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );

  const removeItem = (id) => setCart(cart.filter((item) => item.id !== id));

  // ✅ Filter products
  const filteredProducts =
    selectedCategory === "All"
      ? dummyProducts
      : dummyProducts.filter((p) => p.category === selectedCategory);

  // 🔥 Razorpay payment function
  const handlePayment = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (total <= 0) {
      alert("Cart is empty, add items first!");
      return;
    }

    const options = {
      key: "rzp_test_R9cMqNbCbhzInI", // replace with your Razorpay Test Key
      amount: total * 100, // in paise
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ✅ Navbar Top with categories + Seller Login */}
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

      {/* ✅ Shop Layout */}
      <div style={{ display: "flex", flex: 1, background: "#fff" }}>
        {/* Left Sidebar - Categories */}
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

        {/* Center - Products */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "inline-block", width: "30%", margin: "1%" }}
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
                  textAlign: "center",
                  fontSize: "18px",
                  color: "gray",
                }}
              >
                No items available 🚫
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Cart with Payment */}
        <Cart
          cart={cart}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          removeItem={removeItem}
          handlePayment={handlePayment} // ✅ Payment function passed
        />
      </div>
    </div>
  );
}
