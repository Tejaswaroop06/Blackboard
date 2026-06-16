import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { pseudonym, email, password } = await req.json();

    if (!pseudonym || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password Strength Check
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Secret Key must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingPseudonym = await prisma.user.findUnique({
      where: { pseudonym },
    });

    if (existingPseudonym) {
      return NextResponse.json(
        { error: "Pseudonym is already claimed" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already claimed" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // In development, auto-verify for smoother onboarding
    const isDev = process.env.NODE_ENV !== "production";

    await prisma.user.create({
      data: {
        pseudonym,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
        emailVerified: isDev ? new Date() : null,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}`;

    // In development, the token is logged to the server console.
    if (isDev) {
      console.log(
        `\n[DEV] Email verification link for ${email} (Auto-verified in dev):\n${verificationUrl}\n`
      );
    } else {
      // Production: Send real email via SMTP
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Blackboard Sanctuary" <noreply@blackboard.com>',
          to: email,
          subject: "Initiate Your Identity",
          text: `Enter the Sanctuary: ${verificationUrl}`,
          html: `
            <div style="background: black; color: white; padding: 40px; font-family: sans-serif; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">Blackboard</h1>
              <p style="color: #666; margin-top: 20px;">You are attempting to manifest an identity in the sanctuary.</p>
              <a href="${verificationUrl}" style="display: inline-block; margin-top: 30px; padding: 12px 30px; border: 1px solid white; color: white; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Verify Identity</a>
              <p style="color: #333; font-size: 10px; margin-top: 40px;">If you did not initiate this, ignore this whisper.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Email dispatch failed:", mailError);
        // We don't fail the signup here, but log it. In a real prod app, you might want to return an error.
      }
    }

    return NextResponse.json(
      { message: "Identity initiated. Please verify your email." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
