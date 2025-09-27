// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";

export default function App() {
  // Cart state yaha define karo
  const [cart, setCart] = useState([]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Shop ko cart aur setCart pass karo taki "Add to Cart" wahan kaam kare */}
      <Route path="/shop" element={<Shop cart={cart} setCart={setCart} />} />

      {/* Cart page ko bhi state bhejo */}
      <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
    </Routes>
  );
}
