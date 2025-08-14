import jwt from "jsonwebtoken";

export function verifyToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production") as { userId: string };
  return decoded;
}
