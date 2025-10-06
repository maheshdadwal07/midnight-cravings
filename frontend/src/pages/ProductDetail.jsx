import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartProvider";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addItem } = useContext(CartContext);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get(`/api/products`),
          api.get(`/api/seller/${id}`),
        ]);
        if (!mounted) return;

        const found = pRes.data.find((p) => (p._id || p.id) === id);
        setProduct(found);
        setSellers(sRes.data || []);
        if (sRes.data.length) setSelectedSeller(sRes.data[0]);
        if (found)
          setMainImage(
            found.image
              ? `http://localhost:5000${found.image}`
              : "https://via.placeholder.com/500"
          );
      } catch (err) {
        console.error("Failed to load product or sellers", err);
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!product) return <div className="container">Product not found</div>;

  const handleAddToCart = async () => {
    if (!selectedSeller) return toast.error("Select a seller");
    if (quantity < 1) return toast.error("Quantity must be at least 1");
    if (quantity > selectedSeller.stock) return toast.error("Not enough stock");

    try {
      await addItem({
        sellerProduct_id: selectedSeller._id,
        product_id: product._id,
        name: product.name,
        price: selectedSeller.price,
        quantity,
        image: product.image || "",
      });
      toast.success("Added to cart");
    } catch (err) {
      console.error("Failed to add item:", err);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <div className="container">
      <div className="product-grid">
        {/* Image Section */}
        <div className="image-section">
          <div className="image-wrapper">
            <img src={mainImage} alt={product.name} />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:5000${img}`}
                  alt={`thumb-${idx}`}
                  onClick={() => setMainImage(`http://localhost:5000${img}`)}
                  className={
                    mainImage === `http://localhost:5000${img}`
                      ? "active-thumb"
                      : ""
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase Section */}
        <div className="info-section">
          <h1>{product.name}</h1>
          <p className="category">{product.category}</p>
          <p className="description">
            {product.description ||
              "Delicious product available from multiple sellers."}
          </p>

          {/* Seller Selection Buttons */}
          <div className="seller-buttons">
            {sellers.length === 0 ? (
              <p>No sellers available</p>
            ) : (
              sellers.map((s) => (
                <button
                  key={s._id}
                  className={
                    selectedSeller?._id === s._id
                      ? "seller-btn active"
                      : "seller-btn"
                  }
                  onClick={() => setSelectedSeller(s)}
                >
                  {s.seller_id?.name || "Seller"} — ₹{s.price}
                </button>
              ))
            )}
          </div>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="qty-btn"
            >
              -
            </button>
            <input type="number" value={quantity} readOnly />
            <button
              onClick={() =>
                setQuantity((q) =>
                  selectedSeller ? Math.min(selectedSeller.stock, q + 1) : q + 1
                )
              }
              className="qty-btn"
            >
              +
            </button>
          </div>

          <button className="add-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>

          {!user && <p className="login-note">Please login to place orders.</p>}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .container {
          padding: 24px;
          max-width: 1200px;
          margin: auto;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 24px;
        }
        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .image-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .image-wrapper {
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f9fafb;
          transition: transform 0.3s;
        }
        .image-wrapper:hover {
          transform: scale(1.02);
        }
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.3s;
        }

        .thumbnails {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .thumbnails img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: 0.2s;
        }
        .thumbnails img.active-thumb {
          border-color: #6366f1;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .info-section h1 {
          font-size: 32px;
          font-weight: 800;
        }
        .category {
          color: #6366f1;
          font-weight: 700;
        }
        .description {
          color: #374151;
          line-height: 1.6;
        }

        .seller-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }
        .seller-btn {
          padding: 8px 16px;
          border: 2px solid #6366f1;
          background: white;
          color: #6366f1;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        .seller-btn.active,
        .seller-btn:hover {
          background: #6366f1;
          color: white;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }
        .quantity-selector input {
          width: 60px;
          text-align: center;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          padding: 6px;
          font-size: 16px;
        }
        .qty-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 8px;
          background: #fbbf24;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .qty-btn:hover {
          background: #f59e0b;
        }

        .add-cart-btn {
          margin-top: 16px;
          padding: 14px;
          background: #ef4444;
          color: white;
          font-weight: 700;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .add-cart-btn:hover {
          background: #dc2626;
          transform: scale(1.02);
        }

        .login-note {
          font-size: 14px;
          color: #6b7280;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
