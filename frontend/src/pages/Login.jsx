// import React, { useContext } from 'react'
// import { useForm } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'
// import * as yup from 'yup'
// import { AuthContext } from '../context/AuthProvider'
// import { useNavigate } from 'react-router-dom'
// import toast from 'react-hot-toast'
// import Button from '../components/Button'

// const schema = yup.object({
//   email: yup.string().email('Invalid email').required('Email required'),
//   password: yup.string().min(4, 'Too short').required('Password required')
// }).required()

// export default function Login() {
//   const { login } = useContext(AuthContext)
//   const navigate = useNavigate()
//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) })

//   const onSubmit = async (data) => {
//     try {
//       await login(data.email, data.password)
//       toast.success('Logged in')
//       navigate('/')
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Login failed')
//     }
//   }

//   return (
//     <div className="container" style={{maxWidth:400,paddingTop:48}}>
//       <h2 style={{fontSize:22,fontWeight:700}}>Login</h2>
//       <form onSubmit={handleSubmit(onSubmit)} style={{marginTop:16,background:'#fff',padding:24,borderRadius:10,boxShadow:'0 6px 18px rgba(15,23,42,0.06)'}}>
//         <label style={{display:'block',fontSize:14,marginBottom:4}}>Email</label>
//         <input {...register('email')} style={{width:'100%',border:'1px solid #e5e7eb',padding:10,borderRadius:6,marginBottom:6}} />
//         {errors.email && <div style={{color:'#ef4444',fontSize:13,marginBottom:6}}>{errors.email.message}</div>}

//         <label style={{display:'block',fontSize:14,marginTop:12,marginBottom:4}}>Password</label>
//         <input type="password" {...register('password')} style={{width:'100%',border:'1px solid #e5e7eb',padding:10,borderRadius:6,marginBottom:6}} />
//         {errors.password && <div style={{color:'#ef4444',fontSize:13,marginBottom:6}}>{errors.password.message}</div>}

//         <div style={{marginTop:18}}>
//           <Button type="submit" style={{width:'100%'}} disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</Button>
//         </div>
//       </form>
//     </div>
//   )
// }


import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/Button";

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

      // Response should include role and sellerStatus
      const { role, sellerStatus } = response;

      if (role === "seller" && sellerStatus !== "approved") {
        toast.error(
          sellerStatus === "pending_verification"
            ? "Seller account pending approval. Please wait for admin verification."
            : "Seller account rejected. Contact admin."
        );
        return;
      }

      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, paddingTop: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Login</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          marginTop: 16,
          background: "#fff",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
        }}
      >
        <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
          Email
        </label>
        <input
          {...register("email")}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 10,
            borderRadius: 6,
            marginBottom: 6,
          }}
        />
        {errors.email && (
          <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 6 }}>
            {errors.email.message}
          </div>
        )}

        <label
          style={{
            display: "block",
            fontSize: 14,
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 10,
            borderRadius: 6,
            marginBottom: 6,
          }}
        />
        {errors.password && (
          <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 6 }}>
            {errors.password.message}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <Button
            type="submit"
            style={{ width: "100%" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}
