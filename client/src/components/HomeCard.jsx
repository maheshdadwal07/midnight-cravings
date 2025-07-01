// components/HomeCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomeCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`}>
      <div className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer">
        <img
          src={`/${product.image}`}
          className="w-full h-48 object-cover mb-2"
          alt={product.name}
        />
        <h2 className="text-lg font-bold">{product.name}</h2>
        <p className="text-green-600 font-semibold">₹{product.price}</p>
        <p className="text-gray-700 truncate">{product.description}</p>
        <p className="text-sm text-gray-500 mt-1">Contact: {product.contact}</p>
      </div>
    </Link>
  );
};

export default HomeCard;
