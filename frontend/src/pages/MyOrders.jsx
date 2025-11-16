import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import Icon from "../components/Icon";
import ReviewModal from "../components/ReviewModal";
import toast from "react-hot-toast";

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [availableSellers, setAvailableSellers] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    fetchOrders();
    fetchReviewedOrders();
  }, [user]);

  const fetchOrders = () => {
    api
      .get("/api/orders/my-orders")
      .then((res) => {
        const groupedOrders = groupOrderItems(res.data);
        setOrders(groupedOrders);
      })
      .catch((err) => console.error(err));
  };

  const fetchReviewedOrders = async () => {
    try {
      const res = await api.get("/api/reviews/my-reviews");
      const reviewedPairs = new Set(
        res.data.map((r) => {
          const itemId = r.order_id._id || r.order_id;
          const sellerId = r.seller_id._id || r.seller_id;
          return `${itemId}-${sellerId}`;
        })
      );
      setReviewedOrders(reviewedPairs);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const handleOpenReview = (order) => {
    // Get unique sellers from this order
    const sellers = [];
    const sellerMap = new Map();
    
    order.items.forEach(item => {
      if (item.sellerProduct_id?.seller_id) {
        const seller = item.sellerProduct_id.seller_id;
        const sellerId = seller._id;
        
        // Check if already reviewed
        const pairKey = `${item._id}-${sellerId}`;
        if (!reviewedOrders.has(pairKey) && !sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            ...seller,
            orderItemId: item._id,
            products: []
          });
        }
        
        // Add product to seller's product list
        if (sellerMap.has(sellerId)) {
          sellerMap.get(sellerId).products.push({
            name: item.product_id?.name || 'Product',
            quantity: item.quantity
          });
        }
      }
    });
    
    const uniqueSellers = Array.from(sellerMap.values());
    
    if (uniqueSellers.length === 0) {
      toast.error("All sellers have been reviewed!");
      return;
    }
    
    setAvailableSellers(uniqueSellers);
    setSelectedOrderForReview(order);
    
    // Auto-select first seller if only one
    if (uniqueSellers.length === 1) {
      setSelectedSeller(uniqueSellers[0]);
    } else {
      setSelectedSeller(null);
    }
    
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = async () => {
    await fetchReviewedOrders();
    
    // Check if there are more unreviewed sellers in this order
    if (selectedOrderForReview && availableSellers.length > 0) {
      const res = await api.get("/api/reviews/my-reviews");
      const freshReviewedPairs = new Set(
        res.data.map((r) => {
          const itemId = r.order_id._id || r.order_id;
          const sellerId = r.seller_id._id || r.seller_id;
          return `${itemId}-${sellerId}`;
        })
      );
      
      // Find remaining unreviewed sellers
      const remainingSellers = availableSellers.filter(seller => {
        const pairKey = `${seller.orderItemId}-${seller._id}`;
        return !freshReviewedPairs.has(pairKey) && seller._id !== selectedSeller?._id;
      });
      
      if (remainingSellers.length > 0) {
        setAvailableSellers(remainingSellers);
        setSelectedSeller(remainingSellers.length === 1 ? remainingSellers[0] : null);
        toast.success("Review submitted! Please rate the next seller.");
      } else {
        toast.success("Thank you for your reviews!");
        setReviewModalOpen(false);
        setSelectedSeller(null);
        setAvailableSellers([]);
      }
    } else {
      toast.success("Thank you for your review!");
      setReviewModalOpen(false);
      setSelectedSeller(null);
      setAvailableSellers([]);
    }
  };



  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = searchQuery === "" || 
      order.items.some(item => 
        item.sellerProduct_id?.product_id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      `#${orders.length - orders.indexOf(order)}`.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    accepted: orders.filter(o => o.status === "accepted").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled" || o.status === "rejected").length,
  };

  const groupOrderItems = (orderItems) => {
    const orderMap = new Map();

    orderItems.forEach((item) => {
      const orderKey = item.razorpay_order_id || item._id;
      
      if (!orderMap.has(orderKey)) {
        orderMap.set(orderKey, {
          orderId: orderKey,
          createdAt: item.createdAt,
          status: item.status,
          paymentStatus: item.paymentStatus,
          verificationCode: item.verificationCode,
          isVerified: item.isVerified,
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
    <div style={{ padding: "24px 16px", maxWidth: 1100, margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#111827" }}>
            My Orders
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {orders.length > 0 && (
          <div style={{ position: "relative", width: "300px" }}>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#9ca3af",
                  padding: 4,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, flex: 1 }}>
            {[
              { key: "all", label: "All Orders", color: "#6b7280", bgColor: "#f3f4f6" },
              { key: "pending", label: "Pending", color: "#d97706", bgColor: "#fef3c7" },
              { key: "accepted", label: "Preparing", color: "#2563eb", bgColor: "#dbeafe" },
              { key: "completed", label: "Completed", color: "#059669", bgColor: "#d1fae5" },
              { key: "cancelled", label: "Cancelled", color: "#dc2626", bgColor: "#fee2e2" },
            ].map(({ key, label, color, bgColor }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  padding: "8px 14px",
                  background: filterStatus === key ? color : "#fff",
                  color: filterStatus === key ? "#fff" : color,
                  border: filterStatus === key ? "none" : `1px solid ${bgColor}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (filterStatus !== key) { e.currentTarget.style.background = bgColor; }
                }}
                onMouseLeave={(e) => {
                  if (filterStatus !== key) { e.currentTarget.style.background = "#fff"; }
                }}
              >
                {label} {statusCounts[key] > 0 && `(${statusCounts[key]})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>📦</div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#374151" }}>No orders yet</p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#9ca3af" }}>
            Start ordering delicious food!
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>🔍</div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#374151" }}>No orders found</p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#9ca3af" }}>
            Try adjusting your filters or search
          </p>
        </div>
      ) : (
        <>
        {(searchQuery || filterStatus !== "all") && (
          <div style={{ marginBottom: 12, fontSize: 13, color: "#6b7280" }}>
            Showing {filteredOrders.length} of {orders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </div>
        )}
        
        <div style={{ display: "grid", gap: 14 }}>
          {filteredOrders.map((order, idx) => {
            const orderNumber = orders.length - orders.indexOf(order);
            return (
            <div
              key={order.orderId}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => navigate(`/order/${order.orderId}`)}
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  background: "#fff",
                  transition: "background 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fafbfc";
                  e.currentTarget.parentElement.style.transform = "translateY(-2px)";
                  e.currentTarget.parentElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.parentElement.style.transform = "translateY(0)";
                  e.currentTarget.parentElement.style.boxShadow = "none";
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                      Order #{orderNumber}
                    </div>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: 5,
                        background: order.status === "pending"
                          ? "#d97706"
                          : order.status === "accepted"
                          ? "#2563eb"
                          : order.status === "completed"
                          ? "#059669"
                          : order.status === "cancelled" || order.status === "rejected"
                          ? "#dc2626"
                          : "#6b7280",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                    {formatDate(order.createdAt)} • {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {order.items.slice(0, 3).map((item, i) => (
                      item.sellerProduct_id?.product_id?.image && (
                        <img
                          key={i}
                          src={
                            item.sellerProduct_id.product_id.image.startsWith('http')
                              ? item.sellerProduct_id.product_id.image
                              : item.sellerProduct_id.product_id.image.startsWith('/')
                              ? `http://localhost:5001${item.sellerProduct_id.product_id.image}`
                              : `http://localhost:5001/uploads/${item.sellerProduct_id.product_id.image}`
                          }
                          alt=""
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      )
                    ))}
                    {order.items.length > 3 && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#6b7280",
                        }}
                      >
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                      ₹{order.totalAmount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
        </>
      )}

      {reviewModalOpen && selectedOrderForReview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => {
            setReviewModalOpen(false);
            setSelectedOrderForReview(null);
            setSelectedSeller(null);
            setAvailableSellers([]);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
                Rate Seller
              </h3>
              <button
                onClick={() => {
                  setReviewModalOpen(false);
                  setSelectedOrderForReview(null);
                  setSelectedSeller(null);
                  setAvailableSellers([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {availableSellers.length > 1 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  Select Seller to Review
                </label>
                <select
                  value={selectedSeller?._id || ""}
                  onChange={(e) => {
                    const seller = availableSellers.find(s => s._id === e.target.value);
                    setSelectedSeller(seller || null);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 14,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Choose a seller...</option>
                  {availableSellers.map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.name} {seller.shopName ? `(${seller.shopName})` : ''} - {seller.products.length} item{seller.products.length > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                
                {selectedSeller && (
                  <div style={{ marginTop: 12, padding: 12, background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                      Products from this seller:
                    </div>
                    {selectedSeller.products.map((product, idx) => (
                      <div key={idx} style={{ color: "#6b7280", marginLeft: 8 }}>
                        • {product.name} (x{product.quantity})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {availableSellers.length === 1 && (
              <div style={{ marginBottom: 20, padding: 16, background: "#f9fafb", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {availableSellers[0].name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                      {availableSellers[0].name}
                    </div>
                    {availableSellers[0].shopName && (
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {availableSellers[0].shopName}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginLeft: 8 }}>
                  <strong>Products:</strong>
                  {availableSellers[0].products.map((product, idx) => (
                    <div key={idx} style={{ marginLeft: 8, marginTop: 4 }}>
                      • {product.name} (x{product.quantity})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedSeller || availableSellers.length === 1) && (
              <ReviewModal
                order={{
                  ...selectedOrderForReview,
                  _id: (selectedSeller || availableSellers[0]).orderItemId
                }}
                seller={selectedSeller || availableSellers[0]}
                onClose={() => {
                  setReviewModalOpen(false);
                  setSelectedOrderForReview(null);
                  setSelectedSeller(null);
                  setAvailableSellers([]);
                }}
                onSuccess={handleReviewSuccess}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
