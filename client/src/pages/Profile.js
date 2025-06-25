import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Pehle login kar");
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          alert("Unauthorized");
          window.location.href = "/login";
        }
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Welcome back, {user.id}!</h2>
    </div>
  );
};

export default Profile;
