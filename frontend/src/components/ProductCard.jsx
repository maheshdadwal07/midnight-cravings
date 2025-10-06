import React, { useContext } from 'react'
import { CartContext } from '../context/CartProvider'
import toast from 'react-hot-toast'

export default function ProductCard({ product, onClick }) {
  const { addItem } = useContext(CartContext)
  const price = (product.price !== undefined && product.price !== null) ? product.price : null
  const sellers = product.sellerCount || (product.sellers || []).length || 0

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    try {
      const sellerListing = (product.sellers && product.sellers[0]) || null;
      const item = {
        sellerProduct_id: sellerListing?._id || product._id,
        product_id: product._id,
        name: product.name,
        price: sellerListing?.price ?? price ?? 0,
        quantity: 1,
        image: product.image || "",
      };
      await addItem(item); // 👈 wait for backend confirmation
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error("Failed to add item");
    }
  };


  return (
    <article
      className="card product-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      aria-label={`View ${product.name}`}
    >
      <div className="image" style={{ position: "relative" }}>
        <img
          loading="lazy"
          src={
            `http://localhost:5000${product.image}` || "https://via.placeholder.com/800x600?text=Product"
          }
          alt={product.name || "Product image"}
        />

        <div
          className="price-badge"
          style={{ position: "absolute", left: 12, top: 12 }}
        >
          {price !== null ? `₹${price}` : "₹—"}
        </div>
        {sellers > 0 && (
          <div
            className="badge-pill"
            style={{ position: "absolute", right: 12, top: 12 }}
          >
            {sellers} seller{sellers > 1 ? "s" : ""}
          </div>
        )}
        {product.category && (
          <div
            style={{ position: "absolute", left: 12, bottom: 12 }}
            className="pill"
          >
            {product.category}
          </div>
        )}
      </div>

      <div
        style={{
          paddingTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>{product.name}</h3>
        <p className="muted small" style={{ margin: 0 }}>
          {product.description ? product.description.slice(0, 80) : ""}
        </p>
      </div>

      <div
        className="footer"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="price">{price !== null ? `₹${price}` : "₹—"}</div>
          <div className="small muted">{product.short || ""}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name}`}
          >
            Quick add
          </button>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            aria-label={`View ${product.name}`}
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}
