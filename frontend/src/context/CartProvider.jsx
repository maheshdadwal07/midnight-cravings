import React, { createContext, useEffect, useState, useContext } from "react";
import api, { setToken } from "../services/api";
import { AuthContext } from "./AuthProvider";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  // Load cart on mount and when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        // If not logged in, load cart from localStorage
        const localCart = localStorage.getItem("mc_guest_cart");
        if (localCart) {
          try {
            setItems(JSON.parse(localCart));
          } catch {
            setItems([]);
          }
        } else {
          setItems([]);
        }
        setToken(null);
        return;
      }

      // Clear items immediately when fetching for logged-in user
      setItems([]);

      try {
        const token = localStorage.getItem("mc_token");
        if (!token) return;

        setToken(token);
        
        // Merge guest cart with user cart if exists
        const localCart = localStorage.getItem("mc_guest_cart");
        if (localCart) {
          try {
            const guestItems = JSON.parse(localCart);
            // Add each guest cart item to user cart
            for (const item of guestItems) {
              await api.post("/api/cart/add", item);
            }
            // Clear guest cart after merging
            localStorage.removeItem("mc_guest_cart");
          } catch (err) {
            console.error("Failed to merge guest cart:", err);
          }
        }
        
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
    
    // If not logged in, store in localStorage
    if (!token || !user) {
      const localCart = localStorage.getItem("mc_guest_cart");
      let guestItems = [];
      
      if (localCart) {
        try {
          guestItems = JSON.parse(localCart);
        } catch {
          guestItems = [];
        }
      }
      
      // Check if item already exists
      const existingIndex = guestItems.findIndex(
        (i) => i.sellerProduct_id === item.sellerProduct_id
      );
      
      if (existingIndex >= 0) {
        // Update quantity
        guestItems[existingIndex].quantity += item.quantity;
      } else {
        // Add new item
        guestItems.push(item);
      }
      
      localStorage.setItem("mc_guest_cart", JSON.stringify(guestItems));
      setItems(guestItems);
      return;
    }

    // If logged in, save to backend
    setToken(token);
    const res = await api.post("/api/cart/add", item);
    setItems(res.data.items || []);
  } catch (err) {
    console.error("Failed to add item:", err.response?.data || err.message);
    throw err;
  }
};

const updateQuantity = async (sellerProduct_id, quantity) => {
  const token = localStorage.getItem("mc_token");
  
  // If not logged in, update localStorage
  if (!token || !user) {
    const localCart = localStorage.getItem("mc_guest_cart");
    let guestItems = [];
    
    if (localCart) {
      try {
        guestItems = JSON.parse(localCart);
      } catch {
        guestItems = [];
      }
    }
    
    const updatedItems = guestItems.map((item) =>
      item.sellerProduct_id === sellerProduct_id
        ? { ...item, quantity }
        : item
    );
    
    localStorage.setItem("mc_guest_cart", JSON.stringify(updatedItems));
    setItems(updatedItems);
    return;
  }
  
  setToken(token);
  const res = await api.put("/api/cart/update", { sellerProduct_id, quantity });
  setItems(res.data.items || []);
};

const removeItem = async (sellerProduct_id) => {
  const token = localStorage.getItem("mc_token");
  
  // If not logged in, update localStorage
  if (!token || !user) {
    const localCart = localStorage.getItem("mc_guest_cart");
    let guestItems = [];
    
    if (localCart) {
      try {
        guestItems = JSON.parse(localCart);
      } catch {
        guestItems = [];
      }
    }
    
    const updatedItems = guestItems.filter(
      (item) => item.sellerProduct_id !== sellerProduct_id
    );
    
    localStorage.setItem("mc_guest_cart", JSON.stringify(updatedItems));
    setItems(updatedItems);
    return;
  }
  
  setToken(token);
  const res = await api.delete(`/api/cart/remove/${sellerProduct_id}`);
  setItems(res.data.items || []);
};

const clear = async () => {
  const token = localStorage.getItem("mc_token");
  
  // If not logged in, clear localStorage
  if (!token || !user) {
    localStorage.removeItem("mc_guest_cart");
    setItems([]);
    return;
  }
  
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
