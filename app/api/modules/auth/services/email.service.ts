import nodemailer from "nodemailer";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendHtml(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"BuySell Liberia" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
    } catch (error: any) {
      console.error(
        "[EMAIL SERVICE] Failed to send html email:",
        error?.message || error
      );
      throw new Error("Failed to send email");
    }
  }

  async sendManualPaymentStatusEmail(args: {
    to: string;
    status: "approved" | "rejected";
    amount: number;
    currency?: string;
    transactionId?: string;
    featureType?: string;
    featurePlan?: string;
    listingTitle?: string | null;
    adminNotes?: string | null;
  }): Promise<void> {
    const {
      to,
      status,
      amount,
      currency = "LRD",
      transactionId,
      featureType,
      featurePlan,
      listingTitle,
      adminNotes,
    } = args;

    const niceType =
      featureType === "featured_listing"
        ? "Featured Listing"
        : featureType === "bump_listing"
        ? "Bump Credits"
        : featureType === "account_verification"
        ? "Account Verification"
        : featureType === "banner_ad"
        ? "Banner Ad"
        : featureType === "paid_category_listing"
        ? "Paid Category Listing"
        : featureType || "Manual Payment";

    const subjectPrefix = status === "approved" ? "Approved" : "Rejected";
    const subject = `${subjectPrefix}: ${niceType} payment`;

    const amountLine = `${Number(amount).toLocaleString()} ${currency}`;

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:0;background:#f7f7f8}
          .container{max-width:640px;margin:0 auto;padding:24px}
          .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
          .header{background:${
            status === "approved" ? "#16a34a" : "#dc2626"
          };color:#fff;padding:16px 20px}
          .content{padding:20px}
          .row{margin:8px 0}
          .muted{color:#6b7280;font-size:12px}
          .label{color:#374151;font-weight:600}
          .value{color:#111827}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h2 style="margin:0; font-size:18px;">${
                status === "approved" ? "Payment Approved" : "Payment Rejected"
              }</h2>
              <div class="muted">BuySell Liberia</div>
            </div>
            <div class="content">
              <p>Hi,</p>
              <p>Your manual payment request has been <strong>${status}</strong>.</p>
              <div class="row"><span class="label">Type:</span> <span class="value">${niceType}</span></div>
              ${
                listingTitle
                  ? `<div class="row"><span class="label">Listing:</span> <span class="value">${listingTitle}</span></div>`
                  : ""
              }
              ${
                featurePlan
                  ? `<div class="row"><span class="label">Plan:</span> <span class="value">${featurePlan}</span></div>`
                  : ""
              }
              <div class="row"><span class="label">Amount:</span> <span class="value">${amountLine}</span></div>
              ${
                transactionId
                  ? `<div class="row"><span class="label">Transaction ID:</span> <span class="value">${transactionId}</span></div>`
                  : ""
              }
              ${
                adminNotes
                  ? `<div class="row"><span class="label">Notes:</span> <span class="value">${adminNotes}</span></div>`
                  : ""
              }
              <p class="muted">If you have any questions, reply to this email and our team will assist you.</p>
              <p>Thanks,<br/>BuySell Liberia Team</p>
            </div>
          </div>
          <p class="muted" style="text-align:center;margin-top:12px;">© ${new Date().getFullYear()} BuySell Liberia</p>
        </div>
      </body>
      </html>
    `;

    await this.sendHtml(to, subject, html);
  }
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      console.log("[EMAIL SERVICE] Sending verification email to:", email);

      const mailOptions = {
        from: `"BuySell Liberia" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Email - BuySell Liberia",
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
                <h1>Welcome to BuySell Liberia!</h1>
              </div>
              <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p><strong>This code expires in 10 minutes</strong></p>
                </div>
                
                <p>If you didn't create an account with BuySell Liberia, please ignore this email.</p>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} BuySell Liberia. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(
        "[EMAIL SERVICE] Verification email sent successfully to:",
        email
      );
    } catch (error: any) {
      console.error(
        "[EMAIL SERVICE] Failed to send verification email:",
        error.message
      );
      throw new Error("Failed to send verification email");
    }
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    try {
      console.log("[EMAIL SERVICE] Sending password reset email to:", email);

      const mailOptions = {
        from: `"BuySell Liberia" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset - BuySell Liberia",
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
                    <p>© ${new Date().getFullYear()} BuySell Liberia. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(
        "[EMAIL SERVICE] Password reset email sent successfully to:",
        email
      );
    } catch (error: any) {
      console.error(
        "[EMAIL SERVICE] Failed to send password reset email:",
        error.message
      );
      throw new Error("Failed to send password reset email");
    }
  }
}
