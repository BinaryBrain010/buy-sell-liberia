export const secretKey = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"
export const refreshSecretKey =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-this-in-production"
export const SMTPUser = process.env.SMTP_USER || "alykhan027@gmail.com"
export const SMTPPass = process.env.SMTP_PASS || "dgbr lkms oorz jmeu"
export const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/buysell"

// Email configuration
export const emailConfig = {
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTPUser,
    pass: SMTPPass,
  },
}
