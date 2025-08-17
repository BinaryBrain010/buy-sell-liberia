import nodemailer from "nodemailer"

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      console.log("[EMAIL SERVICE] Sending verification email to:", email)

      const mailOptions = {
        from: `"BuySell Platform" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Email - BuySell",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background: white; border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to BuySell!</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p><strong>This code expires in 10 minutes</strong></p>
                </div>
                
                <p>If you didn't create an account with BuySell, please ignore this email.</p>
                
                <div class="footer">
                  <p>© 2024 BuySell Platform. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log("[EMAIL SERVICE] Verification email sent successfully to:", email)
    } catch (error: any) {
      console.error("[EMAIL SERVICE] Failed to send verification email:", error.message)
      throw new Error("Failed to send verification email")
    }
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    try {
      console.log("[EMAIL SERVICE] Sending password reset email to:", email)

      const mailOptions = {
        from: `"BuySell Platform" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset - BuySell",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>You requested to reset your password. Please use the code below to proceed:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p><strong>This code expires in 10 minutes</strong></p>
                </div>
                
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                
                <div class="footer">
                  <p>© 2024 BuySell Platform. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log("[EMAIL SERVICE] Password reset email sent successfully to:", email)
    } catch (error: any) {
      console.error("[EMAIL SERVICE] Failed to send password reset email:", error.message)
      throw new Error("Failed to send password reset email")
    }
  }
}
