import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      console.log("✅ Registered:", res.data);
      alert("User registered successfully ✅");
      navigate("/login");
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data?.message);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
          className="w-full px-4 py-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Sign Up
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
