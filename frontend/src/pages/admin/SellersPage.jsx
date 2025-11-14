import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [profileModal, setProfileModal] = useState(false);
  const [currentSeller, setCurrentSeller] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [banFilter, setBanFilter] = useState("");

  useEffect(() => {
    fetchSellers();
  }, []);

  // Filter sellers when search/filter changes
  useEffect(() => {
    let filtered = [...sellers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.shopName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((s) => s.sellerStatus === statusFilter);
    }

    // Ban filter
    if (banFilter) {
      const isBanned = banFilter === "banned";
      filtered = filtered.filter((s) => s.banned === isBanned);
    }

    setFilteredSellers(filtered);
  }, [sellers, searchQuery, statusFilter, banFilter]);

  const fetchSellers = async () => {
    try {
      const res = await api.get("/api/admin/sellers");
      setSellers(res.data);
      setFilteredSellers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: sellers.length,
    pending: sellers.filter((s) => s.sellerStatus === "pending_verification")
      .length,
    approved: sellers.filter((s) => s.sellerStatus === "approved").length,
    rejected: sellers.filter((s) => s.sellerStatus === "rejected").length,
    banned: sellers.filter((s) => s.banned).length,
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/api/admin/seller/${id}/verify`, { status: "approved" });
      toast.success("Seller approved");
      setSellers((prev) =>
        prev.map((s) => (s._id === id ? { ...s, sellerStatus: "approved" } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/api/admin/seller/${id}/verify`, { status: "rejected" });
      toast.success("Seller rejected");
      setSellers((prev) =>
        prev.map((s) => (s._id === id ? { ...s, sellerStatus: "rejected" } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    }
  };

  const handleBanToggle = async (id) => {
    try {
      const res = await api.patch(`/api/admin/seller/${id}/ban`);
      toast.success(res.data.message);
      setSellers((prev) =>
        prev.map((s) => (s._id === id ? { ...s, banned: res.data.banned } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Ban toggle failed");
    }
  };

  const handleViewProfile = async (id) => {
    try {
      const res = await api.get(`/api/admin/seller/${id}`);
      setCurrentSeller(res.data);
      setProfileModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch profile");
    }
  };

  if (loading) return <div className="container">Loading sellers...</div>;

  return (
    <div className="container">
      {/* Header with Stats */}
      <div className="header">
        <h2 className="mainTitle">Sellers Management <Icon name="store" size={28} /></h2>
        <div className="stats">
          <div className="statCard">
            <div className="statNumber">{stats.total}</div>
            <div className="statLabel">Total Sellers</div>
          </div>
          <div className="statCard pending">
            <div className="statNumber">{stats.pending}</div>
            <div className="statLabel">Pending</div>
          </div>
          <div className="statCard approved">
            <div className="statNumber">{stats.approved}</div>
            <div className="statLabel">Approved</div>
          </div>
          <div className="statCard rejected">
            <div className="statNumber">{stats.rejected}</div>
            <div className="statLabel">Rejected</div>
          </div>
          <div className="statCard banned">
            <div className="statNumber">{stats.banned}</div>
            <div className="statLabel">Banned</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, email, or shop..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchInput"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filterSelect"
        >
          <option value="">All Status</option>
          <option value="pending_verification">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={banFilter}
          onChange={(e) => setBanFilter(e.target.value)}
          className="filterSelect"
        >
          <option value="">All Sellers</option>
          <option value="active">Active Only</option>
          <option value="banned">Banned Only</option>
        </select>
        {(searchQuery || statusFilter || banFilter) && (
          <button
            className="clearBtn"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setBanFilter("");
            }}
          >
            <Icon name="x" size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="resultsInfo">
        Showing {filteredSellers.length} of {sellers.length} sellers
      </div>

      {sellers.length === 0 ? (
        <p>No sellers found.</p>
      ) : filteredSellers.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon"><Icon name="store" size={48} /></div>
          <h3>No sellers found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="seller-grid">
          {filteredSellers.map((s) => {
            const statusClass =
              s.sellerStatus?.toLowerCase().replace(/\s+/g, "_") ||
              "pending_verification";
            const imageSrc = s.collegeIdUrl
              ? s.collegeIdUrl.startsWith('http')
                ? s.collegeIdUrl
                : s.collegeIdUrl.startsWith('/')
                ? `http://localhost:5001${s.collegeIdUrl}`
                : `http://localhost:5001/uploads/${s.collegeIdUrl}`
              : "https://via.placeholder.com/150?text=No+ID";

            return (
              <div key={s._id} className="seller-card">
                <div className="seller-image-container">
                  <img
                    src={imageSrc}
                    alt={s.name}
                    className="seller-image"
                    onClick={() => {
                      setCurrentImage(imageSrc);
                      setImageModal(true);
                    }}
                  />
                  <div className={`status-badge ${statusClass}`}>
                    {s.sellerStatus || "Pending"}
                  </div>
                </div>

                <div className="seller-info">
                  <div className="seller-name">{s.name}</div>
                  <div className="seller-email">{s.email}</div>
                  <div>
                    <strong>Hostel:</strong> {s.hostelBlock || "-"}
                  </div>
                  <div>
                    <strong>Room No:</strong> {s.roomNumber || "-"}
                  </div>
                  <div>
                    <strong>Ban Status:</strong>{" "}
                    {s.banned ? "Banned" : "Active"}
                  </div>
                </div>

                <div className="seller-actions">
                  {statusClass === "pending_verification" && (
                    <>
                      <button
                        className="btn approve"
                        onClick={() => handleApprove(s._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => handleReject(s._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {statusClass === "approved" && (
                    <button
                      className="btn ban"
                      onClick={() => handleBanToggle(s._id)}
                    >
                      {s.banned ? "Unban" : "Ban"}
                    </button>
                  )}
                  <button
                    className="btn view"
                    onClick={() => handleViewProfile(s._id)}
                  >
                    See Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div className="image-modal" onClick={() => setImageModal(false)}>
          <img src={currentImage} alt="Full View" />
        </div>
      )}

      {/* Profile Modal */}
      {profileModal && currentSeller && (
        <div className="profile-modal" onClick={() => setProfileModal(false)}>
          <div
            className="profile-content"
            onClick={(e) => e.stopPropagation()} // Prevent close on inner click
          >
            <h3>Seller Profile</h3>
            <img
              src={
                currentSeller.collegeIdUrl
                  ? currentSeller.collegeIdUrl.startsWith('http')
                    ? currentSeller.collegeIdUrl
                    : currentSeller.collegeIdUrl.startsWith('/')
                    ? `http://localhost:5001${currentSeller.collegeIdUrl}`
                    : `http://localhost:5001/uploads/${currentSeller.collegeIdUrl}`
                  : "https://via.placeholder.com/200?text=No+Image"
              }
              alt={currentSeller.name}
              className="profile-img"
            />
            <div className="profile-details">
              <p><strong>Name:</strong> {currentSeller.name}</p>
              <p><strong>Email:</strong> {currentSeller.email}</p>
              <p><strong>Shop Name:</strong> {currentSeller.shopName || "-"}</p>
              <p><strong>Hostel Block:</strong> {currentSeller.hostelBlock || "-"}</p>
              <p><strong>Room Number:</strong> {currentSeller.roomNumber || "-"}</p>
              <p><strong>UPI ID:</strong> {currentSeller.upiId || "-"}</p>
              <p><strong>Status:</strong> {currentSeller.sellerStatus}</p>
              <p><strong>Banned:</strong> {currentSeller.banned ? "Yes" : "No"}</p>
              <p><strong>Created At:</strong> {new Date(currentSeller.createdAt).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(currentSeller.updatedAt).toLocaleString()}</p>
            </div>
            <button className="close-btn" onClick={() => setProfileModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Internal CSS */}
      <style>{`
        .container {
          padding: 32px;
          font-family: 'Poppins', sans-serif;
          max-width: 1400px;
          margin: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .mainTitle {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .statCard {
          background: #ffffff;
          border: 2px solid #6366f1;
          padding: 16px 24px;
          border-radius: 12px;
          min-width: 120px;
          text-align: center;
        }

        .statCard.pending {
          border-color: #f59e0b;
        }

        .statCard.approved {
          border-color: #10b981;
        }

        .statCard.rejected {
          border-color: #ef4444;
        }

        .statCard.banned {
          border-color: #6b7280;
        }

        .statNumber {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #111827;
        }

        .statCard.pending .statNumber { color: #f59e0b; }
        .statCard.approved .statNumber { color: #10b981; }
        .statCard.rejected .statNumber { color: #ef4444; }
        .statCard.banned .statNumber { color: #6b7280; }

        .statLabel {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .searchInput {
          flex: 1;
          min-width: 250px;
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          font-size: 15px;
          transition: all 0.2s;
        }

        .searchInput:focus {
          border-color: #6366f1;
          outline: none;
        }

        .filterSelect {
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 150px;
        }

        .filterSelect:focus {
          border-color: #6366f1;
          outline: none;
        }

        .clearBtn {
          padding: 12px 20px;
          background: #f3f4f6;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clearBtn.disabled {
          background: #e5e7eb;
          color: #374151;
        }

        .resultsInfo {
          margin-bottom: 16px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
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

        .seller-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .seller-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
          border: 2px solid #f3f4f6;
        }



        .seller-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          cursor: pointer;
        }

        .seller-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
          color: #fff;
          font-size: 12px;
          text-transform: capitalize;
        }

        .status-badge.pending_verification { 
          background: #f59e0b;
        }
        .status-badge.approved { 
          background: #10b981;
        }
        .status-badge.rejected { 
          background: #ef4444;
        }

        .seller-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          background: #f9fafb;
          flex: 1;
        }

        .seller-info > div {
          display: flex;
          align-items: center;
          color: #4b5563;
          line-height: 1.5;
        }

        .seller-info strong {
          color: #1f2937;
          margin-right: 6px;
          font-weight: 600;
        }

        .seller-name {
          font-weight: 700;
          font-size: 18px;
          color: #1f2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .seller-email {
          color: #6366f1;
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .seller-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 16px 20px;
          background: #fff;
          border-top: 1px solid #f3f4f6;
        }

        .btn {
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.3s;
          flex: 1;
          min-width: fit-content;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .btn.approve { 
          background: #10b981;
          color: #fff;
        }
        .btn.reject { 
          background: #ef4444;
          color: #fff;
        }
        .btn.ban { 
          background: #6366f1;
          color: #fff;
        }
        .btn.view { 
          background: #2563eb;
          color: #fff;
        }

        /* Modal Styles */
        .image-modal,
        .profile-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
          animation: modalFadeIn 0.3s ease;
        }

        .image-modal img {
          max-width: 90%;
          max-height: 90%;
          border-radius: 16px;
          object-fit: contain;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: zoomIn 0.3s ease;
        }

        .profile-content {
          background: linear-gradient(135deg, #ffffff, #f9fafb);
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 500px;
          text-align: center;
          color: #111827;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .profile-img {
          width: 100%;
          max-height: 280px;
          object-fit: contain;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          background: #fff;
          padding: 8px;
        }

        .profile-details {
          text-align: left;
          font-size: 14px;
          line-height: 1.8;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .profile-details > div {
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .profile-details > div:last-child {
          border-bottom: none;
        }

        .close-btn {
          margin-top: 24px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 32px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }

        .close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239,68,68,0.4);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .seller-grid { 
            grid-template-columns: 1fr;
          }
          
          .stats-cards {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-direction: column;
            gap: 12px;
          }

          .filters input,
          .filters select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
