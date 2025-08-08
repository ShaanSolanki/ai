import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import InterviewSession from "@/models/interviewsession";
import { verifyToken } from "@/lib/auth";

