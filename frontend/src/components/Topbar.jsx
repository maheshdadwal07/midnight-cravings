import React from 'react'
import { Link } from 'react-router-dom'

export default function Topbar(){
  return (
    <div style={{width:'100%',background:'#6366f1',color:'#fff',fontSize:13}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{display:'none'}} aria-hidden>placeholder</span>
          <span style={{opacity:0.9}}>📞 +1 (555) 123-4567</span>
          <span style={{opacity:0.7}}>|</span>
          <span style={{opacity:0.9}}>Free delivery over $20</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/help" style={{color:'#fff',textDecoration:'none'}}>Help</Link>
          <Link to="/contact" style={{color:'#fff',textDecoration:'none'}}>Contact</Link>
        </div>
      </div>
    </div>
  )
}
