// Email Configuration for Password Reset
// File: backend/config/email.js
// Using Official Mailtrap SDK with Nodemailer

const nodemailer = require('nodemailer');
const { MailtrapTransport } = require('mailtrap');

// Configure transporter based on email service
let transporter;

// Option 1: Mailtrap Official SDK (Recommended for development/testing)
if (process.env.MAILTRAP_TOKEN) {
  const mailtrapTransport = MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN
  });

  transporter = nodemailer.createTransport(mailtrapTransport);
  console.log('✅ Mailtrap Official SDK initialized');
}
// Option 2: Gmail with App Password
else if (process.env.EMAIL_SERVICE === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // App-specific password, not regular password
    }
  });
  console.log('✅ Gmail transporter initialized');
}
// Option 3: SMTP Service (Mailtrap SMTP, SendGrid, etc.)
else if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
  console.log('✅ SMTP transporter initialized');
}
// Option 4: Default fallback (prints to console in development)
else {
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 Email would be sent (dev mode):');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:', mailOptions.html);
      return { response: 'Email logged to console (dev mode)' };
    }
  };
  console.log('✅ Console fallback mode');
}

// Test connection
if (process.env.NODE_ENV === 'development' && transporter.verify) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error);
    } else if (success) {
      console.log('✅ Email service ready to send messages');
    }
  });
}

module.exports = transporter;
