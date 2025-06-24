import React from 'react';

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: '#f0f0f0',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h2>Campus Marketplace 🛍️</h2>
      <div>
        <button style={{ marginRight: '10px' }}>Login</button>
        <button>Signup</button>
      </div>
    </nav>
  );
};

export default Navbar;
