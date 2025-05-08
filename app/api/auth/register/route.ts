import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DEV_DOMAIN = process.env.DEV_DOMAIN || "resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Email template for verification
const createVerificationEmail = (name: string, verificationLink: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #f0f9ff;
          padding: 20px;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #0f172a;
        }
        .logo-icon {
          color: #0ea5e9;
          margin-right: 5px;
        }
        .content {
          padding: 30px 20px;
          text-align: center;
        }
        .shield-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
        }
        h1 {
          color: #0f172a;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .explanation {
          font-size: 16px;
          margin-bottom: 30px;
          text-align: left;
          padding: 0 10px;
        }
        .button {
          display: inline-block;
          background-color: #0ea5e9;
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          color: #0f172a;
          margin-top: 40px;
          margin-bottom: 20px;
          text-align: center;
        }
        .benefit {
          text-align: left;
          margin-bottom: 20px;
          padding: 0 10px;
        }
        .benefit-title {
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 5px;
        }
        .footer {
          background-color: #0f172a;
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .footer-logo {
          font-size: 20px;
          font-weight: bold;
          color: white;
          margin-bottom: 20px;
        }
        .social-icons {
          margin-bottom: 20px;
        }
        .social-icon {
          display: inline-block;
          width: 32px;
          height: 32px;
          background-color: #ffffff;
          border-radius: 50%;
          margin: 0 5px;
          text-align: center;
          line-height: 32px;
        }
        .footer-links {
          margin-bottom: 10px;
        }
        .footer-link {
          color: white;
          text-decoration: none;
          margin: 0 10px;
          font-size: 14px;
        }
        .powered-by {
          margin-top: 30px;
          color: #94a3b8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">📞</span> AI Call Clarity
          </div>
          <div style="text-align: right;">
            <a href="${APP_URL}/auth/login" style="background-color: #0ea5e9; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">Log in</a>
          </div>
        </div>
        
        <div class="content">
          <div class="shield-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0ea5e9" width="64" height="64">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
              <path d="M12 13c-2.2 0-4 1.8-4 4h8c0-2.2-1.8-4-4-4z" fill="white"/>
            </svg>
          </div>
          
          <h1>Verify Your Account</h1>
          
          <p class="greeting">Hello ${name},</p>
          
          <p class="explanation">
            To finish your account setup with AI Call Clarity and unlock all features, we need to verify your identity. 
            This ensures the highest level of security for your account and protects your personal information. 
            Click the link below to verify your email address.
          </p>
          
          <a href="${verificationLink}" class="button">Verify my email</a>
          
          <h2 class="section-title">Why Verification Matters</h2>
          
          <div class="benefit">
            <p class="benefit-title">Enhanced Security</p>
            <p>Identity verification helps prevent unauthorized access and protects your information.</p>
          </div>
          
          <div class="benefit">
            <p class="benefit-title">Compliance</p>
            <p>This process helps us comply with industry regulations and ensures a safe experience for all our clients.</p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">
            <span class="logo-icon">📞</span> AI Call Clarity
          </div>
          
          <div class="social-icons">
            <span class="social-icon">f</span>
            <span class="social-icon">in</span>
            <span class="social-icon">t</span>
            <span class="social-icon">ig</span>
          </div>
          
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy Policy</a> •
            <a href="#" class="footer-link">Contact Us</a> •
            <a href="#" class="footer-link">Unsubscribe</a>
          </div>
          
          <div class="powered-by">
            Powered by AI Call Clarity
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      jobTitle, 
      department, 
      phoneNumber, 
      inviteCode 
    } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with professional profile fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        jobTitle,
        department,
        phoneNumber,
      },
    });

    // If invite code is provided, join the team
    if (inviteCode) {
      const invite = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
      });

      if (invite && invite.expiresAt > new Date() && invite.usedCount < invite.maxUses) {
        // Add user to the team
        await prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: invite.teamId,
            role: "AGENT", // Default role for invited members
          },
        });

        // Set as user's primary team
        await prisma.user.update({
          where: { id: user.id },
          data: { teamId: invite.teamId },
        });

        // Increment the used count for the invite code
        await prisma.inviteCode.update({
          where: { id: invite.id },
          data: { usedCount: invite.usedCount + 1 },
        });
      }
    }

    // Create verification token
    const token = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        userId: user.id,
      },
    });

    const verificationLink = `${APP_URL}/auth/verify?token=${token.token}`;
    const emailHtml = createVerificationEmail(name, verificationLink);

    // Send verification email
    await resend.emails.send({
      from: `AI Call Clarity <onboarding@${DEV_DOMAIN}>`,
      to: [email],
      subject: "Verify your email address",
      html: emailHtml,
    });

    return NextResponse.json(
      {
        message: "User registered successfully. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}