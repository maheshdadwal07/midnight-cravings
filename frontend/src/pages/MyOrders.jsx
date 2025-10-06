import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthProvider'
import Button from '../components/Button'

export default function MyOrders() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let mounted = true
    if (!user) return
    api.get('/api/orders/my-orders')
      .then(res => mounted && setOrders(res.data))
      .catch(() => {})
    return () => { mounted = false }
  }, [user])

  if (!user) return <div className="container" style={{paddingTop:32}}>Please login to view orders.</div>

  return (
    <div className="container" style={{paddingTop:32}}>
      <h2 style={{fontSize:22,fontWeight:700}}>My Orders</h2>
      {orders.length === 0 ? <p style={{marginTop:16,color:'#6b7280'}}>No orders yet.</p> : (
        <ul style={{marginTop:16,display:'grid',gap:18}}>
          {orders.map(o => (
            <li key={o._id} className="card" style={{padding:18}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:700}}>{o.sellerProduct_id?.product_id?.name}</div>
                  <div style={{fontSize:13,color:'#6b7280'}}>Qty: {o.quantity}</div>
                </div>
                <div style={{fontSize:15,fontWeight:700}}>₹{o.totalPrice}</div>
              </div>
              <div style={{marginTop:8,fontSize:13,color:'#6b7280'}}>Status: <span style={{fontWeight:700,color:'#6366f1'}}>{o.status}</span></div>
              <div style={{marginTop:12,textAlign:'right'}}>
                <Button variant="secondary">View</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
