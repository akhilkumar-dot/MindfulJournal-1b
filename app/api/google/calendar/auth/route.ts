import { NextResponse } from "next/server"

export async function GET() {
  // Google OAuth2 configuration
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/google/calendar/callback`

  const scope = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"].join(
    " ",
  )

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`

  return NextResponse.json({ authUrl })
}
