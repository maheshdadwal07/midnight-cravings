import React, { useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { path: "/admin/users", label: "Users", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
    { path: "/admin/sellers", label: "Sellers", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { path: "/admin/products", label: "Products", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    )},
    { path: "/admin/orders", label: "Orders", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
    )},
    { path: "/admin/product-requests", label: "Product Requests", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    )},
    { path: "/admin/reviews", label: "Reviews", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )},
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-container">
            {/* <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </div> */}
            <h2 className="logo">Midnight Cravings</h2>
            <div className="logo-subtitle">Admin Panel</div>
          </div>

          {/* Admin Info */}
          {user && user.role === "admin" && (
            <div className="admin-info">
              <div className="admin-avatar">
                {user.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div className="admin-details">
                <div className="admin-name">{user.name}</div>
                <div className="admin-role">Administrator</div>
                <div className="admin-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav>
            <div className="nav-section-title">NAVIGATION</div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {location.pathname === item.path && (
                  <span className="nav-indicator">●</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>

      {/* Internal CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .admin-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f9fafb;
        }

        /* Sidebar - Clean Minimal */
        .sidebar {
          width: 260px;
          background: #ffffff;
          color: #1f2937;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px 16px;
          flex: 1;
          overflow-y: auto;
        }

        .logo-container {
          text-align: center;
          padding: 24px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .logo-icon {
          font-size: 32px;
          margin-bottom: 8px;
          color: #6366f1;
        }

        .logo {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.5px;
          margin: 0 0 4px 0;
        }

        .logo-subtitle {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        /* Admin Info - Simple Card */
        .admin-info {
          display: flex;
          align-items: center;
          background: #f9fafb;
          padding: 12px;
          border-radius: 8px;
          gap: 12px;
          border: 1px solid #e5e7eb;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .admin-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          overflow: hidden;
        }

        .admin-name {
          font-weight: 600;
          color: #111827;
          font-size: 0.9rem;
        }

        .admin-role {
          font-size: 0.7rem;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .admin-email {
          font-size: 0.7rem;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-section-title {
          font-size: 10px;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #4b5563;
          padding: 10px 12px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          font-size: 14px;
        }

        .nav-icon {
          font-size: 18px;
        }

        .nav-label {
          flex: 1;
        }

        .nav-indicator {
          color: #6366f1;
          font-size: 6px;
        }

        .nav-link:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .nav-link.active {
          background: #6366f1;
          color: white;
          font-weight: 600;
        }

        /* Sidebar Bottom */
        .sidebar-bottom {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        /* Logout Button */
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #ffffff;
          color: #ef4444;
          border: 1px solid #e5e7eb;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        /* Main content */
        .content {
          flex: 1;
          padding: 32px;
          background: #ffffff;
          overflow-y: auto;
          min-height: 100vh;
        }

        /* Scrollbar styling */
        .content::-webkit-scrollbar {
          width: 8px;
        }
        .content::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        .content::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-container {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            box-shadow: none;
            padding: 16px;
          }
          .logout-btn {
            width: 100%;
            margin-top: 16px;
          }
          .content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
