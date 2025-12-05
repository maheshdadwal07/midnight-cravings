import React from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function AppWrapper({ children }) {
  const location = useLocation()
  
  // Don't show navbar on admin routes (they have their own AdminLayout with sidebar)
  const isAdminRoute = location.pathname.startsWith('/admin')
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdminRoute && (
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#fff', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <Navbar />
        </div>
      )}
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}
