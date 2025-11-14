import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartProvider";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addItem, items } = useContext(CartContext);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  // Check if product is already in cart
  const isInCart = selectedSeller && items.some(
    (item) => item.sellerProduct_id === selectedSeller._id
  );

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
        
        // Get hostel filter from URL if present
        const params = new URLSearchParams(location.search);
        const hostelFilter = params.get("hostel");
        
        // Filter sellers by hostel if filter is applied
        let filteredSellers = sRes.data || [];
        if (hostelFilter) {
          filteredSellers = filteredSellers.filter(
            (seller) => seller.seller_id?.hostelBlock === hostelFilter
          );
        }
        
        setSellers(filteredSellers);
        if (filteredSellers.length) setSelectedSeller(filteredSellers[0]);
        if (found) {
          const imageUrl = found.image
            ? found.image.startsWith('http')
              ? found.image
              : found.image.startsWith('/')
              ? `http://localhost:5001${found.image}`
              : `http://localhost:5001/uploads/${found.image}`
            : "https://via.placeholder.com/500";
          setMainImage(imageUrl);
          
          // Get similar products (same category, exclude current product)
          const similar = pRes.data
            .filter((p) => {
              const pId = p._id || p.id;
              const sellerCount = p.sellerCount || (p.sellers || []).length || 0;
              return pId !== id && 
                     p.category === found.category && 
                     sellerCount > 0;
            })
            .slice(0, 4);
          setSimilarProducts(similar);
          
          // Get other products (different category, exclude current product)
          const others = pRes.data
            .filter((p) => {
              const pId = p._id || p.id;
              const sellerCount = p.sellerCount || (p.sellers || []).length || 0;
              return pId !== id && 
                     p.category !== found.category && 
                     sellerCount > 0;
            })
            .slice(0, 8);
          setOtherProducts(others);
        }
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
  }, [id, location.search]);

  if (loading) return <div className="container">Loading...</div>;
  if (!product) return <div className="container">Product not found</div>;

  const handleAddToCart = async () => {
    if (!selectedSeller) return toast.error("Select a seller");
    
    // Check if seller is banned
    if (selectedSeller.seller_id?.banned) {
      return toast.error("This seller is currently unavailable");
    }
    
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
    <div style={{ background: "#f9fafb", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <Link to="/products" style={{ color: "#6366f1", textDecoration: "none" }}>
            Products
          </Link>
          <span>/</span>
          <span style={{ color: "#374151" }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Main Product Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            marginBottom: 48,
          }}
        >
          {/* Image Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                overflow: "hidden",
                borderRadius: 16,
                background: "#f3f4f6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={mainImage}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div style={{ display: "flex", gap: 12 }}>
                {product.images.map((img, idx) => {
                  const imgUrl = img.startsWith('http')
                    ? img
                    : img.startsWith('/')
                    ? `http://localhost:5001${img}`
                    : `http://localhost:5001/uploads/${img}`;
                  
                  return (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`thumb-${idx}`}
                      onClick={() => setMainImage(imgUrl)}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        cursor: "pointer",
                        border:
                          mainImage === imgUrl
                            ? "3px solid #6366f1"
                            : "2px solid #e5e7eb",
                        transition: "all 0.2s",
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Info & Purchase Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Title */}
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#ede9fe",
                  color: "#6366f1",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  marginBottom: 12,
                }}
              >
                {product.category}
              </div>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#1f2937",
                  margin: "0 0 8px",
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </h1>
            </div>

            {/* Description */}
            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.7,
                fontSize: 15,
                margin: 0,
              }}
            >
              {product.description ||
                "Delicious product available from multiple sellers. Order now and enjoy fast delivery!"}
            </p>

            {/* Seller Selection */}
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: 12,
                }}
              >
                Select Seller
              </h3>
              {sellers.length === 0 ? (
                <div
                  style={{
                    padding: 16,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#dc2626",
                    fontSize: 14,
                  }}
                >
                  ⚠️ No sellers available for this product
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sellers.map((s) => {
                    const isBanned = s.seller_id?.banned;
                    return (
                      <div
                        key={s._id}
                        onClick={() => !isBanned && setSelectedSeller(s)}
                        style={{
                          padding: 16,
                          border: isBanned
                            ? "2px solid #fca5a5"
                            : selectedSeller?._id === s._id
                            ? "2px solid #6366f1"
                            : "2px solid #e5e7eb",
                          borderRadius: 12,
                          background: isBanned
                            ? "#fef2f2"
                            : selectedSeller?._id === s._id
                            ? "#f5f3ff"
                            : "#fff",
                          cursor: isBanned ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          opacity: isBanned ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isBanned && selectedSeller?._id !== s._id) {
                            e.currentTarget.style.borderColor = "#c7d2fe";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isBanned && selectedSeller?._id !== s._id) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                          }
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: isBanned ? "#dc2626" : "#374151",
                              fontSize: 15,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {s.seller_id?.name || "Seller"}
                            {isBanned && (
                              <span style={{ fontSize: 12, color: "#dc2626" }}>
                                (Unavailable)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                            {isBanned ? "Currently unavailable" : `Stock: ${s.stock} units`}
                          </div>
                          {s.seller_id?.hostelBlock && (
                            <div style={{ fontSize: 12, color: "#6366f1", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                              🏢 {s.seller_id.hostelBlock}
                              {s.seller_id?.roomNumber && ` - Room ${s.seller_id.roomNumber}`}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: isBanned ? "#dc2626" : "#6366f1",
                          }}
                        >
                          {isBanned ? "🚫" : `₹${s.price}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {sellers.length > 0 && (
              <>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 12,
                    }}
                  >
                    Quantity
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{
                        width: 40,
                        height: 40,
                        border: "2px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#fff",
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: "pointer",
                        color: "#374151",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#6366f1";
                        e.currentTarget.style.color = "#6366f1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.color = "#374151";
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      style={{
                        width: 80,
                        height: 40,
                        textAlign: "center",
                        border: "2px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    />
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          selectedSeller
                            ? Math.min(selectedSeller.stock, q + 1)
                            : q + 1
                        )
                      }
                      style={{
                        width: 40,
                        height: 40,
                        border: "2px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#fff",
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: "pointer",
                        color: "#374151",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#6366f1";
                        e.currentTarget.style.color = "#6366f1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.color = "#374151";
                      }}
                    >
                      +
                    </button>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Total Price
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#6366f1",
                        }}
                      >
                        ₹{selectedSeller ? selectedSeller.price * quantity : 0}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={isInCart ? () => navigate('/cart') : handleAddToCart}
                  style={{
                    padding: "16px 32px",
                    background: isInCart ? "#10b981" : "#6366f1",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: isInCart 
                      ? "0 4px 12px rgba(16, 185, 129, 0.3)" 
                      : "0 4px 12px rgba(99, 102, 241, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isInCart ? "#059669" : "#4f46e5";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = isInCart
                      ? "0 8px 20px rgba(16, 185, 129, 0.4)"
                      : "0 8px 20px rgba(99, 102, 241, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isInCart ? "#10b981" : "#6366f1";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isInCart
                      ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                      : "0 4px 12px rgba(99, 102, 241, 0.3)";
                  }}
                >
                  {isInCart ? (
                    <>
                      <Icon name="check" size={18} style={{ marginRight: 8 }} /> Go to Cart
                    </>
                  ) : (
                    <>
                      <Icon name="cart" size={18} style={{ marginRight: 8 }} /> Add to Cart
                    </>
                  )}
                </button>
              </>
            )}

            {!user && (
              <div
                style={{
                  padding: 12,
                  background: "#fef3c7",
                  border: "1px solid #fbbf24",
                  borderRadius: 8,
                  color: "#92400e",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Please login to place orders
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Similar Products
              </h2>
              <Link
                to={`/products?category=${product.category}`}
                style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                View All →
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                gap: 20,
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: 16,
                scrollbarWidth: "thin",
                scrollbarColor: "#6366f1 #f3f4f6",
              }}
            >
              {similarProducts.map((p) => (
                <div
                  key={p._id || p.id}
                  style={{
                    minWidth: 280,
                    maxWidth: 280,
                    flexShrink: 0,
                  }}
                >
                  <ProductCard
                    product={p}
                    onClick={() => {
                      navigate(`/products/${p._id || p.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Products Section */}
        {otherProducts.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Other Products
              </h2>
              <Link
                to="/products"
                style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                View All →
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                gap: 20,
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: 16,
                scrollbarWidth: "thin",
                scrollbarColor: "#6366f1 #f3f4f6",
              }}
            >
              {otherProducts.map((p) => (
                <div
                  key={p._id || p.id}
                  style={{
                    minWidth: 280,
                    maxWidth: 280,
                    flexShrink: 0,
                  }}
                >
                  <ProductCard
                    product={p}
                    onClick={() => {
                      navigate(`/products/${p._id || p.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
