import React from 'react'

export default function Button({ children, onClick, variant = 'primary', style = {}, ...rest }) {
  const baseStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    margin: 0
  }
  const variants = {
    primary: {
      background: '#6366f1',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: '#fff',
      color: '#6366f1',
      border: '1px solid #e5e7eb',
    },
    danger: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
    }
  }
  const mergedStyle = { ...baseStyle, ...(variants[variant] || variants.primary), ...style }
  return (
    <button onClick={onClick} style={mergedStyle} {...rest}>
      {children}
    </button>
  )
}
