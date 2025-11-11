import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHostel, setSelectedHostel] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    hostel: "",
    description: "",
    imageFile: null,
  });
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [sellersModal, setSellersModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // ✅ FIXED handleUpdate: no more disappearing items
  const handleUpdate = async (p) => {
    try {
      const formData = new FormData();
      formData.append("name", p._editName);
      formData.append("category", p._editCategory);
      formData.append("hostel", p._editHostel);
      formData.append("description", p._editDescription);
      if (p._editImageFile) formData.append("image", p._editImageFile);

      await api.patch(`/api/products/${p._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Merge update locally instead of relying on backend response
      setProducts((prev) =>
        prev.map((x) =>
          x._id === p._id
            ? {
                ...x,
                name: p._editName,
                category: p._editCategory,
                hostel: p._editHostel,
                description: p._editDescription,
                _editing: false,
                image: p._editImageFile
                  ? URL.createObjectURL(p._editImageFile)
                  : x.image,
              }
            : x
        )
      );

      toast.success("Snack updated successfully!");
    } catch {
      toast.error("Update failed");
    }
  };

  const getImageSrc = (product) =>
    product._editImageFile
      ? URL.createObjectURL(product._editImageFile)
      : product.image
      ? `http://localhost:5001${product.image}`
      : "https://via.placeholder.com/400x300?text=Snack+Image";

  return (
    <div className="container">
      <div className="header">
        <h2 className="mainTitle">Midnight Snacks 💤🍫</h2>
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
          placeholder="🔍 Search products..."
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
            ✕ Clear Filters
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
            <div className="emptyIcon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
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

                {/* Category Dropdown */}
                <select
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
                  className="input"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

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
                        <span className="metaIcon">🏠</span>
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
                      <span className="statIcon">📦</span>
                      <span className="statText">
                        {p.sellerCount || 0} Seller{p.sellerCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cardActions">
                  <button
                    className="btn btnEdit"
                    onClick={() => handleEditToggle(p._id)}
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    className="btn btnDelete"
                    onClick={() => {
                      setTarget(p);
                      setDeleteModal(true);
                    }}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </>
            )}
          </div>
          ))
        )}
      </div>

      {/* Add Product */}
      <div className="card mt16">
        <h3>Add New Snack 🍪</h3>
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
                    <span className="detailLabel">📧 Email:</span>
                    <span className="detailValue">{seller.seller_id?.email || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">🏠 Hostel:</span>
                    <span className="detailValue">{seller.seller_id?.hostelBlock || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">🚪 Room:</span>
                    <span className="detailValue">{seller.seller_id?.roomNumber || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">🏪 Shop Name:</span>
                    <span className="detailValue">{seller.seller_id?.shopName || 'N/A'}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">💰 Price:</span>
                    <span className="detailValue priceValue">₹{seller.price}</span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">📦 Stock:</span>
                    <span className={`detailValue ${seller.stock > 10 ? 'stockGood' : seller.stock > 0 ? 'stockLow' : 'stockOut'}`}>
                      {seller.stock} units
                    </span>
                  </div>
                  
                  <div className="detailRow">
                    <span className="detailLabel">📊 Status:</span>
                    <span className={`statusBadge ${seller.seller_id?.banned ? 'statusBanned' : 'statusActive'}`}>
                      {seller.seller_id?.banned ? '🚫 Banned' : '✅ Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="noSellers">
            <div className="noSellersIcon">📦</div>
            <p>No sellers available for this product</p>
          </div>
        )}
      </Modal>

      <style>{`
        .container { max-width: 1400px; margin: auto; padding: 32px; font-family: 'Poppins', sans-serif; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .mainTitle { font-size: 28px; font-weight: 700; color: #111827; margin: 0; }
        .stats { display: flex; gap: 16px; }
        .statCard { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 24px; border-radius: 12px; color: white; min-width: 120px; text-align: center; }
        .statNumber { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .statLabel { font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; }
        .filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .searchInput { flex: 1; min-width: 250px; padding: 12px 16px; border-radius: 10px; border: 2px solid #e5e7eb; font-size: 15px; transition: all 0.2s; }
        .searchInput:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .filterSelect { padding: 12px 16px; border-radius: 10px; border: 2px solid #e5e7eb; font-size: 14px; background: white; cursor: pointer; transition: all 0.2s; min-width: 150px; }
        .filterSelect:focus { border-color: #6366f1; outline: none; }
        .clearBtn { padding: 12px 20px; background: #f3f4f6; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.2s; }
        .clearBtn:hover { background: #e5e7eb; color: #374151; }
        .resultsInfo { margin-bottom: 16px; font-size: 14px; color: #6b7280; font-weight: 500; }
        .emptyState { grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #f9fafb; border-radius: 16px; border: 2px dashed #e5e7eb; }
        .emptyIcon { font-size: 48px; margin-bottom: 16px; }
        .emptyState h3 { font-size: 20px; color: #374151; margin-bottom: 8px; }
        .emptyState p { color: #9ca3af; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 12px; transition: all 0.3s; border: 2px solid #f3f4f6; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); border-color: #6366f1; }
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
        .imageContainer { position: relative; width: 100%; height: 240px; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
        .productImage { width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: all 0.4s ease; }
        .productImage:hover { transform: scale(1.1); }
        .imageBadge { position: absolute; top: 12px; right: 12px; }
        .categoryBadge { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #6366f1; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .productInfo { display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .productHeader { display: flex; flex-direction: column; gap: 6px; }
        .productTitle { font-size: 18px; font-weight: 700; color: #111827; margin: 0; line-height: 1.3; }
        .productMeta { display: flex; gap: 12px; flex-wrap: wrap; }
        .metaItem { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; font-weight: 500; }
        .metaIcon { font-size: 14px; }
        .productDescription { font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .productStats { display: flex; gap: 12px; padding-top: 8px; border-top: 1px solid #f3f4f6; }
        .statItem { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; font-weight: 600; color: #4b5563; transition: all 0.2s; }
        .statItem.clickable { cursor: pointer; }
        .statItem.clickable:hover { background: #e5e7eb; transform: translateY(-2px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .statIcon { font-size: 14px; }
        .statText { font-size: 13px; }
        .priceTag { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 700; }
        .cardActions { display: flex; gap: 10px; margin-top: auto; padding-top: 12px; }
        .btnEdit { flex: 1; background: #f3f4f6; color: #374151; border: 2px solid #e5e7eb; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btnEdit:hover { background: #e5e7eb; border-color: #d1d5db; }
        .btnDelete { flex: 1; background: #fef2f2; color: #dc2626; border: 2px solid #fecaca; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .btnDelete:hover { background: #fee2e2; border-color: #fca5a5; }
        .preview { width: 100%; max-width: 200px; height: auto; border-radius: 10px; object-fit: cover; margin-top: 8px; border: 2px solid #e5e7eb; }
        .textGray { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .smallText { font-size: 13px; color: #9ca3af; padding: 4px 0; }
        
        /* Sellers Modal Styles */
        .sellersContainer { display: flex; flex-direction: column; gap: 16px; max-height: 500px; overflow-y: auto; padding: 4px; }
        .sellerCard { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; transition: all 0.2s; }
        .sellerCard:hover { border-color: #6366f1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }
        .sellerHeader { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
        .sellerNumber { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
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
