import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    profilePic: null, // now will hold File object
  });

  const [message, setMessage] = useState("");
  const [previewURL, setPreviewURL] = useState(""); // for showing selected image

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/profile/me", {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        const { name, phone, gender, profilePic } = res.data.user;
        setFormData({ name, phone, gender, profilePic: null });
        setPreviewURL(profilePic); // show saved image if available
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profilePic: file }));
      setPreviewURL(URL.createObjectURL(file)); // show preview
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("gender", formData.gender);
      if (formData.profilePic) {
        data.append("profilePic", formData.profilePic);
      }

      await axios.put("http://localhost:5000/api/profile/update", data, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Profile updated successfully ✅");
    } catch (err) {
      console.error("Update error:", err.message);
      setMessage("Update failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Profile Settings</h2>

        {message && <p className="mb-4 text-center text-blue-600">{message}</p>}

        {/* Profile Preview Image */}
        {previewURL && (
          <img
            src={previewURL}
            alt="Preview"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          type="file"
          name="profilePic"
          accept="image/*"
          onChange={handleChange}
          className="w-full mb-6 px-4 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
