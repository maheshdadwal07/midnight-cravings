import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import { useNavigate, useLocation } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
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

    // Filter out products with no sellers
    result = result.filter((p) => {
      const sellerCount = p.sellerCount || (p.sellers || []).length || 0;
      return sellerCount > 0;
    });

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

    // Add sorting logic
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFiltered(result);
  }, [location.search, products, sortBy]);

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
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Products</h2>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {filtered.length} items
        </div>
      </div>

      {/* Filters and Sort */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <select
          value={new URLSearchParams(location.search).get("category") || ""}
          onChange={(e) => {
            const params = new URLSearchParams(location.search);
            if (e.target.value) {
              params.set("category", e.target.value);
            } else {
              params.delete("category");
            }
            navigate(`?${params.toString()}`);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            fontSize: "14px",
            minWidth: "160px"
          }}
        >
          <option value="">All Categories</option>
          <option value="Snacks">Snacks</option>
          <option value="Beverages">Beverages</option>
          <option value="Biscuits">Biscuits</option>
          <option value="Chocolates">Chocolates</option>
          <option value="Chips">Chips</option>
          <option value="Noodles">Noodles</option>
          <option value="Desserts">Desserts</option>
          <option value="Ice Cream">Ice Cream</option>
          <option value="Sandwiches">Sandwiches</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Healthy">Healthy</option>
          <option value="Dairy">Dairy</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            fontSize: "14px",
            minWidth: "160px"
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
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
