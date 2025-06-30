import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HomeCard from '../components/HomeCard.jsx';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching products', err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6">📦 Campus Products</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <HomeCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
