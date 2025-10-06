import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartProvider";
import api from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Sweet", icon: "🍭", products: 120 },
    { name: "Savory", icon: "🥨", products: 85 },
    { name: "International", icon: "🌍", products: 200 },
    { name: "Healthy", icon: "🥦", products: 65 },
  ];

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/products?limit=4")
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data);
      })
      .catch(() => setProducts([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-left">
            <h2>
              Midnight <span>Snacks</span> Delivered Fast!
            </h2>
            <p>
              Hot, fresh, and delicious snacks delivered straight to your door.
              Experience flavor like never before!
            </p>
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate("/products")}
              >
                Shop Now
              </button>
              <button
                className="btn-outline"
                onClick={() => navigate("/products")}
              >
                View All
              </button>
            </div>
          </div>

          <div className="hero-right">
            <img src="/images/chips.png" alt="Snack 1" className="main-snack" />
            <img
              src="/images/popcorn.png"
              alt="Snack 2"
              className="floating one"
            />
            <img
              src="/images/oreo.png"
              alt="Snack 3"
              className="floating two"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories">
        <div className="page-wrapper">
          <h2 className="section-title">
            Explore Our <span>Categories</span>
          </h2>
          <p className="section-desc">
            From sweet to savory, we've got all your snack cravings covered.
          </p>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="category-card"
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                }
              >
                <div style={{ fontSize: "2rem" }}>{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.products}+ Products</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-products">
        <h2>Featured Snacks</h2>
        <div className="product-grid">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, idx) => (
                  <div key={idx} className="product-placeholder"></div>
                ))
            : products.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onClick={() => navigate(`/products/${p._id || p.id}`)}
                />
              ))}
        </div>
      </section>

      {/* STYLES */}
      <style jsx>{`
        body {
          margin: 0;
          font-family: "Poppins", sans-serif;
          background: #f9fafb;
        }

        .home {
          width: 100%;
        }

        /* HERO */
        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #eef2ff, #f5f3ff);
          min-height: 90vh;
          position: relative;
          overflow: hidden;
          flex-wrap: wrap;
        }
        .hero-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          gap: 3rem;
          flex-wrap: wrap;
        }
        .hero-left {
          flex: 1;
          min-width: 280px;
          animation: fadeInLeft 1s ease forwards;
        }
        .hero-left h2 {
          font-size: clamp(3rem, 6vw, 4rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1rem;
          color: #111827;
        }
        .hero-left h2 span {
          background: linear-gradient(90deg, #6366f1, #4f46e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-left p {
          font-size: 1.2rem;
          color: #4b5563;
          margin-bottom: 2rem;
        }
        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-primary {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
          border: none;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.35);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 16px 40px rgba(79, 70, 229, 0.45);
        }
        .btn-outline {
          padding: 1rem 2rem;
          border: 2px solid #4f46e5;
          color: #4f46e5;
          border-radius: 9999px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .hero-right {
          flex: 1;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 280px;
        }
        .main-snack {
          width: 360px;
          border-radius: 2rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: float 5s ease-in-out infinite;
          z-index: 2;
          transition: transform 0.4s ease;
        }
        .main-snack:hover {
          transform: scale(1.05) rotate(1deg);
        }
        .floating {
          position: absolute;
          width: 180px;
          border-radius: 1.5rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          opacity: 0.85;
          animation: float 6s ease-in-out infinite;
        }
        .floating.one {
          top: -40px;
          left: -60px;
          transform: rotate(-5deg);
        }
        .floating.two {
          bottom: 20px;
          right: -60px;
          transform: rotate(8deg);
        }

        /* CATEGORIES */
        .categories {
          text-align: center;
          padding: 5rem 2rem;
        }
        .section-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        .section-title span {
          color: #4f46e5;
        }
        .section-desc {
          font-size: 1.1rem;
          color: #6b7280;
          margin-bottom: 3rem;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
        }
        .category-card {
          background: #fff;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        /* FEATURED PRODUCTS */
        .featured-products {
          padding: 4rem 2rem;
          text-align: center;
        }
        .featured-products h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #111827;
          font-weight: 800;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          justify-items: center;
        }
        .product-placeholder {
          height: 300px;
          width: 250px;
          background: #e5e7eb;
          border-radius: 16px;
          animation: pulse 1.5s infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            text-align: center;
            padding: 2rem;
          }
          .main-snack {
            width: 80%;
            margin-top: 2rem;
          }
          .floating {
            display: none;
          }
          .categories-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
