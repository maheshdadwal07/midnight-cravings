import React, { useContext, useState } from 'react'
import { CartContext } from '../context/CartProvider'
import { AuthContext } from '../context/AuthProvider'
import api from '../services/api'
import { createRazorpayOrder, loadRazorpay, completePayment } from '../services/payment'
import Button from '../components/Button'

export default function Cart() {
  const { items, updateQuantity, removeItem, clear } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const [placing, setPlacing] = useState(false)
  const [message, setMessage] = useState(null)

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const placeOrders = async () => {
    if (!user) return alert('Please login to place orders')
    if (items.length === 0) return
    setPlacing(true)
    try {
      const amount = total

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
          // response: razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            const res = await completePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items,
            });
            if (res.ok) {
              clear();
              setMessage("Payment successful and orders created");
            } else {
              setMessage("Payment verified but order creation failed");
            }
          } catch (err) {
            setMessage(
              err.response?.data?.message || "Payment verification failed"
            );
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setMessage(err.message || 'Payment initiation failed')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container">
      <h2 style={{fontSize:22,fontWeight:700}}>Your Cart</h2>
      {items.length === 0 ? (
        <p style={{marginTop:12,color:'#6b7280'}}>Your cart is empty.</p>
      ) : (
        <div style={{marginTop:12,background:'#fff',padding:14,borderRadius:8}}>
          <ul>
            {items.map(i => (
              <li key={i.sellerProduct_id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:10,borderBottom:'1px solid #f1f5f9'}}>
                <div>
                  <div style={{fontWeight:700}}>{i.name}</div>
                  <div style={{color:'#6b7280'}}>₹{i.price} each</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <input type="number" value={i.quantity} onChange={e => updateQuantity(i.sellerProduct_id, Number(e.target.value))} style={{width:80,padding:6,borderRadius:6,border:'1px solid #e5e7eb'}} />
                  <div style={{fontWeight:800}}>₹{i.price * i.quantity}</div>
                  <button onClick={() => removeItem(i.sellerProduct_id)} style={{background:'transparent',border:'none',color:'#ef4444'}}>Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:18,fontWeight:800}}>Total: ₹{total}</div>
            <div>
              <button onClick={placeOrders} disabled={placing} style={{padding:'10px 14px',background:'#ef6b6b',color:'#fff',border:'none',borderRadius:8}}>{placing ? 'Processing...' : 'Pay Now'}</button>
            </div>
          </div>

          {message && <div style={{marginTop:12,color:'#16a34a'}}>{message}</div>}
        </div>
      )}
    </div>
  )
}
