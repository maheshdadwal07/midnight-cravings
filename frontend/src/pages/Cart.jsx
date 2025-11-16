import React, { useContext, useState } from 'react'
import { CartContext } from '../context/CartProvider'
import { AuthContext } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { createRazorpayOrder, loadRazorpay, completePayment } from '../services/payment'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'

export default function Cart() {
  const { items, updateQuantity, removeItem, clear } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  
  // Delivery address customization
  const [customDelivery, setCustomDelivery] = useState(false)
  const [deliveryHostel, setDeliveryHostel] = useState('')
  const [deliveryRoom, setDeliveryRoom] = useState('')

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = items.length > 0 ? 40 : 0
  const tax = subtotal * 0.05 // 5% tax
  const total = subtotal + deliveryFee + tax
  
  const hostels = [
    "Archimedes A",
    "Archimedes B",
    "Marco Polo",
    "Francaline A",
    "Francaline B",
    "Aristotle",
    "Alfred Nobel A",
    "Alfred Nobel B",
  ]

  const handleQuantityChange = (sellerProductId, newQty) => {
    if (newQty < 1) {
      removeItem(sellerProductId)
    } else {
      updateQuantity(sellerProductId, newQty)
    }
  }

  const placeOrders = async () => {
    if (!user) {
      toast.error('Please login to place orders')
      navigate('/login')
      return
    }
    if (items.length === 0) return
    
    // Determine delivery hostel (custom or user's default)
    const finalDeliveryHostel = customDelivery ? deliveryHostel : user?.hostelBlock;
    
    // Validate custom delivery address if enabled
    if (customDelivery) {
      if (!deliveryHostel || !deliveryRoom) {
        toast.error('Please enter delivery hostel and room number')
        return
      }
    }
    
    // Check if all sellers are from the same hostel as delivery address
    const wrongHostelItems = items.filter(item => {
      const sellerHostel = item.sellerProduct_id?.seller_id?.hostelBlock;
      return sellerHostel && sellerHostel !== finalDeliveryHostel;
    });
    
    if (wrongHostelItems.length > 0) {
      toast.error('All sellers must be from your delivery hostel (' + finalDeliveryHostel + '). Please remove items from other hostels or change your delivery address.');
      return;
    }
    
    setPlacing(true)
    try {
      const amount = Math.round(total)

      // 1) create razorpay order on backend
      const rzOrder = await createRazorpayOrder(amount)

      // 2) load checkout script
      await loadRazorpay()

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        name: "Midnight Cravings",
        description: "Order payment",
        order_id: rzOrder.id,
        handler: async function (response) {
          try {
            const res = await completePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
              customDelivery: customDelivery ? {
                hostel: deliveryHostel,
                room: deliveryRoom
              } : null,
            });
            if (res.ok) {
              clear();
              toast.success("Payment successful! Orders placed.");
              navigate('/my-orders');
            } else {
              toast.error("Payment verified but order creation failed");
            }
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Shopping Cart
          </h1>
          <p style={{ color: "#6b7280", margin: 0, fontSize: 15 }}>
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          // Empty Cart State
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "64px 32px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}><Icon name="cart" size={64} /></div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Your cart is empty
            </h2>
            <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 15 }}>
              Add some delicious items to get started!
            </p>
            <button
              onClick={() => navigate("/products")}
              style={{
                padding: "12px 24px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4f46e5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: 24,
            }}
          >
            {/* Cart Items */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 20,
                }}
              >
                Cart Items
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {items.map((item) => (
                  <div
                    key={item.sellerProduct_id}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: 16,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      background: "#fafafa",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#d1d5db")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#e5e7eb")
                    }
                  >
                    {/* Product Image */}
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#f3f4f6",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          item.image
                            ? item.image.startsWith('http')
                              ? item.image
                              : item.image.startsWith('/')
                              ? `http://localhost:5001${item.image}`
                              : `http://localhost:5001/uploads/${item.image}`
                            : "https://via.placeholder.com/100"
                        }
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#111827",
                          margin: "0 0 6px",
                        }}
                      >
                        {item.name}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          margin: "0 0 4px",
                        }}
                      >
                        ₹{item.price} each
                      </p>
                      {item.sellerProduct_id?.seller_id && (
                        <div style={{ 
                          fontSize: 12, 
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginBottom: 8,
                        }}>
                          <span style={{ opacity: 0.7, fontWeight: 600, fontSize: 11 }}>Seller:</span>
                          <span style={{ fontWeight: 500 }}>
                            {item.sellerProduct_id.seller_id.name}
                            {item.sellerProduct_id.seller_id.shopName && (
                              <span style={{ opacity: 0.7 }}> ({item.sellerProduct_id.seller_id.shopName})</span>
                            )}
                          </span>
                          {item.sellerProduct_id.seller_id.hostelBlock && (
                            <>
                              <span style={{ opacity: 0.5, margin: "0 4px" }}>•</span>
                              <span style={{ opacity: 0.8, fontWeight: 600, fontSize: 11 }}>Hostel: {item.sellerProduct_id.seller_id.hostelBlock}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginTop: "auto",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                typeof item.sellerProduct_id === 'object' ? item.sellerProduct_id._id : item.sellerProduct_id,
                                item.quantity - 1
                              )
                            }
                            style={{
                              width: 32,
                              height: 32,
                              border: "1px solid #d1d5db",
                              borderRadius: 6,
                              background: "#fff",
                              fontSize: 16,
                              fontWeight: 600,
                              cursor: "pointer",
                              color: "#374151",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#6366f1";
                              e.currentTarget.style.color = "#6366f1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#d1d5db";
                              e.currentTarget.style.color = "#374151";
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#111827",
                              minWidth: 30,
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                typeof item.sellerProduct_id === 'object' ? item.sellerProduct_id._id : item.sellerProduct_id,
                                item.quantity + 1
                              )
                            }
                            style={{
                              width: 32,
                              height: 32,
                              border: "1px solid #d1d5db",
                              borderRadius: 6,
                              background: "#fff",
                              fontSize: 16,
                              fontWeight: 600,
                              cursor: "pointer",
                              color: "#374151",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#6366f1";
                              e.currentTarget.style.color = "#6366f1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#d1d5db";
                              e.currentTarget.style.color = "#374151";
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(typeof item.sellerProduct_id === 'object' ? item.sellerProduct_id._id : item.sellerProduct_id)}
                          style={{
                            marginLeft: "auto",
                            padding: "6px 12px",
                            background: "transparent",
                            border: "1px solid #fecaca",
                            borderRadius: 6,
                            color: "#dc2626",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#111827",
                        flexShrink: 0,
                      }}
                    >
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ height: "fit-content" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  position: "sticky",
                  top: 24,
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 20,
                  }}
                >
                  Order Summary
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280", fontSize: 15 }}>
                      Subtotal ({items.length} items)
                    </span>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280", fontSize: 15 }}>
                      Delivery Fee
                    </span>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      ₹{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280", fontSize: 15 }}>
                      Tax (5%)
                    </span>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      ₹{tax.toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      borderTop: "2px solid #e5e7eb",
                      marginTop: 8,
                      paddingTop: 16,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                      Total
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#6366f1" }}>
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Address Section */}
                {user && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 16,
                      background: "#f9fafb",
                      borderRadius: 10,
                      border: "2px solid #e5e7eb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>
                        Delivery Address
                      </h3>
                      <button
                        onClick={() => {
                          setCustomDelivery(!customDelivery)
                          if (!customDelivery) {
                            setDeliveryHostel(user?.hostelBlock || '')
                            setDeliveryRoom(user?.roomNumber || '')
                          }
                        }}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          background: customDelivery ? "#6366f1" : "#fff",
                          color: customDelivery ? "#fff" : "#6366f1",
                          border: "1px solid #6366f1",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {customDelivery ? "Custom" : "Change"}
                      </button>
                    </div>
                    
                    {!customDelivery ? (
                      <div style={{ fontSize: 14, color: "#4b5563" }}>
                        <div style={{ marginBottom: 4 }}>
                          <strong>Hostel:</strong> {user?.hostelBlock || "Not set"}
                        </div>
                        <div>
                          <strong>Room:</strong> {user?.roomNumber || "Not set"}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                        <select
                          value={deliveryHostel}
                          onChange={(e) => setDeliveryHostel(e.target.value)}
                          style={{
                            padding: "10px",
                            fontSize: 14,
                            border: "2px solid #e5e7eb",
                            borderRadius: 8,
                            background: "#fff",
                            outline: "none",
                          }}
                        >
                          <option value="">Select Hostel</option>
                          {hostels.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Room Number"
                          value={deliveryRoom}
                          onChange={(e) => setDeliveryRoom(e.target.value)}
                          style={{
                            padding: "10px",
                            fontSize: 14,
                            border: "2px solid #e5e7eb",
                            borderRadius: 8,
                            background: "#fff",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {!user && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: 14,
                      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                      border: "2px solid #fbbf24",
                      borderRadius: 10,
                      fontSize: 14,
                      color: "#78350f",
                      textAlign: "center",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🔒</span>
                    Please login to place your order
                  </div>
                )}

                <button
                  onClick={placeOrders}
                  disabled={placing || !user}
                  style={{
                    width: "100%",
                    marginTop: 16,
                    padding: "14px",
                    background: placing || !user ? "#9ca3af" : "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: placing || !user ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!placing && user) e.currentTarget.style.background = "#4f46e5";
                  }}
                  onMouseLeave={(e) => {
                    if (!placing && user) e.currentTarget.style.background = "#6366f1";
                  }}
                >
                  {!user ? "Login to Checkout" : placing ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
