// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "secret"; // .env me set karna

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
}

export const verifyToken = (req: NextRequest): string | null => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (err) {
    return null;
  }
};
