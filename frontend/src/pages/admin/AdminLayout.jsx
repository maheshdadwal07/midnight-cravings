import React, { useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { path: "/admin/users", label: "Users" },
    { path: "/admin/sellers", label: "Sellers" },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
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
          <h2 className="logo">Admin Panel</h2>

          {/* Admin Info */}
          {user && user.role === "admin" && (
            <div className="admin-info">
              <div className="admin-avatar">
                {user.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div className="admin-details">
                <div className="admin-name">{user.name}</div>
                <div className="admin-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
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
          width: 250px;
          background: #111827;
          color: white;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 2px 0 12px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          height: 100vh;
        }

        /* Stack top section neatly */
        .sidebar-top {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #f9fafb;
          text-align: center;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        /* Admin Info */
        .admin-info {
          display: flex;
          align-items: center;
          background: #1f2937;
          padding: 12px 14px;
          border-radius: 10px;
          gap: 12px;
        }

        .admin-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .admin-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .admin-name {
          font-weight: 600;
          color: #fff;
          font-size: 0.95rem;
        }

        .admin-email {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }

        .nav-link {
          display: block;
          color: #d1d5db;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: #374151;
          color: white;
        }

        .nav-link.active {
          background: #6366f1;
          color: white;
          font-weight: 600;
        }

        /* Logout Button */
        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
        }

        .logout-btn:hover {
          background: #dc2626;
        }

        .logout-btn:active {
          transform: scale(0.98);
        }

        /* Main content */
        .content {
          flex: 1;
          padding: 32px;
          background: #f9fafb;
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        .content > * {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(15,23,42,0.06);
          margin-bottom: 24px;
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
