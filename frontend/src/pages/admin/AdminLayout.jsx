import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/admin/users", label: "Users" },
    { path: "/admin/sellers", label: "Sellers" },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin Panel</h2>
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
          width: 240px;
          background: #111827;
          color: white;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          justify-content: start;
          box-shadow: 2px 0 12px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 40px;
          color: #f9fafb;
          text-align: center;
          letter-spacing: 1px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-link {
          display: block;
          color: #d1d5db;
          padding: 12px 16px;
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

        /* Main content */
        .content {
          flex: 1;
          padding: 32px;
          background: #f9fafb;
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        /* Shadow card effect for each content section */
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

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .sidebar {
            width: 200px;
            padding: 24px 16px;
          }
          .logo {
            font-size: 20px;
            margin-bottom: 32px;
          }
        }

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
          .nav-link {
            padding: 10px 12px;
          }
          .content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
