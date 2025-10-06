import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import toast from "react-hot-toast";
import Modal from "../components/Modal";

// ---------------- PRODUCT ITEM ----------------
function ProductItem({
  product,
  onEditToggle,
  onUpdate,
  onDelete,
  setProducts,
}) {
  return (
    <li className="item">
      {product._editing ? (
        <div className="formGrid">
          <input
            value={product._editName}
            onChange={(e) =>
              setProducts((prev) =>
                prev.map((x) =>
                  x._id === product._id
                    ? { ...x, _editName: e.target.value }
                    : x
                )
              )
            }
            placeholder="Name"
            className="input"
          />
          <input
            value={product._editCategory}
            onChange={(e) =>
              setProducts((prev) =>
                prev.map((x) =>
                  x._id === product._id
                    ? { ...x, _editCategory: e.target.value }
                    : x
                )
              )
            }
            placeholder="Category"
            className="input"
          />
          <input
            value={product._editHostel}
            onChange={(e) =>
              setProducts((prev) =>
                prev.map((x) =>
                  x._id === product._id
                    ? { ...x, _editHostel: e.target.value }
                    : x
                )
              )
            }
            placeholder="Hostel"
            className="input"
          />
          <textarea
            value={product._editDescription}
            onChange={(e) =>
              setProducts((prev) =>
                prev.map((x) =>
                  x._id === product._id
                    ? { ...x, _editDescription: e.target.value }
                    : x
                )
              )
            }
            rows={3}
            placeholder="Description"
            className="input"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setProducts((prev) =>
                prev.map((x) =>
                  x._id === product._id
                    ? { ...x, _editImageFile: e.target.files[0] }
                    : x
                )
              )
            }
          />
          {product._editImageFile && (
            <img
              src={URL.createObjectURL(product._editImageFile)}
              alt="preview"
              className="preview"
            />
          )}
          <div className="actions">
            <button className="btn btnGreen" onClick={() => onUpdate(product)}>
              Save
            </button>
            <button
              className="btn btnGray"
              onClick={() => onEditToggle(product._id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flexBetween">
          <div>
            <div className="bold">{product.name}</div>
            <div className="textGray">{product.description}</div>
            <div className="smallText">Hostel: {product.hostel}</div>
          </div>
          <div className="actions">
            <button
              className="btn btnGray"
              onClick={() => onEditToggle(product._id)}
            >
              Edit
            </button>
            <button className="btn btnRed" onClick={() => onDelete(product)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ---------------- PRODUCT FORM ----------------
function ProductForm({ form, setForm, creating, onSubmit }) {
  return (
    <div>
      <h3 className="title">Add Product</h3>
      <div className="formGrid">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="input"
        />
        <input
          placeholder="Hostel"
          value={form.hostel}
          onChange={(e) => setForm((f) => ({ ...f, hostel: e.target.value }))}
          className="input"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
          className="input"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm((f) => ({ ...f, imageFile: e.target.files[0] }))
          }
        />
        {form.imageFile && (
          <img
            src={URL.createObjectURL(form.imageFile)}
            alt="preview"
            className="preview"
          />
        )}
        <button
          className="btn btnBlue full"
          disabled={creating}
          onClick={onSubmit}
        >
          {creating ? "Creating..." : "Create Product"}
        </button>
      </div>
    </div>
  );
}

// ---------------- ORDERS LIST ----------------
function OrdersList({ orders }) {
  return (
    <div>
      <h3 className="title">Recent Orders</h3>
      {orders.length === 0 ? (
        <p className="textGray">No recent orders</p>
      ) : (
        <ul>
          {orders.slice(0, 8).map((o) => (
            <li key={o._id} className="item">
              <div className="bold">
                {o.sellerProduct_id?.product_id?.name || "Product"}
              </div>
              <div className="textGray">
                {o.user_id?.name} — Qty: {o.quantity}
              </div>
              <div className="smallText">
                Status: <strong>{o.status}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------- ADMIN DASHBOARD ----------------
export default function Admin() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    hostel: "",
    description: "",
    imageFile: null,
  });
  const [creating, setCreating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .get("/api/products")
      .then((r) => setProducts(r.data))
      .catch(() => {});
    api
      .get("/api/orders")
      .then((r) => setOrders(r.data || []))
      .catch(() => {});
  }, [user]);

  if (!user || user.role !== "admin") {
    return <div className="container">Unauthorized. Admins only.</div>;
  }

  // ---------------- CRUD ----------------
  const handleCreateProduct = async () => {
    if (!form.name || !form.category || !form.hostel)
      return toast.error("Name, category, and hostel are required");

    try {
      setCreating(true);
      const formData = new FormData();
      // Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      Object.entries(form).forEach(([k, v]) => {
        if (!v) return;
        if (k === "imageFile") formData.append("image", v); // rename here
        else formData.append(k, v);
      });

      const res = await api.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((p) => [res.data, ...p]);
      setForm({
        name: "",
        category: "",
        hostel: "",
        description: "",
        imageFile: null,
      });
      toast.success("Product created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  const handleEditToggle = (id) => {
    setProducts((prev) =>
      prev.map((x) =>
        x._id === id
          ? {
              ...x,
              _editing: !x._editing,
              _editName: x.name,
              _editCategory: x.category,
              _editHostel: x.hostel,
              _editDescription: x.description,
              _editImageFile: null,
            }
          : { ...x, _editing: false }
      )
    );
  };

  const handleUpdateProduct = async (p) => {
    try {
      const formData = new FormData();
      formData.append("name", p._editName);
      formData.append("category", p._editCategory);
      formData.append("hostel", p._editHostel);
      formData.append("description", p._editDescription);
      if (p._editImageFile) formData.append("image", p._editImageFile);

      const res = await api.patch(`/api/products/${p._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) =>
        prev.map((x) =>
          x._id === p._id ? { ...res.data.product, _editing: false } : x
        )
      );
      toast.success("Product updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/products/${deleteTarget._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== deleteTarget._id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="container">
      <h2 className="mainTitle">Admin Dashboard</h2>
      <p className="subtitle">
        Create, edit, remove products and review recent orders.
      </p>

      <div className="grid">
        {/* Products Section */}
        <section className="card">
          <h3 className="title">Products</h3>
          <ul className="list">
            {products.map((p) => (
              <ProductItem
                key={p._id}
                product={p}
                setProducts={setProducts}
                onEditToggle={handleEditToggle}
                onUpdate={handleUpdateProduct}
                onDelete={(prod) => {
                  setDeleteTarget(prod);
                  setDeleteModalOpen(true);
                }}
              />
            ))}
          </ul>
        </section>

        {/* Actions Section */}
        <section className="card">
          <ProductForm
            form={form}
            setForm={setForm}
            creating={creating}
            onSubmit={handleCreateProduct}
          />
          <OrdersList orders={orders} />
        </section>
      </div>

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        title="Confirm delete"
      >
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="actionsRight">
          <button
            className="btn btnGray"
            onClick={() => {
              setDeleteModalOpen(false);
              setDeleteTarget(null);
            }}
          >
            Cancel
          </button>
          <button className="btn btnRed" onClick={handleDeleteProduct}>
            Delete
          </button>
        </div>
      </Modal>

      {/* Internal CSS */}
      <style>{`
        .container { padding: 32px; max-width: 1200px; margin: auto; }
        .mainTitle { font-size: 22px; font-weight: 700; }
        .subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px; }
        .card { background: #fff; border-radius: 10px; padding: 18px; box-shadow: 0 6px 18px rgba(15,23,42,0.06); }
        .list { margin-top: 12px; list-style: none; padding: 0; }
        .item { padding: 10px; border-bottom: 1px solid #f1f5f9; }
        .formGrid { display: grid; gap: 8px; }
        .input { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; }
        .preview { width: 100%; border-radius: 8px; margin-top: 4px; object-fit: cover; }
        .btn { padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .btnGray { border: 1px solid #e5e7eb; background: #f9fafb; }
        .btnGreen { background: #10b981; color: #fff; border: none; }
        .btnBlue { background: #6366f1; color: #fff; border: none; }
        .btnRed { background: #ef4444; color: #fff; border: none; }
        .full { width: 100%; margin-top: 8px; padding: 12px; }
        .actions { display: flex; gap: 8px; margin-top: 8px; }
        .actionsRight { margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end; }
        .flexBetween { display: flex; justify-content: space-between; align-items: center; }
        .bold { font-weight: 700; }
        .textGray { color: #6b7280; }
        .smallText { font-size: 13px; color: #9ca3af; }
        .title { font-weight: 700; margin-bottom: 8px; }
      `}</style>
    </div>
  );
}
