import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/Button'

const schema = yup.object({
  name: yup.string().required('Name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(4, 'Too short').required('Password required'),
  role: yup.string().oneOf(['user','seller'])
}).required()

export default function Register() {
  const { signup } = useContext(AuthContext)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema), defaultValues: { role: 'user' } })

  const onSubmit = async (data) => {
    try {
      await signup(data.name, data.email, data.password, data.role)
      toast.success('Account created')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="container" style={{maxWidth:400,paddingTop:48}}>
      <h2 style={{fontSize:22,fontWeight:700}}>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{marginTop:16,background:'#fff',padding:24,borderRadius:10,boxShadow:'0 6px 18px rgba(15,23,42,0.06)'}}>
        <label style={{display:'block',fontSize:14,marginBottom:4}}>Name</label>
        <input {...register('name')} style={{width:'100%',border:'1px solid #e5e7eb',padding:10,borderRadius:6,marginBottom:6}} />
        {errors.name && <div style={{color:'#ef4444',fontSize:13,marginBottom:6}}>{errors.name.message}</div>}

        <label style={{display:'block',fontSize:14,marginTop:12,marginBottom:4}}>Email</label>
        <input {...register('email')} style={{width:'100%',border:'1px solid #e5e7eb',padding:10,borderRadius:6,marginBottom:6}} />
        {errors.email && <div style={{color:'#ef4444',fontSize:13,marginBottom:6}}>{errors.email.message}</div>}

        <label style={{display:'block',fontSize:14,marginTop:12,marginBottom:4}}>Password</label>
        <input type="password" {...register('password')} style={{width:'100%',border:'1px solid #e5e7eb',padding:10,borderRadius:6,marginBottom:6}} />
        {errors.password && <div style={{color:'#ef4444',fontSize:13,marginBottom:6}}>{errors.password.message}</div>}

        <label style={{display:'block',fontSize:14,marginTop:12,marginBottom:4}}>Role</label>
        <select {...register('role')} style={{width:'100%',border:'1px solid #e5e7eb',padding:10,borderRadius:6,marginBottom:6}}>
          <option value="user">User</option>
          <option value="seller">Seller</option>
        </select>

        <div style={{marginTop:18}}>
          <Button type="submit" style={{width:'100%'}} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Register'}</Button>
        </div>
      </form>
    </div>
  )
}
