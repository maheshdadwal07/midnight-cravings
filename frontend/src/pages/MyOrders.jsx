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
      .then((res) => {
        // Group orders by razorpay_order_id or individual order ID
        const groupedOrders = groupOrderItems(res.data);
        setOrders(groupedOrders);
      })
      .catch((err) => console.error(err));
  }, [user]);

  // Group order items into proper orders
  const groupOrderItems = (orderItems) => {
    const orderMap = new Map();

    orderItems.forEach((item) => {
      // Use razorpay_order_id if available, otherwise use the individual order _id
      const orderKey = item.razorpay_order_id || item._id;
      
      if (!orderMap.has(orderKey)) {
        orderMap.set(orderKey, {
          orderId: orderKey,
          createdAt: item.createdAt,
          status: item.status,
          paymentStatus: item.paymentStatus,
          items: [],
          totalAmount: 0,
        });
      }

      const order = orderMap.get(orderKey);
      order.items.push(item);
      order.totalAmount += item.totalPrice || 0;
    });

    return Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      preparing: "#8b5cf6",
      shipped: "#6366f1",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status?.toLowerCase()] || "#6b7280";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user)
    return (
      <div style={{ padding: "32px", fontSize: 16, color: "#555" }}>
        Please login to view orders.
      </div>
    );

  return (
    <div style={{ padding: "32px 16px", maxWidth: 900, margin: "auto" }}>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 24,
          color: "#1f2937",
        }}
      >
        My Orders
      </h2>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 16px",
            color: "#6b7280",
            fontSize: 16,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ margin: 0 }}>No orders yet.</p>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>
            Start ordering your favorite food!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {orders.map((order, idx) => (
            <div
              key={order.orderId}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0,0,0,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "#6366f1",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
                    Order #{orders.length - idx}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.25)",
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    marginBottom: 16,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Items ({order.items.length})
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {order.items.map((item, itemIdx) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: 8,
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: "#1f2937",
                            marginBottom: 4,
                          }}
                        >
                          {item.sellerProduct_id?.product_id?.name ||
                            "Product"}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#6366f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹{item.totalPrice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "#f9fafb",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
                  Total Amount
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#6366f1",
                  }}
                >
                  ₹{order.totalAmount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
