import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthProvider";
import Icon from "../components/Icon";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hostelBlock: "",
    roomNumber: "",
    shopName: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        hostelBlock: user.hostelBlock || "",
        roomNumber: user.roomNumber || "",
        shopName: user.shopName || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setPasswordLoading(true);

    try {
      await api.put("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success("Password changed successfully!");
      setChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      console.error("Error response:", error.response);
      const errorMsg = error.response?.data?.message || "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put("/api/auth/profile", formData);
      
      // Update user in context and localStorage
      const updatedUser = {
        ...user,
        name: res.data.user.name,
        email: res.data.user.email,
        hostelBlock: res.data.user.hostelBlock,
        roomNumber: res.data.user.roomNumber,
        shopName: res.data.user.shopName,
      };
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem("mc_name", res.data.user.name);
      localStorage.setItem("mc_hostelBlock", res.data.user.hostelBlock || "");
      localStorage.setItem("mc_roomNumber", res.data.user.roomNumber || "");
      
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <Icon name="alert-circle" size={48} />
          <h2>Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.avatar}>
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={styles.title}>My Profile</h1>
              <p style={styles.subtitle}>
                Manage your account information
              </p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={styles.editBtn}
            >
              <Icon name="edit" size={18} />
              Edit Profile
            </button>
          )}
        </div>

        <div style={styles.card}>
          <form onSubmit={handleUpdateProfile}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Icon name="user" size={20} />
                Personal Information
              </h3>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  ) : (
                    <p style={styles.value}>{user.name}</p>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  ) : (
                    <p style={styles.value}>{user.email || "Not available - please log out and log in again"}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Icon name="home" size={20} />
                Hostel Information
              </h3>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Hostel Block</label>
                  {editing ? (
                    <input
                      type="text"
                      name="hostelBlock"
                      value={formData.hostelBlock}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., Block A"
                    />
                  ) : (
                    <p style={styles.value}>
                      {user.hostelBlock || "Not provided"}
                    </p>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Room Number</label>
                  {editing ? (
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., 201"
                    />
                  ) : (
                    <p style={styles.value}>
                      {user.roomNumber || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {user.role === "seller" && (
              <>
                <div style={styles.divider}></div>
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    <Icon name="store" size={20} />
                    Seller Information
                  </h3>
                  <div style={styles.field}>
                    <label style={styles.label}>Shop Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Your shop name"
                      />
                    ) : (
                      <p style={styles.value}>
                        {user.shopName || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div style={styles.statusBadge}>
                    <span style={styles.statusLabel}>Seller Status:</span>
                    <span
                      style={{
                        ...styles.badge,
                        ...(user.sellerStatus === "approved"
                          ? styles.badgeSuccess
                          : user.sellerStatus === "pending"
                          ? styles.badgeWarning
                          : styles.badgeDanger),
                      }}
                    >
                      {user.sellerStatus || "pending"}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div style={styles.divider}></div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Icon name="shield" size={20} />
                Account Details
              </h3>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Account Type</label>
                  <p style={styles.value}>
                    <span
                      style={{
                        ...styles.roleBadge,
                        ...(user.role === "admin"
                          ? styles.roleAdmin
                          : user.role === "seller"
                          ? styles.roleSeller
                          : styles.roleUser),
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Member Since</label>
                  <p style={styles.value}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {editing && (
              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      hostelBlock: user.hostelBlock || "",
                      roomNumber: user.roomNumber || "",
                      shopName: user.shopName || "",
                    });
                  }}
                  style={styles.cancelBtn}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.saveBtn}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Security Section - Separate Card */}
        <div style={{ ...styles.card, marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={styles.sectionTitle}>
              <Icon name="lock" size={20} />
              Security
            </h3>
            {!changingPassword && (
              <button
                onClick={() => setChangingPassword(true)}
                style={styles.changePasswordBtn}
              >
                <Icon name="key" size={16} />
                Change Password
              </button>
            )}
          </div>

          {changingPassword ? (
            <form onSubmit={handleChangePassword}>
              <div style={styles.field}>
                <label style={styles.label}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  style={styles.cancelBtn}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.saveBtn}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          ) : (
            <p style={styles.securityNote}>
              <Icon name="info" size={16} />
              Keep your password secure and change it regularly
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#f9fafb',
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0.25rem 0 0 0",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    padding: "2rem",
  },
  section: {
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },
  value: {
    fontSize: "1rem",
    color: "#111827",
    margin: 0,
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s ease",
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "1.5rem 0",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  statusLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },
  badge: {
    padding: "0.375rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  badgeSuccess: {
    background: "#d1fae5",
    color: "#065f46",
  },
  badgeWarning: {
    background: "#fef3c7",
    color: "#92400e",
  },
  badgeDanger: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  roleBadge: {
    padding: "0.375rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  roleAdmin: {
    background: "#fce7f3",
    color: "#9f1239",
  },
  roleSeller: {
    background: "#dbeafe",
    color: "#1e40af",
  },
  roleUser: {
    background: "#e0e7ff",
    color: "#3730a3",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  saveBtn: {
    padding: "0.75rem 1.5rem",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  errorBox: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
  },
  changePasswordBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  securityNote: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "8px",
    color: "#166534",
    fontSize: "0.875rem",
    margin: 0,
  },
};
