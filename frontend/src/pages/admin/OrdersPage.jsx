import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";

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

  // Group orders by razorpay_order_id
  const groupOrdersByRazorpayId = () => {
    const grouped = {};
    orders.forEach((order) => {
      const key = order.razorpay_order_id || order._id;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(order);
    });
    
    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a[0].createdAt);
      const dateB = new Date(b[0].createdAt);
      return dateB - dateA;
    });
  };

  const groupedOrders = groupOrdersByRazorpayId();

  return (
    <div className="container">
      <h2 className="mainTitle">Recent Orders ({groupedOrders.length})</h2>
      {groupedOrders.length === 0 ? (
        <p className="noOrders">No recent orders.</p>
      ) : (
        <div className="orders-grid">
          {groupedOrders.map((orderGroup, idx) => {
            const firstOrder = orderGroup[0];
            const totalAmount = orderGroup.reduce((sum, o) => sum + o.totalPrice, 0);
            const orderDate = new Date(firstOrder.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            
            return (
              <div key={firstOrder.razorpay_order_id || firstOrder._id} className="order-card">
                <div className="order-header">
                  <div className="order-number">Order #{groupedOrders.length - idx}</div>
                  <div className={`order-status status-${firstOrder.status}`}>
                    {firstOrder.status}
                  </div>
                </div>
                
                <div className="order-buyer">
                  <strong>Customer:</strong> {firstOrder.buyerName || firstOrder.user_id?.name || "Unknown"}
                </div>
                
                <div className="order-delivery">
                  <strong><Icon name="location" size={14} /> Delivery:</strong> {firstOrder.deliveryHostel || "Not provided"}, Room {firstOrder.deliveryRoom || "N/A"}
                </div>
                
                <div className="order-date">
                  <strong>Date:</strong> {orderDate}
                </div>
                
                <div className="order-items">
                  <strong>Items:</strong>
                  {orderGroup.map((o) => {
                    const image = o.sellerProduct_id?.product_id?.image;
                    const imageUrl = image
                      ? image.startsWith('http')
                        ? image
                        : image.startsWith('/')
                        ? `http://localhost:5001${image}`
                        : `http://localhost:5001/uploads/${image}`
                      : null;
                    
                    return (
                      <div key={o._id} className="order-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        {imageUrl && (
                          <img 
                            src={imageUrl} 
                            alt={o.sellerProduct_id?.product_id?.name || "Product"}
                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div>• {o.sellerProduct_id?.product_id?.name || "Product"} x {o.quantity}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                            <Icon name="store" size={12} /> Seller: {o.sellerProduct_id?.seller_id?.name || o.seller_id?.name || "Unknown"}
                            {(o.sellerProduct_id?.seller_id?.shopName || o.seller_id?.shopName) && ` (${o.sellerProduct_id?.seller_id?.shopName || o.seller_id?.shopName})`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="order-total">
                  <strong>Total:</strong> ₹{totalAmount}
                </div>
                
                {firstOrder.razorpay_order_id && (
                  <div className="order-id">
                    Order ID: {firstOrder.razorpay_order_id.slice(-8)}
                  </div>
                )}
              </div>
            );
          })}
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
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 2px solid #f3f4f6;
        }

        .order-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          border-color: #6366f1;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 2px solid #f3f4f6;
        }

        .order-number {
          font-weight: 700;
          font-size: 18px;
          color: #1f2937;
        }

        .order-status {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-accepted {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-cancelled, .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .order-buyer,
        .order-delivery,
        .order-date,
        .order-total {
          font-size: 14px;
          color: #4b5563;
        }
        
        .order-delivery {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 8px 12px;
          border-radius: 8px;
          border-left: 3px solid #6366f1;
        }
        
        .order-items {
          font-size: 14px;
          color: #4b5563;
          background: #f9fafb;
          padding: 12px;
          border-radius: 8px;
        }
        
        .order-item {
          margin-top: 6px;
          color: #6b7280;
          font-size: 13px;
        }
        
        .order-total {
          font-size: 16px;
          font-weight: 700;
          color: #6366f1;
          padding-top: 8px;
          border-top: 2px solid #f3f4f6;
        }
        
        .order-id {
          font-size: 11px;
          color: #9ca3af;
          font-family: monospace;
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
