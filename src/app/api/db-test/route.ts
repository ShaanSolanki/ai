import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!" 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Database connection failed", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 