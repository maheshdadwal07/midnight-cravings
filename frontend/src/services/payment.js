import api from './api'

export async function createRazorpayOrder(amount) {
  const res = await api.post('/api/payment/create-order', { amount })
  return res.data
}

export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Razorpay script load failed'))
    document.body.appendChild(script)
  })
}

export async function completePayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, items }) {
  const res = await api.post('/api/payment/complete', { razorpay_order_id, razorpay_payment_id, razorpay_signature, items })
  return res.data
}
