import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db"; // make sure you have this to connect to MongoDB
import User from "@/models/user"; // your user schema
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { mode, name, email, password } = await req.json();

    if (!mode || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ SIGNUP FLOW
    if (mode === "signup") {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      const token = jwt.sign({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email
      }, JWT_SECRET, { expiresIn: "7d" });
      return NextResponse.json(
        {
          message: "Signup successful",
          token,
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
          },
        },
        { status: 201 }
      );
    }

    // ✅ LOGIN FLOW
    if (mode === "login") {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }

      const token = jwt.sign({
        userId: user._id,
        name: user.name,
        email: user.email
      }, JWT_SECRET, { expiresIn: "7d" });
      return NextResponse.json(
        {
          message: "Login successful",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
