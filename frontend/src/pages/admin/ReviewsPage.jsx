import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/api/reviews/admin/all");
      setReviews(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
      setLoading(false);
    }
  };

  const handleFlag = async (reviewId) => {
    try {
      await api.put(`/api/reviews/admin/${reviewId}/flag`);
      toast.success("Review flagged");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to flag review");
    }
  };

  const handleRemove = async (reviewId) => {
    if (!window.confirm("Are you sure you want to remove this review?")) return;
    try {
      await api.put(`/api/reviews/admin/${reviewId}/remove`);
      toast.success("Review removed");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to remove review");
    }
  };

  const handleActivate = async (reviewId) => {
    try {
      await api.put(`/api/reviews/admin/${reviewId}/activate`);
      toast.success("Review activated");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to activate review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: 14,
              color: star <= rating ? "#fbbf24" : "#d1d5db",
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (filterStatus === "all") return true;
    return review.status === filterStatus;
  });

  const statusCounts = {
    all: reviews.length,
    active: reviews.filter((r) => r.status === "active").length,
    flagged: reviews.filter((r) => r.status === "flagged").length,
    removed: reviews.filter((r) => r.status === "removed").length,
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", fontSize: 16 }}>
        Loading reviews...
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#111827" }}>
          Reviews
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
          Moderate customer reviews
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All", color: "#6b7280" },
          { key: "active", label: "Active", color: "#059669" },
          { key: "flagged", label: "Flagged", color: "#d97706" },
          { key: "removed", label: "Removed", color: "#dc2626" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            style={{
              padding: "8px 16px",
              background: filterStatus === key ? color : "#fff",
              color: filterStatus === key ? "#fff" : "#374151",
              border: filterStatus === key ? "none" : "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (filterStatus !== key) {
                e.currentTarget.style.background = "#f9fafb";
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== key) {
                e.currentTarget.style.background = "#fff";
              }
            }}
          >
            {label} · {statusCounts[key]}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.3 }}>💬</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px", color: "#374151" }}>
            No reviews found
          </h3>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            {filterStatus === "all" ? "No reviews submitted" : `No ${filterStatus} reviews`}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            overflow: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Customer
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Seller
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Rating
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Comment
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Date
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review._id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {review.user_id?.name ? review.user_id.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                          {review.user_id?.name || "Unknown"}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          {review.user_id?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                        {review.seller_id?.name || "Unknown"}
                      </div>
                      {review.seller_id?.shopName && (
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          {review.seller_id.shopName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>{renderStars(review.rating)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div
                      style={{
                        maxWidth: 320,
                        fontSize: 13,
                        color: "#374151",
                        lineHeight: 1.6,
                      }}
                    >
                      {review.comment}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        background:
                          review.status === "active"
                            ? "#d1fae5"
                            : review.status === "flagged"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          review.status === "active"
                            ? "#059669"
                            : review.status === "flagged"
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>
                    {formatDate(review.createdAt)}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {review.status === "active" && (
                        <button
                          onClick={() => handleFlag(review._id)}
                          title="Flag"
                          style={{
                            padding: "6px 10px",
                            background: "#fef3c7",
                            color: "#d97706",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 13,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fde68a")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#fef3c7")}
                        >
                          🚩
                        </button>
                      )}
                      {(review.status === "active" || review.status === "flagged") && (
                        <button
                          onClick={() => handleRemove(review._id)}
                          title="Remove"
                          style={{
                            padding: "6px 10px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 13,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fecaca")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#fee2e2")}
                        >
                          ✕
                        </button>
                      )}
                      {(review.status === "flagged" || review.status === "removed") && (
                        <button
                          onClick={() => handleActivate(review._id)}
                          title="Activate"
                          style={{
                            padding: "6px 10px",
                            background: "#d1fae5",
                            color: "#059669",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 13,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#a7f3d0")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#d1fae5")}
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
