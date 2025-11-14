// import React, { useContext, useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { AuthContext } from "../context/AuthProvider";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";

// const baseSchema = yup.object({
//   name: yup.string().required("Name required"),
//   email: yup.string().email("Invalid email").required("Email required"),
//   password: yup.string().min(4, "Too short").required("Password required"),
//   role: yup.string().oneOf(["user", "seller"]).required(),
// });

// const sellerSchema = yup.object({
//   hostelBlock: yup.string().required("Hostel Block required"),
//   roomNumber: yup.string().required("Room Number required"),
//   upiId: yup.string().required("UPI ID required"),
//   collegeId: yup
//     .mixed()
//     .required("College ID required")
//     .test(
//       "fileType",
//       "Only images allowed",
//       (value) =>
//         value &&
//         value[0] &&
//         ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type)
//     ),
//   shopName: yup.string().optional(),
// });

// export default function Register() {
//   const { signup } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     trigger,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(
//       baseSchema.concat(step > 1 ? sellerSchema : yup.object())
//     ),
//     defaultValues: { role: "user" },
//   });

//   const role = watch("role");

//   const nextStep = async () => {
//     const valid = await trigger();
//     if (valid) setStep((s) => s + 1);
//   };

//   const prevStep = () => setStep((s) => s - 1);

//   const onSubmit = async (data) => {
//     try {
//       await signup(data);
//       toast.success("Account created! Sellers will need admin approval.");
//       navigate("/");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="register-wrapper">
//       <div className="register-box">
//         <h2>{role === "seller" ? "Seller Signup" : "User Signup"}</h2>

//         {role === "seller" && (
//           <div className="register-progress">
//             {[1, 2].map((s) => (
//               <div
//                 key={s}
//                 className={`register-step ${s <= step ? "active" : ""}`}
//               >
//                 {s}
//               </div>
//             ))}
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="register-form">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={step}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {step === 1 && (
//                 <>
//                   <div className="register-group">
//                     <label>Name</label>
//                     <input {...register("name")} />
//                     {errors.name && (
//                       <p className="register-error">{errors.name.message}</p>
//                     )}
//                   </div>

//                   <div className="register-group">
//                     <label>Email</label>
//                     <input {...register("email")} />
//                     {errors.email && (
//                       <p className="register-error">{errors.email.message}</p>
//                     )}
//                   </div>

//                   <div className="register-group">
//                     <label>Password</label>
//                     <input type="password" {...register("password")} />
//                     {errors.password && (
//                       <p className="register-error">
//                         {errors.password.message}
//                       </p>
//                     )}
//                   </div>

//                   <div className="register-group">
//                     <label>Role</label>
//                     <select {...register("role")}>
//                       <option value="user">User</option>
//                       <option value="seller">Seller</option>
//                     </select>
//                   </div>

//                   {role === "user" ? (
//                     <button
//                       type="submit"
//                       className="register-btn"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? "Creating..." : "Register"}
//                     </button>
//                   ) : (
//                     <button
//                       type="button"
//                       className="register-btn"
//                       onClick={nextStep}
//                     >
//                       Next →
//                     </button>
//                   )}
//                 </>
//               )}

//               {step === 2 && role === "seller" && (
//                 <>
//                   <div className="register-group">
//                     <label>Hostel Block</label>
//                     <input {...register("hostelBlock")} />
//                     {errors.hostelBlock && (
//                       <p className="register-error">
//                         {errors.hostelBlock.message}
//                       </p>
//                     )}
//                   </div>

//                   <div className="register-group">
//                     <label>Room Number</label>
//                     <input {...register("roomNumber")} />
//                     {errors.roomNumber && (
//                       <p className="register-error">
//                         {errors.roomNumber.message}
//                       </p>
//                     )}
//                   </div>

//                   <div className="register-group">
//                     <label>UPI ID</label>
//                     <input {...register("upiId")} />
//                     {errors.upiId && (
//                       <p className="register-error">{errors.upiId.message}</p>
//                     )}
//                   </div>

//                   <div className="register-group">
//                     <label>Shop Name (optional)</label>
//                     <input {...register("shopName")} />
//                   </div>

//                   <div className="register-group">
//                     <label>College ID (Image)</label>
//                     <input
//                       type="file"
//                       {...register("collegeId")}
//                       accept="image/*"
//                     />
//                     {errors.collegeId && (
//                       <p className="register-error">
//                         {errors.collegeId.message}
//                       </p>
//                     )}
//                   </div>

//                   <div className="register-buttons">
//                     <button
//                       type="button"
//                       className="register-btn-secondary"
//                       onClick={prevStep}
//                     >
//                       ← Back
//                     </button>
//                     <button
//                       type="submit"
//                       className="register-btn"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? "Creating..." : "Finish Signup"}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </motion.div>
//           </AnimatePresence>
//         </form>
//       </div>

//       {/* Scoped Internal CSS */}
//       <style>{`
//         .register-wrapper {
//           display: flex;
//           justify-content: center;
//           align-items: flex-start;
//           padding: 100px 20px;
//           font-family: 'Inter', sans-serif;
//         }

//         .register-box {
//           width: 100%;
//           max-width: 420px;
//           background: rgba(255,255,255,0.85);
//           backdrop-filter: blur(10px);
//           border-radius: 16px;
//           box-shadow: 0 4px 30px rgba(0,0,0,0.08);
//           padding: 40px 30px;
//         }

//         .register-box h2 {
//           text-align: center;
//           margin-bottom: 24px;
//           color: #111827;
//         }

//         .register-box input,
//         .register-box select {
//           width: 100%;
//           padding: 10px;
//           border: 1px solid #d1d5db;
//           border-radius: 8px;
//           background: #fff;
//           font-size: 14px;
//         }

//         .register-box input:focus,
//         .register-box select:focus {
//           border-color: #6366f1;
//           box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
//           outline: none;
//         }

//         .register-group {
//           display: flex;
//           flex-direction: column;
//           margin-bottom: 14px;
//         }

//         .register-group label {
//           font-size: 14px;
//           font-weight: 500;
//           color: #374151;
//           margin-bottom: 6px;
//         }

//         .register-error {
//           color: #ef4444;
//           font-size: 13px;
//           margin-top: 4px;
//         }

//         .register-btn {
//           width: 100%;
//           padding: 12px;
//           background: #6366f1;
//           color: white;
//           font-weight: 600;
//           border: none;
//           border-radius: 8px;
//           cursor: pointer;
//           transition: 0.2s;
//         }

//         .register-btn:hover {
//           background: #4f46e5;
//         }

//         .register-btn:disabled {
//           background: #a5b4fc;
//           cursor: not-allowed;
//         }

//         .register-btn-secondary {
//           flex: 1;
//           padding: 12px;
//           background: #f3f4f6;
//           color: #374151;
//           border: none;
//           border-radius: 8px;
//           cursor: pointer;
//         }

//         .register-buttons {
//           display: flex;
//           justify-content: space-between;
//           gap: 10px;
//         }

//         .register-progress {
//           display: flex;
//           justify-content: center;
//           gap: 10px;
//           margin-bottom: 20px;
//         }

//         .register-step {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           background: #e5e7eb;
//           color: #6b7280;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 600;
//         }

//         .register-step.active {
//           background: #6366f1;
//           color: #fff;
//         }

//         @media (max-width: 480px) {
//           .register-box {
//             padding: 28px 20px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const baseSchema = yup.object({
  name: yup.string().required("Name required"),
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(4, "Too short").required("Password required"),
  role: yup.string().oneOf(["user", "seller"]).required(),
  hostelBlock: yup.string().required("Hostel required"),
  roomNumber: yup.string().required("Room number required"),
});

const sellerSchema = yup.object({
  upiId: yup.string().required("UPI ID required"),
  collegeId: yup
    .mixed()
    .required("College ID required")
    .test(
      "fileType",
      "Only images allowed",
      (value) =>
        value &&
        value[0] &&
        ["image/jpeg", "image/png", "image/jpg"].includes(value[0].type)
    ),
  shopName: yup.string().optional(),
});

export default function Register() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Check URL parameters for pre-selected role
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  const initialRole = roleParam === 'seller' ? 'seller' : 'user';

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(
      baseSchema.concat(step > 1 ? sellerSchema : yup.object())
    ),
    defaultValues: { role: initialRole },
  });

  const role = watch("role");

  const nextStep = async () => {
    const valid = await trigger();
    if (valid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data) => {
    try {
      await signup(data);
      toast.success("Account created! Sellers need admin approval.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        <p style={styles.subtitle}>
          Create your account <Icon name="sparkles" size={18} style={{ display: "inline-block", verticalAlign: "middle" }} />
        </p>

        {role === "seller" && (
          <div style={styles.progress}>
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  ...styles.step,
                  background: s <= step ? "#6366f1" : "#e5e7eb",
                  color: s <= step ? "#fff" : "#6b7280",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              style={{ width: "100%" }}
            >
              {step === 1 && (
                <>
                  <div style={styles.field}>
                    <input
                      {...register("name")}
                      placeholder="Full Name"
                      style={{
                        ...styles.input,
                        borderColor: errors.name ? "#ef4444" : "#e5e7eb",
                      }}
                    />
                    {errors.name && (
                      <p style={styles.error}>{errors.name.message}</p>
                    )}
                  </div>

                  <div style={styles.field}>
                    <input
                      {...register("email")}
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
                      type="password"
                      {...register("password")}
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

                  <div style={styles.field}>
                    <select {...register("role")} style={styles.select}>
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <select
                      {...register("hostelBlock")}
                      style={{
                        ...styles.select,
                        borderColor: errors.hostelBlock ? "#ef4444" : "#e5e7eb",
                      }}
                    >
                      <option value="">Select Your Hostel</option>
                      <option value="Archimedes A">Archimedes A</option>
                      <option value="Archimedes B">Archimedes B</option>
                      <option value="Marco Polo">Marco Polo</option>
                      <option value="Francaline A">Francaline A</option>
                      <option value="Francaline B">Francaline B</option>
                      <option value="Aristotle">Aristotle</option>
                      <option value="Alfred Nobel A">Alfred Nobel A</option>
                      <option value="Alfred Nobel B">Alfred Nobel B</option>
                    </select>
                    {errors.hostelBlock && (
                      <p style={styles.error}>{errors.hostelBlock.message}</p>
                    )}
                  </div>

                  <div style={styles.field}>
                    <input
                      {...register("roomNumber")}
                      placeholder="Room Number (e.g., 205)"
                      style={{
                        ...styles.input,
                        borderColor: errors.roomNumber ? "#ef4444" : "#e5e7eb",
                      }}
                    />
                    {errors.roomNumber && (
                      <p style={styles.error}>{errors.roomNumber.message}</p>
                    )}
                  </div>

                  <div style={{ marginTop: 24 }}>
                    {role === "user" ? (
                      <button
                        type="submit"
                        style={{
                          ...styles.button,
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Register"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        style={styles.button}
                        onClick={nextStep}
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </>
              )}

              {step === 2 && role === "seller" && (
                <>
                  <div style={styles.field}>
                    <input
                      {...register("upiId")}
                      placeholder="UPI ID"
                      style={{
                        ...styles.input,
                        borderColor: errors.upiId ? "#ef4444" : "#e5e7eb",
                      }}
                    />
                    {errors.upiId && (
                      <p style={styles.error}>{errors.upiId.message}</p>
                    )}
                  </div>

                  <div style={styles.field}>
                    <input
                      {...register("shopName")}
                      placeholder="Shop Name (optional)"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.fileLabel}>College ID (Image)</label>
                    <input
                      type="file"
                      {...register("collegeId")}
                      accept="image/*"
                      style={styles.fileInput}
                    />
                    {errors.collegeId && (
                      <p style={styles.error}>{errors.collegeId.message}</p>
                    )}
                  </div>

                  <div style={{ ...styles.buttonGroup, marginTop: 28 }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={styles.secondaryButton}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        ...styles.button,
                        flex: 1,
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      {isSubmitting ? "Creating..." : "Finish Signup"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>
            Login
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
    padding: "40px 20px",
  },
  card: {
    background: "#fff",
    borderRadius: 28,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    padding: "42px 38px",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 26,
  },
  progress: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 26,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 16, // ✅ ensures visible space between every input
  },
  input: {
    width: "100%",
    padding: "14px 18px",
    fontSize: 15,
    border: "2px solid #e5e7eb",
    borderRadius: 40,
    background: "#f9fafb",
    outline: "none",
    transition: "all 0.25s ease",
  },
  select: {
    width: "100%",
    padding: "14px 18px",
    border: "2px solid #e5e7eb",
    borderRadius: 40,
    background: "#f9fafb",
    fontSize: 15,
  },
  fileLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  fileInput: {
    fontSize: 14,
    padding: "6px 0",
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
  },
  secondaryButton: {
    flex: 1,
    padding: "14px 0",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: 40,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    gap: 12,
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    marginTop: 26,
  },
  link: {
    color: "#6366f1",
    fontWeight: 600,
    textDecoration: "none",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 4,
    paddingLeft: 10,
  },
};

// Add interactive focus + hover styles dynamically
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(99,102,241,0.35);
  }
  input:focus, select:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
`;
document.head.appendChild(styleTag);
