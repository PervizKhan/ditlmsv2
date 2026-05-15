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
      socketTimeout: 10000, // 10 second timeout
      connectionTimeout: 10000,
    });
  }
  return transporter;
};

// HTML email template for OTP
const getOTPEmailHTML = (otp: string, expiresInMinutes: number = 10) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .content { padding: 40px 32px; }
        .logo h1 { color: #0b1f3a; font-size: 28px; text-align: center; margin: 0 0 24px 0; }
        .title { font-size: 24px; font-weight: 600; color: #0b1f3a; text-align: center; margin-bottom: 16px; }
        .message { color: #555; text-align: center; margin-bottom: 32px; }
        .otp-container { background-color: #f8f9fa; border-radius: 12px; padding: 24px 16px; margin: 24px 0; text-align: center; }
        .otp-digits { display: inline-block; font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #d4af37; font-family: 'Courier New', monospace; word-break: keep-all; white-space: nowrap; }
        @media only screen and (max-width: 480px) {
          .content { padding: 24px 20px; }
          .otp-digits { font-size: 28px; letter-spacing: 8px; }
          .title { font-size: 20px; }
        }
        .expiry { font-size: 14px; color: #888; text-align: center; margin-top: 24px; }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #999; }
        hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
        .button { display: inline-block; background-color: #d4af37; color: #0b1f3a; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="logo"><h1>✨ Portal LMS</h1></div>
          <div class="title">Verify Your Email Address</div>
          <div class="message"><p>Thank you for signing up! Please use the verification code below.</p></div>
          <div class="otp-container">
            <div style="font-size: 14px; color: #666; margin-bottom: 12px;">Your verification code:</div>
            <div class="otp-digits">${otp}</div>
          </div>
          <div class="expiry">⏰ This code expires in <strong>${expiresInMinutes} minutes</strong></div>
          <hr />
          <div class="footer">
            <p>If you didn't request this, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Portal LMS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

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
  async sendOTP(to: string, otp: string): Promise<Result<string>> {
    // DEVELOPMENT MODE: Just log OTP to console
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('\n=================================');
    //   console.log(`📧 EMAIL WOULD BE SENT TO: ${to}`);
    //   console.log(`🔑 OTP CODE: ${otp}`);
    //   console.log('=================================\n');
    //   return ok('OTP sent successfully (development mode)');
    // }

    if (!config.user || !config.pass) {
      console.error('Email configuration missing');
      console.log(`🔑 OTP for ${to}: ${otp}`);
      return ok('OTP sent (demo mode - check console)');
    }

    try {
      const transporter = getTransporter();
      await transporter.verify();
      
      const mailOptions = {
        from: config.from,
        to: to,
        subject: '🔐 Your Verification Code - Portal LMS',
        text: getOTPEmailText(otp),
        html: getOTPEmailHTML(otp),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
      return ok('OTP sent successfully');
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Don't fail - just log OTP
      console.log(`🔑 OTP for ${to}: ${otp}`);
      return ok('OTP sent (check console for code)');
    }
  },

  async sendWelcomeEmail(to: string, name?: string): Promise<Result<string>> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 WELCOME EMAIL WOULD BE SENT TO: ${to}`);
      return ok('Welcome email sent (development mode)');
    }

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
          <title>Welcome to Portal LMS</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; }
            .content { padding: 40px 32px; }
            .logo h1 { color: #0b1f3a; font-size: 28px; text-align: center; margin: 0 0 24px 0; }
            .title { font-size: 24px; font-weight: 600; color: #0b1f3a; text-align: center; margin-bottom: 16px; }
            .message { color: #555; line-height: 1.6; margin-bottom: 24px; }
            .button { display: inline-block; background-color: #d4af37; color: #0b1f3a; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="logo"><h1>🎉 Portal LMS</h1></div>
              <div class="title">Welcome Aboard!</div>
              <div class="message">
                <p>Dear ${name || 'Valued User'},</p>
                <p>Your email has been verified successfully. You can now access all features.</p>
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
        text: `Welcome to Portal LMS! Your email has been verified.`,
        html: welcomeHTML,
      });

      return ok('Welcome email sent');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return err('Failed to send welcome email');
    }
  },

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