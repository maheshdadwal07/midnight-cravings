import React, { useContext } from 'react'
import { CartContext } from '../context/CartProvider'
import toast from 'react-hot-toast'

export default function ProductCard({ product, onClick }) {
  const { addItem } = useContext(CartContext)
  const price = (product.price !== undefined && product.price !== null) ? product.price : null
  const sellers = product.sellerCount || (product.sellers || []).length || 0

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    
    // Check if there are any sellers
    if (sellers === 0 || !product.sellers || product.sellers.length === 0) {
      toast.error("No sellers available for this product");
      return;
    }

    const sellerListing = product.sellers[0];
    
    // Check if seller listing exists and has valid price
    if (!sellerListing || !sellerListing._id) {
      toast.error("Invalid seller listing");
      return;
    }

    const itemPrice = sellerListing.price ?? price ?? 0;
    
    // Check if price is valid (greater than 0)
    if (itemPrice <= 0) {
      toast.error("Invalid product price");
      return;
    }

    // Check if product is in stock
    if (sellerListing.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      const item = {
        sellerProduct_id: sellerListing._id,
        product_id: product._id,
        name: product.name,
        price: itemPrice,
        quantity: 1,
        image: product.image || "",
      };
      await addItem(item);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.message || "Failed to add item");
    }
  };

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        cursor: "pointer",
        height: "100%",
      }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        e.currentTarget.style.borderColor = "#d1d5db";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderColor = "#e5e7eb";
      }}
      aria-label={`View ${product.name}`}
    >
      {/* Image Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "75%",
          background: "#f9fafb",
          overflow: "hidden",
        }}
      >
        <img
          loading="lazy"
          src={
            product.image
              ? `http://localhost:5001${product.image}`
              : "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={product.name || "Product image"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        />

        {/* Sellers Badge */}
        {sellers > 0 && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              background: "#fff",
              color: "#6b7280",
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid #e5e7eb",
            }}
          >
            {sellers} {sellers > 1 ? "sellers" : "seller"}
          </div>
        )}

        {/* Category Badge */}
        {product.category && (
          <div
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              background: "#eff6ff",
              color: "#1e40af",
              padding: "4px 10px",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "capitalize",
              border: "1px solid #bfdbfe",
            }}
          >
            {product.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        {/* Product Name */}
        <h3
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "42px",
          }}
        >
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0 16px 16px",
          display: "flex",
          gap: 8,
          marginTop: "auto",
        }}
      >
        <button
          onClick={handleQuickAdd}
          disabled={sellers === 0 || !price || price <= 0}
          style={{
            flex: 1,
            padding: "10px 12px",
            background: sellers === 0 || !price || price <= 0 ? "#f3f4f6" : "#fff",
            color: sellers === 0 || !price || price <= 0 ? "#9ca3af" : "#374151",
            border: sellers === 0 || !price || price <= 0 ? "1px solid #e5e7eb" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: sellers === 0 || !price || price <= 0 ? "not-allowed" : "pointer",
            transition: "background 0.15s ease, border-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (sellers > 0 && price > 0) {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#9ca3af";
            }
          }}
          onMouseLeave={(e) => {
            if (sellers > 0 && price > 0) {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#d1d5db";
            }
          }}
          aria-label={`Add ${product.name} to cart`}
        >
          {sellers === 0 ? "Unavailable" : "Add to Cart"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            padding: "10px 16px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#6366f1";
          }}
          aria-label={`View ${product.name} details`}
        >
          View
        </button>
      </div>
    </article>
  );
}
