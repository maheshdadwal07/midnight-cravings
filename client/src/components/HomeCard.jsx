// components/Home.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products').then(res => {
      setProducts(res.data);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map(product => (
        <div key={product._id} className="border p-4 rounded shadow">
          <img src={`/${product.image}`} className="w-full h-48 object-cover" alt={product.name} />
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p>₹{product.price}</p>
          <p>{product.description}</p>
          <p className="text-sm text-gray-600">Contact: {product.contact}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
