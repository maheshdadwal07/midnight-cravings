// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/productUpload');
const authMiddleware = require('../middleware/authMiddleware'); // JWT auth check

//  POST /api/products - Add Product
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, contact } = req.body;
    const newProduct = new Product({
      name,
      price,
      description,
      contact,
      seller: req.user.id,
      image: req.file ? req.file.path : ''
    });
    await newProduct.save();
    res.json({ message: 'Product added', product: newProduct });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products - Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name profilePic');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//  GET /api/products/:id - Get Single Product Detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name profilePic');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
