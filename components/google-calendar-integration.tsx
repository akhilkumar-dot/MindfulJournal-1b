"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Bell, Plus, ExternalLink, Check, Settings, Link } from "lucide-react"

interface CalendarEvent {
  id: string
  summary: string
  description: string
  start: { dateTime: string }
  end: { dateTime: string }
  htmlLink: string
  created: string
}

export function GoogleCalendarIntegration() {
  const [reminderTime, setReminderTime] = useState("19:00")
  const [isConnected, setIsConnected] = useState(false)
  const [reminderDays, setReminderDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  })
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const connectToGoogleCalendar = async () => {
    try {
      const response = await fetch("/api/google/calendar/auth")
      if (response.ok) {
        const { authUrl } = await response.json()
        window.location.href = authUrl
      }
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error)
      alert("Error connecting to Google Calendar.")
    }
  }

  const createDailyReminder = async () => {
    setIsCreating(true)
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 1) // Tomorrow
      startDate.setHours(Number.parseInt(reminderTime.split(":")[0]), Number.parseInt(reminderTime.split(":")[1]), 0, 0)

      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + 30) // 30-minute duration

      const response = await fetch("/api/google/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: "Daily Mindfulness Journaling",
          description:
            "Time for reflection and mindful journaling practice. Take a moment to connect with your thoughts and emotions.",
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          recurrence: ["RRULE:FREQ=DAILY"],
        }),
      })

      if (response.ok) {
        const { event } = await response.json()
        setEvents((prev) => [...prev, event])
        alert("Daily reminder created successfully!")
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      alert("Error creating calendar reminder.")
    }
    setIsCreating(false)
  }

  const createWeeklyReview = async () => {
    setIsCreating(true)
    try {
      const startDate = new Date()
      // Set to next Sunday
      const daysUntilSunday = 7 - startDate.getDay()
      startDate.setDate(startDate.getDate() + daysUntilSunday)
      startDate.setHours(18, 0, 0, 0) // 6 PM

      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + 60) // 1-hour duration

      const response = await fetch("/api/google/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: "Weekly Mindfulness Review",
          description:
            "Reflect on your week's journaling journey. Review your entries, celebrate progress, and set intentions for the coming week.",
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=SU"],
        }),
      })

      if (response.ok) {
        const { event } = await response.json()
        setEvents((prev) => [...prev, event])
        alert("Weekly review reminder created successfully!")
      }
    } catch (error) {
      console.error("Error creating weekly review:", error)
      alert("Error creating weekly review reminder.")
    }
    setIsCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={isConnected ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Google Calendar Integration
            </span>
            <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Not Connected"}</Badge>
          </CardTitle>
          <CardDescription>
            {isConnected
              ? "Your Google Calendar is connected and ready for journaling reminders"
              : "Connect your Google Calendar to automatically schedule journaling sessions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={connectToGoogleCalendar} className="flex-1">
                  <Link className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Manual Setup
                </Button>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  <strong>Benefits of connecting:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Automatic daily journaling reminders</li>
                  <li>Weekly reflection sessions</li>
                  <li>Smart scheduling based on your availability</li>
                  <li>Integration with your existing calendar</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">Google Calendar Connected</span>
              <Button variant="outline" size="sm" className="ml-auto bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Manage Connection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              Reminder Settings
            </CardTitle>
            <CardDescription>Customize your journaling reminders and schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Selection */}
            <div className="space-y-2">
              <Label>Preferred Reminder Time</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="07:00">7:00 AM - Morning Reflection</SelectItem>
                    <SelectItem value="08:00">8:00 AM - Start of Day</SelectItem>
                    <SelectItem value="12:00">12:00 PM - Midday Check-in</SelectItem>
                    <SelectItem value="18:00">6:00 PM - Evening Wind-down</SelectItem>
                    <SelectItem value="19:00">7:00 PM - Dinner Reflection</SelectItem>
                    <SelectItem value="20:00">8:00 PM - Evening Journaling</SelectItem>
                    <SelectItem value="21:00">9:00 PM - Night Reflection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Days Selection */}
            <div className="space-y-3">
              <Label>Reminder Days</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(reminderDays).map(([day, enabled]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Switch
                      id={day}
                      checked={enabled}
                      onCheckedChange={(checked) => setReminderDays((prev) => ({ ...prev, [day]: checked }))}
                    />
                    <Label htmlFor={day} className="capitalize">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={createDailyReminder} disabled={isCreating} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create Daily Reminder"}
              </Button>
              <Button
                onClick={createWeeklyReview}
                disabled={isCreating}
                variant="outline"
                className="w-full bg-transparent"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Weekly Review Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Created Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              Scheduled Reminders
            </CardTitle>
            <CardDescription>Your Google Calendar journaling events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.summary}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>
                        {new Date(event.start.dateTime).toLocaleDateString()} at{" "}
                        {new Date(event.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Google Calendar
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Benefits */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">Google Calendar Benefits</CardTitle>
          <CardDescription>Why integrate with Google Calendar?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-800">Smart Scheduling</h4>
              <ul className="text-sm text-purple-700 space-y-2">
                <li>• Automatic conflict detection</li>
                <li>• Respects your existing appointments</li>
                <li>• Suggests optimal journaling times</li>
                <li>• Syncs across all your devices</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-800">Enhanced Features</h4>
              <ul className="text-sm text-purple-700 space-y-2">
                <li>• Email and mobile notifications</li>
                <li>• Recurring reminder patterns</li>
                <li>• Integration with Google Assistant</li>
                <li>• Shared calendar visibility</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Setup Instructions</CardTitle>
            <CardDescription>Alternative ways to set up journaling reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Option 1: Google Calendar Web</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Open Google Calendar in your browser</li>
                <li>Click "Create" to add a new event</li>
                <li>Set title as "Daily Mindfulness Journaling"</li>
                <li>Choose your preferred time and set to repeat daily</li>
                <li>Add reminders 10 minutes before</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Option 2: Mobile App</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Open Google Calendar app on your phone</li>
                <li>Tap the "+" button to create an event</li>
                <li>Set up recurring daily reminders</li>
                <li>Enable notifications for the event</li>
              </ol>
            </div>

            <Button variant="outline" className="w-full bg-transparent" asChild>
              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Calendar
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
