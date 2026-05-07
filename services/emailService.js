const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send customer credentials email
const sendCustomerCredentials = async (email, name, password, loginUrl) => {
  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER}>`,
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
          <p>Your account has been created in our Vehicle Management System. Please use the following credentials to login:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
          </div>
          
          <p style="color: #dc2626; font-size: 14px; margin-top: 10px;">
            <strong>⚠️ Important:</strong> Please change your password after your first login for security reasons.
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Click Here to Login
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
          <p>If you didn't request this account creation, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Send agent credentials email
const sendAgentCredentials = async (email, name, password, loginUrl) => {
  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Vehicle Management System - Agent Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb;">Welcome to Vehicle Management System</h2>
          <p style="color: #666;">Your agent account has been created!</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Agent Login Credentials</h3>
          <p><strong>Dear ${name},</strong></p>
          <p>You have been added as an agent in our Vehicle Management System. Please use the following credentials to access your agent portal:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
          </div>
          
          <p style="color: #dc2626; font-size: 14px; margin-top: 10px;">
            <strong>⚠️ Important:</strong> Please change your password after your first login for security reasons.
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Access Agent Portal
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
          <p>If you have any questions, please contact your administrator.</p>
          <p>&copy; ${new Date().getFullYear()} Vehicle Management System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Dear ${name},</strong></p>
          <p>We received a request to reset your password. Please use the following OTP to verify your identity:</p>
          
          <div style="background-color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 32px; font-family: monospace; letter-spacing: 5px; font-weight: bold;">${otp}</span>
          </div>
          
          <p style="color: #dc2626; font-size: 14px;">
            <strong>⚠️ This OTP is valid for 10 minutes.</strong>
          </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Send welcome email (generic)
const sendWelcomeEmail = async (email, name, role) => {
  const mailOptions = {
    from: `"Vehicle Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to Vehicle Management System - ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb;">Welcome ${name}!</h2>
          <p>Your ${role} account has been successfully created.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p>You can now access your dashboard and manage your activities.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
          <p>&copy; ${new Date().getFullYear()} Vehicle Management System</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendCustomerCredentials,
  sendAgentCredentials,
  sendPasswordResetEmail,
  sendWelcomeEmail
};