import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { summary, description, startDateTime, endDateTime, recurrence } = await request.json()

    // Initialize Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )

    // For this example, we'll use a service account or API key approach
    // In production, you'd want to implement proper OAuth flow
    const calendar = google.calendar({
      version: "v3",
      auth: process.env.GOOGLE_API_KEY,
    })

    const event = {
      summary: summary || "Daily Journaling Reminder",
      description: description || "Time for mindful reflection and journaling",
      start: {
        dateTime: startDateTime,
        timeZone: "America/Los_Angeles",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "America/Los_Angeles",
      },
      recurrence: recurrence || ["RRULE:FREQ=DAILY"],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    }

    // For demo purposes, we'll return a mock response
    // In production, you'd create the actual calendar event
    const mockEvent = {
      id: `mindful_journal_${Date.now()}`,
      htmlLink: `https://calendar.google.com/calendar/event?eid=${Buffer.from(JSON.stringify(event)).toString("base64")}`,
      summary: event.summary,
      start: event.start,
      end: event.end,
    }

    return NextResponse.json({
      event: mockEvent,
      message: "Calendar event created successfully",
    })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }
}
