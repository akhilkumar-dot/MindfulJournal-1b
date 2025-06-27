"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Trash2, Calendar, Mic, MicOff } from "lucide-react"
import Link from "next/link"

interface JournalEntry {
  id: number
  title: string
  content: string
  mood_score: number
  is_draft: boolean
  emotions: string[]
  created_at: string
  updated_at: string
}

const emotionOptions = [
  "Happy",
  "Sad",
  "Anxious",
  "Calm",
  "Excited",
  "Frustrated",
  "Grateful",
  "Angry",
  "Peaceful",
  "Stressed",
  "Hopeful",
  "Lonely",
  "Confident",
  "Overwhelmed",
  "Content",
  "Worried",
  "Joyful",
  "Tired",
]

export default function EditJournalEntry() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()
  const entryId = params.id as string

  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [moodScore, setMoodScore] = useState([5])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    if (entryId) {
      fetchEntry()
    }
  }, [entryId])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/journal/entries/${entryId}`)
      if (response.ok) {
        const data = await response.json()
        const entryData = data.entry
        setEntry(entryData)
        setTitle(entryData.title)
        setContent(entryData.content)
        setMoodScore([entryData.mood_score || 5])
        setSelectedEmotions(entryData.emotions || [])
      } else {
        console.error("Failed to fetch entry")
        router.push("/journal")
      }
    } catch (error) {
      console.error("Error fetching entry:", error)
      router.push("/journal")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (isDraft = false) => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/journal/entries/${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          mood_score: moodScore[0],
          emotions: selectedEmotions,
          is_draft: isDraft,
        }),
      })

      if (response.ok) {
        alert(isDraft ? "Entry saved as draft!" : "Entry updated successfully!")
        if (!isDraft) {
          router.push("/journal")
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to save entry: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error saving entry:", error)
      alert("Failed to save entry. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/journal/entries/${entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Entry deleted successfully!")
        router.push("/journal")
      } else {
        const errorData = await response.json()
        alert(`Failed to delete entry: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete entry. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        const formData = new FormData()
        formData.append("audio", audioBlob)

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const { text } = await response.json()
            setContent((prev) => prev + (prev ? "\n\n" : "") + text)
          }
        } catch (error) {
          console.error("Transcription error:", error)
          alert("Failed to transcribe audio")
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      setIsRecording(true)
      mediaRecorder.start()

      // Stop recording after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
          setIsRecording(false)
        }
      }, 30000)

      // Store mediaRecorder reference for manual stop
      ;(window as any).currentRecorder = mediaRecorder
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Failed to start recording. Please check microphone permissions.")
    }
  }

  const stopRecording = () => {
    const recorder = (window as any).currentRecorder
    if (recorder && recorder.state === "recording") {
      recorder.stop()
      setIsRecording(false)
    }
  }

  const createCalendarEvent = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(19, 0, 0, 0) // 7 PM

    const eventTitle = encodeURIComponent("Journal Reflection Time")
    const eventDetails = encodeURIComponent("Time for mindful journaling and self-reflection")
    const startTime = tomorrow.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const endTime = new Date(tomorrow.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startTime}/${endTime}&details=${eventDetails}`

    window.open(calendarUrl, "_blank")
    alert("Calendar event created! Check your Google Calendar.")
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Entry Not Found</h1>
        <p className="text-gray-600 mb-6">
          The journal entry you're looking for doesn't exist or you don't have permission to edit it.
        </p>
        <Link href="/journal">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/journal">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Journal
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Entry</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={createCalendarEvent} className="hidden sm:flex bg-transparent">
            <Calendar className="h-4 w-4 mr-2" />
            Set Reminder
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Journal Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? "text-red-600 border-red-300" : ""}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="min-h-[300px] text-base leading-relaxed"
            />
            <p className="text-sm text-gray-500 mt-2">
              {content.split(/\s+/).filter((word) => word.length > 0).length} words
            </p>
          </div>

          {/* Mood Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood Score: {moodScore[0]}/10</label>
            <Slider value={moodScore} onValueChange={setMoodScore} max={10} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {emotionOptions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={() => toggleEmotion(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => handleSave(true)}
              variant="outline"
              disabled={saving || !title.trim() || !content.trim()}
              className="flex-1"
            >
              {saving ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={saving || !title.trim() || !content.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {saving ? "Updating..." : "Update Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
