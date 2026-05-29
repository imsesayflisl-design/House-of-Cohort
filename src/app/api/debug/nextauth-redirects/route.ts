import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
  const google = `${base.replace(/\/$/, "")}/api/auth/callback/google`;

  return NextResponse.json({
    nextAuthBase: base,
    google,
  });
}
