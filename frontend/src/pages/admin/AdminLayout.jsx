import React, { useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/sellers", label: "Sellers", icon: "🏪" },
    { path: "/admin/products", label: "Products", icon: "🍫" },
    { path: "/admin/orders", label: "Orders", icon: "📦" },
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
            <div className="logo-icon">🌙</div>
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
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>

      {/* Internal CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .admin-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          background: #f3f4f6;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
          color: white;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          position: sticky;
          top: 0;
          height: 100vh;
        }

        /* Stack top section neatly */
        .sidebar-top {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 28px 20px;
          flex: 1;
          overflow-y: auto;
        }

        .logo-container {
          text-align: center;
          padding: 20px 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .logo-icon {
          font-size: 40px;
          margin-bottom: 8px;
        }

        .logo {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #c7d2fe;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        /* Admin Info */
        .admin-info {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          padding: 16px;
          border-radius: 14px;
          gap: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .admin-info:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .admin-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .admin-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          overflow: hidden;
        }

        .admin-name {
          font-weight: 700;
          color: #fff;
          font-size: 0.95rem;
        }

        .admin-role {
          font-size: 0.7rem;
          color: #a5b4fc;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .admin-email {
          font-size: 0.75rem;
          color: #cbd5e1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #a5b4fc;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #e0e7ff;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-icon {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .nav-label {
          flex: 1;
          font-size: 14px;
        }

        .nav-indicator {
          color: #fff;
          font-size: 8px;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(4px);
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.2);
        }

        .nav-link.active {
          background: linear-gradient(135deg, #818cf8, #6366f1);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        /* Sidebar Bottom */
        .sidebar-bottom {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        /* Logout Button */
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 14px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }

        .logout-btn:active {
          transform: translateY(0);
        }

        /* Main content */
        .content {
          flex: 1;
          padding: 36px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          overflow-y: auto;
          transition: all 0.3s ease;
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
