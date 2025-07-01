import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error("Product fetch error", err));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <img
        src={`/${product.image}`}
        alt={product.name}
        className="w-full h-64 object-cover mb-4 rounded"
      />
      <h2 className="text-3xl font-bold">{product.name}</h2>
      <p className="text-xl text-green-600">₹{product.price}</p>
      <p className="my-4">{product.description}</p>
      <p>Contact: <strong>{product.contact}</strong></p>
      <p>Seller: {product.seller?.name}</p>
    </div>
  );
};

export default ProductDetail;
