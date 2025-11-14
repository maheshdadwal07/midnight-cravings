import React, { useEffect, useState, useContext } from "react";
import api, { setToken } from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import toast from "react-hot-toast";
import Select from "react-select";
import Icon from "../components/Icon";

export default function SellerDashboard() {
  const { user } = useContext(AuthContext);
  const [sellerStatus, setSellerStatus] = useState(
    user?.sellerStatus || "pending_verification"
  );
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ productId: "", price: "", stock: "" });
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, listings, orders, requests
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Product Request Form State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    productName: "",
    category: "Snacks",
    description: "",
    image: null,
    suggestedPrice: "",
    stock: "",
  });

  // Helper to fix image URLs
  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/80";
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `http://localhost:5001${img}`;
    return `http://localhost:5001/uploads/${img}`;
  };

  // Set token for API requests
  useEffect(() => {
    if (user?.token) setToken(user.token);
  }, [user?.token]);

  // Fetch seller data
  useEffect(() => {
    let mounted = true;
    if (!user) return;

    async function loadData() {
      const results = await Promise.allSettled([
        api.get("/api/seller"),
        api.get("/api/orders/seller-orders"),
        api.get("/api/products/seller/all"), // Show all products for seller listing
        api.get("/api/notifications"),
        api.get("/api/notifications/unread-count"),
        api.get("/api/product-requests/my-requests"), // Fetch product requests
      ]);

      if (!mounted) return;

      const [sellerRes, ordersRes, productsRes, notificationsRes, unreadRes, requestsRes] = results;

      if (sellerRes.status === "fulfilled") setListings(sellerRes.value.data);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data);
      if (productsRes.status === "fulfilled")
        setProducts(productsRes.value.data);
      if (notificationsRes.status === "fulfilled")
        setNotifications(notificationsRes.value.data);
      if (unreadRes.status === "fulfilled")
        setUnreadCount(unreadRes.value.data.count);
      if (requestsRes.status === "fulfilled")
        setProductRequests(requestsRes.value.data);

      if (
        sellerRes.status !== "fulfilled" ||
        ordersRes.status !== "fulfilled" ||
        productsRes.status !== "fulfilled"
      ) {
        toast.error("Some data failed to load. Check console.");
        console.error("Seller API:", sellerRes.reason);
        console.error("Orders API:", ordersRes.reason);
        console.error("Products API:", productsRes.reason);
      }

      setLoading(false);
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const productOptions = products.map((p) => ({
    value: p._id,
    label: p.name,
    image: getImageUrl(p.image),
  }));

  // --- Guards ---
  if (!user)
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        Please login as a seller to view dashboard.
      </div>
    );
  if (user.role !== "seller")
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        This area is for sellers only.
      </div>
    );
  if (loading)
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        Loading your dashboard...
      </div>
    );
  if (sellerStatus !== "approved")
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Seller Dashboard</h2>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Your seller account is currently{" "}
          <strong>
            {sellerStatus === "pending_verification"
              ? "Pending Verification"
              : sellerStatus}
          </strong>
          .<br />
          Please wait for admin approval to access the full dashboard.
        </p>
      </div>
    );

  // --- Approved Seller Dashboard ---
  
  // Notification handlers
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // Calculate stats
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeListings = listings.filter((l) => l.stock > 0).length;
  const lowStock = listings.filter((l) => l.stock > 0 && l.stock < 5).length;

  return (
    <>
      <div style={styles.dashboardWrapper}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logoSection}>
              <span style={styles.logoIcon}><Icon name="store" size={24} color="#fff" /></span>
              <div>
                <h2 style={styles.sidebarTitle}>Seller Panel</h2>
                <p style={styles.sidebarSubtitle}>{user.shopName || "My Shop"}</p>
              </div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <SidebarItem
              icon={<Icon name="chart" size={18} />}
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              dataTab="overview"
            />
            <SidebarItem
              icon="�"
              label="My Listings"
              active={activeTab === "listings"}
              onClick={() => setActiveTab("listings")}
              dataTab="listings"
            />
            <SidebarItem
              icon={<Icon name="clipboard" size={18} />}
              label="Orders"
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              dataTab="orders"
            />
            <SidebarItem
              icon={<Icon name="plus" size={18} />}
              label="Product Requests"
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
              dataTab="requests"
              badge={productRequests.filter(r => r.status === "pending").length}
            />
          </nav>

          <div style={styles.sidebarFooter}>
            <div style={styles.sellerInfoCard}>
              <p style={styles.infoLabel}>Shop Location</p>
              <p style={styles.infoValue}>
                {user.hostelBlock || "Hostel"} - Room {user.roomNumber || "N/A"}
              </p>
              <p style={{ ...styles.infoLabel, marginTop: 12 }}>Status</p>
              <StatusBadge status={sellerStatus} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Stats Cards - Only show in Overview tab */}
          {activeTab === "overview" && (
            <div style={styles.statsGrid}>
              <StatCard
                title="Total Revenue"
                value={`₹${totalRevenue}`}
                icon={<Icon name="dollar" size={40} color="#fff" />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <StatCard
                title="Active Listings"
                value={activeListings}
                icon={<Icon name="package" size={40} color="#fff" />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
              <StatCard
                title="Pending Orders"
                value={pendingOrders}
                icon={<Icon name="bell" size={40} color="#fff" />}
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
              <StatCard
                title="Low Stock Alert"
                value={lowStock}
                icon={<Icon name="warning" size={40} color="#fff" />}
                gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
            </div>
          )}

          {/* Content Area */}
          <div style={styles.contentCard}>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>
                {activeTab === "overview" && <><Icon name="chart-bar" size={20} /> Dashboard Overview</>}
                {activeTab === "listings" && <><Icon name="package" size={20} /> Product Listings</>}
                {activeTab === "orders" && <><Icon name="clipboard-list" size={20} /> Order Management</>}
                {activeTab === "requests" && <><Icon name="plus-circle" size={20} /> Product Requests</>}
              </h2>
              
              {/* Notification Bell */}
              <div style={styles.notificationWrapper}>
                <button 
                  style={styles.notificationButton}
                  onClick={() => setShowNotifications(!showNotifications)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = styles.notificationButtonHover.background;
                    e.currentTarget.style.borderColor = styles.notificationButtonHover.borderColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = styles.notificationButton.background;
                    e.currentTarget.style.borderColor = styles.notificationButton.border.split(' ')[2];
                  }}
                >
                  <Icon name="bell" size={20} />
                  {unreadCount > 0 && (
                    <span style={styles.notificationBadge}>{unreadCount}</span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div style={styles.notificationDropdown}>
                    <div style={styles.notificationHeader}>
                      <h3 style={styles.notificationTitle}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          style={styles.markAllReadBtn}
                          onClick={handleMarkAllAsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div style={styles.notificationList}>
                      {notifications.length === 0 ? (
                        <div style={styles.emptyNotifications}>
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            style={{
                              ...styles.notificationItem,
                              background: notif.read ? '#fff' : '#f0f9ff'
                            }}
                          >
                            <div style={styles.notificationContent}>
                              <p style={styles.notificationMessage}>
                                {notif.message}
                              </p>
                              <p style={styles.notificationTime}>
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div style={styles.notificationActions}>
                              {!notif.read && (
                                <button 
                                  style={styles.markReadBtn}
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  title="Mark as read"
                                >
                                  ✓
                                </button>
                              )}
                              <button 
                                style={styles.deleteBtn}
                                onClick={() => handleDeleteNotification(notif._id)}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.contentBody}>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "listings" && renderListings()}
              {activeTab === "orders" && renderOrders()}
              {activeTab === "requests" && renderProductRequests()}
            </div>
          </div>
        </main>
      </div>

      {/* Add hover effects with style tag */}
      <style>{`
        /* Smooth transition for sidebar buttons */
        button[data-tab] {
          transition: box-shadow 0.2s ease !important;
        }
        
        /* Hover effect only for inactive buttons (transparent background) */
        button[data-tab]:not([style*="background: rgb(99, 102, 241)"]):not([style*="background:#6366f1"]):hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
          border-color: transparent !important;
          transform: none !important;
        }
        
        /* No hover effect for active buttons (purple background) */
        button[data-tab][style*="background: rgb(99, 102, 241)"]:hover,
        button[data-tab][style*="background:#6366f1"]:hover {
          background: #6366f1 !important;
          color: #ffffff !important;
          border-color: #6366f1 !important;
          box-shadow: none !important;
          transform: none !important;
        }
      `}</style>

      {/* Styles */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );

  // ==================== RENDER FUNCTIONS ====================

  function renderOverview() {
    const recentOrders = orders.slice(0, 5);
    const recentListings = listings.slice(0, 5);

    return (
      <div style={styles.overviewGrid}>
        {/* Recent Orders */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🕒 Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p style={styles.emptyText}>No orders yet</p>
          ) : (
            <div style={styles.orderList}>
              {recentOrders.map((o) => (
                <div key={o._id} style={styles.orderItem}>
                  <img
                    src={getImageUrl(o.sellerProduct_id?.product_id?.image)}
                    alt=""
                    style={styles.orderImage}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={styles.orderName}>
                      {o.sellerProduct_id?.product_id?.name}
                    </div>
                    <div style={styles.orderMeta}>
                      {o.user_id?.name} • Qty: {o.quantity}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><Icon name="fire" size={20} /> Your Top Listings</h3>
          {recentListings.length === 0 ? (
            <p style={styles.emptyText}>No listings yet</p>
          ) : (
            <div style={styles.productList}>
              {recentListings.map((l) => (
                <div key={l._id} style={styles.productItem}>
                  <img
                    src={getImageUrl(l.product_id?.image)}
                    alt=""
                    style={styles.productImage}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={styles.productName}>{l.product_id?.name}</div>
                    <div style={styles.productMeta}>
                      ₹{l.price} • Stock: {l.stock}
                    </div>
                  </div>
                  <StockBadge stock={l.stock} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderListings() {
    return (
      <div style={styles.listingsContainer}>
        {/* Create Listing Form */}
        <div style={styles.createCard}>
          <h3 style={styles.cardTitle}>➕ Create New Listing</h3>
          <div style={styles.createForm}>
            <Select
              options={productOptions}
              value={productOptions.find((opt) => opt.value === form.productId)}
              onChange={(selected) =>
                setForm((f) => ({ ...f, productId: selected?.value || "" }))
              }
              placeholder="Select Product"
              formatOptionLabel={({ label, image }) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={image}
                    alt={label}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <span>{label}</span>
                </div>
              )}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: 10,
                  border: "2px solid #e5e7eb",
                  padding: 4,
                }),
              }}
            />
            <div style={styles.formRow}>
              <input
                placeholder="Price (₹)"
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                style={styles.input}
              />
              <input
                placeholder="Stock Quantity"
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                style={styles.input}
              />
            </div>
            <button
              disabled={creating}
              onClick={handleCreateListing}
              style={styles.createBtn}
            >
              {creating ? "Creating..." : "🚀 Create Listing"}
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><Icon name="package" size={20} /> All Listings ({listings.length})</h3>
          {listings.length === 0 ? (
            <p style={styles.emptyText}>
              No listings yet. Create your first listing above!
            </p>
          ) : (
            <div style={styles.listingsGrid}>
              {listings.map((l) => (
                <ListingCard
                  key={l._id}
                  listing={l}
                  isEditing={editingId === l._id}
                  onEdit={() => setEditingId(l._id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={handleUpdateListing}
                  onDelete={handleDeleteListing}
                  savingId={savingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderOrders() {
    // Group orders by razorpay_order_id
    const ordersByRazorpayId = {};
    orders.forEach((order) => {
      const key = order.razorpay_order_id || order._id;
      if (!ordersByRazorpayId[key]) {
        ordersByRazorpayId[key] = [];
      }
      ordersByRazorpayId[key].push(order);
    });

    // Convert to array and sort by created date
    const groupedOrdersArray = Object.values(ordersByRazorpayId).sort((a, b) => {
      const dateA = new Date(a[0].createdAt);
      const dateB = new Date(b[0].createdAt);
      return dateB - dateA;
    });

    // Filter by status
    const groupedOrders = {
      pending: groupedOrdersArray.filter((group) => group[0].status === "pending"),
      accepted: groupedOrdersArray.filter((group) => group[0].status === "accepted"),
      completed: groupedOrdersArray.filter((group) => group[0].status === "completed"),
      cancelled: groupedOrdersArray.filter((group) => 
        group[0].status === "cancelled" || group[0].status === "rejected"
      ),
    };

    return (
      <div style={styles.ordersContainer}>
        {["pending", "accepted", "completed", "cancelled"].map((status) => (
          <div key={status} style={styles.orderSection}>
            <h3 style={styles.orderSectionTitle}>
              {status === "pending" && <Icon name="clock" size={20} />}
              {status === "accepted" && <Icon name="check-circle" size={20} />}
              {status === "completed" && <Icon name="check-circle" size={20} />}
              {status === "cancelled" && <Icon name="x-circle" size={20} />}{" "}
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {groupedOrders[status].length})
            </h3>
            {groupedOrders[status].length === 0 ? (
              <p style={styles.emptyText}>No {status} orders</p>
            ) : (
              <div style={styles.orderCards}>
                {groupedOrders[status].map((orderGroup, idx) => (
                  <OrderGroupCard
                    key={orderGroup[0].razorpay_order_id || orderGroup[0]._id}
                    orderGroup={orderGroup}
                    orderNumber={groupedOrders[status].length - idx}
                    onUpdateStatus={updateOrderGroup}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ==================== HANDLER FUNCTIONS ====================

  async function handleCreateListing() {
    if (!form.productId) return toast.error("Select a product");
    const priceNum = Number(form.price);
    const stockNum = Number(form.stock);
    if (isNaN(priceNum) || priceNum <= 0) return toast.error("Enter valid price");
    if (isNaN(stockNum) || stockNum < 0) return toast.error("Enter valid stock");

    try {
      setCreating(true);
      const res = await api.post(`/api/seller/${form.productId}`, {
        price: priceNum,
        stock: stockNum,
      });

      // Get the product details to merge with the response
      const product = products.find((p) => p._id === form.productId);
      
      // Create the new listing with complete data
      const newListing = {
        ...res.data,
        product_id: product // Ensure we have the product details
      };

      setListings((prev) => [newListing, ...prev]);
      setForm({ productId: "", price: "", stock: "" });
      toast.success("✅ Listing created successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateListing(listing) {
    const price = Number(listing._editPrice ?? listing.price);
    const stock = Number(listing._editStock ?? listing.stock);
    if (isNaN(price) || price <= 0) return toast.error("Enter valid price");
    if (isNaN(stock) || stock < 0) return toast.error("Enter valid stock");

    try {
      setSavingId(listing._id);
      const res = await api.patch(`/api/seller/${listing._id}`, { price, stock });

      // ✅ Merge locally so it updates immediately
      setListings((prev) =>
        prev.map((x) =>
          x._id === listing._id
            ? {
                ...x,
                price,
                stock,
                _editPrice: undefined,
                _editStock: undefined,
              }
            : x
        )
      );

      setEditingId(null);
      toast.success("✅ Listing updated!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteListing(id) {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/api/seller/${id}`);
      setListings((prev) => prev.filter((x) => x._id !== id));
      toast.success("🗑️ Listing deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  async function updateOrder(id, status) {
    try {
      const res = await api.patch(`/api/orders/${id}`, { status });
      setOrders((prev) => prev.map((x) => (x._id === id ? res.data.order : x)));
      toast.success(`Order ${status}!`);
    } catch {
      toast.error("Update failed");
    }
  }

  async function updateOrderGroup(orderGroup, status) {
    try {
      // Update all orders in the group
      const updatePromises = orderGroup.map((order) =>
        api.patch(`/api/orders/${order._id}`, { status })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const orderIds = orderGroup.map((o) => o._id);
      setOrders((prev) =>
        prev.map((x) => (orderIds.includes(x._id) ? { ...x, status } : x))
      );
      
      toast.success(`Order ${status}!`);
    } catch {
      toast.error("Update failed");
    }
  }

  // ==================== PRODUCT REQUESTS ====================
  
  function renderProductRequests() {
    const pendingRequests = productRequests.filter(r => r.status === "pending");
    const approvedRequests = productRequests.filter(r => r.status === "approved");
    const rejectedRequests = productRequests.filter(r => r.status === "rejected");

    return (
      <div>
        {/* Request New Product Button */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowRequestForm(true)}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.3)";
            }}
          >
            ➕ Request New Product
          </button>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowRequestForm(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "40px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "24px",
                }}
              >
                <Icon name="plus-circle" size={24} /> Request New Product
              </h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  formData.append("productName", requestForm.productName);
                  formData.append("category", requestForm.category);
                  formData.append("description", requestForm.description);
                  formData.append("suggestedPrice", requestForm.suggestedPrice);
                  formData.append("stock", requestForm.stock);
                  if (requestForm.image) {
                    formData.append("image", requestForm.image);
                  }

                  try {
                    const res = await api.post("/api/product-requests", formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    toast.success("Product request submitted!");
                    setProductRequests([res.data.productRequest, ...productRequests]);
                    setShowRequestForm(false);
                    setRequestForm({
                      productName: "",
                      category: "Snacks",
                      description: "",
                      image: null,
                      suggestedPrice: "",
                      stock: "",
                    });
                  } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to submit request");
                  }
                }}
              >
                <div style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={requestForm.productName}
                      onChange={(e) => setRequestForm({ ...requestForm, productName: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                      Category *
                    </label>
                    <select
                      value={requestForm.category}
                      onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Instant Food">Instant Food</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                      Description *
                    </label>
                    <textarea
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      required
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                      Product Image *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRequestForm({ ...requestForm, image: e.target.files[0] })}
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        Suggested Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={requestForm.suggestedPrice}
                        onChange={(e) => setRequestForm({ ...requestForm, suggestedPrice: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                        Initial Stock *
                      </label>
                      <input
                        type="number"
                        value={requestForm.stock}
                        onChange={(e) => setRequestForm({ ...requestForm, stock: e.target.value })}
                        required
                        min="1"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        background: "#fff",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: "12px",
                        border: "none",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Requests Lists */}
        <div style={{ display: "grid", gap: "24px" }}>
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#f59e0b" }}>
                <Icon name="clock" size={18} /> Pending Requests ({pendingRequests.length})
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {pendingRequests.map((req) => (
                  <ProductRequestCard key={req._id} request={req} />
                ))}
              </div>
            </div>
          )}

          {/* Approved Requests */}
          {approvedRequests.length > 0 && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#10b981" }}>
                <Icon name="check-circle" size={18} /> Approved Requests ({approvedRequests.length})
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {approvedRequests.map((req) => (
                  <ProductRequestCard key={req._id} request={req} />
                ))}
              </div>
            </div>
          )}

          {/* Rejected Requests */}
          {rejectedRequests.length > 0 && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#ef4444" }}>
                <Icon name="x-circle" size={18} /> Rejected Requests ({rejectedRequests.length})
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {rejectedRequests.map((req) => (
                  <ProductRequestCard key={req._id} request={req} />
                ))}
              </div>
            </div>
          )}

          {productRequests.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ marginBottom: "16px" }}><Icon name="package" size={64} /></div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>
                No product requests yet
              </h3>
              <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
                Request admin to add products that you want to sell
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function ProductRequestCard({ request }) {
    const statusColors = {
      pending: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
      approved: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
      rejected: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    };
    const colors = statusColors[request.status];

    return (
      <div
        style={{
          background: "#fff",
          border: `2px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          gap: "20px",
        }}
      >
        <img
          src={
            request.image
              ? request.image.startsWith('/uploads/')
                ? getImageUrl(request.image)
                : getImageUrl(`/uploads/${request.image}`)
              : "https://via.placeholder.com/100"
          }
          alt={request.productName}
          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
              {request.productName}
            </h4>
            <span
              style={{
                padding: "4px 12px",
                background: colors.bg,
                color: colors.text,
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "6px",
                textTransform: "capitalize",
              }}
            >
              {request.status}
            </span>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "12px" }}>
            {request.description}
          </p>
          <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#64748b" }}>
            <span><Icon name="package" size={14} /> {request.category}</span>
            <span><Icon name="dollar-sign" size={14} /> ₹{request.suggestedPrice}</span>
            <span><Icon name="bar-chart" size={14} /> Stock: {request.stock}</span>
          </div>
          {request.adminNote && (
            <div style={{ marginTop: "12px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
              <strong style={{ fontSize: "12px", color: "#64748b" }}>Admin Note:</strong>
              <p style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>{request.adminNote}</p>
            </div>
          )}
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#94a3b8" }}>
            Requested on {new Date(request.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  // ==================== HELPER COMPONENTS ====================

  function SidebarItem({ icon, label, active, onClick, dataTab, badge }) {
    return (
      <button
        style={active ? styles.sidebarItemActive : styles.sidebarItem}
        onClick={onClick}
        data-tab={dataTab}
      >
        <span style={styles.sidebarIcon}>{icon}</span>
        <span style={styles.sidebarLabel}>{label}</span>
        {badge > 0 && (
          <span
            style={{
              marginLeft: "auto",
              background: "#ef4444",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "700",
              padding: "2px 8px",
              borderRadius: "12px",
              minWidth: "20px",
              textAlign: "center",
            }}
          >
            {badge}
          </span>
        )}
        {active && <span style={styles.activeIndicator}></span>}
      </button>
    );
  }

  function StatCard({ title, value, icon, gradient }) {
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <div 
        style={{
          ...styles.statCard,
          ...(isHovered ? styles.statCardHover : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.statIcon}>{icon}</div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statTitle}>{title}</div>
      </div>
    );
  }

  function TabButton({ label, active, onClick, dataTab }) {
    return (
      <button
        style={active ? styles.tabActive : styles.tab}
        onClick={onClick}
        data-tab={dataTab}
      >
        {label}
      </button>
    );
  }

  function StatusBadge({ status }) {
    const colors = {
      pending: "#f59e0b",
      accepted: "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444",
      rejected: "#ef4444",
    };
    return (
      <span
        style={{
          ...styles.badge,
          background: colors[status] || "#6b7280",
        }}
      >
        {status}
      </span>
    );
  }

  function StockBadge({ stock }) {
    const color = stock === 0 ? "#ef4444" : stock < 5 ? "#f59e0b" : "#10b981";
    return (
      <span style={{ ...styles.badge, background: color }}>
        {stock === 0 ? "Out" : stock < 5 ? "Low" : "OK"}
      </span>
    );
  }

  function ListingCard({
    listing,
    isEditing,
    onEdit,
    onCancelEdit,
    onSave,
    onDelete,
    savingId,
  }) {
    const [editPrice, setEditPrice] = useState(listing.price);
    const [editStock, setEditStock] = useState(listing.stock);

    useEffect(() => {
      if (isEditing) {
        setEditPrice(listing.price);
        setEditStock(listing.stock);
      }
    }, [isEditing, listing.price, listing.stock]);

    return (
      <div style={styles.listingCard}>
        <img
          src={listing.product_id?.image
            ? getImageUrl(listing.product_id.image)
            : "https://via.placeholder.com/80"}
          alt=""
          style={styles.listingImage}
        />
        <div style={styles.listingContent}>
          <h4 style={styles.listingName}>{listing.product_id?.name}</h4>
          {isEditing ? (
            <div style={styles.editForm}>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price"
                style={styles.editInput}
              />
              <input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                placeholder="Stock"
                style={styles.editInput}
              />
              <div style={styles.editActions}>
                <button
                  onClick={() => onSave({ ...listing, _editPrice: editPrice, _editStock: editStock })}
                  disabled={savingId === listing._id}
                  style={styles.saveBtn}
                >
                  {savingId === listing._id ? "Saving..." : "Save"}
                </button>
                <button onClick={onCancelEdit} style={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.listingMeta}>
                <span>₹{listing.price}</span>
                <span>•</span>
                <span>Stock: {listing.stock}</span>
              </div>
              <div style={styles.listingActions}>
                <button onClick={onEdit} style={styles.editBtn}>
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(listing._id)}
                  style={styles.deleteBtnSecondary}
                >
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  function OrderGroupCard({ orderGroup, orderNumber, onUpdateStatus }) {
    const [showOtpModal, setShowOtpModal] = React.useState(false);
    const [otpInput, setOtpInput] = React.useState("");
    const [verifying, setVerifying] = React.useState(false);
    
    const firstOrder = orderGroup[0];
    const totalAmount = orderGroup.reduce((sum, order) => sum + order.totalPrice, 0);
    const customerName = firstOrder.buyerName || firstOrder.user_id?.name || "Unknown";
    const deliveryHostel = firstOrder.deliveryHostel || "Not provided";
    const deliveryRoom = firstOrder.deliveryRoom || "Not provided";
    const orderDate = new Date(firstOrder.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const handleCompleteClick = () => {
      // Check if order requires verification
      if (firstOrder.verificationCode && !firstOrder.isVerified) {
        setShowOtpModal(true);
      } else {
        // Old orders without verification can be completed directly
        onUpdateStatus(orderGroup, "completed");
      }
    };

    const handleVerifyAndComplete = async () => {
      if (!otpInput || otpInput.length !== 6) {
        toast.error("Please enter 6-digit verification code");
        return;
      }

      setVerifying(true);
      try {
        // Verify OTP for all orders in the group
        const verifyPromises = orderGroup.map((order) =>
          api.post(`/api/orders/${order._id}/verify-completion`, { 
            verificationCode: otpInput 
          })
        );
        
        await Promise.all(verifyPromises);
        
        // Update local state
        const orderIds = orderGroup.map((o) => o._id);
        setOrders((prev) =>
          prev.map((x) => 
            orderIds.includes(x._id) 
              ? { ...x, status: "completed", isVerified: true } 
              : x
          )
        );
        
        toast.success("Order completed successfully! 🎉");
        setShowOtpModal(false);
        setOtpInput("");
      } catch (error) {
        const message = error.response?.data?.message || "Invalid verification code";
        toast.error(message);
      } finally {
        setVerifying(false);
      }
    };

    return (
      <div style={styles.orderGroupCard}>
        {/* Order Header */}
        <div style={styles.orderGroupHeader}>
          <div>
            <h4 style={styles.orderGroupTitle}>
              Order #{orderNumber}
            </h4>
            <p style={styles.orderGroupMeta}>
              Customer: {customerName} • {orderDate}
            </p>
            <p style={{ ...styles.orderGroupMeta, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>📍</span>
              <strong>Delivery:</strong> {deliveryHostel}, Room {deliveryRoom}
            </p>
          </div>
          <div style={styles.orderGroupTotal}>
            ₹{totalAmount}
          </div>
        </div>

        {/* Order Items */}
        <div style={styles.orderItemsContainer}>
          {orderGroup.map((order) => (
            <div key={order._id} style={styles.orderItemCard}>
              <img
                src={getImageUrl(order.sellerProduct_id?.product_id?.image)}
                alt=""
                style={styles.orderItemImage}
              />
              <div style={styles.orderItemDetails}>
                <p style={styles.orderItemName}>
                  {order.sellerProduct_id?.product_id?.name}
                </p>
                <p style={styles.orderItemQty}>Qty: {order.quantity}</p>
              </div>
              <p style={styles.orderItemPrice}>₹{order.totalPrice}</p>
            </div>
          ))}
        </div>

        {/* Order Actions */}
        <div style={styles.orderCardActions}>
          {firstOrder.status === "pending" && (
            <>
              <button
                onClick={() => onUpdateStatus(orderGroup, "accepted")}
                style={styles.acceptBtn}
              >
                <Icon name="check" size={16} /> Accept Order
              </button>
              <button
                onClick={() => onUpdateStatus(orderGroup, "rejected")}
                style={styles.rejectBtn}
              >
                <Icon name="x" size={16} /> Reject Order
              </button>
            </>
          )}
          {firstOrder.status === "accepted" && (
            <button
              onClick={handleCompleteClick}
              style={styles.completeBtn}
            >
              <Icon name="party" size={16} /> Mark Complete
            </button>
          )}
        </div>

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowOtpModal(false)}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "40px",
                maxWidth: "480px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                animation: "slideIn 0.3s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔐</div>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: "8px",
                  }}
                >
                  Verify Order Completion
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                  Ask the customer for their 6-digit verification code
                  <br />
                  to complete this order safely
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "12px",
                  }}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtpInput(value);
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "24px",
                    fontWeight: "700",
                    textAlign: "center",
                    letterSpacing: "12px",
                    border: "3px solid #e2e8f0",
                    borderRadius: "12px",
                    outline: "none",
                    fontFamily: "monospace",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpInput("");
                  }}
                  disabled={verifying}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#64748b",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#ffffff";
                    e.target.style.borderColor = "#e2e8f0";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndComplete}
                  disabled={verifying || otpInput.length !== 6}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "12px",
                    background:
                      verifying || otpInput.length !== 6
                        ? "#cbd5e1"
                        : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    cursor: verifying || otpInput.length !== 6 ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow:
                      verifying || otpInput.length !== 6
                        ? "none"
                        : "0 4px 12px rgba(99, 102, 241, 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    if (!verifying && otpInput.length === 6) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      verifying || otpInput.length !== 6
                        ? "none"
                        : "0 4px 12px rgba(99, 102, 241, 0.4)";
                  }}
                >
                  {verifying ? "Verifying..." : "Complete Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// ==================== STYLES ====================
const styles = {
  // Main Layout
  dashboardWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#ffffff",
  },
  
  // Sidebar Styles - Light Theme
  sidebar: {
    width: 260,
    background: "#ffffff",
    boxShadow: "0 0 0 1px #e5e7eb",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "auto",
  },
  sidebarHeader: {
    padding: "20px 16px",
    borderBottom: "1px solid #e5e7eb",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    fontSize: 28,
    color: "#6366f1",
  },
  sidebarTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 2,
  },
  sidebarSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 500,
  },
  sidebarNav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#4b5563",
    position: "relative",
    textAlign: "left",
  },
  sidebarItemActive: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "#6366f1",
    border: "1px solid #6366f1",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff",
    position: "relative",
    textAlign: "left",
  },
  sidebarIcon: {
    fontSize: 18,
  },
  sidebarLabel: {
    flex: 1,
  },
  activeIndicator: {
    display: "none",
  },
  sidebarFooter: {
    padding: "16px 12px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  sellerInfoCard: {
    padding: 12,
    background: "#ffffff",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  },
  infoLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: 600,
  },

  // Main Content Area - Light Theme
  mainContent: {
    flex: 1,
    padding: 28,
    overflow: "auto",
    background: "#f9fafb",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#111827",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  statCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
    color: "#6366f1",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111827",
  },
  statTitle: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
  },
  contentCard: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  contentHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
  },
  notificationWrapper: {
    position: "relative",
  },
  notificationButton: {
    position: "relative",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: 18,
    color: "#6366f1",
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  notificationButtonHover: {
    background: "#f9fafb",
    borderColor: "#d1d5db",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
    border: "2px solid #fff",
  },
  notificationDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: 380,
    maxHeight: 480,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 1000,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  notificationHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f9fafb",
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  markAllReadBtn: {
    background: "transparent",
    border: "none",
    color: "#6366f1",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    transition: "all 0.2s",
  },
  notificationList: {
    maxHeight: 400,
    overflowY: "auto",
  },
  emptyNotifications: {
    padding: 40,
    textAlign: "center",
    color: "#9ca3af",
  },
  notificationItem: {
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    transition: "background 0.2s",
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    lineHeight: 1.5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  notificationActions: {
    display: "flex",
    gap: 8,
  },
  markReadBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    width: 28,
    height: 28,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    width: 28,
    height: 28,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  contentBody: {
    padding: 24,
    minHeight: 400,
  },

  // Legacy styles (keeping for compatibility)
  container: {
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "24px 20px",
  },
  header: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 20px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    transition: "all 0.2s ease",
  },
  tabActive: {
    padding: "10px 20px",
    border: "1px solid #6366f1",
    background: "#6366f1",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  tabContent: {
    minHeight: 400,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e5e7eb",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 14,
    color: "#111827",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: 24,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 15,
    textAlign: "center",
    padding: "32px 0",
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  orderItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    background: "#f9fafb",
    transition: "all 0.2s ease",
  },
  orderImage: {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: 10,
  },
  orderName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1f2937",
  },
  orderMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  productList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  productItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    background: "#f9fafb",
  },
  productImage: {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1f2937",
  },
  productMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  badge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
  },
  listingsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  createCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    border: "2px dashed #e5e7eb",
  },
  createForm: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    fontSize: 15,
    outline: "none",
    transition: "border 0.3s ease",
  },
  createBtn: {
    padding: 14,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  listingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  listingCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  listingCardHover: {
    borderColor: "#cbd5e1",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  listingImage: {
    width: "100%",
    height: 180,
    objectFit: "cover",
  },
  listingContent: {
    padding: 16,
  },
  listingName: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 8,
  },
  listingMeta: {
    fontSize: 14,
    color: "#6b7280",
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  listingActions: {
    display: "flex",
    gap: 8,
  },
  editBtn: {
    flex: 1,
    padding: 8,
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  editBtnHover: {
    background: "#e5e7eb",
  },
  deleteBtnSecondary: {
    flex: 1,
    padding: 8,
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  deleteBtnHover: {
    background: "#fecaca",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  editInput: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    fontSize: 14,
  },
  editActions: {
    display: "flex",
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    padding: 8,
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  saveBtnHover: {
    background: "#059669",
  },
  cancelBtn: {
    flex: 1,
    padding: 8,
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  cancelBtnHover: {
    background: "#e5e7eb",
  },
  ordersContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  orderSection: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  orderSectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    color: "#1f2937",
  },
  orderCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
  },
  orderCard: {
    border: "2px solid #f3f4f6",
    borderRadius: 12,
    padding: 16,
    background: "#fafafa",
  },
  orderGroupCard: {
    border: "2px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    background: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  orderGroupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: "2px solid #f3f4f6",
  },
  orderGroupTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
    marginBottom: 6,
  },
  orderGroupMeta: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
  orderGroupTotal: {
    fontSize: 24,
    fontWeight: 700,
    color: "#6366f1",
  },
  orderItemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  orderItemCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    background: "#f9fafb",
  },
  orderItemImage: {
    width: 60,
    height: 60,
    objectFit: "cover",
    borderRadius: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: 700,
    color: "#10b981",
    margin: 0,
  },
  orderCardHeader: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
  },
  orderCardImage: {
    width: 70,
    height: 70,
    objectFit: "cover",
    borderRadius: 10,
  },
  orderCardName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 4,
  },
  orderCardMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderCardPrice: {
    fontSize: 15,
    fontWeight: 700,
    color: "#10b981",
  },
  orderCardActions: {
    display: "flex",
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    padding: 10,
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  rejectBtn: {
    flex: 1,
    padding: 10,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  completeBtn: {
    width: "100%",
    padding: 10,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
