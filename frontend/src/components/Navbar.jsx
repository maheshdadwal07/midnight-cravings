import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartProvider";
import feather from "feather-icons";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { items } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  // Feather icons
  useEffect(() => {
    feather.replace();
  }, [mobileOpen, userDropdownOpen, isMobile]);

  // Handle window resize and click outside
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 815);
    checkMobile(); // initial check

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener("resize", checkMobile);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <i data-feather="box"></i>
          Midnight
          <span style={styles.logoHighlight}>Cravings</span>
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display: isMobile ? "none" : "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>
              <i data-feather="search"></i>
            </button>
          </form>

          <NavItem
            to="/products"
            label="Products"
            active={location.pathname === "/products"}
          />
          {user && user.role === "user" && (
            <NavItem
              to="/my-orders"
              label="My Orders"
              active={location.pathname === "/my-orders"}
           
            />
          )}

          <Link to="/cart" style={styles.cartIcon}>
            <i data-feather="shopping-cart"></i>
            {items.length > 0 && (
              <span style={styles.cartBadge}>
                {items.length > 99 ? "99+" : items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div style={styles.userContainer} ref={dropdownRef}>
              <div
                style={styles.userBadge}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                {user.name[0].toUpperCase()}
              </div>
              {userDropdownOpen && (
                <div style={styles.userDropdown}>
                  <div style={styles.arrow}></div>
                  <div style={styles.userInfoRow}>
                    <strong>Name:</strong> {user.name}
                  </div>
                  <div style={styles.userInfoRow}>
                    <strong>Email:</strong> {user.email || "N/A"}
                  </div>
                  {user.role === "admin" && (
                    <Link to="/admin" style={styles.dropdownLink}>
                      Admin
                    </Link>
                  )}
                  {user.role === "seller" && (
                    <Link to="/seller" style={styles.dropdownLink}>
                      Dashboard
                    </Link>
                  )}
                  <button style={styles.logoutButton} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.navLink}>
                Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger Toggle */}
        {isMobile && (
          <button
            style={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <i data-feather={mobileOpen ? "x" : "menu"}></i>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <div
          style={{
            ...styles.mobileMenu,
            maxHeight: mobileOpen ? "500px" : "0",
            opacity: mobileOpen ? 1 : 0,
          }}
        >
          <form onSubmit={handleSearch} style={styles.mobileSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.mobileSearchInput}
            />
            <button type="submit" style={styles.mobileSearchBtn}>
              <i data-feather="search"></i>
            </button>
          </form>

          <NavItem
            to="/products"
            label="Products"
            active={location.pathname === "/products"}
            isMobile
            onClick={() => setMobileOpen(false)}
          />
          {user && user.role === "user" && (
            <NavItem
              to="/my-orders"
              label="My Orders"
              active={location.pathname === "/my-orders"}
              isMobile
              onClick={() => setMobileOpen(false)}
            />
          )}

          <Link
            to="/cart"
            style={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            Cart {items.length > 0 && `(${items.length})`}
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  style={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Admin
                </Link>
              )}
              {user.role === "seller" && (
                <Link
                  to="/seller"
                  style={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button style={styles.logoutButtonMobile} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// NavItem component
function NavItem({ to, label, active, isMobile, onClick }) {
  return (
    <Link
      to={to}
      style={{
        ...styles.navItem,
        ...(active ? styles.navItemActive : {}),
        ...(isMobile ? styles.mobileLink : {}),
      }}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

// Styles
const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
  },
  navContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "0.8rem 1rem",
  },
  logo: {
    fontSize: "clamp(1.2rem, 4vw, 1.7rem)",
    fontWeight: 700,
    color: "#111827",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoHighlight: { color: "#6366f1" },
  navItem: {
    fontSize: "0.95rem",
    textDecoration: "none",
    color: "#6b7280",
    fontWeight: 500,
    padding: "8px 14px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
  navItemActive: { color: "#111827", fontWeight: 600, background: "#f3f4f6" },
  cartIcon: {
    position: "relative",
    fontSize: "1.4rem",
    color: "#4b5563",
    display: "flex",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#6366f1",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userContainer: { position: "relative" },
  userBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
  },
  userDropdown: {
    position: "absolute",
    top: "55px",
    right: "0",
    backgroundColor: "#fff",
    padding: "16px 20px",
    borderRadius: "12px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "220px",
    zIndex: 1001,
  },
  arrow: {
    position: "absolute",
    top: "-10px",
    right: "16px",
    width: 0,
    height: 0,
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    borderBottom: "10px solid #fff",
  },
  userInfoRow: { fontSize: "0.92rem", color: "#111827" },
  logoutButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  logoutButtonMobile: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    margin: "4px 12px",
  },
  authLinks: { display: "flex", alignItems: "center", gap: "12px" },
  navLink: { color: "#6b7280", textDecoration: "none" },
  registerBtn: {
    background: "#6366f1",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "8px",
    textDecoration: "none",
  },
  hamburger: {
    background: "transparent",
    border: "none",
    fontSize: "1.8rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#111827", // ensure visible color
  },
  mobileMenu: {
    overflow: "hidden",
    transition: "all 0.4s ease",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    background: "rgba(255,255,255,0.95)",
  },
  mobileSearch: { display: "flex", gap: "6px", padding: "8px 12px" },
  mobileSearchInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  mobileSearchBtn: {
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
  },
  mobileLink: {
    padding: "8px 12px",
    textDecoration: "none",
    color: "#111827",
    borderRadius: "8px",
    margin: "4px 12px",
    background: "#f3f4f6",
  },
  searchForm: { display: "flex", gap: "4px" },
  searchInput: {
    padding: "6px 12px",
    borderRadius: "999px 0 0 999px",
    border: "1px solid #ccc",
  },
  searchBtn: {
    padding: "6px 12px",
    borderRadius: "0 999px 999px 0",
    border: "none",
    background: "#6366f1",
    color: "#fff",
  },
};
