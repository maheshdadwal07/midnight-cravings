import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email required"),
    password: yup.string().min(4, "Too short").required("Password required"),
  })
  .required();

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data.email, data.password);
      const { role, sellerStatus } = response;

      if (role === "seller" && sellerStatus !== "approved") {
        toast.error(
          sellerStatus === "pending_verification"
            ? "Seller account pending approval."
            : "Seller account rejected."
        );
        return;
      }

      toast.success("Login successful");
      if (role === "admin") navigate("/admin");
      else if (role === "seller") navigate("/seller");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Welcome back 👋</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.field}>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              style={{
                ...styles.input,
                borderColor: errors.email ? "#ef4444" : "#e5e7eb",
              }}
            />
            {errors.email && (
              <p style={styles.error}>{errors.email.message}</p>
            )}
          </div>

          <div style={styles.field}>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              style={{
                ...styles.input,
                borderColor: errors.password ? "#ef4444" : "#e5e7eb",
              }}
            />
            {errors.password && (
              <p style={styles.error}>{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don’t have an account?{" "}
          <a href="/register" style={styles.link}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // background:
    //   "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f8fafc 100%)",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 28,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "fadeIn 0.4s ease-in-out",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    marginTop: 4,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  field: { width: "100%", display: "flex", flexDirection: "column" },
  input: {
    width: "100%",
    padding: "14px 18px",
    fontSize: 15,
    border: "2px solid #e5e7eb",
    borderRadius: 40,
    outline: "none",
    transition: "all 0.25s ease",
    background: "#f9fafb",
  },
  button: {
    width: "100%",
    padding: "14px 0",
    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 40,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(99,102,241,0.3)",
    transition: "all 0.25s ease",
    marginTop: 6,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    marginTop: 22,
  },
  link: {
    color: "#6366f1",
    fontWeight: 600,
    textDecoration: "none",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 12,
  },
};

// Add hover & focus effects
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(99,102,241,0.35);
  }
  input:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleTag);
