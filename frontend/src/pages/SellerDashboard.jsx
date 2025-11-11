import React, { useEffect, useState, useContext } from "react";
import api, { setToken } from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import toast from "react-hot-toast";
import Select from "react-select";

export default function SellerDashboard() {
  const { user } = useContext(AuthContext);
  const [sellerStatus, setSellerStatus] = useState(
    user?.sellerStatus || "pending_verification"
  );
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ productId: "", price: "", stock: "" });
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, listings, orders

  // Helper to fix image URLs
  const getImageUrl = (img) =>
    img ? `http://localhost:5001${img}` : "https://via.placeholder.com/80";

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
      ]);

      if (!mounted) return;

      const [sellerRes, ordersRes, productsRes] = results;

      if (sellerRes.status === "fulfilled") setListings(sellerRes.value.data);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data);
      if (productsRes.status === "fulfilled")
        setProducts(productsRes.value.data);

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
              <span style={styles.logoIcon}>🏪</span>
              <div>
                <h2 style={styles.sidebarTitle}>Seller Panel</h2>
                <p style={styles.sidebarSubtitle}>{user.shopName || "My Shop"}</p>
              </div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <SidebarItem
              icon="📊"
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
              icon="📋"
              label="Orders"
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              dataTab="orders"
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
                icon="💰"
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <StatCard
                title="Active Listings"
                value={activeListings}
                icon="📦"
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
              <StatCard
                title="Pending Orders"
                value={pendingOrders}
                icon="🔔"
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
              <StatCard
                title="Low Stock Alert"
                value={lowStock}
                icon="⚠️"
                gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
            </div>
          )}

          {/* Content Area */}
          <div style={styles.contentCard}>
            <div style={styles.contentHeader}>
              <h2 style={styles.contentTitle}>
                {activeTab === "overview" && "📊 Dashboard Overview"}
                {activeTab === "listings" && "📦 Product Listings"}
                {activeTab === "orders" && "📋 Order Management"}
              </h2>
            </div>

            <div style={styles.contentBody}>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "listings" && renderListings()}
              {activeTab === "orders" && renderOrders()}
            </div>
          </div>
        </main>
      </div>

      {/* Add hover effects with style tag */}
      <style>{`
        button[data-tab]:not([data-tab=""]):hover {
          background: rgba(99, 102, 241, 0.1) !important;
          transform: translateX(4px);
        }
        
        div[style*="statCard"]:hover {
          transform: translateY(-4px) scale(1.02);
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
          <h3 style={styles.cardTitle}>🔥 Your Top Listings</h3>
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
          <h3 style={styles.cardTitle}>📦 All Listings ({listings.length})</h3>
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
              {status === "pending" && "⏳"}
              {status === "accepted" && "✅"}
              {status === "completed" && "🎉"}
              {status === "cancelled" && "❌"}{" "}
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

  // ==================== HELPER COMPONENTS ====================

  function SidebarItem({ icon, label, active, onClick, dataTab }) {
    return (
      <button
        style={active ? styles.sidebarItemActive : styles.sidebarItem}
        onClick={onClick}
        data-tab={dataTab}
      >
        <span style={styles.sidebarIcon}>{icon}</span>
        <span style={styles.sidebarLabel}>{label}</span>
        {active && <span style={styles.activeIndicator}></span>}
      </button>
    );
  }

  function StatCard({ title, value, icon, gradient }) {
    return (
      <div style={{ ...styles.statCard, background: gradient }}>
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
            ? `http://localhost:5001${listing.product_id.image}`
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
                  style={styles.deleteBtn}
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
    const firstOrder = orderGroup[0];
    const totalAmount = orderGroup.reduce((sum, order) => sum + order.totalPrice, 0);
    const customerName = firstOrder.user_id?.name || "Unknown";
    const orderDate = new Date(firstOrder.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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
          </div>
          <div style={styles.orderGroupTotal}>
            ₹{totalAmount}
          </div>
        </div>

        {/* Order Items */}
        <div style={styles.orderItemsContainer}>
          {orderGroup.map((order) => (
            <div key={order._id} style={styles.orderItem}>
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
                ✅ Accept Order
              </button>
              <button
                onClick={() => onUpdateStatus(orderGroup, "rejected")}
                style={styles.rejectBtn}
              >
                ❌ Reject Order
              </button>
            </>
          )}
          {firstOrder.status === "accepted" && (
            <button
              onClick={() => onUpdateStatus(orderGroup, "completed")}
              style={styles.completeBtn}
            >
              🎉 Mark Complete
            </button>
          )}
        </div>
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
    background: "#f8fafc",
  },
  
  // Sidebar Styles
  sidebar: {
    width: 280,
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "auto",
  },
  sidebarHeader: {
    padding: "24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    fontSize: 36,
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 4,
  },
  sidebarSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  sidebarNav: {
    flex: 1,
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: "transparent",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 500,
    color: "#cbd5e1",
    transition: "all 0.3s ease",
    position: "relative",
    textAlign: "left",
  },
  sidebarItemActive: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: "rgba(99, 102, 241, 0.15)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    boxShadow: "0 4px 16px rgba(99,102,241,0.2)",
    position: "relative",
    textAlign: "left",
  },
  sidebarIcon: {
    fontSize: 20,
  },
  sidebarLabel: {
    flex: 1,
  },
  activeIndicator: {
    width: 4,
    height: 20,
    background: "#6366f1",
    borderRadius: 4,
    position: "absolute",
    right: 8,
  },
  sidebarFooter: {
    padding: "20px 12px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  sellerInfoCard: {
    padding: 16,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: "#fff",
    fontWeight: 500,
  },

  // Main Content Area
  mainContent: {
    flex: 1,
    padding: 32,
    overflow: "auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    padding: 24,
    borderRadius: 16,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    transition: "transform 0.3s ease",
    cursor: "pointer",
  },
  statIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.9,
    fontWeight: 500,
  },
  contentCard: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  contentHeader: {
    padding: "24px 32px",
    borderBottom: "2px solid #f1f5f9",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
  },
  contentBody: {
    padding: 32,
    minHeight: 400,
  },

  // Legacy styles (keeping for compatibility)
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "32px 24px",
  },
  header: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  tabs: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tab: {
    padding: "12px 24px",
    border: "2px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    color: "#6b7280",
    transition: "all 0.3s ease",
  },
  tabActive: {
    padding: "12px 24px",
    border: "2px solid #6366f1",
    background: "#6366f1",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  tabContent: {
    minHeight: 400,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
    color: "#1f2937",
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
    border: "2px solid #f3f4f6",
    borderRadius: 14,
    overflow: "hidden",
    transition: "all 0.3s ease",
    cursor: "pointer",
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
  },
  deleteBtn: {
    flex: 1,
    padding: 8,
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
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
  orderItem: {
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
