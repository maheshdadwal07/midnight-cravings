// components/AddProduct.jsx
import React, { useState } from 'react';
import axios from 'axios';

function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    contact: '',
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }

    try {
      await axios.post('/api/products', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Product added successfully!');
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
      <input name="name" placeholder="Product Name" onChange={handleChange} required />
      <input name="price" placeholder="Price" type="number" onChange={handleChange} required />
      <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
      <input name="contact" placeholder="Contact No." onChange={handleChange} required />
      <input name="image" type="file" accept="image/*" onChange={handleChange} required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Product</button>
    </form>
  );
}

export default AddProduct;
