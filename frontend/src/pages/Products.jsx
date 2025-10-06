import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { useNavigate, useLocation } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all products once
  useEffect(() => {
    let mounted = true;
    api
      .get("/api/products")
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Filter whenever query string or products change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search")?.toLowerCase() || "";
    const category = params.get("category") || "";

    let result = [...products];

    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      );
    }

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    setFiltered(result);
  }, [location.search, products]);

  if (loading) return <div className="container">Loading products...</div>;
  if (error)
    return (
      <div className="container" style={{ color: "red" }}>
        {error}
      </div>
    );

  return (
    <div className="container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Products</h2>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {filtered.length} items
        </div>
      </div>

      {/* Grid Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 20,
          marginTop: 18,
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              color: "#6b7280",
              marginTop: 20,
              gridColumn: "1 / -1",
              textAlign: "center",
            }}
          >
            No products found
          </div>
        ) : (
          filtered.map((p) => (
            <ProductCard
              key={p._id || p.id}
              product={p}
              onClick={() => navigate(`/products/${p._id || p.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
