import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import SellerProduct from "./models/SellerProduct.js";

dotenv.config();
connectDB();

const seedData = async () => {
  try {
   
   

    // Create users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const sellerPassword = await bcrypt.hash("seller123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "admin",
    });

    const seller = await User.create({
      name: "Seller",
      email: "seller@example.com",
      passwordHash: sellerPassword,
      role: "seller",
      sellerStatus: "approved", // ✅ Set seller as approved
      hostelBlock: "Hostel A",
      roomNumber: "101",
      upiId: "seller@paytm",
      shopName: "Midnight Bites",
    });

    const user = await User.create({
      name: "User",
      email: "user@example.com",
      passwordHash: userPassword,
      role: "user",
    });

    console.log("Users seeded");

    // Create sample products
    const products = await Product.insertMany([
      {
        name: "Coke",
        category: "Beverages",
        hostel: "Hostel A",
        image: "https://example.com/coke.jpg",
      },
      {
        name: "Burger",
        category: "Snacks",
        hostel: "Hostel B",
        image: "https://example.com/burger.jpg",
      },
      {
        name: "Chips",
        category: "Snacks",
        hostel: "Hostel A",
        image: "https://example.com/chips.jpg",
      },
    ]);

    console.log("Products seeded");

    // Create seller product listings
    await SellerProduct.create([
      {
        product_id: products[0]._id,
        seller_id: seller._id,
        price: 50,
        stock: 100,
        hostel: "Hostel A",
      },
      {
        product_id: products[1]._id,
        seller_id: seller._id,
        price: 80,
        stock: 50,
        hostel: "Hostel B",
      },
    ]);

    console.log("Seller listings seeded");
    console.log("Seeding completed!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();
