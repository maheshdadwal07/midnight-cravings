import React from 'react'

export default function Footer(){
  return (
    <footer style={{background:'#fff',borderTop:'1px solid #f1f5f9',marginTop:24}}>
      <div className="container" style={{padding:'18px 20px',textAlign:'center',color:'#6b7280',fontSize:13}}>
        © {new Date().getFullYear()} Midnight Cravings — made with ❤️
      </div>
    </footer>
  )
}
