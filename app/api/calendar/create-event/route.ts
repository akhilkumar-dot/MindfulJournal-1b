import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { title, description, startTime, duration } = await request.json()

    // Create a calendar event URL (Google Calendar format)
    const startDate = new Date(startTime)
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(description)}&recur=RRULE:FREQ=DAILY`

    // For a real implementation, you would integrate with calendar APIs like:
    // - Google Calendar API
    // - Microsoft Graph API (Outlook)
    // - CalDAV servers

    // Simulate creating a calendar event
    const eventData = {
      id: `event_${Date.now()}`,
      title,
      description,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      url: googleCalendarUrl,
      created: new Date().toISOString(),
    }

    // In a real app, you would save this to your database
    // await saveCalendarEvent(eventData)

    return NextResponse.json({
      success: true,
      eventUrl: googleCalendarUrl,
      event: eventData,
    })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }
}
