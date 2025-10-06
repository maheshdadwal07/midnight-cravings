// import React, { useEffect, useState, useContext } from 'react'
// import api from '../services/api'
// import { AuthContext } from '../context/AuthProvider'
// import toast from 'react-hot-toast'

// export default function SellerDashboard() {
//   const { user } = useContext(AuthContext)
//   const [listings, setListings] = useState([])
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [products, setProducts] = useState([])
//   const [form, setForm] = useState({ productId: '', price: '', stock: '', hostel: '' })
//   const [editingId, setEditingId] = useState(null)
//   const [savingId, setSavingId] = useState(null)
//   const [creating, setCreating] = useState(false)

//   useEffect(() => {
//     let mounted = true
//     if (!user) return

//     Promise.all([
//       api.get('/api/orders/seller-orders'),
//       api.get('/api/seller'),
//       api.get('/api/products')
//     ])
//       .then(([oRes, sRes, pRes]) => {
//         if (!mounted) return
//         setOrders(oRes.data || [])
//         setListings(sRes.data || [])
//         // products should come from the products API response
//         setProducts(pRes.data || [])
//       })
//       .catch(() => {})
//       .finally(() => mounted && setLoading(false))

//     return () => { mounted = false }
//   }, [user])

//   if (!user) return <div className="container" style={{paddingTop:32}}>Please login as a seller to view dashboard.</div>
//   if (user.role !== 'seller') return <div className="container" style={{paddingTop:32}}>This area is for sellers only.</div>

//   return (
//     <div className="container" style={{paddingTop:32}}>
//       <h2 style={{fontSize:22,fontWeight:700}}>Seller Dashboard</h2>
//       <p style={{color:'#6b7280',marginTop:6}}>Manage your listings and view incoming orders.</p>

//       <div style={{display:'grid',gridTemplateColumns:'1fr',gap:18,marginTop:16}}>
//         <section style={{background:'#fff',padding:18,borderRadius:10,boxShadow:'0 6px 18px rgba(15,23,42,0.06)'}}>
//           <h3 style={{fontWeight:700}}>Your Listings</h3>
//           {loading ? <p>Loading...</p> : listings.length === 0 ? (
//             <div>
//               <p style={{color:'#6b7280'}}>No listings yet.</p>
//             </div>
//           ) : (
//             <ul style={{marginTop:12}}>
//               {listings.map(l => (
//                 <li key={l._id} style={{padding:10,borderBottom:'1px solid #f1f5f9'}}>
//                   {editingId === l._id ? (
//                     <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'center'}}>
//                       <div>
//                         <div style={{fontWeight:700,marginBottom:6}}>{l.product_id?.name || 'Product'}</div>
//                         <div style={{display:'flex',gap:8,alignItems:'center'}}>
//                           <input value={l._editPrice ?? l.price} onChange={e=>setListings(prev=>prev.map(x=> x._id===l._id ? {...x, _editPrice: e.target.value} : x))} style={{width:120,padding:8,borderRadius:6,border:'1px solid #e5e7eb'}} />
//                           <input value={l._editStock ?? l.stock} onChange={e=>setListings(prev=>prev.map(x=> x._id===l._id ? {...x, _editStock: e.target.value} : x))} style={{width:120,padding:8,borderRadius:6,border:'1px solid #e5e7eb'}} />
//                           <input value={l._editHostel ?? l.hostel} onChange={e=>setListings(prev=>prev.map(x=> x._id===l._id ? {...x, _editHostel: e.target.value} : x))} style={{padding:8,borderRadius:6,border:'1px solid #e5e7eb'}} />
//                         </div>
//                       </div>
//                       <div style={{display:'flex',flexDirection:'column',gap:8}}>
//                         <button disabled={savingId===l._id} onClick={async ()=>{
//                           // validate
//                           const price = Number(l._editPrice ?? l.price)
//                           const stock = Number(l._editStock ?? l.stock)
//                           const hostel = ((l._editHostel ?? l.hostel) || '').toString().trim()
//                           if (isNaN(price) || price <= 0) return toast.error('Enter valid price')
//                           if (isNaN(stock) || stock < 0) return toast.error('Enter valid stock')
//                           if (!hostel) return toast.error('Hostel is required')
//                           try{
//                             setSavingId(l._id)
//                             const res = await api.patch(`/api/seller/${l._id}`, { price, stock, hostel })
//                             setListings(prev=>prev.map(x=> x._id===l._id ? res.data.listing : x))
//                             setEditingId(null)
//                             toast.success('Listing updated')
//                           }catch(e){toast.error(e.response?.data?.message || 'Update failed')}
//                           finally{setSavingId(null)}
//                         }} style={{padding:'8px 10px',background:'#10b981',color:'#fff',border:'none',borderRadius:6}}>Save</button>
//                         <button onClick={()=>{
//                           // discard draft fields
//                           setListings(prev=>prev.map(x=> x._id===l._id ? (({_editPrice,_editStock,_editHostel,...rest})=>rest)(x) : x))
//                           setEditingId(null)
//                         }} style={{padding:'8px 10px',borderRadius:6,border:'1px solid #e5e7eb'}}>Cancel</button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
//                       <div>
//                         <div style={{fontWeight:700}}>{l.product_id?.name || 'Product'}</div>
//                         <div style={{color:'#6b7280'}}>Hostel: {l.hostel || '—'}</div>
//                       </div>
//                       <div style={{textAlign:'right'}}>
//                         <div style={{fontWeight:800,color:'#6366f1'}}>₹{l.price}</div>
//                         <div style={{color:'#6b7280'}}>Stock: {l.stock}</div>
//                         <div style={{marginTop:8,display:'flex',gap:8,justifyContent:'flex-end'}}>
//                           <button onClick={()=>setEditingId(l._id)} style={{padding:'6px 8px',borderRadius:6,border:'1px solid #e5e7eb'}}>Edit</button>
//                           <button onClick={async ()=>{
//                             if (!confirm('Delete listing?')) return
//                             try{
//                               await api.delete(`/api/seller/${l._id}`)
//                               setListings(ls=>ls.filter(x=>x._id!==l._id))
//                               toast.success('Listing deleted')
//                             }catch(e){toast.error('Delete failed')}
//                           }} style={{padding:'6px 8px',borderRadius:6,background:'#ef4444',color:'#fff',border:'none'}}>Delete</button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           )}
//           <div style={{marginTop:12}}>
//             <h4 style={{fontWeight:700,marginBottom:8}}>Create a Listing</h4>
//             <select value={form.productId} onChange={e=>setForm(f=>({...f,productId:e.target.value}))} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e5e7eb',marginBottom:8}}>
//               <option value="">Select product</option>
//               {products.map(p=> <option key={p._id} value={p._id}>{p.name}</option>)}
//             </select>
//             <input placeholder="Price" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e5e7eb',marginBottom:8}} />
//             <input placeholder="Stock" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e5e7eb',marginBottom:8}} />
//             <input placeholder="Hostel" value={form.hostel} onChange={e=>setForm(f=>({...f,hostel:e.target.value}))} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e5e7eb',marginBottom:8}} />
//             <div style={{display:'flex',gap:8}}>
//               <button disabled={creating} onClick={async ()=>{
//                 if (!form.productId) return toast.error('Select product')
//                 if (!form.hostel || !form.hostel.trim()) return toast.error('Hostel is required')
//                 const priceNum = Number(form.price)
//                 const stockNum = Number(form.stock)
//                 if (!form.price || isNaN(priceNum)) return toast.error('Valid price is required')
//                 if (!form.stock || isNaN(stockNum)) return toast.error('Valid stock is required')
//                 try{
//                   setCreating(true)
//                   const res = await api.post(`/api/seller/${form.productId}`, { price: priceNum, stock: stockNum, hostel: form.hostel.trim() })
//                   setListings(l=>[res.data,...l])
//                   setForm({ productId:'', price:'', stock:'', hostel:'' })
//                   toast.success('Listing created')
//                 }catch(e){toast.error(e.response?.data?.message||'Create failed')}
//                 finally{setCreating(false)}
//               }} style={{padding:8,background:'#6366f1',color:'#fff',border:'none',borderRadius:6}}>{creating ? 'Creating...' : 'Create Listing'}</button>
//             </div>
//           </div>
//         </section>

//   <section style={{background:'#fff',padding:18,borderRadius:10,boxShadow:'0 6px 18px rgba(15,23,42,0.06)'}}>
//           <h3 style={{fontWeight:700}}>Recent Orders</h3>
//           {orders.length === 0 ? <p style={{color:'#6b7280',marginTop:8}}>No orders yet.</p> : (
//             <ul style={{marginTop:12}}>
//               {orders.slice(0,6).map(o => (
//                 <li key={o._id} style={{paddingBottom:10,borderBottom:'1px solid #f1f5f9',marginBottom:8}}>
//                   <div style={{fontWeight:700}}>{o.sellerProduct_id?.product_id?.name || 'Product'}</div>
//                   <div style={{color:'#6b7280'}}>By {o.user_id?.name} — Qty: {o.quantity}</div>
//                   <div style={{fontSize:12,color:'#9ca3af',marginTop:6}}>Status: <strong>{o.status}</strong></div>
//                   <div style={{marginTop:8,display:'flex',gap:8}}>
//                     <button onClick={async ()=>{
//                       try{
//                         const res = await api.patch(`/api/orders/${o._id}`, { status: 'accepted' })
//                         setOrders(ord=>ord.map(x=> x._id===o._id ? res.data.order : x))
//                       }catch(e){alert('Update failed')}
//                     }} style={{padding:6,borderRadius:6}}>Accept</button>
//                     <button onClick={async ()=>{
//                       try{
//                         const res = await api.patch(`/api/orders/${o._id}`, { status: 'completed' })
//                         setOrders(ord=>ord.map(x=> x._id===o._id ? res.data.order : x))
//                       }catch(e){alert('Update failed')}
//                     }} style={{padding:6,borderRadius:6}}>Complete</button>
//                     <button onClick={async ()=>{
//                       try{
//                         const res = await api.patch(`/api/orders/${o._id}`, { status: 'cancelled' })
//                         setOrders(ord=>ord.map(x=> x._id===o._id ? res.data.order : x))
//                       }catch(e){alert('Update failed')}
//                     }} style={{padding:6,borderRadius:6,background:'#ef4444',color:'#fff',border:'none'}}>Cancel</button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//       </div>
//     </div>
//   )
// }
import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider";
import toast from "react-hot-toast";

export default function SellerDashboard() {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    price: "",
    stock: "",
    hostel: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user) return;

    Promise.all([
      api.get("/api/orders/seller-orders"),
      api.get("/api/seller"),
      api.get("/api/products"),
    ])
      .then(([oRes, sRes, pRes]) => {
        if (!mounted) return;
        setOrders(oRes.data || []);
        setListings(sRes.data || []);
        setProducts(pRes.data || []);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user)
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        Please login as a seller to view dashboard.
      </div>
    );
  if (user.role !== "seller")
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        This area is for sellers only.
      </div>
    );

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Seller Dashboard</h2>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Manage your listings and recent orders below.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 20,
          marginTop: 16,
        }}
      >
        {/* LISTINGS SECTION */}
        <section
          style={{
            background: "#fff",
            padding: 18,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
          }}
        >
          <h3 style={{ fontWeight: 700 }}>Your Listings</h3>
          {loading ? (
            <p>Loading...</p>
          ) : listings.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No listings yet.</p>
          ) : (
            <ul style={{ marginTop: 12 }}>
              {listings.map((l) => (
                <li
                  key={l._id}
                  style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}
                >
                  {editingId === l._id ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                          {l.product_id?.name || "Product"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <input
                            value={l._editPrice ?? l.price}
                            onChange={(e) =>
                              setListings((prev) =>
                                prev.map((x) =>
                                  x._id === l._id
                                    ? { ...x, _editPrice: e.target.value }
                                    : x
                                )
                              )
                            }
                            style={{
                              width: 120,
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <input
                            value={l._editStock ?? l.stock}
                            onChange={(e) =>
                              setListings((prev) =>
                                prev.map((x) =>
                                  x._id === l._id
                                    ? { ...x, _editStock: e.target.value }
                                    : x
                                )
                              )
                            }
                            style={{
                              width: 120,
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <input
                            value={l._editHostel ?? l.hostel}
                            onChange={(e) =>
                              setListings((prev) =>
                                prev.map((x) =>
                                  x._id === l._id
                                    ? { ...x, _editHostel: e.target.value }
                                    : x
                                )
                              )
                            }
                            style={{
                              padding: 8,
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <button
                          disabled={savingId === l._id}
                          onClick={async () => {
                            const price = Number(l._editPrice ?? l.price);
                            const stock = Number(l._editStock ?? l.stock);
                            const hostel = (
                              (l._editHostel ?? l.hostel) ||
                              ""
                            ).trim();
                            if (isNaN(price) || price <= 0)
                              return toast.error("Enter valid price");
                            if (isNaN(stock) || stock < 0)
                              return toast.error("Enter valid stock");
                            if (!hostel)
                              return toast.error("Hostel is required");
                            try {
                              setSavingId(l._id);
                              const res = await api.patch(
                                `/api/seller/${l._id}`,
                                { price, stock, hostel }
                              );
                              setListings((prev) =>
                                prev.map((x) =>
                                  x._id === l._id ? res.data.listing : x
                                )
                              );
                              setEditingId(null);
                              toast.success("Listing updated");
                            } catch (e) {
                              toast.error(
                                e.response?.data?.message || "Update failed"
                              );
                            } finally {
                              setSavingId(null);
                            }
                          }}
                          style={{
                            padding: "8px 10px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {l.product_id?.name || "Product"}
                        </div>
                        <div style={{ color: "#6b7280" }}>
                          Hostel: {l.hostel || "—"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "#6366f1" }}>
                          ₹{l.price}
                        </div>
                        <div style={{ color: "#6b7280" }}>Stock: {l.stock}</div>
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 8,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => setEditingId(l._id)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete listing?")) return;
                              try {
                                await api.delete(`/api/seller/${l._id}`);
                                setListings((ls) =>
                                  ls.filter((x) => x._id !== l._id)
                                );
                                toast.success("Listing deleted");
                              } catch {
                                toast.error("Delete failed");
                              }
                            }}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {/* Create Listing */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>
              Create a Listing
            </h4>
            <select
              value={form.productId}
              onChange={(e) =>
                setForm((f) => ({ ...f, productId: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
              }}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
              }}
            />
            <input
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
              }}
            />
            <input
              placeholder="Hostel"
              value={form.hostel}
              onChange={(e) =>
                setForm((f) => ({ ...f, hostel: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                marginBottom: 8,
              }}
            />
            <button
              disabled={creating}
              onClick={async () => {
                if (!form.productId) return toast.error("Select product");
                if (!form.hostel) return toast.error("Hostel required");
                const priceNum = Number(form.price);
                const stockNum = Number(form.stock);
                if (isNaN(priceNum) || priceNum <= 0)
                  return toast.error("Enter valid price");
                if (isNaN(stockNum) || stockNum < 0)
                  return toast.error("Enter valid stock");
                try {
                  setCreating(true);
                  const res = await api.post(`/api/seller/${form.productId}`, {
                    price: priceNum,
                    stock: stockNum,
                    hostel: form.hostel,
                  });
                  setListings((l) => [res.data, ...l]);
                  setForm({ productId: "", price: "", stock: "", hostel: "" });
                  toast.success("Listing created");
                } catch (e) {
                  toast.error(e.response?.data?.message || "Create failed");
                } finally {
                  setCreating(false);
                }
              }}
              style={{
                padding: 10,
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 6,
              }}
            >
              {creating ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </section>

        {/* ORDERS SECTION */}
        <section
          style={{
            background: "#fff",
            padding: 18,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
          }}
        >
          <h3 style={{ fontWeight: 700 }}>Recent Orders</h3>
          {orders.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No orders yet.</p>
          ) : (
            <ul style={{ marginTop: 12 }}>
              {orders.slice(0, 6).map((o) => (
                <li
                  key={o._id}
                  style={{
                    paddingBottom: 10,
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {o.sellerProduct_id?.product_id?.name || "Product"}
                  </div>
                  <div style={{ color: "#6b7280" }}>
                    Buyer: {o.user_id?.name} — Qty: {o.quantity}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                    Status: <strong>{o.status}</strong>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.patch(`/api/orders/${o._id}`, {
                            status: "accepted",
                          });
                          setOrders((ord) =>
                            ord.map((x) =>
                              x._id === o._id ? res.data.order : x
                            )
                          );
                          toast.success("Order accepted");
                        } catch {
                          toast.error("Update failed");
                        }
                      }}
                      style={{ padding: 6, borderRadius: 6 }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.patch(`/api/orders/${o._id}`, {
                            status: "completed",
                          });
                          setOrders((ord) =>
                            ord.map((x) =>
                              x._id === o._id ? res.data.order : x
                            )
                          );
                          toast.success("Order completed");
                        } catch {
                          toast.error("Update failed");
                        }
                      }}
                      style={{ padding: 6, borderRadius: 6 }}
                    >
                      Complete
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.patch(`/api/orders/${o._id}`, {
                            status: "cancelled",
                          });
                          setOrders((ord) =>
                            ord.map((x) =>
                              x._id === o._id ? res.data.order : x
                            )
                          );
                          toast.success("Order cancelled");
                        } catch {
                          toast.error("Update failed");
                        }
                      }}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
