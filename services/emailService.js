const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP - Vehicle Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
          <p style="font-size: 16px; color: #666;">Hello ${name},</p>
          <p style="font-size: 16px; color: #666;">You have requested to reset your password. Use the following OTP to complete the process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</div>
          </div>
          <p style="font-size: 14px; color: #999;">This OTP will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #999;">If you didn't request this, please ignore this email and secure your account.</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} Vehicle Management System. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send welcome email based on role
const sendWelcomeEmail = async (email, name, role) => {
  const roleSpecificContent = {
    admin: `
      <p style="font-size: 16px; color: #666;">You have been registered as an <strong>Administrator</strong> with full system access.</p>
      <p style="font-size: 16px; color: #666;">You can manage users, vehicles, and view all reports.</p>
    `,
    agent: `
      <p style="font-size: 16px; color: #666;">You have been registered as an <strong>Agent</strong>.</p>
      <p style="font-size: 16px; color: #666;">You can manage vehicle listings, track sales, and interact with customers.</p>
    `,
    customer: `
      <p style="font-size: 16px; color: #666;">You have been registered as a <strong>Customer</strong>.</p>
      <p style="font-size: 16px; color: #666;">You can browse vehicles, save favorites, and track your purchases.</p>
    `
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Welcome to Vehicle Management System - ${role.charAt(0).toUpperCase() + role.slice(1)} Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Welcome to Vehicle Management System!</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
          <p style="font-size: 16px; color: #666;">Dear ${name},</p>
          <p style="font-size: 16px; color: #666;">Your account has been successfully created as a <strong>${role}</strong>.</p>
          ${roleSpecificContent[role]}
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/login" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
          </div>
          <p style="font-size: 14px; color: #999;">Your login credentials:</p>
          <p style="font-size: 14px; color: #666;">Email: ${email}</p>
          <p style="font-size: 14px; color: #999;">Use the password you set during registration.</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} Vehicle Management System. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send password changed notification
const sendPasswordChangedEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Changed Successfully - Vehicle Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Changed Successfully</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
          <p style="font-size: 16px; color: #666;">Hello ${name},</p>
          <p style="font-size: 16px; color: #666;">Your password has been changed successfully.</p>
          <p style="font-size: 14px; color: #999;">If you didn't make this change, please contact support immediately.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/login" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Login</a>
          </div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} Vehicle Management System. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail
};