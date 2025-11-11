import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statistics, setStatistics] = useState({
    total: 0,
    buyers: 0,
    sellers: 0,
    admins: 0,
    bannedUsers: 0
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      // Filter to show only buyers (regular users)
      const buyers = res.data.filter(u => u.role === "user");
      setUsers(buyers);
      setFilteredUsers(buyers);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
      setDeleteModal(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  // Filter and calculate statistics
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((u) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);

    // Calculate statistics for buyers only
    const stats = {
      total: users.length,
      buyers: users.length, // All are buyers now
      sellers: 0,
      admins: 0,
      bannedUsers: users.filter((u) => u.banned === true).length
    };
    setStatistics(stats);
  }, [users, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h2 className="mainTitle">👥 Buyers Management</h2>
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">�</div>
            <div className="stat-details">
              <div className="stat-label">Total Buyers</div>
              <div className="stat-value">{statistics.total}</div>
            </div>
          </div>
          <div className="stat-card buyers">
            <div className="stat-icon">✅</div>
            <div className="stat-details">
              <div className="stat-label">Active Buyers</div>
              <div className="stat-value">{statistics.total - statistics.bannedUsers}</div>
            </div>
          </div>
          <div className="stat-card banned">
            <div className="stat-icon">🚫</div>
            <div className="stat-details">
              <div className="stat-label">Banned Buyers</div>
              <div className="stat-value">{statistics.bannedUsers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="results-info">
        Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> buyers
      </div>

      {filteredUsers.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">🔍</div>
          <h3>No buyers found</h3>
          <p>Try adjusting your search</p>
        </div>
      ) : (
        <div className="user-grid">
          {filteredUsers.map((u) => (
            <div key={u._id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                {u.banned && (
                  <div className="role-badge banned-badge-header">
                    🚫 Banned
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{u.name}</div>
                <div className="user-email">{u.email}</div>
                {u.hostelBlock && (
                  <div className="user-detail">
                    <span className="detail-icon">🏢</span>
                    Hostel: {u.hostelBlock}
                  </div>
                )}
                {u.roomNumber && (
                  <div className="user-detail">
                    <span className="detail-icon">🚪</span>
                    Room: {u.roomNumber}
                  </div>
                )}
                {u.phoneNumber && (
                  <div className="user-detail">
                    <span className="detail-icon">�</span>
                    Phone: {u.phoneNumber}
                  </div>
                )}
              </div>
              <div className="user-actions">
                <button
                  className="btn btnView"
                  onClick={() => {
                    setTarget(u);
                    setViewModal(true);
                  }}
                >
                  👁️ View
                </button>
                <button
                  className="btn btnRed"
                  onClick={() => {
                    setTarget(u);
                    setDeleteModal(true);
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="User Details"
      >
        {target && (
          <div className="view-modal-content">
            <div className="view-avatar-large">
              {target.name?.charAt(0).toUpperCase()}
            </div>
            <div className="view-details">
              <div className="view-row">
                <strong>Name:</strong> {target.name}
              </div>
              <div className="view-row">
                <strong>Email:</strong> {target.email}
              </div>
              {target.hostelBlock && (
                <div className="view-row">
                  <strong>Hostel Block:</strong> {target.hostelBlock}
                </div>
              )}
              {target.roomNumber && (
                <div className="view-row">
                  <strong>Room Number:</strong> {target.roomNumber}
                </div>
              )}
              {target.phoneNumber && (
                <div className="view-row">
                  <strong>Phone:</strong> {target.phoneNumber}
                </div>
              )}
              <div className="view-row">
                <strong>Ban Status:</strong> 
                <span style={{ color: target.banned ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  {target.banned ? '🚫 Banned' : '✅ Active'}
                </span>
              </div>
              <div className="view-row">
                <strong>Joined:</strong> {new Date(target.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="⚠️ Confirm Delete"
      >
        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#6b7280' }}>
          Are you sure you want to delete user <strong style={{ color: '#111827' }}>{target?.name}</strong>?
          <br />
          <span style={{ color: '#ef4444', fontSize: '14px' }}>This action cannot be undone.</span>
        </p>
        <div className="actionsRight">
          <button className="btn btnGray" onClick={() => setDeleteModal(false)}>
            Cancel
          </button>
          <button
            className="btn btnRed"
            onClick={() => handleDelete(target._id)}
          >
            Delete User
          </button>
        </div>
      </Modal>

      {/* Internal CSS */}
      <style>{`
        .container {
          max-width: 1400px;
          margin: auto;
          padding: 32px;
          font-family: 'Poppins', sans-serif;
        }

        .header {
          margin-bottom: 32px;
        }

        .mainTitle {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          transition: all 0.3s;
          color: white;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
        }

        .stat-card.buyers {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .stat-card.buyers:hover {
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
        }

        .stat-card.sellers {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .stat-card.sellers:hover {
          box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
        }

        .stat-card.admins {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }

        .stat-card.admins:hover {
          box-shadow: 0 12px 24px rgba(245, 158, 11, 0.3);
        }

        .stat-card.banned {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .stat-card.banned:hover {
          box-shadow: 0 12px 24px rgba(239, 68, 68, 0.3);
        }

        .stat-icon {
          font-size: 36px;
          line-height: 1;
        }

        .stat-details {
          flex: 1;
        }

        .stat-label {
          font-size: 13px;
          opacity: 0.9;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin-top: 4px;
        }

        .filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .filter-select {
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 160px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .results-info {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #6366f1;
        }

        .results-info strong {
          color: #6366f1;
          font-weight: 700;
        }

        .emptyState {
          text-align: center;
          padding: 60px 20px;
          background: #f9fafb;
          border-radius: 16px;
          border: 2px dashed #e5e7eb;
        }

        .emptyIcon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .emptyState h3 {
          font-size: 20px;
          color: #374151;
          margin-bottom: 8px;
        }

        .emptyState p {
          color: #9ca3af;
          font-size: 14px;
        }

        .user-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .user-card {
          background: #fff;
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
          border: 2px solid #f3f4f6;
          overflow: hidden;
        }

        .user-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
          border-color: #6366f1;
        }

        .user-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .banned-badge-header {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .user-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          flex: 1;
        }

        .user-name {
          font-weight: 700;
          font-size: 18px;
          color: #1f2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-email {
          color: #6366f1;
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4b5563;
        }

        .detail-icon {
          font-size: 16px;
        }

        .user-actions {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          background: #fff;
          border-top: 1px solid #f3f4f6;
        }

        .btn {
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          border: none;
          transition: all 0.3s;
          flex: 1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btnView {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
        }

        .btnRed {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
        }

        .btnGray {
          background: #f3f4f6;
          color: #111;
          border: 2px solid #e5e7eb;
        }

        .btnGray:hover {
          background: #e5e7eb;
        }

        .actionsRight {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .view-modal-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .view-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 700;
          color: white;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .view-details {
          width: 100%;
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .view-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #4b5563;
        }

        .view-row:last-child {
          border-bottom: none;
        }

        .view-row strong {
          color: #1f2937;
          font-weight: 600;
          min-width: 140px;
        }

        @media (max-width: 768px) {
          .user-grid {
            grid-template-columns: 1fr;
          }

          .stats-cards {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-direction: column;
          }

          .search-wrapper {
            min-width: 100%;
          }

          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
