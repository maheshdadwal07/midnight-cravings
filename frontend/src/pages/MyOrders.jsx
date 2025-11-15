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
  const [expandedOrders, setExpandedOrders] = useState(new Set());
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

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
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
          
          {filteredOrders.length > 0 && (
            <button
              onClick={() => {
                if (expandedOrders.size === filteredOrders.length) {
                  setExpandedOrders(new Set());
                } else {
                  setExpandedOrders(new Set(filteredOrders.map(o => o.orderId)));
                }
              }}
              style={{
                padding: "8px 14px",
                background: "#fff",
                color: "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              {expandedOrders.size === filteredOrders.length ? "Collapse All" : "Expand All"}
            </button>
          )}
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
            const isExpanded = expandedOrders.has(order.orderId);
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
                onClick={() => toggleOrderExpand(order.orderId)}
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  background: isExpanded ? "#fafbfc" : "#fff",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.currentTarget.style.background = "#fafbfc";
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.currentTarget.style.background = "#fff";
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
                  {!isExpanded && (
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
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/order/${order.orderId}`);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#6366f1",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
                  >
                    View Details
                  </button>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                      ₹{order.totalAmount}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: "#9ca3af",
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </div>
                </div>
              </div>

              <div
                style={{
                  maxHeight: isExpanded ? "2000px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease-in-out",
                }}
              >
              <div 
                style={{ 
                  padding: "20px 18px", 
                  background: "#fafbfc",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 16 }}>
                  Order Status
                </div>
                
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "calc(16.66% + 8px)",
                      right: "calc(16.66% + 8px)",
                      height: "3px",
                      background: "#e5e7eb",
                      borderRadius: "2px",
                      zIndex: 0,
                    }}
                  />
                  
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "calc(16.66% + 8px)",
                      width: (() => {
                        const statuses = ["pending", "accepted", "completed"];
                        if (order.status === "cancelled" || order.status === "rejected") {
                          return "33.33%";
                        }
                        const currentIndex = statuses.indexOf(order.status);
                        if (currentIndex === -1) return "0%";
                        const total = statuses.length - 1;
                        return `calc(${(currentIndex / total) * 100}% - ${((currentIndex / total) * 16.66)}%)`;
                      })(),
                      height: "3px",
                      background: order.status === "rejected" || order.status === "cancelled" 
                        ? "#dc2626"
                        : order.status === "completed"
                        ? "#059669"
                        : order.status === "accepted"
                        ? "#2563eb"
                        : "#d97706",
                      borderRadius: "2px",
                      zIndex: 0,
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                  {["pending", "accepted", "completed"].map((status, idx) => {
                    const statuses = ["pending", "accepted", "completed"];
                    const currentStatusIndex = statuses.indexOf(order.status);
                    const isActive = order.status === status;
                    const isPassed = currentStatusIndex > idx;
                    const isRejected = (order.status === "cancelled" || order.status === "rejected");

                    return (
                      <div
                        key={status}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: 1,
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: isRejected && idx === 1
                              ? "#dc2626"
                              : status === "completed" && (isActive || isPassed)
                              ? "#059669"
                              : status === "accepted" && (isActive || isPassed)
                              ? "#2563eb"
                              : status === "pending" && (isActive || isPassed)
                              ? "#d97706"
                              : "#fff",
                            border: isActive || isPassed || (isRejected && idx === 1) ? "none" : "3px solid #d1d5db",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "12px",
                          }}
                        >
                          {isPassed && !isActive ? (
                            <span style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>✓</span>
                          ) : isRejected && status === "accepted" ? (
                            <span style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>✕</span>
                          ) : (
                            <span style={{ color: isActive || isPassed ? "#fff" : "#9ca3af", fontSize: "18px", fontWeight: "bold" }}>
                              {isPassed || isActive ? "✓" : ""}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: isActive ? 600 : 500,
                            color: isActive
                              ? status === "completed"
                                ? "#059669"
                                : status === "accepted"
                                ? "#2563eb"
                                : "#d97706"
                              : isPassed || (isRejected && status === "accepted")
                              ? "#374151" 
                              : "#9ca3af",
                            textAlign: "center",
                            maxWidth: "80px",
                          }}
                        >
                          {isRejected && status === "accepted" 
                            ? order.status === "cancelled" ? "Cancelled" : "Rejected"
                            : status === "pending" 
                            ? "Placed" 
                            : status === "accepted"
                            ? "Preparing"
                            : "Delivered"}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>

              {order.verificationCode && !order.isVerified && order.status !== "completed" && (
                <div 
                  style={{ 
                    padding: "18px",
                    background: "#fffbeb",
                    borderBottom: "1px solid #fde68a",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 10 }}>
                    🔐 Verification Code
                  </div>
                  
                  <div
                    style={{
                      background: "#fff",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "2px dashed #fbbf24",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#f59e0b",
                        letterSpacing: "6px",
                        fontFamily: "monospace",
                        marginBottom: "8px",
                      }}
                    >
                      {order.verificationCode}
                    </div>
                    
                    <div style={{ fontSize: "12px", color: "#78350f", fontWeight: 500 }}>
                      Share this code with seller at delivery
                    </div>
                  </div>
                </div>
              )}

              <div style={{ padding: "18px" }}>
                <div
                  style={{
                    marginBottom: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#6b7280",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Items ({order.items.length})</span>
                  {order.status === "completed" && (() => {
                    // Get unique unreviewed sellers
                    const sellerMap = new Map();
                    order.items.forEach(item => {
                      if (item.sellerProduct_id?.seller_id) {
                        const sellerId = item.sellerProduct_id.seller_id._id;
                        const pairKey = `${item._id}-${sellerId}`;
                        if (!reviewedOrders.has(pairKey)) {
                          sellerMap.set(sellerId, item);
                        }
                      }
                    });
                    
                    const unreviewedSellerCount = sellerMap.size;
                    const allReviewed = unreviewedSellerCount === 0;
                    
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (allReviewed) return;
                          handleOpenReview(order);
                        }}
                        style={{
                          padding: "6px 14px",
                          background: allReviewed ? "#9ca3af" : "#6366f1",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: allReviewed ? "not-allowed" : "pointer",
                          boxShadow: allReviewed ? "none" : "0 2px 4px rgba(99, 102, 241, 0.2)",
                          transition: "all 0.2s ease",
                          opacity: allReviewed ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!allReviewed) {
                            e.currentTarget.style.background = "#4f46e5";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(99, 102, 241, 0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!allReviewed) {
                            e.currentTarget.style.background = "#6366f1";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(99, 102, 241, 0.2)";
                          }
                        }}
                        disabled={allReviewed}
                      >
                        {allReviewed ? '✓ Reviewed' : unreviewedSellerCount > 1 ? `Rate ${unreviewedSellerCount} Sellers` : 'Rate Seller'}
                      </button>
                    );
                  })()}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {order.items.map((item, itemIdx) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px",
                        background: "#fafbfc",
                        borderRadius: 8,
                        gap: "12px",
                        border: "1px solid #f3f4f6",
                      }}
                    >
                      {item.sellerProduct_id?.product_id?.image && (
                        <img
                          src={
                            item.sellerProduct_id.product_id.image.startsWith('http')
                              ? item.sellerProduct_id.product_id.image
                              : item.sellerProduct_id.product_id.image.startsWith('/')
                              ? `http://localhost:5001${item.sellerProduct_id.product_id.image}`
                              : `http://localhost:5001/uploads/${item.sellerProduct_id.product_id.image}`
                          }
                          alt={item.sellerProduct_id?.product_id?.name || "Product"}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 4 }}>
                          {item.sellerProduct_id?.product_id?.name || "Product"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
                          Qty: {item.quantity}
                        </div>
                        {item.sellerProduct_id?.seller_id && (
                          <div style={{ 
                            fontSize: 11, 
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 4,
                          }}>
                            <span style={{ opacity: 0.7 }}>👤</span>
                            <span style={{ fontWeight: 500 }}>
                              {item.sellerProduct_id.seller_id.name}
                              {item.sellerProduct_id.seller_id.shopName && (
                                <span style={{ opacity: 0.7 }}> ({item.sellerProduct_id.seller_id.shopName})</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#6366f1", whiteSpace: "nowrap" }}>
                          ₹{item.totalPrice}
                        </div>
                        {order.status === "completed" && item.sellerProduct_id?.seller_id?._id && reviewedOrders.has(`${item._id}-${item.sellerProduct_id.seller_id._id}`) && (
                          <div style={{ 
                            padding: "4px 8px",
                            background: "#d1fae5",
                            color: "#059669",
                            borderRadius: 5,
                            fontSize: 11, 
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Reviewed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
