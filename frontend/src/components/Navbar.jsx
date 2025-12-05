import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartProvider";
import feather from "feather-icons";
import Icon from "./Icon";

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

  // Inject animation styles
  useEffect(() => {
    const styleId = 'navbar-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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

  // ==================== SELLER NAVBAR ====================
  if (user && user.role === "seller") {
    return (
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* Logo */}
          <Link to="/seller" style={styles.logo}>
            <i data-feather="box"></i>
            Midnight
            <span style={styles.logoHighlight}>Cravings</span>
          </Link>

          {/* Desktop - Seller Navigation */}
          <div
            style={{
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <NavItem
              to="/seller"
              label={<><Icon name="chart" size={16} /> Dashboard</>}
              active={location.pathname === "/seller"}
            />
            <div style={styles.navDivider}></div>
            <span style={styles.navLabel}>Quick Actions:</span>
            <button
              onClick={() => {
                navigate("/seller");
                // Simulate click on "My Listings" tab after navigation
                setTimeout(() => {
                  const listingsTab = document.querySelector('[data-tab="listings"]');
                  if (listingsTab) listingsTab.click();
                }, 100);
              }}
              style={styles.quickActionBtn}
            >
              <Icon name="package" size={16} /> Listings
            </button>
            <button
              onClick={() => {
                navigate("/seller");
                setTimeout(() => {
                  const ordersTab = document.querySelector('[data-tab="orders"]');
                  if (ordersTab) ordersTab.click();
                }, 100);
              }}
              style={styles.quickActionBtn}
            >
              <Icon name="package" size={16} /> Orders
            </button>

            {/* User Profile Dropdown */}
            <div style={styles.userContainer} ref={dropdownRef}>
              <div
                style={styles.userBadge}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={styles.avatarText}>{user.name[0].toUpperCase()}</div>
                <div style={styles.statusDot}></div>
              </div>
              {userDropdownOpen && (
                <div style={styles.userDropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div style={styles.dropdownUserInfo}>
                      <div style={styles.dropdownName}>{user.name}</div>
                      <div style={styles.dropdownRole}>
                        <Icon name="package" size={12} /> Seller
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <div style={styles.dropdownSection}>
                    <div style={styles.infoLabel}>Shop Details</div>
                    <div style={styles.infoValue}>
                      <Icon name="store" size={14} /> {user.shopName || "Not set"}
                    </div>
                    <div style={styles.infoValue}>
                      <Icon name="home" size={14} /> {user.hostelBlock || "N/A"} - {user.roomNumber || "N/A"}
                    </div>
                  </div>
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <Link 
                    to="/profile" 
                    style={styles.dropdownMenuItem}
                    onClick={() => setUserDropdownOpen(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon name="user" size={18} />
                    <span>My Profile</span>
                  </Link>
                  
                  <Link 
                    to="/seller" 
                    style={styles.dropdownMenuItem}
                    onClick={() => setUserDropdownOpen(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon name="chart" size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <button 
                    style={styles.logoutButton} 
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    <Icon name="door" size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Toggle - Seller Mobile */}
          {isMobile && (
            <button
              style={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i data-feather={mobileOpen ? "x" : "menu"}></i>
            </button>
          )}
        </div>

        {/* Mobile Menu - Seller */}
        {isMobile && (
          <div
            style={{
              ...styles.mobileMenu,
              maxHeight: mobileOpen ? "400px" : "0",
              opacity: mobileOpen ? 1 : 0,
            }}
          >
            <NavItem
              to="/seller"
              label={<><Icon name="chart" size={16} /> Dashboard</>}
              active={location.pathname === "/seller"}
              isMobile
              onClick={() => setMobileOpen(false)}
            />
            
            <div style={styles.mobileQuickActions}>
              <div style={styles.mobileQuickTitle}>Quick Actions</div>
              <button
                onClick={() => {
                  navigate("/seller");
                  setMobileOpen(false);
                  setTimeout(() => {
                    const listingsTab = document.querySelector('[data-tab="listings"]');
                    if (listingsTab) listingsTab.click();
                  }, 100);
                }}
                style={styles.mobileActionBtn}
              >
                <Icon name="package" size={16} /> My Listings
              </button>
              <button
                onClick={() => {
                  navigate("/seller");
                  setMobileOpen(false);
                  setTimeout(() => {
                    const ordersTab = document.querySelector('[data-tab="orders"]');
                    if (ordersTab) ordersTab.click();
                  }, 100);
                }}
                style={styles.mobileActionBtn}
              >
                <Icon name="package" size={16} /> My Orders
              </button>
            </div>

            <div style={styles.mobileUserInfo}>
              <div style={styles.mobileUserName}>{user.name}</div>
              <div style={styles.mobileUserRole}>Seller Account</div>
              <div style={styles.mobileUserMeta}>
                {user.shopName && <div>Shop: {user.shopName}</div>}
                {user.hostelBlock && <div>Hostel: {user.hostelBlock} - {user.roomNumber}</div>}
              </div>
            </div>
            <Link
              to="/"
              onClick={handleLogout}
              style={styles.mobileLinkDanger}
            >
              <Icon name="door" size={16} /> Logout
            </Link>
          </div>
        )}
      </nav>
    );
  }

  // ==================== ADMIN NAVBAR ====================
  if (user && user.role === "admin") {
    return (
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* Logo */}
          <Link to="/admin/users" style={styles.logo}>
            <i data-feather="shield"></i>
            Midnight
            <span style={styles.logoHighlight}>Admin</span>
          </Link>

          {/* Desktop - Admin Navigation */}
          <div
            style={{
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <NavItem
              to="/admin/users"
              label={<><Icon name="users" size={16} /> Users</>}
              active={location.pathname === "/admin/users"}
            />
            <NavItem
              to="/admin/sellers"
              label={<><Icon name="store" size={16} /> Sellers</>}
              active={location.pathname === "/admin/sellers"}
            />
            <NavItem
              to="/admin/products"
              label={<><Icon name="chocolate" size={16} /> Products</>}
              active={location.pathname === "/admin/products"}
            />
            <NavItem
              to="/admin/orders"
              label={<><Icon name="package" size={16} /> Orders</>}
              active={location.pathname === "/admin/orders"}
            />
          </div>

          {/* User Section - Admin */}
          <div
            style={{
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>Admin</span>
            </div>
            <button 
              onClick={handleLogout} 
              style={styles.logoutBtn}
              onMouseEnter={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#dc2626';
              }}
            >
              <i data-feather="log-out"></i>
              Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            style={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <i data-feather={mobileOpen ? "x" : "menu"}></i>
          </button>
        </div>

        {/* Mobile Menu - Admin */}
        {mobileOpen && (
          <div style={styles.mobileMenu}>
            <Link
              to="/admin/users"
              style={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name="users" size={16} /> Users
            </Link>
            <Link
              to="/admin/sellers"
              style={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name="store" size={16} /> Sellers
            </Link>
            <Link
              to="/admin/products"
              style={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name="chocolate" size={16} /> Products
            </Link>
            <Link
              to="/admin/orders"
              style={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name="package" size={16} /> Orders
            </Link>
            <div style={styles.mobileDivider}></div>
            <div style={styles.mobileUserInfo}>
              <span style={styles.mobileUserName}>{user.name}</span>
              <span style={styles.mobileUserRole}>Admin</span>
            </div>
            <button 
              onClick={handleLogout} 
              style={styles.mobileLogoutBtn}
              onMouseEnter={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#dc2626';
              }}
            >
              <i data-feather="log-out"></i>
              Logout
            </button>
          </div>
        )}
      </nav>
    );
  }

  // ==================== USER NAVBAR ====================
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
          {user && user.role === "seller" && (
            <NavItem
              to="/seller"
              label="Dashboard"
              active={location.pathname === "/seller"}
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
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={styles.avatarText}>{user.name[0].toUpperCase()}</div>
                <div style={styles.statusDot}></div>
              </div>
              {userDropdownOpen && (
                <div style={styles.userDropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div style={styles.dropdownUserInfo}>
                      <div style={styles.dropdownName}>{user.name}</div>
                      <div style={styles.dropdownEmail}>{user.email || "user@example.com"}</div>
                      <div style={styles.dropdownRole}>
                        <Icon name={user.role === "admin" ? "shield" : user.role === "seller" ? "package" : "user"} size={12} />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <Link 
                    to="/profile" 
                    style={styles.dropdownMenuItem}
                    onClick={() => setUserDropdownOpen(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon name="user" size={18} />
                    <span>My Profile</span>
                  </Link>
                  
                  {user.role === "admin" && (
                    <Link 
                      to="/admin" 
                      style={styles.dropdownMenuItem}
                      onClick={() => setUserDropdownOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon name="shield" size={18} />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  {user.role === "seller" && (
                    <Link 
                      to="/seller" 
                      style={styles.dropdownMenuItem}
                      onClick={() => setUserDropdownOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon name="chart" size={18} />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}
                  
                  {user.role === "user" && (
                    <Link 
                      to="/my-orders" 
                      style={styles.dropdownMenuItem}
                      onClick={() => setUserDropdownOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon name="package" size={18} />
                      <span>My Orders</span>
                    </Link>
                  )}
                  
                  <div style={styles.dropdownDivider}></div>
                  
                  <button 
                    style={styles.logoutButton} 
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    <Icon name="door" size={18} />
                    <span>Logout</span>
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
          {user && user.role === "seller" && (
            <NavItem
              to="/seller"
              label="Dashboard"
              active={location.pathname === "/seller"}
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
              <Link
                to="/profile"
                style={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                <Icon name="user" size={16} /> Profile
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  style={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon name="shield" size={16} /> Admin
                </Link>
              )}
              {user.role === "seller" && (
                <Link
                  to="/seller"
                  style={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon name="chart" size={16} /> Dashboard
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
    position: "relative",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1.1rem",
    border: "3px solid #fff",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  avatarText: {
    position: "relative",
    zIndex: 1,
  },
  statusDot: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#10b981",
    border: "2px solid #fff",
    zIndex: 2,
  },
  userDropdown: {
    position: "absolute",
    top: "58px",
    right: "0",
    backgroundColor: "#fff",
    padding: "0",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)",
    width: "280px",
    zIndex: 1001,
    border: "1px solid rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    animation: "dropdownFadeIn 0.2s ease-out",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  dropdownAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1.2rem",
    border: "2px solid rgba(255, 255, 255, 0.3)",
  },
  dropdownUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  dropdownName: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownEmail: {
    fontSize: "12px",
    opacity: 0.9,
    marginBottom: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownRole: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dropdownSection: {
    padding: "12px 20px",
  },
  infoLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  infoValue: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#374151",
    marginBottom: "6px",
    padding: "6px 0",
  },
  dropdownDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, #e5e7eb 50%, transparent)",
    margin: "8px 0",
  },
  dropdownMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    textDecoration: "none",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    margin: "8px 16px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#fef2f2",
    color: "#ef4444",
    border: "2px solid #fee2e2",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s ease",
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
  mobileLinkDanger: {
    padding: "8px 12px",
    textDecoration: "none",
    color: "#fff",
    borderRadius: "8px",
    margin: "4px 12px",
    background: "#ef4444",
    fontWeight: 600,
  },
  mobileUserInfo: {
    padding: "12px",
    margin: "4px 12px",
    background: "#f9fafb",
    borderRadius: "8px",
    borderLeft: "4px solid #6366f1",
  },
  mobileUserName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "4px",
  },
  mobileUserRole: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  mobileUserMeta: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #e5e7eb",
  },
  navDivider: {
    width: "1px",
    height: "24px",
    background: "#e5e7eb",
  },
  navLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 600,
  },
  quickActionBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  mobileQuickActions: {
    padding: "12px",
    margin: "8px 12px",
    background: "#f9fafb",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  mobileQuickTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: "4px",
  },
  mobileActionBtn: {
    padding: "10px",
    background: "#fff",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    textAlign: "left",
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
  // Admin-specific styles
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
  },
  userRole: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "2px solid #dc2626",
    borderRadius: "8px",
    color: "#dc2626",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  mobileLogoutBtn: {
    padding: "12px 16px",
    background: "transparent",
    border: "2px solid #dc2626",
    borderRadius: "8px",
    color: "#dc2626",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    margin: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  mobileDivider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "12px",
  },
};
