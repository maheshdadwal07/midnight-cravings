import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider";

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    api
      .get("/api/orders/my-orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, [user]);

  if (!user)
    return (
      <div style={{ padding: "32px", fontSize: 16, color: "#555" }}>
        Please login to view orders.
      </div>
    );

  return (
    <div style={{ padding: "32px", maxWidth: 800, margin: "auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        My Orders
      </h2>

      {orders.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No orders yet.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 16,
          }}
        >
          {orders.map((o) => (
            <li
              key={o._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 16,
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                background: "#fff",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {o.sellerProduct_id?.product_id?.name || "Product"}
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    Qty: {o.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  ₹{o.totalPrice}
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: "#6366f1" }}>
                Status: <span style={{ fontWeight: 600 }}>{o.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
