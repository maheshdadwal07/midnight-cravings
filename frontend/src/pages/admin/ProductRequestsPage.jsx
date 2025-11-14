import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";

export default function ProductRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const res = await api.get(`/api/product-requests?status=${filter}`);
      setRequests(res.data);
    } catch {
      toast.error("Failed to fetch requests");
    }
  };

  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      await api.patch(`/api/product-requests/${selectedRequest._id}/approve`, { adminNote });
      toast.success("Product request approved!");
      setShowModal(false);
      setAdminNote("");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request) => {
    const note = prompt("Enter rejection reason (optional):");
    if (note === null) return;

    try {
      await api.patch(`/api/product-requests/${request._id}/reject`, { adminNote: note });
      toast.success("Product request rejected");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/100";
    // If image already starts with http or /, use as is
    if (img.startsWith('http') || img.startsWith('/uploads/')) {
      return img.startsWith('http') ? img : `http://localhost:5001${img}`;
    }
    // Otherwise add /uploads/ prefix
    return `http://localhost:5001/uploads/${img}`;
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1e293b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon name="plus" size={32} /> Product Requests
        </h1>
        <p style={{ color: "#64748b" }}>Manage seller product requests</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", borderBottom: "2px solid #e2e8f0" }}>
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "12px 24px",
              border: "none",
              borderBottom: filter === status ? "3px solid #6366f1" : "3px solid transparent",
              background: "none",
              fontSize: "16px",
              fontWeight: filter === status ? "700" : "500",
              color: filter === status ? "#6366f1" : "#64748b",
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s ease",
            }}
          >
            {status === "pending" && <Icon name="clock" size={16} />} {status === "approved" && <Icon name="check" size={16} />} {status === "rejected" && <Icon name="x" size={16} />}{" "}
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "80px", marginBottom: "16px" }}><Icon name="package" size={80} /></div>
          <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>
            No {filter} requests
          </h3>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {requests.map((request) => (
            <div
              key={request._id}
              style={{
                background: "#fff",
                border: "2px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                gap: "24px",
                transition: "all 0.3s ease",
              }}
            >
              {/* Product Image */}
              <img
                src={getImageUrl(request.image)}
                alt={request.productName}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />

              {/* Request Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                      {request.productName}
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                      By: {request.seller_id?.name || "Unknown"} ({request.seller_id?.shopName || "No shop name"})
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "6px 16px",
                      background:
                        request.status === "pending"
                          ? "#fef3c7"
                          : request.status === "approved"
                          ? "#d1fae5"
                          : "#fee2e2",
                      color:
                        request.status === "pending"
                          ? "#92400e"
                          : request.status === "approved"
                          ? "#065f46"
                          : "#991b1b",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      height: "fit-content",
                    }}
                  >
                    {request.status}
                  </span>
                </div>

                <p style={{ color: "#475569", fontSize: "15px", marginBottom: "16px", lineHeight: "1.6" }}>
                  {request.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Category</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="package" size={16} /> {request.category}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Suggested Price</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
                      ₹{request.suggestedPrice}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Initial Stock</div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
                      {request.stock} units
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Requested</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {request.adminNote && (
                  <div
                    style={{
                      padding: "16px",
                      background: "#f1f5f9",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      borderLeft: "4px solid #6366f1",
                    }}
                  >
                    <strong style={{ fontSize: "14px", color: "#475569" }}>Admin Note:</strong>
                    <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>{request.adminNote}</p>
                  </div>
                )}

                {request.status === "approved" && request.createdProduct_id && (
                  <div
                    style={{
                      padding: "12px",
                      background: "#d1fae5",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#065f46",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <Icon name="check" size={14} /> Product created successfully! Product ID: {request.createdProduct_id._id}
                  </div>
                )}

                {/* Actions */}
                {request.status === "pending" && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => handleApprove(request)}
                      style={{
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <Icon name="check" size={15} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      style={{
                        padding: "12px 24px",
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <Icon name="x" size={15} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
              Approve Product Request
            </h3>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              This will create the product and automatically create a listing for the seller.
            </p>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Admin Note (Optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add any note for the seller..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  background: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "none",
                  borderRadius: "8px",
                  background: processing
                    ? "#cbd5e1"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: processing ? "not-allowed" : "pointer",
                }}
              >
                {processing ? "Processing..." : "Approve & Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
