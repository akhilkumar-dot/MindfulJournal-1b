import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=calendar_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=no_auth_code`)
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/google/calendar/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokens = await tokenResponse.json()

    // In a real application, you would:
    // 1. Store the tokens securely (encrypted in database)
    // 2. Associate them with the user's account
    // 3. Handle token refresh

    // For now, redirect back to settings with success
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?success=calendar_connected`)
  } catch (error) {
    console.error("Calendar OAuth callback error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=calendar_auth_failed`)
  }
}
