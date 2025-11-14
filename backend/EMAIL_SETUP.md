# Email Notification Setup Guide

## Overview
The application now sends email notifications to sellers when they receive new orders and to buyers when order status changes.

## Setup Instructions

### 1. Gmail Setup (Recommended)

#### Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security**
3. Enable **2-Step Verification**

#### Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select your device
4. Click **Generate**
5. Copy the 16-character password

#### Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-character app password
```

### 2. Other Email Services

#### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo Mail
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### Custom SMTP (Advanced)
If you're using a custom email service, modify `backend/utils/emailService.js`:

```javascript
const transporter = nodemailer.createTransporter({
  host: "smtp.yourdomain.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Email Notifications

### 1. Seller Order Notification
**Trigger:** When a customer places an order
**Sent to:** Seller's email
**Contains:**
- Order details (products, quantities, prices)
- Total amount
- Link to seller dashboard
- Call to action (Accept/Reject order)

### 2. Buyer Status Update
**Trigger:** When seller updates order status
**Sent to:** Buyer's email
**Contains:**
- Status update (Accepted/Rejected/Completed)
- Order information
- Link to order details

## Testing

### Test Email Configuration
```bash
# Start the backend server
cd backend
npm start
```

1. Place a test order through the frontend
2. Check seller's email inbox for order notification
3. Update order status from seller dashboard
4. Check buyer's email for status update

### Troubleshooting

#### "Invalid login credentials"
- Make sure you're using App Password, not regular password
- Verify 2FA is enabled for Gmail

#### "Connection timeout"
- Check your internet connection
- Verify EMAIL_SERVICE is correct
- Some networks block SMTP ports

#### Emails going to spam
- Add sender email to contacts
- Check spam folder and mark as "Not Spam"
- Consider using a custom domain email

## Email Templates

Email templates are fully styled with:
- Responsive HTML design
- Gradient headers
- Professional layout
- Mobile-friendly
- Call-to-action buttons

### Customize Templates
Edit templates in `backend/utils/emailService.js`:
- Change colors
- Update branding
- Modify content
- Add/remove sections

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Use App Passwords, not regular passwords
- Keep EMAIL_PASSWORD secure
- Regularly rotate App Passwords
- Monitor email sending logs

## Production Recommendations

For production environments:
1. Use a dedicated email service (SendGrid, Mailgun, Amazon SES)
2. Implement rate limiting on email sends
3. Add email queue system (Bull, Agenda)
4. Set up email delivery monitoring
5. Use environment-specific email templates

## Support

If you encounter issues:
1. Check logs in terminal
2. Verify .env configuration
3. Test SMTP connection
4. Check email service status

---

**Note:** Email notifications are optional. The app will continue to work with in-app notifications if email fails.
