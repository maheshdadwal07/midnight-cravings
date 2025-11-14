import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import Icon from "../../components/Icon";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHostel, setSelectedHostel] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageFile: null,
  });
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [sellersModal, setSellersModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    description: "",
    imageFile: null,
  });

  // Category Options for Food Delivery
  const categories = [
    "Snacks",
    "Beverages",
    "Biscuits",
    "Chocolates",
    "Chips",
    "Noodles",
    "Desserts",
    "Ice Cream",
    "Sandwiches",
    "Fast Food",
    "Healthy",
    "Dairy",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search/filter changes
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Hostel filter
    if (selectedHostel) {
      filtered = filtered.filter((p) => p.hostel === selectedHostel);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedHostel]);

  const fetchProducts = async () => {
    try {
      // Admin endpoint shows ALL products regardless of seller availability
      const res = await api.get("/api/products/admin/all");
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  // Get unique hostels from products
  const hostels = [...new Set(products.map((p) => p.hostel))].filter(Boolean);

  const handleCreate = async () => {
    if (!form.name || !form.category)
      return toast.error("Name and category are required");

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
        description: "",
        imageFile: null,
      });
      toast.success("Snack added successfully!");
    } catch {
      toast.error("Failed to create snack");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Snack deleted");
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEditToggle = (product) => {
    if (editingProduct && editingProduct._id === product._id) {
      setEditingProduct(null);
      setEditForm({
        name: "",
        category: "",
        hostel: "",
        description: "",
        imageFile: null,
      });
    } else {
      setEditingProduct(product);
      setEditForm({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        imageFile: null,
      });
      // Scroll to edit form
      setTimeout(() => {
        document.getElementById('edit-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    
    if (!editForm.name.trim() || !editForm.category) {
      return toast.error("Name and category are required");
    }

    try {
      const formData = new FormData();
      formData.append("name", editForm.name.trim());
      formData.append("category", editForm.category);
      formData.append("description", editForm.description || "");
      if (editForm.imageFile) formData.append("image", editForm.imageFile);

      await api.patch(`/api/products/${editingProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update local state
      setProducts((prev) =>
        prev.map((x) =>
          x._id === editingProduct._id
            ? {
                ...x,
                name: editForm.name,
                category: editForm.category,
                description: editForm.description,
                image: editForm.imageFile
                  ? URL.createObjectURL(editForm.imageFile)
                  : x.image,
              }
            : x
        )
      );

      setEditingProduct(null);
      setEditForm({
        name: "",
        category: "",
        hostel: "",
        description: "",
        imageFile: null,
      });
      toast.success("Snack updated successfully!");
    } catch {
      toast.error("Update failed");
    }
  };

  const getImageSrc = (product) => {
    if (!product) return "https://via.placeholder.com/400x300?text=Snack+Image";
    
    if (product.image) {
      if (product.image.startsWith('http')) return product.image;
      if (product.image.startsWith('/')) return `http://localhost:5001${product.image}`;
      return `http://localhost:5001/uploads/${product.image}`;
    }
    return "https://via.placeholder.com/400x300?text=Snack+Image";
  };

  return (
    <div className="container">
      <div className="header">
        <h2 className="mainTitle">Midnight Snacks <Icon name="moon" size={28} /> <Icon name="chocolate" size={28} /></h2>
        <div className="stats">
          <div className="statCard">
            <div className="statNumber">{products.length}</div>
            <div className="statLabel">Total Products</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{categories.length}</div>
            <div className="statLabel">Categories</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{hostels.length}</div>
            <div className="statLabel">Hostels</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchInput"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filterSelect"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          className="filterSelect"
        >
          <option value="">All Hostels</option>
          {hostels.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {(searchQuery || selectedCategory || selectedHostel) && (
          <button
            className="clearBtn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedHostel("");
            }}
          >
            <Icon name="x" size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="resultsInfo">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Product Grid */}
      <div className="grid">
        {filteredProducts.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon"><Icon name="package" size={48} /></div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
          <div 
            key={p._id} 
            className={`card ${editingProduct && editingProduct._id === p._id ? 'editing' : ''}`}
          >
            <div className="imageContainer">
              <img
                src={getImageSrc(p)}
                alt={p.name}
                className="productImage"
                onClick={() => window.open(getImageSrc(p), "_blank")}
                title="Click to view full image"
              />
              <div className="imageBadge">
                <span className="categoryBadge">{p.category}</span>
              </div>
            </div>
            <div className="productInfo">
              <div className="productHeader">
                <h3 className="productTitle">{p.name}</h3>
                <div className="productMeta">
                  <span className="metaItem">
                    <span className="metaIcon"><Icon name="store" size={14} /></span>
                    {p.hostel}
                  </span>
                </div>
              </div>
              {p.description && (
                <p className="productDescription">{p.description}</p>
              )}
              <div className="productStats">
                <div 
                  className="statItem clickable"
                  onClick={() => {
                    setSelectedProduct(p);
                    setSellersModal(true);
                  }}
                  title="Click to view sellers"
                >
                  <span className="statIcon"><Icon name="package" size={14} /></span>
                  <span className="statText">
                    {p.sellerCount || 0} Seller{p.sellerCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="cardActions">
              <button
                className="btn btnEdit"
                onClick={() => handleEditToggle(p)}
              >
                <span><Icon name="edit" size={16} /></span> {editingProduct && editingProduct._id === p._id ? 'Editing' : 'Edit'}
              </button>
              <button
                className="btn btnDelete"
                onClick={() => {
                  setTarget(p);
                  setDeleteModal(true);
                }}
              >
                <span><Icon name="trash" size={16} /></span> Delete
              </button>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Edit Product Section */}
      {editingProduct && (
        <div id="edit-section" className="card mt24 editSection">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>
              <Icon name="edit" size={20} /> Editing: {editingProduct.name}
            </h3>
            <button
              className="btn btnGray"
              onClick={() => {
                setEditingProduct(null);
                setEditForm({
                  name: "",
                  category: "",
                  description: "",
                  imageFile: null,
                });
              }}
            >
              <Icon name="x" size={16} /> Cancel
            </button>
          </div>
          <div className="formGrid">
            <input
              placeholder="Snack Name"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
            <select
              value={editForm.category}
              onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
              className="input"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Description (optional)"
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="input"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditForm((f) => ({ ...f, imageFile: e.target.files[0] }))
              }
            />
            {(editForm.imageFile || editingProduct.image) && (
              <img
                src={editForm.imageFile ? URL.createObjectURL(editForm.imageFile) : getImageSrc(editingProduct)}
                alt="preview"
                style={{ width: '225px', height: '225px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '8px' }}
              />
            )}
            <button
              className="btn btnGreen full"
              onClick={handleUpdate}
            >
              <Icon name="check" size={16} /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Add Product */}
      <div className="card mt16">
        <h3>Add New Snack <Icon name="cookie" size={20} /></h3>
        <div className="formGrid">
          <input
            placeholder="Snack Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
          />

          {/* Category Dropdown */}
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className="input"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description (optional)"
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
              style={{ width: '225px', height: '225px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '8px' }}
            />
          )}
          <button
            className="btn btnBlue full"
            disabled={creating}
            onClick={handleCreate}
          >
            {creating ? "Creating..." : "Add Snack"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Sellers Modal */}
      <Modal
        open={sellersModal}
        onClose={() => {
          setSellersModal(false);
          setSelectedProduct(null);
        }}
        title={`Sellers for ${selectedProduct?.name || 'Product'}`}
      >
        {selectedProduct?.sellers && selectedProduct.sellers.length > 0 ? (
          <div className="sellersContainer">
            {selectedProduct.sellers.map((seller, idx) => (
              <div key={seller._id || idx} className="sellerCard">
                <div className="sellerHeader">
                  <div className="sellerNumber">#{idx + 1}</div>
                  <div className="sellerName">
                    {seller.seller_id?.name || 'Unknown Seller'}
                  </div>
                </div>
                
                <div className="sellerDetails">
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="mail" size={13} /> Email:</span>
                    <span className="detailValue">{seller.seller_id?.email || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="store" size={13} /> Hostel:</span>
                    <span className="detailValue">{seller.seller_id?.hostelBlock || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="door" size={13} /> Room:</span>
                    <span className="detailValue">{seller.seller_id?.roomNumber || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="store" size={13} /> Shop Name:</span>
                    <span className="detailValue">{seller.seller_id?.shopName || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="dollar" size={13} /> Price:</span>
                    <span className="detailValue priceValue">₹{seller.price}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="package" size={13} /> Stock:</span>
                    <span className={`detailValue ${seller.stock > 10 ? 'stockGood' : seller.stock > 0 ? 'stockLow' : 'stockOut'}`}>
                      {seller.stock} units
                    </span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel"><Icon name="chart" size={13} /> Status:</span>
                    <span className={`statusBadge ${seller.seller_id?.banned ? 'statusBanned' : 'statusActive'}`}>
                      {seller.seller_id?.banned ? <><Icon name="x" size={12} /> Banned</> : <><Icon name="check" size={12} /> Active</>}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="noSellers">
            <div className="noSellersIcon"><Icon name="package" size={48} /></div>
            <p>No sellers available for this product</p>
          </div>
        )}
      </Modal>

      <style>{`
        * { transition: none !important; animation: none !important; }
        .btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; transform: none !important; }
        .container { max-width: 1400px; margin: auto; padding: 32px; font-family: 'Poppins', sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .mainTitle { font-size: 28px; font-weight: 700; color: #111827; margin: 0; }
        .stats { display: flex; gap: 16px; }
        .statCard { background: #ffffff; border: 2px solid #6366f1; padding: 16px 24px; border-radius: 12px; min-width: 120px; text-align: center; }
        .statNumber { font-size: 28px; font-weight: 700; margin-bottom: 4px; color: #6366f1; }
        .statLabel { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .searchInput { flex: 1; min-width: 250px; padding: 12px 16px; border-radius: 10px; border: 2px solid #e5e7eb; font-size: 15px; }
        .searchInput:focus { border-color: #6366f1; outline: none; }
        .filterSelect { padding: 12px 16px; border-radius: 10px; border: 2px solid #e5e7eb; font-size: 14px; background: white; cursor: pointer; min-width: 150px; }
        .filterSelect:focus { border-color: #6366f1; outline: none; }
        .clearBtn { padding: 12px 20px; background: #f3f4f6; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; }

        .resultsInfo { margin-bottom: 16px; font-size: 14px; color: #6b7280; font-weight: 500; }
        .emptyState { grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #f9fafb; border-radius: 16px; border: 2px dashed #e5e7eb; }
        .emptyIcon { font-size: 48px; margin-bottom: 16px; }
        .emptyState h3 { font-size: 20px; color: #374151; margin-bottom: 8px; }
        .emptyState p { color: #9ca3af; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
        .card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 10px; border: 2px solid #f3f4f6; }
        .card.editing { border-color: #6366f1; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2); }
        .editSection { border: 3px solid #6366f1; background: linear-gradient(to bottom, #ffffff, #f9fafb); max-width: 800px; margin-left: auto; margin-right: auto; }
        .mt24 { margin-top: 32px; }
        .mt16 { margin-top: 24px; max-width: 800px; margin-left: auto; margin-right: auto; }

        .formGrid { display: grid; gap: 12px; }
        .input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .input:focus { border-color: #6366f1; outline: none; }
        .btn { padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }

        .btnGray { border: 1px solid #e5e7eb; background: #f9fafb; color: #374151; }
        .btnGreen { background: #10b981; color: #fff; border: none; }
        .btnBlue { background: #6366f1; color: #fff; border: none; }
        .btnRed { background: #ef4444; color: #fff; border: none; }
        .full { width: 100%; margin-top: 12px; padding: 14px; font-size: 15px; }
        .actions { display: flex; gap: 12px; margin-top: 10px; }
        .actionsRight { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
        .textGray { color: #6b7280; }
        .smallText { font-size: 13px; color: #9ca3af; }
        .imageContainer { position: relative; width: 100%; height: 160px; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
        .productImage { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }

        .imageBadge { position: absolute; top: 12px; right: 12px; }
        .categoryBadge { background: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #6366f1; border: 2px solid #6366f1; }
        .productInfo { display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .productHeader { display: flex; flex-direction: column; gap: 6px; }
        .productTitle { font-size: 18px; font-weight: 700; color: #111827; margin: 0; line-height: 1.3; }
        .productMeta { display: flex; gap: 12px; flex-wrap: wrap; }
        .metaItem { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; font-weight: 500; }
        .metaIcon { font-size: 14px; }
        .productDescription { font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .productStats { display: flex; gap: 12px; padding-top: 8px; border-top: 1px solid #f3f4f6; }
        .statItem { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; font-weight: 600; color: #4b5563; }
        .statItem.clickable { cursor: pointer; }

        .statIcon { font-size: 14px; }
        .statText { font-size: 13px; }
        .priceTag { background: #6366f1; color: white; font-weight: 700; }
        .cardActions { display: flex; gap: 10px; margin-top: auto; padding-top: 12px; }
        .btnEdit { flex: 1; background: #f3f4f6; color: #374151; border: 2px solid #e5e7eb; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btnDelete { flex: 1; background: #fef2f2; color: #dc2626; border: 2px solid #fecaca; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .preview { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; margin-top: 8px; border: 2px solid #e5e7eb; display: block; }
        .textGray { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .smallText { font-size: 13px; color: #9ca3af; padding: 4px 0; }
        
        /* Sellers Modal Styles */
        .sellersContainer { display: flex; flex-direction: column; gap: 16px; max-height: 500px; overflow-y: auto; padding: 4px; }
        .sellerCard { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; }
        .sellerHeader { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
        .sellerNumber { background: #6366f1; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .sellerName { font-size: 18px; font-weight: 700; color: #111827; flex: 1; }
        .sellerDetails { display: flex; flex-direction: column; gap: 12px; }
        .detailRow { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 8px; }
        .detailLabel { font-size: 13px; font-weight: 600; color: #6b7280; display: flex; align-items: center; gap: 6px; }
        .detailValue { font-size: 14px; font-weight: 600; color: #111827; text-align: right; }
        .priceValue { color: #6366f1; font-size: 16px; }
        .stockGood { color: #10b981; }
        .stockLow { color: #f59e0b; }
        .stockOut { color: #ef4444; }
        .statusBadge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .statusActive { background: #d1fae5; color: #065f46; }
        .statusBanned { background: #fee2e2; color: #991b1b; }
        .noSellers { text-align: center; padding: 40px 20px; }
        .noSellersIcon { font-size: 48px; margin-bottom: 16px; }
        .noSellers p { color: #6b7280; font-size: 15px; }
        
        @media (max-width: 1024px) { 
          .header { flex-direction: column; align-items: flex-start; }
          .stats { width: 100%; justify-content: space-between; }
        }
        @media (max-width: 768px) { 
          .grid { grid-template-columns: 1fr; } 
          .stats { flex-direction: column; }
          .statCard { width: 100%; }
          .filters { flex-direction: column; }
          .searchInput, .filterSelect { width: 100%; }
          .detailRow { flex-direction: column; align-items: flex-start; gap: 4px; }
          .detailValue { text-align: left; }
        }
      `}</style>
    </div>
  );
}
