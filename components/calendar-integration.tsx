"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Bell, Plus, ExternalLink, Check } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  url: string
  created: string
}

export function CalendarIntegration() {
  const [reminderTime, setReminderTime] = useState("19:00")
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

  const createDailyReminder = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Daily Mindfulness Journaling",
          description: "Time for reflection and mindful journaling practice",
          startTime: new Date(`2024-01-08T${reminderTime}:00`),
          duration: 30,
          recurring: true,
          days: Object.entries(reminderDays)
            .filter(([_, enabled]) => enabled)
            .map(([day, _]) => day),
        }),
      })

      if (response.ok) {
        const { event, eventUrl } = await response.json()
        setEvents((prev) => [...prev, { ...event, url: eventUrl }])
        alert("Daily reminder created successfully!")
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      alert("Error creating calendar reminder.")
    }
    setIsCreating(false)
  }

  const createOneTimeReminder = async () => {
    setIsCreating(true)
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(Number.parseInt(reminderTime.split(":")[0]), Number.parseInt(reminderTime.split(":")[1]))

      const response = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Mindfulness Journal Session",
          description: "Take time to reflect and write in your mindfulness journal",
          startTime: tomorrow,
          duration: 30,
        }),
      })

      if (response.ok) {
        const { event, eventUrl } = await response.json()
        setEvents((prev) => [...prev, { ...event, url: eventUrl }])
        alert("Reminder created successfully!")
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      alert("Error creating calendar reminder.")
    }
    setIsCreating(false)
  }

  const syncWithGoogleCalendar = () => {
    // In a real implementation, this would initiate OAuth flow
    window.open("https://calendar.google.com/calendar/u/0/r/settings/addcalendar", "_blank")
  }

  const syncWithOutlook = () => {
    // In a real implementation, this would initiate Microsoft Graph OAuth
    window.open("https://outlook.live.com/calendar/", "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Calendar Sync Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Calendar Integration
          </CardTitle>
          <CardDescription>Connect your calendar to set up automatic journaling reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button onClick={syncWithGoogleCalendar} variant="outline" className="w-full bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </Button>
            <Button onClick={syncWithOutlook} variant="outline" className="w-full bg-transparent">
              <Calendar className="h-4 w-4 mr-2" />
              Connect Outlook Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-orange-600" />
            Reminder Settings
          </CardTitle>
          <CardDescription>Customize when and how often you want to be reminded to journal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Select value={reminderTime} onValueChange={setReminderTime}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                  <SelectItem value="21:00">9:00 PM</SelectItem>
                  <SelectItem value="22:00">10:00 PM</SelectItem>
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

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={createDailyReminder} disabled={isCreating} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? "Creating..." : "Create Daily Reminder"}
            </Button>
            <Button
              onClick={createOneTimeReminder}
              disabled={isCreating}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              One-Time Reminder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Created Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              Created Reminders
            </CardTitle>
            <CardDescription>Your scheduled journaling reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startTime).toLocaleDateString()} at{" "}
                      {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={event.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Integration Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Set reminders at times when you're typically free and relaxed</li>
            <li>• Consider your natural energy patterns - some prefer morning reflection, others evening</li>
            <li>• Start with 3-4 days per week and gradually increase frequency</li>
            <li>• Use calendar notifications to build a consistent habit</li>
            <li>• Block out 15-30 minutes for each journaling session</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
