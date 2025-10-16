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

  // Helper to fix image URLs
  const getImageUrl = (img) =>
    img ? `http://localhost:5000${img}` : "https://via.placeholder.com/60";

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
        api.get("/api/products"),
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
  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Seller Dashboard</h2>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Manage your listings and recent orders below.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 20,
          marginTop: 16,
        }}
      >
        {/* LISTINGS SECTION */}
        <section
          style={{
            background: "#fff",
            padding: 18,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
          }}
        >
          <h3 style={{ fontWeight: 700 }}>Your Listings</h3>

          {listings.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No listings yet.</p>
          ) : (
            <ul style={{ marginTop: 12 }}>
              {listings.map((l) => {
                const isEditing = editingId === l._id;
                return (
                  <li
                    key={l._id}
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <img
                      src={getImageUrl(l.product_id?.image)}
                      alt={l.product_id?.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>
                        {l.product_id?.name}
                      </div>
                      <div style={{ color: "#6b7280" }}>
                        Hostel: {l.hostel || "—"}
                      </div>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          <input
                            type="number"
                            value={l._editPrice ?? l.price}
                            onChange={(e) =>
                              setListings((prev) =>
                                prev.map((x) =>
                                  x._id === l._id
                                    ? { ...x, _editPrice: e.target.value }
                                    : x
                                )
                              )
                            }
                            style={{
                              width: 100,
                              padding: 6,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                            placeholder="Price"
                          />
                          <input
                            type="number"
                            value={l._editStock ?? l.stock}
                            onChange={(e) =>
                              setListings((prev) =>
                                prev.map((x) =>
                                  x._id === l._id
                                    ? { ...x, _editStock: e.target.value }
                                    : x
                                )
                              )
                            }
                            style={{
                              width: 100,
                              padding: 6,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                            placeholder="Stock"
                          />
                        </div>
                      ) : (
                        <div style={{ color: "#6b7280", marginTop: 6 }}>
                          Stock: {l.stock}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {isEditing ? (
                        <>
                          <button
                            onClick={async () => {
                              const price = Number(l._editPrice ?? l.price);
                              const stock = Number(l._editStock ?? l.stock);
                              if (isNaN(price) || price <= 0)
                                return toast.error("Enter valid price");
                              if (isNaN(stock) || stock < 0)
                                return toast.error("Enter valid stock");
                              try {
                                setSavingId(l._id);
                                const res = await api.patch(
                                  `/api/seller/${l._id}`,
                                  { price, stock }
                                );
                                setListings((prev) =>
                                  prev.map((x) =>
                                    x._id === l._id ? res.data.listing : x
                                  )
                                );
                                setEditingId(null);
                                toast.success("Listing updated");
                              } catch (e) {
                                toast.error(
                                  e.response?.data?.message || "Update failed"
                                );
                              } finally {
                                setSavingId(null);
                              }
                            }}
                            disabled={savingId === l._id}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              background: "#10b981",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(l._id)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete listing?")) return;
                              try {
                                await api.delete(`/api/seller/${l._id}`);
                                setListings((prev) =>
                                  prev.filter((x) => x._id !== l._id)
                                );
                                toast.success("Listing deleted");
                              } catch {
                                toast.error("Delete failed");
                              }
                            }}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* CREATE LISTING */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>
              Create a Listing
            </h4>

            <Select
              options={productOptions}
              value={productOptions.find((opt) => opt.value === form.productId)}
              onChange={(selected) =>
                setForm((f) => ({ ...f, productId: selected.value }))
              }
              formatOptionLabel={({ label, image }) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={image}
                    alt={label}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <span>{label}</span>
                </div>
              )}
            />

            <input
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
                marginTop: 8,
              }}
            />
            <input
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
              }}
            />

            <button
              disabled={creating}
              onClick={async () => {
                if (!form.productId) return toast.error("Select product");
                const priceNum = Number(form.price);
                const stockNum = Number(form.stock);
                if (isNaN(priceNum) || priceNum <= 0)
                  return toast.error("Enter valid price");
                if (isNaN(stockNum) || stockNum < 0)
                  return toast.error("Enter valid stock");

                try {
                  setCreating(true);
                  const res = await api.post(`/api/seller/${form.productId}`, {
                    price: priceNum,
                    stock: stockNum,
                  });
                  setListings((l) => [res.data, ...l]);
                  setForm({ productId: "", price: "", stock: "" });
                  toast.success("Listing created");
                } catch (e) {
                  toast.error(e.response?.data?.message || "Create failed");
                } finally {
                  setCreating(false);
                }
              }}
              style={{
                padding: 10,
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              {creating ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </section>

        {/* ORDERS SECTION */}
        <section
          style={{
            background: "#fff",
            padding: 18,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
          }}
        >
          <h3 style={{ fontWeight: 700 }}>Recent Orders</h3>
          {orders.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No orders yet.</p>
          ) : (
            <ul style={{ marginTop: 12 }}>
              {orders.slice(0, 6).map((o) => (
                <li
                  key={o._id}
                  style={{
                    paddingBottom: 10,
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <img
                    src={getImageUrl(o.sellerProduct_id?.product_id?.image)}
                    alt={o.sellerProduct_id?.product_id?.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      {o.sellerProduct_id?.product_id?.name}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      Buyer: {o.user_id?.name} — Qty: {o.quantity}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}
                    >
                      Status: <strong>{o.status}</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={async () => updateOrder(o._id, "accepted")}
                      style={{ padding: 6, borderRadius: 6 }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => updateOrder(o._id, "completed")}
                      style={{ padding: 6, borderRadius: 6 }}
                    >
                      Complete
                    </button>
                    <button
                      onClick={async () => updateOrder(o._id, "cancelled")}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );

  async function updateOrder(id, status) {
    try {
      const res = await api.patch(`/api/orders/${id}`, { status });
      setOrders((prev) => prev.map((x) => (x._id === id ? res.data.order : x)));
      toast.success(`Order ${status}`);
    } catch {
      toast.error("Update failed");
    }
  }
}
