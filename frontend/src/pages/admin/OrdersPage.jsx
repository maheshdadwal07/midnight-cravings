import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data || []);
    } catch {
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container">
      <h2 className="mainTitle">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="noOrders">No recent orders.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div key={o._id} className="order-card">
              <div className="order-header">
                <div className="product-name">
                  {o.sellerProduct_id?.product_id?.name || "Product"}
                </div>
                <div className="order-status">{o.status}</div>
              </div>
              <div className="order-info">
                <div>
                  <strong>Buyer:</strong> {o.user_id?.name || "Unknown"}
                </div>
                <div>
                  <strong>Quantity:</strong> {o.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 32px;
          font-family: 'Poppins', sans-serif;
        }

        .mainTitle {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .noOrders {
          font-size: 16px;
          color: #6b7280;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .order-card {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .order-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-name {
          font-weight: 700;
          font-size: 16px;
        }

        .order-status {
          font-size: 14px;
          font-weight: bold;
          color: #10b981;
        }

        .order-info {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .orders-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
