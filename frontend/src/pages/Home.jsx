import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartProvider";
import { AuthContext } from "../context/AuthProvider";
import api from "../services/api";
import Icon from "../components/Icon";

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);


  // Define categories to display
  const categories = [
    { name: "Snacks", icon: "snack" },
    { name: "Beverages", icon: "beverage" },
    { name: "Biscuits", icon: "cookie" },
    { name: "Chocolates", icon: "chocolate" },
    { name: "Chips", icon: "snack" },
    { name: "Noodles", icon: "noodle" },
    { name: "Desserts", icon: "cake" },
    { name: "Ice Cream", icon: "icecream" },
    { name: "Sandwiches", icon: "sandwich" },
    { name: "Fast Food", icon: "burger" },
    { name: "Healthy", icon: "salad" },
    { name: "Dairy", icon: "milk" },
  ];
  // Redirect seller/admin to their respective dashboards
  useEffect(() => {
    if (user && user.role === "seller") {
      navigate("/seller");
    } else if (user && user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Fetch last order for hero section
  useEffect(() => {
    const fetchLastOrder = async () => {
      try {
        const res = await api.get("/api/orders/public/recent");
        // Get only the last order
        if (res.data && res.data.length > 0) {
          const order = res.data[0];
          setLastOrder({
            id: order._id,
            quantity: order.quantity || 1,
            total: order.totalPrice || 0,
            status: order.status || 'pending',
            time: new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            product: order.sellerProduct_id?.product_id?.name || 'Product',
            createdAt: order.createdAt
          });
        }
      } catch (error) {
        console.error("Failed to fetch last order", error);
        setLastOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchLastOrder();
  }, []);

  // Handle scroll to hide indicator
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await api.get("/api/products");
        // Get products with sellers and sort by seller count (popularity)
        const productsWithSellers = res.data.filter((p) => {
          const sellerCount = p.sellerCount || (p.sellers || []).length || 0;
          return sellerCount > 0;
        });
        
        // Sort by seller count and get top 8
        const trending = productsWithSellers
          .sort((a, b) => {
            const aCount = a.sellerCount || (a.sellers || []).length || 0;
            const bCount = b.sellerCount || (b.sellers || []).length || 0;
            return bCount - aCount;
          })
          .slice(0, 8);
        
        setTrendingProducts(trending);
      } catch (err) {
        console.error("Failed to fetch trending products", err);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchProductsByCategory = async () => {
      try {
        const res = await api.get("/api/products");
        if (!mounted) return;

        // Filter products with sellers
        const productsWithSellers = res.data.filter((p) => {
          const sellerCount = p.sellerCount || (p.sellers || []).length || 0;
          return sellerCount > 0;
        });

        // Group products by category
        const grouped = {};
        categories.forEach((cat) => {
          const categoryProducts = productsWithSellers
            .filter((p) => p.category === cat.name)
            .slice(0, 4); // Get max 4 products per category
          if (categoryProducts.length > 0) {
            grouped[cat.name] = categoryProducts;
          }
        });

        setProductsByCategory(grouped);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProductsByCategory();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home">
      {/* HERO SECTION */}
            <div className="hero">
        <div className="hero-left">
          <div className="hero-badge"><Icon name="snack" size={20} /> Late Night Snacks Delivered</div>
          <h1 className="hero-title">
            Midnight Cravings?
            <br />
            <span className="highlight">We've Got You!</span>
          </h1>
          <p className="hero-subtitle">
            Quick delivery of your favorite snacks, drinks, and munchies right to your hostel room. 
            Available 24/7 because hunger doesn't sleep! <Icon name="moon" size={20} />
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/products')}
            >
              <Icon name="cart" size={20} /> Order Now
            </button>
            <button 
              className="btn-outline"
              onClick={() => navigate('/products')}
            >
              View Menu
            </button>
          </div>
          {/* Trust indicators */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Happy Students</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">15min</span>
              <span className="stat-label">Avg Delivery</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Always Open</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          {/* Mobile Phone Mockup with Live Orders */}
          <div className="phone-mockup-scene">
            <div className="phone-container">
              {/* Phone Frame */}
              <div className="phone-frame">
                {/* Notch */}
                <div className="phone-notch"></div>
                
                {/* Screen */}
                <div className="phone-screen">
                  {/* App Header */}
                  <div className="app-header">
                    <div className="app-logo">
                      <Icon name="moon" size={24} />
                      <span>Midnight Cravings</span>
                    </div>
                    <div className="live-badge">
                      <span className="pulse-dot"></span>
                      LIVE
                    </div>
                  </div>
                  
                  {/* Order Tracker */}
                  <div className="order-tracker-container">
                    <h3 className="tracker-title">Live Order Tracking</h3>
                    {loadingOrder ? (
                      <div className="loading-tracker">Loading...</div>
                    ) : lastOrder ? (
                      <>
                        {/* Order Info Card */}
                        <div className="tracker-order-info">
                          <div className="info-row">
                            <span className="info-label">Order ID</span>
                            <span className="info-value">#{lastOrder.id.slice(-6)}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Amount</span>
                            <span className="info-value">₹{lastOrder.total}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Time</span>
                            <span className="info-value">{lastOrder.time}</span>
                          </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="progress-tracker">
                          {/* Stage 1: Pending */}
                          <div className={`tracker-stage ${lastOrder.status === 'pending' ? 'active' : lastOrder.status === 'accepted' || lastOrder.status === 'completed' ? 'completed' : ''}`}>
                            <div className="stage-circle">
                              {lastOrder.status === 'accepted' || lastOrder.status === 'completed' ? (
                                <Icon name="check" size={20} />
                              ) : lastOrder.status === 'pending' ? (
                                <span className="pulse-ring"></span>
                              ) : (
                                <Icon name="clock" size={20} />
                              )}
                            </div>
                            <span className="stage-label">Pending</span>
                          </div>

                          <div className={`tracker-line ${lastOrder.status === 'accepted' || lastOrder.status === 'completed' ? 'completed' : ''}`}></div>

                          {/* Stage 2: Accepted */}
                          <div className={`tracker-stage ${lastOrder.status === 'accepted' ? 'active' : lastOrder.status === 'completed' ? 'completed' : ''}`}>
                            <div className="stage-circle">
                              {lastOrder.status === 'completed' ? (
                                <Icon name="check" size={20} />
                              ) : lastOrder.status === 'accepted' ? (
                                <span className="pulse-ring"></span>
                              ) : (
                                <Icon name="delivery" size={20} />
                              )}
                            </div>
                            <span className="stage-label">Accepted</span>
                          </div>

                          <div className={`tracker-line ${lastOrder.status === 'completed' ? 'completed' : ''}`}></div>

                          {/* Stage 3: Completed */}
                          <div className={`tracker-stage ${lastOrder.status === 'completed' ? 'active completed' : ''}`}>
                            <div className="stage-circle">
                              {lastOrder.status === 'completed' ? (
                                <Icon name="check" size={20} />
                              ) : (
                                <Icon name="party" size={20} />
                              )}
                            </div>
                            <span className="stage-label">Completed</span>
                          </div>
                        </div>

                        {/* Current Status Badge */}
                        <div className="current-status">
                          <div className={`status-badge badge-${lastOrder.status}`}>
                            {lastOrder.status === 'pending' && 'Waiting for seller to accept'}
                            {lastOrder.status === 'accepted' && 'Order is being prepared'}
                            {lastOrder.status === 'completed' && 'Order delivered successfully!'}
                            {lastOrder.status === 'rejected' && 'Order was rejected'}
                            {lastOrder.status === 'cancelled' && 'Order was cancelled'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-orders">
                        <Icon name="cart" size={48} />
                        <p>No orders yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Old phone mockup - hidden */}
          <div className="phone-mockup" style={{display: 'none'}}>
            <div className="phone-notch"></div>
            <div className="phone-screen">
            <div className="notification notif-1">
                <span className="notif-icon"><Icon name="party" size={35} /></span>
                <div className="notif-content">
                  <span className="notif-title">Order Confirmed!</span>
                  <span className="notif-text">Your pizza is ready</span>
                </div>
              </div>
              
              <div className="progress-tracker">
                <div className="tracker-step done">
                  <div className="step-circle">Done</div>
                  <span>Placed</span>
                </div>
                <div className="tracker-line done"></div>
                <div className="tracker-step done">
                  <div className="step-circle">✓</div>
                  <span>Cooking</span>
                </div>
                <div className="tracker-line active"></div>
                <div className="tracker-step active">
                  <div className="step-circle pulse"></div>
                  <span>Delivery</span>
                </div>
                <div className="tracker-line"></div>
                <div className="tracker-step">
                  <div className="step-circle">○</div>
                  <span>Done</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Orbiting food items */}
          <div className="food-orbit orbit-1"><Icon name="snack" size={48} /></div>
          <div className="food-orbit orbit-2"><Icon name="burger" size={48} /></div>
          <div className="food-orbit orbit-3"><Icon name="snack" size={48} /></div>
          <div className="food-orbit orbit-4"><Icon name="beverage" size={48} /></div>
          <div className="food-orbit orbit-5"><Icon name="chocolate" size={48} /></div>
          <div className="food-orbit orbit-6"><Icon name="cake" size={48} /></div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className={`scroll-indicator ${!showScrollIndicator ? 'hidden' : ''}`}>
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <span className="scroll-text">Scroll to explore</span>
      </div>

      {/* TRENDING PRODUCTS SECTION */}
      <section className="trending-section">
        <div className="trending-header">
          <div className="trending-title-wrap">
            <span className="trending-icon"><Icon name="fire" size={40} /></span>
            <div>
              <h2 className="trending-title">Trending Now</h2>
              <p className="trending-subtitle">Most loved items this week</p>
            </div>
          </div>
          <button
            className="view-all-trending"
            onClick={() => navigate('/products')}
          >
            View All <span className="arrow">→</span>
          </button>
        </div>
        
        {loadingTrending ? (
          <div className="product-grid">
            {Array(8).fill(0).map((_, idx) => (
              <div key={idx} className="product-placeholder"></div>
            ))}
          </div>
        ) : (
          <div className="trending-grid">
            {trendingProducts.map((product, index) => (
              <div key={product._id || product.id} className="trending-product-wrapper">
                {index < 3 && (
                  <div className="trending-badge">
                    <Icon name="fire" size={16} />
                    <span>#{index + 1}</span>
                  </div>
                )}
                <ProductCard
                  product={product}
                  onClick={() => navigate(`/products/${product._id || product.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTS BY CATEGORY */}
      {loading ? (
        <section className="featured-products">
          <h2>Loading Products...</h2>
          <div className="product-grid">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="product-placeholder"></div>
              ))}
          </div>
        </section>
      ) : (
        <>
          {categories.map((cat) => {
            const categoryProducts = productsByCategory[cat.name];
            if (!categoryProducts || categoryProducts.length === 0) return null;

            return (
              <section key={cat.name} className="featured-products">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 32 }}><Icon name={cat.icon} size={32} /></span>
                    <h2 style={{ margin: 0 }}>{cat.name}</h2>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                    }
                    style={{
                      padding: "10px 20px",
                      background: "#fff",
                      color: "#6366f1",
                      border: "2px solid #6366f1",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#6366f1";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#6366f1";
                    }}
                  >
                    View All →
                  </button>
                </div>
                <div className="product-grid">
                  {categoryProducts.map((p) => (
                    <ProductCard
                      key={p._id || p.id}
                      product={p}
                      onClick={() => navigate(`/products/${p._id || p.id}`)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* BECOME A SELLER SECTION */}
      <section className="become-seller">
        <div className="seller-wrapper">
          <div className="seller-content">
            <div className="seller-badge"><Icon name="fire" size={20} /> Start Selling Today</div>
            <h2 className="seller-title">
              Turn Your Passion Into <span>Profit</span>
            </h2>
            <p className="seller-description">
              Join our thriving marketplace and reach thousands of hungry customers. 
              Set your own prices, manage your inventory, and grow your business with ease.
            </p>
            <div className="seller-features">
              <div className="feature-item">
                <span className="feature-icon"><Icon name="dollar" size={32} /></span>
                <div>
                  <h4>Earn More</h4>
                  <p>Competitive commission rates</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><Icon name="chart" size={32} /></span>
                <div>
                  <h4>Easy Management</h4>
                  <p>Intuitive seller dashboard</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><Icon name="target" size={32} /></span>
                <div>
                  <h4>Reach Customers</h4>
                  <p>Access to large user base</p>
                </div>
              </div>
            </div>
            <button 
              className="seller-cta-button"
              onClick={() => navigate('/register?role=seller')}
            >
              <span>Start Selling Now</span>
              <span className="arrow">→</span>
            </button>
          </div>
          <div className="seller-visual">
            <div className="visual-card card-1">
              <div className="card-icon"><Icon name="chart" size={48} /></div>
              <div className="card-stat">+250%</div>
              <div className="card-label">Growth</div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon"><Icon name="users" size={48} /></div>
              <div className="card-stat">5000+</div>
              <div className="card-label">Active Users</div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon"><Icon name="star" size={48} /></div>
              <div className="card-stat">4.8/5</div>
              <div className="card-label">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* STYLES */}
      <style jsx>{`
        body {
          margin: 0;
          font-family: "Poppins", sans-serif;
          background: #fafbfc;
        }

        .home {
          width: 100%;
          background: #fafbfc;
        }

        /* HERO */
        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
          min-height: 80vh;
          position: relative;
          overflow: hidden;
          flex-wrap: wrap;
        }
        .hero-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          gap: 4rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .hero-left {
          flex: 1;
          min-width: 300px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.08);
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.15);
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
        }
        .hero-title {
          font-size: clamp(2.5rem, 5.5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: #0f172a;
          letter-spacing: -1px;
        }
        .hero-title .highlight {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
        .hero-subtitle {
          font-size: 1.05rem;
          color: #475569;
          margin-bottom: 2rem;
          line-height: 1.7;
          max-width: 520px;
          font-weight: 400;
        }
        .hero-left h2 {
          font-size: clamp(3.2rem, 7vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #1e293b;
          letter-spacing: -1px;
        }
        .hero-left h2 span {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
        .hero-left p {
          font-size: 1.25rem;
          color: #475569;
          margin-bottom: 2.5rem;
          line-height: 1.8;
          max-width: 520px;
        }
        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .btn-primary {
          padding: 1rem 2.2rem;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
        }
        .btn-outline {
          padding: 1rem 2.2rem;
          border: 2px solid #e2e8f0;
          color: #64748b;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          background: #fff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-outline:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
          color: #6366f1;
          transform: translateY(-2px);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          margin-top: 3rem;
          padding: 1.5rem 2.5rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          width: fit-content;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          position: relative;
        }
        .stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }
        .stat-divider {
          width: 1px;
          height: 45px;
          background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
        }
        .hero-right {
          flex: 1;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 400px;
          min-height: 500px;
        }

        /* Phone Mockup - Clean Design */
        .phone-mockup {
          width: 340px;
          height: 680px;
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 45px;
          padding: 14px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          position: relative;
          z-index: 10;
        }

        .phone-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 32px;
          background: #0f172a;
          border-radius: 0 0 22px 22px;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        .phone-notch::after {
          content: '';
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: rgba(99, 102, 241, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
          animation: cameraBlink 4s ease-in-out infinite;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 35px;
          overflow: hidden;
          position: relative;
          padding: 2.5rem 1.5rem;
        }
        

        /* Notifications - Clean */
        .notification {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          gap: 1rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 3;
        }
        .notif-1 {
          top: 40px;
          left: 10px;
          right: 10px;
        }
        .notif-2 {
          top: 130px;
          left: 10px;
          right: 10px;
          animation-delay: 1.5s;
        }
        .notif-icon {
          font-size: 2rem;
        }
        .notif-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .notif-title {
          font-weight: 700;
          color: #1e293b;
          font-size: 0.95rem;
        }
        .notif-text {
          font-size: 0.8rem;
          color: #64748b;
        }
        

        
        /* Mini Map - Clean */
        .mini-map {
          position: absolute;
          bottom: 180px;
          left: 1.5rem;
          right: 1.5rem;
          height: 220px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .map-bg {
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.05), transparent 50%),
            linear-gradient(45deg, #f0f9ff 25%, transparent 25%),
            linear-gradient(-45deg, #f0f9ff 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f9ff 75%),
            linear-gradient(-45deg, transparent 75%, #f0f9ff 75%);
          background-size: 100% 100%, 20px 20px, 20px 20px, 20px 20px, 20px 20px;
          background-position: 0 0, 0 0, 0 10px, 10px -10px, -10px 0px;
          opacity: 0.4;
          animation: mapPan 10s ease-in-out infinite;
        }
        .delivery-route {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .route-line {
          position: absolute;
          top: 50%;
          left: 20%;
          right: 20%;
          height: 4px;
          background: linear-gradient(90deg, 
            #6366f1ff 0%, 
            #8b5cf6 50%, 
            rgba(139, 92, 246, 0.3) 100%
          );
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          animation: routePulse 2s ease-in-out infinite;
        }
        .route-line::after {
          content: '';
          position: absolute;
          top: -3px;
          left: 0;
          width: 10px;
          height: 10px;
          background: #6366f1;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.8);
          animation: routeDot 3s ease-in-out infinite;
        }
        .delivery-scooter {
          position: absolute;
          font-size: 2.8rem;
          top: 50%;
          left: 20%;
          transform: translate(-50%, -50%);
          animation: moveScooter 4s ease-in-out infinite;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
        }
        .location-markers {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .marker {
          position: absolute;
          font-size: 2.4rem;
          top: 50%;
          transform: translateY(-50%);
          animation: markerPulse 2s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }
        .marker.start {
          left: 15%;
        }
        .marker.end {
          right: 15%;
          animation-delay: 1s;
        }
        .marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%);
          border-radius: 50%;
          animation: markerRipple 2s ease-out infinite;
        }
        .marker.end::after {
          animation-delay: 1s;
        }
        

        
        /* Progress Tracker - Clean */
        .progress-tracker {
          position: absolute;
          bottom: 40px;
          left: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.3rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .tracker-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          transition: all 0.4s ease;
        }
        .tracker-step.done {
          color: #6366f1;
          animation: stepComplete 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .tracker-step.active {
          color: #8b5cf6;
          transform: scale(1.1);
        }
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .tracker-step.done .step-circle {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .tracker-step.active .step-circle {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: #fff;
          box-shadow: 
            0 4px 12px rgba(139, 92, 246, 0.5),
            0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        .step-circle.pulse {
          animation: circlePulse 1.5s ease-in-out infinite;
        }
        .tracker-line {
          flex: 1;
          height: 4px;
          background: #e2e8f0;
          margin: 0 0.5rem;
          margin-bottom: 2rem;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .tracker-line.done {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
        }
        .tracker-line.active {
          background: #e2e8f0;
        }
        .tracker-line.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 50%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 2px;
          animation: lineProgress 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
        }
        

        
        /* Orbiting Food - Subtle */
        .food-orbit {
          position: absolute;
          font-size: 2.5rem;
          animation: orbit3D 12s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          opacity: 0.6;
        }
        .orbit-1 {
          top: 8%;
          right: 5%;
          animation-delay: 0s;
        }
        .orbit-2 {
          top: 35%;
          right: 2%;
          animation-delay: 1.7s;
        }
        .orbit-3 {
          bottom: 35%;
          right: 8%;
          animation-delay: 3.4s;
        }
        .orbit-4 {
          bottom: 15%;
          left: 5%;
          animation-delay: 5.1s;
        }
        .orbit-5 {
          top: 45%;
          left: 2%;
          animation-delay: 6.8s;
        }
        .orbit-6 {
          top: 12%;
          left: 8%;
          animation-delay: 8.5s;
        }
        
        @keyframes moveScooter {
          0% {
            left: 20%;
            transform: translate(-50%, -50%) scaleX(1);
          }
          45% {
            transform: translate(-50%, -50%) scaleX(1);
          }
          50% {
            left: 80%;
            transform: translate(-50%, -50%) scaleX(1);
          }
          55% {
            transform: translate(-50%, -50%) scaleX(-1);
          }
          95% {
            transform: translate(-50%, -50%) scaleX(-1);
          }
          100% {
            left: 20%;
            transform: translate(-50%, -50%) scaleX(1);
          }
        }
        @keyframes orbit3D {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }
        @keyframes lineProgress {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        /* CATEGORIES */
        .categories {
          text-align: center;
          padding: 4rem 2rem;
        }
        .section-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .section-title span {
          color: #6366f1;
        }
        .section-desc {
          font-size: 1rem;
          color: #64748b;
          margin-bottom: 2.5rem;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 1300px;
          margin: 0 auto;
        }
        .category-card {
          background: #fff;
          padding: 1.8rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #f1f5f9;
        }
        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        /* FEATURED PRODUCTS */
        .featured-products {
          padding: 3rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
        }
        .featured-products h2 {
          font-size: 1.6rem;
          margin-bottom: 0;
          color: #0f172a;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1300px;
          margin: 0 auto;
        }
        @media (max-width: 1200px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }
        .product-placeholder {
          height: 300px;
          background: #f1f5f9;
          border-radius: 16px;
          animation: pulse 2s infinite;
        }

        /* BECOME A SELLER SECTION */
        .become-seller {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          position: relative;
          overflow: hidden;
          margin-top: 4rem;
        }

        .seller-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .seller-content {
          color: #fff;
        }
        .seller-badge {
          display: inline-block;
          padding: 0.5rem 1.2rem;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .seller-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }
        .seller-title span {
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);
        }
        .seller-description {
          font-size: 1.05rem;
          line-height: 1.7;
          opacity: 0.9;
          margin-bottom: 2.5rem;
        }
        .seller-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .feature-item:hover {
          background: rgba(255,255,255,0.15);
        }
        .feature-icon {
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .feature-item h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .feature-item p {
          margin: 0.25rem 0 0 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .seller-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1.2rem 2.5rem;
          background: #fff;
          color: #667eea;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .seller-cta-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        .seller-cta-button .arrow {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }
        .seller-cta-button:hover .arrow {
          transform: translateX(5px);
        }
        .seller-visual {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          position: relative;
        }
        .visual-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          color: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .visual-card:hover {
          transform: translateY(-10px) scale(1.05);
          background: rgba(255,255,255,0.2);
        }
        .card-1 {
          grid-column: 1 / 2;
        }
        .card-2 {
          grid-column: 2 / 3;
        }
        .card-3 {
          grid-column: 1 / 3;
        }
        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        .card-stat {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }
        .card-label {
          font-size: 1rem;
          opacity: 0.9;
          font-weight: 500;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        /* Scroll Indicator */
        .scroll-indicator {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
          z-index: 10;
          animation: fadeIn 1s ease backwards;
          animation-delay: 1.2s;
          opacity: 1;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .scroll-indicator.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
          pointer-events: none;
        }
        .scroll-mouse {
          width: 28px;
          height: 45px;
          border: 2px solid #6366f1;
          border-radius: 20px;
          position: relative;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
        }
        .scroll-wheel {
          width: 4px;
          height: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 2px;
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          animation: scrollWheel 2s ease-in-out infinite;
        }
        .scroll-text {
          font-size: 0.75rem;
          color: #6366f1;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        @keyframes scrollWheel {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(16px);
          }
        }

        /* Trending Section */
        .trending-section {
          padding: 4rem 2rem;
          max-width: 1300px;
          margin: 3rem auto;
          background: #ffffff;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.03);
        }
        .trending-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }
        .trending-title-wrap {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .trending-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 16px rgba(251, 146, 60, 0.2);
        }
        .trending-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .trending-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0.4rem 0 0;
          font-weight: 400;
        }
        .view-all-trending {
          padding: 0.8rem 1.8rem;
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .view-all-trending:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
          background: #1e293b;
        }
        .view-all-trending .arrow {
          font-size: 1.3rem;
          transition: transform 0.3s ease;
        }
        .view-all-trending:hover .arrow {
          transform: translateX(5px);
        }
        .trending-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
        }
        .trending-product-wrapper {
          position: relative;
        }
        .trending-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          color: #fff;
          padding: 0.35rem 0.7rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
          z-index: 10;
          border: 2px solid #fff;
        }
        @media (max-width: 1200px) {
          .trending-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 900px) {
          .trending-section {
            padding: 3rem 1.5rem;
            margin: 2rem 1rem;
          }
          .trending-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .trending-title {
            font-size: 1.8rem;
          }
        }
        @media (max-width: 600px) {
          .trending-grid {
            grid-template-columns: 1fr;
          }
          .trending-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .view-all-trending {
            width: 100%;
            justify-content: center;
          }
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
            padding: 2.5rem 1.5rem;
            min-height: auto;
          }
          .hero-wrapper {
            gap: 2.5rem;
          }
          .hero-left {
            order: 2;
          }
          .hero-left h2 {
            font-size: clamp(2.2rem, 9vw, 3.5rem);
          }
          .hero-left p {
            font-size: 1.05rem;
            margin: 0 auto 2rem;
            max-width: 400px;
          }
          .hero-buttons {
            justify-content: center;
          }
          .btn-primary, .btn-outline {
            padding: 1rem 2rem;
          }
          .hero-right {
            order: 1;
            min-height: auto;
          }
          .main-snack {
            width: 85%;
            max-width: 320px;
          }
          .floating {
            width: 130px;
          }
          .floating.one {
            top: -10px;
            left: -30px;
          }
          .floating.two {
            bottom: 10px;
            right: -30px;
          }
          .categories-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
          .seller-wrapper {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            text-align: center;
          }
          .seller-title {
            font-size: 1.8rem;
          }
          .seller-features {
            align-items: center;
          }
          .feature-item {
            max-width: 400px;
          }
          .feature-item:hover {
            transform: translateX(0) scale(1.02);
          }
          .seller-cta-button {
            width: 100%;
            justify-content: center;
          }
          .visual-card {
            padding: 1.5rem;
          }
          .card-stat {
            font-size: 2rem;
          }
        }
      `}</style>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-container">
          {/* Footer Top */}
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <Icon name="moon" size={32} />
                <span className="footer-brand-name">Midnight Cravings</span>
              </div>
              <p className="footer-tagline">
                Your late-night craving companion. Quick delivery of snacks, drinks, and more right to your hostel room.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">
                  <Icon name="fire" size={20} />
                </a>
                <a href="#" className="social-link">
                  <Icon name="star" size={20} />
                </a>
                <a href="#" className="social-link">
                  <Icon name="heart" size={20} />
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-title">Quick Links</h4>
                <ul className="footer-list">
                  <li><a href="/products" className="footer-link">Browse Menu</a></li>
                  <li><a href="/cart" className="footer-link">My Cart</a></li>
                  <li><a href="/orders" className="footer-link">Track Order</a></li>
                  <li><a href="/seller" className="footer-link">Become Seller</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="footer-title">Categories</h4>
                <ul className="footer-list">
                  <li><a href="/products" className="footer-link">Snacks</a></li>
                  <li><a href="/products" className="footer-link">Beverages</a></li>
                  <li><a href="/products" className="footer-link">Desserts</a></li>
                  <li><a href="/products" className="footer-link">Fast Food</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="footer-title">Support</h4>
                <ul className="footer-list">
                  <li><a href="#" className="footer-link">Help Center</a></li>
                  <li><a href="#" className="footer-link">Contact Us</a></li>
                  <li><a href="#" className="footer-link">Terms of Service</a></li>
                  <li><a href="#" className="footer-link">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Midnight Cravings. All rights reserved.
            </p>
            <p className="footer-made">
              Made with <Icon name="heart" size={16} /> for hungry students
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        /* Footer Styles */
        .home-footer {
          background: #0f172a;
          color: #fff;
          margin-top: 5rem;
        }

        .footer-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1.5fr 2fr;
          gap: 4rem;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-brand-name {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-tagline {
          color: #9ca3af;
          line-height: 1.6;
          font-size: 14px;
          max-width: 350px;
        }

        .footer-social {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
          transform: translateY(-3px);
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link {
          color: #9ca3af;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .footer-link:hover {
          color: #fbbf24;
          transform: translateX(4px);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-copyright,
        .footer-made {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 900px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 600px) {
          .footer-container {
            padding: 40px 20px 20px;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .footer-tagline {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
