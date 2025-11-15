import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import api from "../services/api";
import ReviewModal from "../components/ReviewModal";
import toast from "react-hot-toast";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [availableSellers, setAvailableSellers] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  useEffect(() => {
    // Wait for auth to load before fetching
    if (authLoading) return;
    
    if (!user) {
      toast.error("Please login to view orders");
      navigate("/login");
      return;
    }

    fetchOrderDetails();
    fetchReviewedOrders();
  }, [orderId, user, authLoading]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Fetch all user orders and find the one matching the orderId
      const res = await api.get("/api/orders/my-orders");
      const allOrders = res.data;
      
      if (!allOrders || allOrders.length === 0) {
        toast.error("No orders found");
        setLoading(false);
        return;
      }
      
      // Group orders by razorpay_order_id
      const orderMap = new Map();
      allOrders.forEach((item) => {
        const orderKey = item.razorpay_order_id || item._id;
        
        if (!orderMap.has(orderKey)) {
          orderMap.set(orderKey, {
            _id: orderKey,
            orderId: orderKey,
            orderNumber: orderKey.slice(-8).toUpperCase(),
            createdAt: item.createdAt,
            acceptedAt: item.acceptedAt,
            completedAt: item.completedAt,
            cancelledAt: item.cancelledAt,
            status: item.status,
            paymentStatus: item.paymentStatus,
            verificationCode: item.verificationCode,
            isVerified: item.isVerified,
            deliveryAddress: `${item.deliveryHostel || 'Not provided'}, Room ${item.deliveryRoom || 'Not provided'}`,
            items: [],
            totalPrice: 0,
          });
        }

        const order = orderMap.get(orderKey);
        order.items.push({
          _id: item._id,
          product_id: item.sellerProduct_id?.product_id,
          sellerProduct_id: item.sellerProduct_id,
          quantity: item.quantity,
          price: item.sellerProduct_id?.price || 0,
          totalPrice: item.totalPrice || 0,
        });
        order.totalPrice += item.totalPrice || 0;
      });

      const groupedOrders = Array.from(orderMap.values());
      const foundOrder = groupedOrders.find(o => o._id === orderId || o.orderId === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
        setLoading(false);
      } else {
        console.log("Order not found. Looking for:", orderId);
        console.log("Available orders:", groupedOrders.map(o => ({ id: o._id, orderId: o.orderId })));
        setLoading(false);
        // Navigate back to orders if not found
        setTimeout(() => {
          toast.error("Order not found");
          navigate("/my-orders");
        }, 1000);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      if (err.response?.status === 401) {
        toast.error("Please login to view orders");
        navigate("/login");
      } else {
        toast.error("Failed to load order details");
      }
      setLoading(false);
    }
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
      // Don't show error toast for reviews, it's not critical
    }
  };

  const handleOpenReview = () => {
    if (!order) return;
    
    const sellers = [];
    const sellerMap = new Map();
    
    order.items.forEach(item => {
      if (item.sellerProduct_id?.seller_id) {
        const seller = item.sellerProduct_id.seller_id;
        const sellerId = seller._id;
        
        const pairKey = `${item._id}-${sellerId}`;
        if (!reviewedOrders.has(pairKey) && !sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            ...seller,
            orderItemId: item._id,
            products: []
          });
        }
        
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
    setSelectedSeller(uniqueSellers.length === 1 ? uniqueSellers[0] : null);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = async () => {
    await fetchReviewedOrders();
    
    if (availableSellers.length > 0) {
      const res = await api.get("/api/reviews/my-reviews");
      const freshReviewedPairs = new Set(
        res.data.map((r) => {
          const itemId = r.order_id._id || r.order_id;
          const sellerId = r.seller_id._id || r.seller_id;
          return `${itemId}-${sellerId}`;
        })
      );
      
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return { bg: "#fef3c7", color: "#d97706", label: "Pending" };
      case "accepted": return { bg: "#dbeafe", color: "#2563eb", label: "Preparing" };
      case "completed": return { bg: "#d1fae5", color: "#059669", label: "Completed" };
      case "cancelled": return { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" };
      case "rejected": return { bg: "#fee2e2", color: "#dc2626", label: "Rejected" };
      default: return { bg: "#f3f4f6", color: "#6b7280", label: status };
    }
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

  if (authLoading || loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Order not found</p>
      </div>
    );
  }

  const statusInfo = getStatusColor(order.status);

  // Get unique sellers for review button
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
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-orders")}
          style={{
            marginBottom: 20,
            padding: "10px 16px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          ← Back to Orders
        </button>

        {/* Order Header */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
                Order #{order.orderNumber}
              </h1>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div
              style={{
                padding: "8px 16px",
                background: statusInfo.bg,
                color: statusInfo.color,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {statusInfo.label}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, padding: 20, background: "#f9fafb", borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Amount</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>₹{order.totalPrice}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Items</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{order.items.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Delivery Address</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{order.deliveryAddress}</div>
            </div>
          </div>
        </div>

        {/* Verification Code / OTP */}
        {order.verificationCode && !order.isVerified && order.status !== "completed" && (
          <div style={{ background: "#fffbeb", border: "2px solid #fbbf24", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🔐</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#92400e" }}>Delivery OTP</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#d97706", letterSpacing: 4, marginBottom: 8 }}>
              {order.verificationCode}
            </div>
            <div style={{ fontSize: 13, color: "#78350f" }}>
              Share this OTP with the seller at delivery to complete your order
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Order Status</h3>
          
          <div style={{ position: "relative", paddingLeft: 32 }}>
            {[
              { status: "pending", label: "Order Placed", time: order.createdAt },
              { status: "accepted", label: "Preparing", time: order.acceptedAt },
              { status: "completed", label: "Completed", time: order.completedAt },
            ].map((step, idx) => {
              const isActive = 
                step.status === "pending" ||
                (step.status === "accepted" && ["accepted", "completed"].includes(order.status)) ||
                (step.status === "completed" && order.status === "completed");
              
              const isCancelled = order.status === "cancelled" || order.status === "rejected";
              
              return (
                <div key={idx} style={{ position: "relative", paddingBottom: idx < 2 ? 32 : 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: -32,
                      top: 0,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: isActive && !isCancelled ? statusInfo.color : "#e5e7eb",
                      border: `3px solid ${isActive && !isCancelled ? statusInfo.bg : "#f3f4f6"}`,
                    }}
                  />
                  {idx < 2 && (
                    <div
                      style={{
                        position: "absolute",
                        left: -25,
                        top: 16,
                        width: 2,
                        height: 32,
                        background: isActive && !isCancelled ? statusInfo.color : "#e5e7eb",
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "#111827" : "#9ca3af" }}>
                      {step.label}
                    </div>
                    {step.time && isActive && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {formatDate(step.time)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {(order.status === "cancelled" || order.status === "rejected") && (
              <div style={{ position: "relative", paddingTop: 16 }}>
                <div
                  style={{
                    position: "absolute",
                    left: -32,
                    top: 16,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#dc2626",
                    border: "3px solid #fee2e2",
                  }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#dc2626" }}>
                    {order.status === "cancelled" ? "Cancelled" : "Rejected"}
                  </div>
                  {order.cancelledAt && (
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {formatDate(order.cancelledAt)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>
              Items ({order.items.length})
            </h3>
            
            {order.status === "completed" && (
              <button
                onClick={handleOpenReview}
                disabled={allReviewed}
                style={{
                  padding: "8px 16px",
                  background: allReviewed ? "#9ca3af" : "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: allReviewed ? "not-allowed" : "pointer",
                  opacity: allReviewed ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!allReviewed) e.currentTarget.style.background = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  if (!allReviewed) e.currentTarget.style.background = "#6366f1";
                }}
              >
                {allReviewed ? '✓ Reviewed' : unreviewedSellerCount > 1 ? `Rate ${unreviewedSellerCount} Sellers` : 'Rate Seller'}
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {order.items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 16,
                  background: "#fafbfc",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
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
                    alt={item.product_id?.name || "Product"}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                    {item.product_id?.name || "Product"}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                    Quantity: {item.quantity} × ₹{item.price}
                  </div>
                  {item.sellerProduct_id?.seller_id && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 6, width: "fit-content" }}>
                      <span style={{ fontSize: 14 }}>👤</span>
                      <div style={{ fontSize: 13, color: "#374151" }}>
                        <span style={{ fontWeight: 600 }}>{item.sellerProduct_id.seller_id.name}</span>
                        {item.sellerProduct_id.seller_id.shopName && (
                          <span style={{ color: "#6b7280" }}> ({item.sellerProduct_id.seller_id.shopName})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#6366f1" }}>
                    ₹{item.totalPrice}
                  </div>
                  {order.status === "completed" && item.sellerProduct_id?.seller_id?._id && reviewedOrders.has(`${item._id}-${item.sellerProduct_id.seller_id._id}`) && (
                    <div style={{ 
                      padding: "4px 10px",
                      background: "#d1fae5",
                      color: "#059669",
                      borderRadius: 6,
                      fontSize: 12, 
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      ✓ Reviewed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
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
                  ...order,
                  _id: (selectedSeller || availableSellers[0]).orderItemId
                }}
                seller={selectedSeller || availableSellers[0]}
                onClose={() => {
                  setReviewModalOpen(false);
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
