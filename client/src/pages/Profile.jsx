import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Pehle login kar");
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/api/user/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data); // directly set user object
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err.message);
        alert("Unauthorized");
        window.location.href = "/login";
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
      <p className="text-gray-600">Email: {user.email}</p>
      <p className="text-gray-600">Phone: {user.phone}</p>
      <p className="text-gray-600">Gender: {user.gender}</p>
    </div>
  );
};

export default Profile;
