import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function SellerReviews() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get(`/api/reviews/seller/${sellerId}`),
        api.get(`/api/reviews/seller/${sellerId}/stats`),
      ]);

      setReviews(reviewsRes.data);
      setStats(statsRes.data);
      
      // Get seller info from first review
      if (reviewsRes.data.length > 0 && reviewsRes.data[0].seller_id) {
        setSeller(reviewsRes.data[0].seller_id);
      } else {
        // Fetch seller info separately
        try {
          const sellerRes = await api.get(`/api/seller/info/${sellerId}`);
          setSeller(sellerRes.data);
        } catch (err) {
          console.error("Could not fetch seller info:", err);
        }
      }
    } catch (err) {
      toast.error("Failed to load seller reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStarRating = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? "#fbbf24" : "none"}
          stroke={i < rating ? "#fbbf24" : "#d1d5db"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "40px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#6b7280",
            cursor: "pointer",
            marginBottom: 24,
          }}
        >
          ← Back
        </button>

        {/* Seller Header */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {(seller?.name || "S")[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1f2937", margin: "0 0 4px" }}>
                {seller?.name}
              </h1>
              {seller?.shopName && (
                <p style={{ fontSize: 16, color: "#6b7280", margin: "0 0 4px" }}>
                  {seller.shopName}
                </p>
              )}
              {seller?.hostelBlock && (
                <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
                  Hostel: {seller.hostelBlock}
                </p>
              )}
            </div>
          </div>

          {/* Rating Stats */}
          {stats && stats.totalReviews > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: 20,
                background: "#f9fafb",
                borderRadius: 12,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: "#1f2937" }}>
                  {stats.averageRating}
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8 }}>
                  {getStarRating(Math.round(stats.averageRating))}
                </div>
                <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                  {stats.totalReviews} reviews
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div
                    key={star}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#6b7280", width: 20 }}>{star}★</span>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: "#e5e7eb",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${
                            stats.totalReviews > 0
                              ? (stats.ratingDistribution[star] / stats.totalReviews) * 100
                              : 0
                          }%`,
                          height: "100%",
                          background: "#fbbf24",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 13, color: "#6b7280", width: 30 }}>
                      {stats.ratingDistribution[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1f2937", marginBottom: 16 }}>
          Customer Reviews
        </h2>

        {reviews.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 60,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ fontSize: 16, color: "#6b7280" }}>No reviews yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {getStarRating(review.rating)}
                    </div>
                    <p style={{ fontSize: 15, color: "#1f2937", lineHeight: 1.6, margin: 0 }}>
                      {review.comment}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 12,
                    borderTop: "1px solid #e5e7eb",
                    marginTop: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#6b7280",
                      }}
                    >
                      {(review.user_id?.name || "U")[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      {review.user_id?.name || "Anonymous"}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
