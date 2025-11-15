import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ReviewModal({ order, seller, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    // Get seller ID from either the seller prop or the order's sellerProduct
    const sellerId = seller?._id || order.sellerProduct_id?.seller_id?._id || order.sellerProduct_id?.seller_id;
    
    if (!sellerId) {
      toast.error("Seller information is missing");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/reviews", {
        order_id: order._id,
        seller_id: sellerId,
        rating,
        comment: comment.trim(),
      });

      toast.success("Thank you for your review! 🎉");
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (r) => {
    switch (r) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
            Write a Review
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.background = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 24,
              cursor: submitting ? "not-allowed" : "pointer",
              color: "#6b7280",
              padding: 0,
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              transition: "all 0.2s ease",
              transform: "scale(1)",
              boxShadow: "none",
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {/* Seller Info */}
          {(() => {
            const sellerData = seller || order.sellerProduct_id?.seller_id;
            return sellerData ? (
              <div
                style={{
                  background: "#f9fafb",
                  padding: 16,
                  borderRadius: 10,
                  marginBottom: 24,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>
                  Seller
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#6366f1",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {(sellerData.name || "S")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 15 }}>
                      {sellerData.name || "Seller"}
                    </div>
                    {sellerData.shopName && (
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {sellerData.shopName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Rating */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                marginBottom: 12,
                fontWeight: 600,
                fontSize: 15,
                color: "#374151",
              }}
            >
              Rating
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    pointerEvents: "auto",
                    transition: "transform 0.2s ease",
                    transform: "scale(1)",
                    boxShadow: "none",
                  }}
                >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={star <= rating ? "#fbbf24" : "none"}
                      stroke={star <= rating ? "#fbbf24" : "#d1d5db"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ 
                        pointerEvents: "none",
                      }}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div style={{ fontSize: 14, fontWeight: 500, color: "#6366f1" }}>
                {getRatingLabel(rating)}
              </div>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 15,
                color: "#374151",
              }}
            >
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this seller..."
              rows={4}
              maxLength={500}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              required
              minLength={10}
            />
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
              {comment.length}/500 {comment.length < 10 && "• Minimum 10 characters"}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{
                flex: 1,
                padding: "12px 20px",
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.5 : 1,
                color: "#6b7280",
                transition: "box-shadow 0.2s ease",
                transform: "none",
                boxShadow: "none",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              onMouseEnter={(e) => {
                if (!submitting && rating > 0) e.currentTarget.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{
                flex: 1,
                padding: "12px 20px",
                border: "none",
                background: submitting || rating === 0 ? "#cbd5e1" : "#6366f1",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting || rating === 0 ? "not-allowed" : "pointer",
                transition: "box-shadow 0.2s ease",
                transform: "none",
                boxShadow: "none",
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
      </form>
      </div>
    </div>
  );
}
