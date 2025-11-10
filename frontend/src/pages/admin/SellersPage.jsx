import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageModal, setImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [profileModal, setProfileModal] = useState(false);
  const [currentSeller, setCurrentSeller] = useState(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await api.get("/api/admin/sellers");
      setSellers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
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
      <h2 className="mainTitle">Sellers Management</h2>

      {sellers.length === 0 ? (
        <p>No sellers found.</p>
      ) : (
        <div className="seller-grid">
          {sellers.map((s) => {
            const statusClass =
              s.sellerStatus?.toLowerCase().replace(/\s+/g, "_") ||
              "pending_verification";
            const imageSrc = s.collegeIdUrl
              ? `http://localhost:5001${s.collegeIdUrl}`
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
                  ? `http://localhost:5001${currentSeller.collegeIdUrl}`
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
          max-width: 1200px;
          margin: auto;
        }

        .mainTitle {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .seller-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .seller-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .seller-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
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
          top: 8px;
          left: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          color: #fff;
          font-size: 12px;
        }

        .status-badge.pending_verification { background: orange; }
        .status-badge.approved { background: green; }
        .status-badge.rejected { background: red; }

        .seller-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
        }

        .seller-name {
          font-weight: 700;
          font-size: 16px;
        }

        .seller-email {
          color: #6b7280;
          font-size: 14px;
        }

        .seller-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 0 16px 16px;
        }

        .btn {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }

        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn.approve { background: #10b981; color: #fff; }
        .btn.reject { background: #ef4444; color: #fff; }
        .btn.ban { background: #6366f1; color: #fff; }
        .btn.view { background: #2563eb; color: #fff; }

        /* Modal Styles */
        .image-modal,
        .profile-modal {
          position: fixed;
          top:0;
          left:0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
        }

        .image-modal img {
          max-width: 90%;
          max-height: 90%;
          border-radius: 12px;
          object-fit: contain;
        }

        .profile-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 100%;
          max-width: 450px;
          text-align: center;
          color: #111827;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          animation: fadeIn 0.3s ease;
        }

        .profile-img {
          width: 100%;
          max-height: 240px;
          object-fit: contain;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .profile-details {
          text-align: left;
          font-size: 14px;
          line-height: 1.5;
        }

        .close-btn {
          margin-top: 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 600;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 768px) {
          .seller-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
