import React, { createContext, useEffect, useState, useContext } from "react";
import api, { setToken } from "../services/api";
import { AuthContext } from "./AuthProvider";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  // Whenever user logs in/out, set or remove token
useEffect(() => {
  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setToken(null);
      return;
    }

    try {
      const token = localStorage.getItem("mc_token");
      if (!token) return;

      setToken(token);
      const res = await api.get("/api/cart");
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to load cart", err);
      setItems([]);
    }
  };

  fetchCart();
}, [user]);



const addItem = async (item) => {
  try {
    const token = localStorage.getItem("mc_token");
    if (!token) throw new Error("Not logged in");
    setToken(token);

    const res = await api.post("/api/cart/add", item); // ✅ include /api/cart
    setItems(res.data.items);
  } catch (err) {
    console.error("Failed to add item:", err.response?.data || err.message);
    throw err;
  }
};

const updateQuantity = async (sellerProduct_id, quantity) => {
  const token = localStorage.getItem("mc_token");
  setToken(token);
  const res = await api.put("/api/cart/update", { sellerProduct_id, quantity });
  setItems(res.data.items);
};

const removeItem = async (sellerProduct_id) => {
  const token = localStorage.getItem("mc_token");
  setToken(token);
  const res = await api.delete(`/api/cart/remove/${sellerProduct_id}`);
  setItems(res.data.items);
};

const clear = async () => {
  const token = localStorage.getItem("mc_token");
  setToken(token);
  await api.delete("/api/cart/clear");
  setItems([]);
};


  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}
