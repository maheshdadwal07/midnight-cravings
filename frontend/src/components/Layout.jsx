import React from 'react'
import Topbar from './Topbar'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      
      <div style={{position:'sticky',top:0,zIndex:40,background:'#fff',boxShadow:'0 2px 8px rgba(15,23,42,0.04)'}}>
        <Navbar />
      </div>
      <main style={{flex:1}}>{children}</main>
      {/* <Footer /> */}
    </div>
  )
}
