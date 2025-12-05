// // import React, { createContext, useState, useEffect } from 'react'
// // import api, { setToken } from '../services/api'

// // export const AuthContext = createContext(null)

// // export default function AuthProvider({ children }) {
// //   const [user, setUser] = useState(null)
// //   const [loading, setLoading] = useState(true)

// //   useEffect(() => {
// //     const token = localStorage.getItem('mc_token')
// //     const name = localStorage.getItem('mc_name')
// //     const role = localStorage.getItem('mc_role')
// //     const userId = localStorage.getItem('mc_userId')
// //     if (token) {
// //       setToken(token)
// //       setUser({ name, role, userId })
// //     }
// //     setLoading(false)
// //   }, [])

// //   const login = async (email, password) => {
// //     const res = await api.post('/api/auth/login', { email, password })
// //     const { token, name, role, userId } = res.data
// //     localStorage.setItem('mc_token', token)
// //     localStorage.setItem('mc_name', name)
// //     localStorage.setItem('mc_role', role)
// //     localStorage.setItem('mc_userId', userId)
// //     setToken(token)
// //     setUser({ name, role, userId })
// //     return res.data
// //   }

// //   const signup = async (name, email, password, role) => {
// //     const res = await api.post('/api/auth/signup', { name, email, password, role })
// //     const { token, name: n, role: r, userId } = res.data
// //     localStorage.setItem('mc_token', token)
// //     localStorage.setItem('mc_name', n)
// //     localStorage.setItem('mc_role', r)
// //     localStorage.setItem('mc_userId', userId)
// //     setToken(token)
// //     setUser({ name: n, role: r, userId })
// //     return res.data
// //   }

// //   const logout = () => {
// //     localStorage.removeItem('mc_token')
// //     localStorage.removeItem('mc_name')
// //     localStorage.removeItem('mc_role')
// //     localStorage.removeItem('mc_userId')
// //     setToken(null)
// //     setUser(null)
// //   }

// //   return (
// //     <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
// //       {children}
// //     </AuthContext.Provider>
// //   )
// // }

// import React, { createContext, useState, useEffect } from "react";
// import api, { setToken } from "../services/api";

// export const AuthContext = createContext(null);

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("mc_token");
//     const name = localStorage.getItem("mc_name");
//     const role = localStorage.getItem("mc_role");
//     const userId = localStorage.getItem("mc_userId");
//     if (token) {
//       setToken(token);
//       setUser({ name, role, userId });
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     const res = await api.post("/api/auth/login", { email, password });
//     const { token, name, role, userId, sellerStatus } = res.data;
//     localStorage.setItem("mc_token", token);
//     localStorage.setItem("mc_name", name);
//     localStorage.setItem("mc_role", role);
//     localStorage.setItem("mc_userId", userId);
//     setToken(token);
//     setUser({ name, role, userId, sellerStatus });
//     return res.data;
//   };

//   const signup = async (data) => {
//     const formData = new FormData();
//     for (let key in data) {
//       if (data[key] instanceof FileList) {
//         formData.append(key, data[key][0]); // append first file
//       } else {
//         formData.append(key, data[key]);
//       }
//     }

//     const res = await api.post("/api/auth/signup", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     const { token, name, role, userId, sellerStatus } = res.data;
//     localStorage.setItem("mc_token", token);
//     localStorage.setItem("mc_name", name);
//     localStorage.setItem("mc_role", role);
//     localStorage.setItem("mc_userId", userId);
//     setToken(token);
//     setUser({ name, role, userId, sellerStatus });
//     return res.data;
//   };

//   const logout = () => {
//     localStorage.removeItem("mc_token");
//     localStorage.removeItem("mc_name");
//     localStorage.removeItem("mc_role");
//     localStorage.removeItem("mc_userId");
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

import React, { createContext, useState, useEffect } from "react";
import api, { setToken } from "../services/api";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("mc_token");
    const name = localStorage.getItem("mc_name");
    const email = localStorage.getItem("mc_email");
    const role = localStorage.getItem("mc_role");
    const userId = localStorage.getItem("mc_userId");
    const sellerStatus = localStorage.getItem("mc_sellerStatus");
    const hostelBlock = localStorage.getItem("mc_hostelBlock");
    const roomNumber = localStorage.getItem("mc_roomNumber");
    const shopName = localStorage.getItem("mc_shopName");

    if (token) {
      setToken(token);
      setUser({ name, email, role, userId, sellerStatus, hostelBlock, roomNumber, shopName });
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token, name, email: userEmail, role, userId, sellerStatus, hostelBlock, roomNumber, shopName } = res.data;

    localStorage.setItem("mc_token", token);
    localStorage.setItem("mc_name", name);
    localStorage.setItem("mc_email", userEmail || email);
    localStorage.setItem("mc_role", role);
    localStorage.setItem("mc_userId", userId);
    localStorage.setItem("mc_sellerStatus", sellerStatus || "");
    localStorage.setItem("mc_hostelBlock", hostelBlock || "");
    localStorage.setItem("mc_roomNumber", roomNumber || "");
    localStorage.setItem("mc_shopName", shopName || "");

    setToken(token);
    setUser({ name, email: userEmail || email, role, userId, sellerStatus, hostelBlock, roomNumber, shopName });
    return res.data;
  };

  // Signup
  const signup = async (data) => {
    const formData = new FormData();
    for (let key in data) {
      if (data[key] instanceof FileList) formData.append(key, data[key][0]);
      else formData.append(key, data[key]);
    }

    const res = await api.post("/api/auth/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { token, name, email, role, userId, sellerStatus, hostelBlock, roomNumber, shopName } = res.data;

    localStorage.setItem("mc_token", token);
    localStorage.setItem("mc_name", name);
    localStorage.setItem("mc_email", email || "");
    localStorage.setItem("mc_role", role);
    localStorage.setItem("mc_userId", userId);
    localStorage.setItem("mc_sellerStatus", sellerStatus || "");
    localStorage.setItem("mc_hostelBlock", hostelBlock || "");
    localStorage.setItem("mc_roomNumber", roomNumber || "");
    localStorage.setItem("mc_shopName", shopName || "");

    setToken(token);
    setUser({ name, email, role, userId, sellerStatus, hostelBlock, roomNumber, shopName });
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_name");
    localStorage.removeItem("mc_email");
    localStorage.removeItem("mc_role");
    localStorage.removeItem("mc_userId");
    localStorage.removeItem("mc_sellerStatus");
    localStorage.removeItem("mc_hostelBlock");
    localStorage.removeItem("mc_roomNumber");
    localStorage.removeItem("mc_shopName");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
