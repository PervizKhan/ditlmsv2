// lib/services/email.service.ts

import nodemailer from 'nodemailer';
import { Result, ok, err } from '../core/result';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

// Load configuration from environment variables
const config: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
  secure: process.env.EMAIL_SECURE === 'true',
};

// Create transporter instance (reused for efficiency)
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
  return transporter;
};

// HTML email template for OTP - FIXED for mobile
const getOTPEmailHTML = (otp: string, expiresInMinutes: number = 10) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        /* Reset styles */
        body, table, td, p, a, div, span {
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
        }
        
        body {
          background-color: #f5f5f5;
          padding: 20px;
        }
        
        .container {
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .content {
          padding: 40px 32px;
        }
        
        .logo {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .logo h1 {
          color: #0b1f3a;
          font-size: 28px;
          margin: 0;
          font-weight: 700;
        }
        
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #0b1f3a;
          text-align: center;
          margin-bottom: 16px;
        }
        
        .message {
          color: #555;
          text-align: center;
          margin-bottom: 32px;
        }
        
        /* FIXED: OTP container with responsive design */
        .otp-container {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 24px 16px;
          margin: 24px 0;
          text-align: center;
        }
        
        /* FIXED: OTP digits - prevents line breaks */
        .otp-digits {
          display: inline-block;
          font-size: 40px;
          font-weight: 800;
          letter-spacing: 12px;
          color: #d4af37;
          font-family: 'Courier New', 'Monaco', monospace;
          word-break: keep-all;
          white-space: nowrap;
          background: #f8f9fa;
        }
        
        /* For very small screens, adjust font size */
        @media only screen and (max-width: 480px) {
          .content {
            padding: 24px 20px;
          }
          .otp-digits {
            font-size: 28px;
            letter-spacing: 8px;
          }
          .title {
            font-size: 20px;
          }
        }
        
        /* Alternative: Individual digit boxes for better mobile display */
        .otp-boxes {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 24px 0;
        }
        
        .otp-box {
          background-color: #f0f2f5;
          border-radius: 12px;
          padding: 12px 0;
          min-width: 60px;
          text-align: center;
          flex: 0 0 auto;
        }
        
        .otp-box-digit {
          font-size: 36px;
          font-weight: 800;
          color: #d4af37;
          font-family: 'Courier New', monospace;
          display: block;
          line-height: 1.2;
        }
        
        .expiry {
          font-size: 14px;
          color: #888;
          text-align: center;
          margin-top: 24px;
        }
        
        .footer {
          text-align: center;
          margin-top: 32px;
          font-size: 12px;
          color: #999;
        }
        
        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
        
        .button {
          display: inline-block;
          background-color: #d4af37;
          color: #0b1f3a;
          padding: 10px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="logo">
            <h1>✨ Portal LMS</h1>
          </div>
          
          <div class="title">Verify Your Email Address</div>
          
          <div class="message">
            <p>Thank you for signing up! Please use the verification code below to complete your registration.</p>
          </div>
          
          <!-- OPTION 1: Single line OTP with spacing (compact design) -->
          <div class="otp-container">
            <div style="font-size: 14px; color: #666; margin-bottom: 12px;">Your verification code:</div>
            <div class="otp-digits">${otp}</div>
          </div>
          
          <!-- OPTION 2: Individual boxes (uncomment to use instead of Option 1) -->
          <!--
          <div class="otp-boxes">
            ${otp.split('').map(digit => `
              <div class="otp-box">
                <span class="otp-box-digit">${digit}</span>
              </div>
            `).join('')}
          </div>
          -->
          
          <div class="expiry">
            ⏰ This code will expire in <strong>${expiresInMinutes} minutes</strong>
          </div>
          
          <hr />
          
          <div class="footer">
            <p>If you didn't request this, please ignore this email.</p>
            <p style="margin-top: 16px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">Visit Portal</a>
            </p>
            <p style="margin-top: 24px;">&copy; ${new Date().getFullYear()} Portal LMS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Alternative version with individual digit boxes (even better for mobile)
const getOTPEmailHTMLWithBoxes = (otp: string, expiresInMinutes: number = 10) => {
  const digits = otp.split('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .content {
          padding: 40px 32px;
        }
        .logo h1 {
          color: #0b1f3a;
          font-size: 28px;
          text-align: center;
          margin: 0 0 24px 0;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #0b1f3a;
          text-align: center;
          margin-bottom: 16px;
        }
        .message {
          color: #555;
          text-align: center;
          margin-bottom: 32px;
        }
        .otp-boxes {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 32px 0;
        }
        .otp-box {
          background: linear-gradient(135deg, #f0f2f5 0%, #e8eaef 100%);
          border-radius: 16px;
          padding: 16px 0;
          min-width: 70px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .otp-box-digit {
          font-size: 42px;
          font-weight: 800;
          color: #d4af37;
          font-family: 'Courier New', monospace;
          display: block;
          line-height: 1;
          letter-spacing: 0;
        }
        .expiry {
          font-size: 14px;
          color: #888;
          text-align: center;
          margin-top: 24px;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          font-size: 12px;
          color: #999;
        }
        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
        @media only screen and (max-width: 480px) {
          .content {
            padding: 24px 20px;
          }
          .otp-box {
            min-width: 50px;
            padding: 12px 0;
          }
          .otp-box-digit {
            font-size: 32px;
          }
          .title {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="logo">
            <h1>🔐 Portal LMS</h1>
          </div>
          <div class="title">Email Verification</div>
          <div class="message">
            <p>Enter this code to verify your email address:</p>
          </div>
          <div class="otp-boxes">
            ${digits.map(digit => `
              <div class="otp-box">
                <span class="otp-box-digit">${digit}</span>
              </div>
            `).join('')}
          </div>
          <div class="expiry">
            ⏰ Expires in ${expiresInMinutes} minutes
          </div>
          <hr />
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plain text version for email clients that don't support HTML
const getOTPEmailText = (otp: string, expiresInMinutes: number = 10) => {
  return `
═══════════════════════════════════
         EMAIL VERIFICATION
═══════════════════════════════════

Thank you for signing up!

Your verification code is: ${otp}

This code will expire in ${expiresInMinutes} minutes.

If you didn't request this, please ignore this email.

═══════════════════════════════════
© ${new Date().getFullYear()} Portal LMS
  `;
};

export const EmailService = {
  /**
   * Send OTP email to user using Nodemailer
   */
  async sendOTP(to: string, otp: string): Promise<Result<string>> {
    if (!config.user || !config.pass) {
      console.error('Email configuration missing. Please check your .env.local file.');
      return err('Email service not configured. Please set EMAIL_USER and EMAIL_PASS.');
    }

    try {
      const transporter = getTransporter();
      await transporter.verify();
      
      // Choose which OTP display style you prefer:
      // Option 1: Single line with letter spacing (compact)
      const htmlContent = getOTPEmailHTML(otp);
      
      // Option 2: Individual boxes (more visual, better for mobile)
      // const htmlContent = getOTPEmailHTMLWithBoxes(otp);
      
      const mailOptions = {
        from: config.from,
        to: to,
        subject: '🔐 Your Verification Code - Portal LMS',
        text: getOTPEmailText(otp),
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
      
      return ok('OTP sent successfully');
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      
      let errorMessage = 'Failed to send email. ';
      if (error instanceof Error) {
        if (error.message.includes('Invalid login')) {
          errorMessage += 'Invalid email credentials. Please check your EMAIL_USER and EMAIL_PASS.';
        } else if (error.message.includes('connect')) {
          errorMessage += 'Cannot connect to email server. Please check your EMAIL_HOST and EMAIL_PORT.';
        } else {
          errorMessage += error.message;
        }
      }
      
      return err(errorMessage);
    }
  },

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(to: string, name?: string): Promise<Result<string>> {
    if (!config.user || !config.pass) {
      return err('Email service not configured');
    }

    try {
      const transporter = getTransporter();
      
      const welcomeHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Portal LMS</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; }
            .content { padding: 40px 32px; }
            .logo h1 { color: #0b1f3a; font-size: 28px; text-align: center; margin: 0 0 24px 0; }
            .title { font-size: 24px; font-weight: 600; color: #0b1f3a; text-align: center; margin-bottom: 16px; }
            .message { color: #555; line-height: 1.6; margin-bottom: 24px; }
            .button { display: inline-block; background-color: #d4af37; color: #0b1f3a; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #999; }
            hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo"><h1>🎉 Portal LMS</h1></div>
              <div class="title">Welcome Aboard!</div>
              <div class="message">
                <p>Dear ${name || 'Valued User'},</p>
                <p>Your email address has been successfully verified. You can now access all features of the portal.</p>
                <p>We're excited to have you on board!</p>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard →</a>
              </div>
              <hr />
              <div class="footer"><p>© ${new Date().getFullYear()} Portal LMS. All rights reserved.</p></div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: config.from,
        to: to,
        subject: '🎉 Welcome to Portal LMS!',
        text: `Welcome to Portal LMS! Your email has been verified. Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
        html: welcomeHTML,
      });

      return ok('Welcome email sent');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return err('Failed to send welcome email');
    }
  },

  /**
   * Test email configuration
   */
  async testConfig(): Promise<Result<string>> {
    if (!config.user || !config.pass) {
      return err('Email configuration incomplete. Please set EMAIL_USER and EMAIL_PASS.');
    }

    try {
      const transporter = getTransporter();
      await transporter.verify();
      return ok('Email configuration is valid');
    } catch (error) {
      return err(`Invalid email configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};