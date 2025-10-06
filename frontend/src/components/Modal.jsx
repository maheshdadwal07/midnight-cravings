import React from 'react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        {title && <h3 style={{marginTop:0}}>{title}</h3>}
        <div style={{marginTop:12}}>{children}</div>
        <div style={{marginTop:18,textAlign:'right'}}>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  )
}
