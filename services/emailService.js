// services/emailService.js - COMPLETE FIXED VERSION
const nodemailer = require('nodemailer');

// Email transporter configuration
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    // For Gmail with App Password
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } 
    // For production SMTP (SendGrid, AWS SES, etc.)
    else if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }
  return transporter;
};

// Send customer credentials email
const sendCustomerCredentials = async (email, name, password, loginUrl) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER || 'noreply@vehiclefinance.com'}>`,
    to: email,
    subject: 'Welcome to Vehicle Management System - Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb;">Welcome to Vehicle Management System</h2>
          <p style="color: #666;">Your account has been created successfully!</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Login Credentials</h3>
          <p><strong>Dear ${name},</strong></p>
          <p>Your account has been created. Please use the following credentials to login:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
          </div>
          
          <p style="color: #dc2626; font-size: 14px; margin-top: 10px;">
            <strong>⚠️ Important:</strong> Please change your password after your first login.
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Click Here to Login
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
          <p>If you didn't request this account, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send payment reminder email
const sendPaymentReminder = async (email, name, emiAmount, dueDate, vehicleName) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.error('Email transporter not configured');
    return { success: false };
  }

  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-IN');
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(emiAmount);

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER || 'noreply@vehiclefinance.com'}>`,
    to: email,
    subject: 'EMI Payment Reminder - Due Soon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #f59e0b;">EMI Payment Reminder</h2>
        </div>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Dear ${name},</strong></p>
          <p>This is a reminder that your EMI payment is due soon.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${vehicleName}</p>
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> <span style="color: #dc2626; font-weight: bold;">${formattedAmount}</span></p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
          </div>
          
          <p>Please ensure timely payment to avoid late fees.</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/customer/loans" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Make Payment
          </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
          <p>&copy; ${new Date().getFullYear()} Vehicle Management System</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Reminder email failed:', error);
    return { success: false };
  }
};

// Send OTP for password reset
const sendOTPEmail = async (email, otp, name) => {
  const transporter = getTransporter();
  if (!transporter) return { success: false };

  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You requested to reset your password. Use the following OTP:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('OTP email failed:', error);
    return { success: false };
  }
};

module.exports = {
  sendCustomerCredentials,
  sendAgentCredentials,
  sendPaymentReminder,
  sendOTPEmail,
  sendWelcomeEmail
};