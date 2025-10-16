import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    hostel: "",
    description: "",
    imageFile: null,
  });
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.category || !form.hostel)
      return toast.error("Required fields missing");

    try {
      setCreating(true);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) formData.append(k === "imageFile" ? "image" : k, v);
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
    } catch {
      toast.error("Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEditToggle = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              _editing: !p._editing,
              _editName: p.name,
              _editCategory: p.category,
              _editHostel: p.hostel,
              _editDescription: p.description,
              _editImageFile: null,
            }
          : { ...p, _editing: false }
      )
    );
  };

  const handleUpdate = async (p) => {
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
          x._id === p._id ? { ...res.data, _editing: false } : x
        )
      );
      toast.success("Product updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const getImageSrc = (product) =>
    product._editImageFile
      ? URL.createObjectURL(product._editImageFile)
      : product.image
      ? `http://localhost:5000${product.image}`
      : "https://via.placeholder.com/400x300?text=Product";

  return (
    <div className="container">
      <h2 className="mainTitle">Products</h2>

      <div className="grid">
        {products.map((p) => (
          <div key={p._id} className="card">
            {p._editing ? (
              <div className="formGrid">
                <input
                  value={p._editName}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((x) =>
                        x._id === p._id
                          ? { ...x, _editName: e.target.value }
                          : x
                      )
                    )
                  }
                  placeholder="Name"
                  className="input"
                />
                <input
                  value={p._editCategory}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((x) =>
                        x._id === p._id
                          ? { ...x, _editCategory: e.target.value }
                          : x
                      )
                    )
                  }
                  placeholder="Category"
                  className="input"
                />
                <input
                  value={p._editHostel}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((x) =>
                        x._id === p._id
                          ? { ...x, _editHostel: e.target.value }
                          : x
                      )
                    )
                  }
                  placeholder="Hostel"
                  className="input"
                />
                <textarea
                  value={p._editDescription}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((x) =>
                        x._id === p._id
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
                        x._id === p._id
                          ? { ...x, _editImageFile: e.target.files[0] }
                          : x
                      )
                    )
                  }
                />
                <img src={getImageSrc(p)} alt="preview" className="preview" />
                <div className="actions">
                  <button
                    className="btn btnGreen"
                    onClick={() => handleUpdate(p)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btnGray"
                    onClick={() => handleEditToggle(p._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={getImageSrc(p)}
                  alt={p.name}
                  className="productImage"
                  onClick={() => window.open(getImageSrc(p), "_blank")}
                  title="Click to view full image"
                />
                <div className="productInfo">
                  <strong>{p.name}</strong>
                  <div className="textGray">{p.description}</div>
                  <div className="smallText">Category: {p.category}</div>
                  <div className="smallText">Hostel: {p.hostel}</div>
                </div>
                <div className="actions">
                  <button
                    className="btn btnGray"
                    onClick={() => handleEditToggle(p._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btnRed"
                    onClick={() => {
                      setTarget(p);
                      setDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Product */}
      <div className="card mt16">
        <h3>Add Product</h3>
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
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
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
            onClick={handleCreate}
          >
            {creating ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Delete"
      >
        <p>
          Are you sure you want to delete <strong>{target?.name}</strong>?
        </p>
        <div className="actionsRight">
          <button className="btn btnGray" onClick={() => setDeleteModal(false)}>
            Cancel
          </button>
          <button
            className="btn btnRed"
            onClick={() => handleDelete(target._id)}
          >
            Delete
          </button>
        </div>
      </Modal>

      <style>{`
        .container { max-width: 1200px; margin: auto; padding: 32px; font-family: 'Poppins', sans-serif; }
        .mainTitle { font-size: 26px; font-weight: 700; margin-bottom: 24px; color: #111827; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 12px; transition: transform 0.3s, box-shadow 0.3s; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.12); }
        .formGrid { display: grid; gap: 12px; }
        .input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; transition: border-color 0.2s; }
        .input:focus { border-color: #6366f1; outline: none; }
        .btn { padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; }
        .btn:hover { opacity: 0.95; transform: translateY(-1px); }
        .btnGray { border: 1px solid #e5e7eb; background: #f9fafb; color: #374151; }
        .btnGreen { background: #10b981; color: #fff; border: none; }
        .btnBlue { background: #6366f1; color: #fff; border: none; }
        .btnRed { background: #ef4444; color: #fff; border: none; }
        .full { width: 100%; margin-top: 12px; padding: 14px; font-size: 15px; }
        .actions { display: flex; gap: 12px; margin-top: 10px; }
        .actionsRight { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
        .textGray { color: #6b7280; }
        .smallText { font-size: 13px; color: #9ca3af; }
        .productImage { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; cursor: pointer; transition: transform 0.3s; }
        .productImage:hover { transform: scale(1.03); }
        .preview { width: 100%; max-width: 180px; height: auto; border-radius: 8px; object-fit: cover; margin-top: 6px; }
        .productInfo { display: flex; flex-direction: column; gap: 6px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
