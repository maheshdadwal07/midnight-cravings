import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail", // gmail, outlook, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App password for Gmail
    },
  });
};

// Send order notification email to seller
export const sendOrderNotificationEmail = async (sellerEmail, sellerName, orderDetails) => {
  try {
    const transporter = createTransporter();

    const { totalAmount, orders, deliveryHostel, deliveryRoom, buyerName } = orderDetails;

    // Build order items HTML
    const orderItemsHTML = orders
      .map(
        (order) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${order.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${order.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${order.price}</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: `"Midnight Cravings" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject: "🎉 New Order Received - Midnight Cravings",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 40px 32px; text-align: center; position: relative;">
              <div style="font-size: 48px; margin-bottom: 12px;">🌙</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">New Order Received!</h1>
              <p style="color: #a5b4fc; margin: 12px 0 0 0; font-size: 18px; font-weight: 500; letter-spacing: 1px;">MIDNIGHT CRAVINGS</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
                Hi <strong>${sellerName}</strong>,
              </p>
              
              <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! You've received a new order. Please prepare the items and wait for customer confirmation.
              </p>

              <!-- Delivery Address -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #6366f1; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);">
                <h3 style="color: #1e1b4b; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">📍 Delivery Address</h3>
                <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6;">
                  <strong>Customer:</strong> ${buyerName || "Guest"}<br/>
                  <strong>Hostel:</strong> ${deliveryHostel || "Not provided"}<br/>
                  <strong>Room:</strong> ${deliveryRoom || "Not provided"}
                </p>
              </div>

              <!-- Order Details Card -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 28px; margin-bottom: 24px; border: 2px solid #6366f1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);">
                <h2 style="color: #1e1b4b; font-size: 20px; font-weight: 700; margin: 0 0 20px 0;">📦 Order Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                      <th style="padding: 14px; text-align: left; font-size: 14px; font-weight: 600; color: #ffffff; border-radius: 8px 0 0 0;">Product</th>
                      <th style="padding: 14px; text-align: center; font-size: 14px; font-weight: 600; color: #ffffff;">Quantity</th>
                      <th style="padding: 14px; text-align: right; font-size: 14px; font-weight: 600; color: #ffffff; border-radius: 0 8px 0 0;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHTML}
                  </tbody>
                </table>

                <div style="margin-top: 20px; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 18px; font-weight: 700; color: #ffffff;">Total Amount:</span>
                    <span style="font-size: 28px; font-weight: 800; color: #ffffff;">₹${totalAmount}</span>
                  </div>
                </div>
              </div>

              <!-- Action Required -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
                <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6; font-weight: 500;">
                  <strong style="font-size: 16px;">⚠️ Action Required:</strong> Please log in to your seller dashboard to accept or reject this order.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:5173" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4); letter-spacing: 0.5px;">
                  🏪 View Order in Dashboard
                </a>
              </div>

              <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                Thank you for being a valued seller on <strong style="color: #6366f1;">Midnight Cravings</strong>! 🌙
              </p>
            </div>

            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 28px; text-align: center; border-top: 2px solid #6366f1;">
              <p style="margin: 0; font-size: 14px; color: #a5b4fc; font-weight: 600; letter-spacing: 0.5px;">
                🌙 MIDNIGHT CRAVINGS
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1;">
                Your Late Night Food Delivery Platform
              </p>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Send order status update email to buyer
export const sendOrderStatusEmail = async (buyerEmail, buyerName, orderStatus, orderDetails) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      accepted: {
        title: "✅ Order Accepted",
        message: "Great news! The seller has accepted your order and is preparing your items.",
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      },
      rejected: {
        title: "❌ Order Rejected",
        message: "Unfortunately, the seller couldn't fulfill your order. Your payment will be refunded.",
        color: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      },
      completed: {
        title: "🎉 Order Completed",
        message: "Your order has been delivered successfully! Enjoy your food!",
        color: "#6366f1",
        gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
      },
    };

    const status = statusMessages[orderStatus] || statusMessages.accepted;

    const mailOptions = {
      from: `"Midnight Cravings" <${process.env.EMAIL_USER}>`,
      to: buyerEmail,
      subject: `${status.title} - Midnight Cravings`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <div style="background: ${status.gradient}; padding: 40px 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">🌙</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">${status.title}</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px; font-weight: 500; letter-spacing: 1px;">MIDNIGHT CRAVINGS</p>
            </div>

            <div style="padding: 40px 32px;">
              <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0; font-weight: 600;">
                Hi <strong style="color: #6366f1;">${buyerName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #6b7280; line-height: 1.8; margin: 0 0 32px 0;">
                ${status.message}
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:5173" 
                   style="display: inline-block; background: ${status.gradient}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); letter-spacing: 0.5px;">
                  📦 View Order Details
                </a>
              </div>

              <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                Thank you for choosing <strong style="color: #6366f1;">Midnight Cravings</strong>! 🌙
              </p>
            </div>

            <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 28px; text-align: center; border-top: 2px solid #6366f1;">
              <p style="margin: 0; font-size: 14px; color: #a5b4fc; font-weight: 600; letter-spacing: 0.5px;">
                🌙 MIDNIGHT CRAVINGS
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1;">
                Your Late Night Food Delivery Platform
              </p>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Status email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending status email:", error);
    return { success: false, error: error.message };
  }
};
