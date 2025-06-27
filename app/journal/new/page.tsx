"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Heart, Mic, MicOff, Calendar, Sparkles, RefreshCw, Save, Send, Loader2 } from "lucide-react"

interface EmotionTag {
  id: number
  name: string
  color: string
}

export default function NewEntryPage() {
  const { user } = useUser()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [moodScore, setMoodScore] = useState([5])
  const [selectedEmotions, setSelectedEmotions] = useState<number[]>([])
  const [availableEmotions, setAvailableEmotions] = useState<EmotionTag[]>([])

  // UI state
  const [isRecording, setIsRecording] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [promptUsed, setPromptUsed] = useState("")

  // Voice recording
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const prompts = [
    "What are three small moments from today that brought you joy? How can you create more of these moments in your daily life?",
    "Describe a challenge you faced recently and what it taught you about your inner strength.",
    "What are you most grateful for right now, and how does this gratitude shape your perspective?",
    "Reflect on a conversation that made you feel truly understood. What made it so meaningful?",
    "What does peace mean to you today, and how can you cultivate more of it in your life?",
    "Write about a moment when you felt completely present. What brought you into that state?",
    "What patterns do you notice in your thoughts lately, and how do they serve or limit you?",
    "How did you show kindness to yourself or others today? How did it feel?",
    "What aspect of your life feels most balanced right now, and what can you learn from it?",
    "If you could give your past self one piece of advice, what would it be and why?",
  ]

  useEffect(() => {
    fetchEmotions()
    generateNewPrompt()
  }, [])

  const fetchEmotions = async () => {
    try {
      const response = await fetch("/api/emotions")
      if (response.ok) {
        const data = await response.json()
        setAvailableEmotions(data.emotions || [])
      }
    } catch (error) {
      console.error("Error fetching emotions:", error)
    }
  }

  const generateNewPrompt = () => {
    setIsGeneratingPrompt(true)
    setTimeout(() => {
      const availablePrompts = prompts.filter((p) => p !== currentPrompt)
      const newPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
      setCurrentPrompt(newPrompt)
      setIsGeneratingPrompt(false)
    }, 800)
  }

  const usePrompt = () => {
    setPromptUsed(currentPrompt)
    if (!title) {
      setTitle("Daily Reflection")
    }
    if (!content) {
      setContent(`Prompt: ${currentPrompt}\n\nMy thoughts:\n`)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data])
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        await transcribeAudio(audioBlob)
        setAudioChunks([])
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.wav")

      const response = await fetch("/api/google/speech-to-text", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.transcript) {
          setContent((prev) => prev + (prev ? "\n\n" : "") + data.transcript)
        }
      }
    } catch (error) {
      console.error("Error transcribing audio:", error)
    }
  }

  const toggleEmotion = (emotionId: number) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionId) ? prev.filter((id) => id !== emotionId) : [...prev, emotionId],
    )
  }

  const saveAsDraft = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Please add some content before saving.")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled Draft",
          content: content.trim(),
          moodScore: moodScore[0],
          emotionTags: selectedEmotions,
          promptUsed: promptUsed || null,
          isDraft: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert("Entry saved as draft!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || "Failed to save draft"}`)
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      alert("Failed to save draft. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const publishEntry = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Please add some content before publishing.")
      return
    }

    setIsPublishing(true)
    try {
      const response = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Daily Reflection",
          content: content.trim(),
          moodScore: moodScore[0],
          emotionTags: selectedEmotions,
          promptUsed: promptUsed || null,
          isDraft: false,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert("Entry published successfully!")

        // Clear form
        setTitle("")
        setContent("")
        setMoodScore([5])
        setSelectedEmotions([])
        setPromptUsed("")

        // Redirect to journal
        router.push("/journal")
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || "Failed to publish entry"}`)
      }
    } catch (error) {
      console.error("Error publishing entry:", error)
      alert("Failed to publish entry. Please try again.")
    } finally {
      setIsPublishing(false)
    }
  }

  const addToCalendar = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(19, 0, 0, 0) // 7 PM

    const startTime = tomorrow.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const endTime = new Date(tomorrow.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Mindfulness Journal Time")}&dates=${startTime}/${endTime}&details=${encodeURIComponent("Time for daily reflection and journaling")}&location=${encodeURIComponent("Personal Space")}`

    window.open(calendarUrl, "_blank")
    alert("Calendar reminder created! Check your Google Calendar.")
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return "😄"
    if (score >= 7) return "😊"
    if (score >= 5) return "🙂"
    if (score >= 3) return "😐"
    return "😔"
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">New Journal Entry</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={addToCalendar} className="flex items-center space-x-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            <span>Set Reminder</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Prompt */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Today's Prompt</CardTitle>
                    <p className="text-sm text-gray-600">AI-generated inspiration</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={generateNewPrompt} disabled={isGeneratingPrompt}>
                  <RefreshCw className={`h-4 w-4 ${isGeneratingPrompt ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-100">
                <blockquote className="text-gray-800 font-medium italic">
                  "{currentPrompt || "Loading prompt..."}"
                </blockquote>
              </div>
              <Button
                onClick={usePrompt}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={!currentPrompt}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Use This Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Write Your Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  placeholder="Give your entry a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "text-red-600" : "text-gray-600"}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-1" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-1" />
                        Voice Input
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Start writing your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                {isRecording && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <div className="animate-pulse w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                    Recording... Click "Stop Recording" when done
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mood Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Mood Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{getMoodEmoji(moodScore[0])}</div>
                <div className="text-2xl font-bold text-gray-900">{moodScore[0]}/10</div>
              </div>
              <Slider value={moodScore} onValueChange={setMoodScore} max={10} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Very Low</span>
                <span>Neutral</span>
                <span>Very High</span>
              </div>
            </CardContent>
          </Card>

          {/* Emotions */}
          <Card>
            <CardHeader>
              <CardTitle>Emotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableEmotions.map((emotion) => (
                  <Badge
                    key={emotion.id}
                    variant={selectedEmotions.includes(emotion.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedEmotions.includes(emotion.id) ? "bg-purple-600 text-white" : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleEmotion(emotion.id)}
                  >
                    {emotion.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={saveAsDraft}
                variant="outline"
                className="w-full bg-transparent"
                disabled={isSaving || (!title.trim() && !content.trim())}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save as Draft
              </Button>

              <Button
                onClick={publishEntry}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isPublishing || (!title.trim() && !content.trim())}
              >
                {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Publish Entry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
