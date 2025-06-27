"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Pause } from "lucide-react"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  isRecording: boolean
  onRecordingChange: (recording: boolean) => void
}

export function VoiceRecorder({ onTranscription, isRecording, onRecordingChange }: VoiceRecorderProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Transcribe the audio
        await transcribeAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      onRecordingChange(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Unable to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      onRecordingChange(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        onTranscription(text)
      } else {
        console.error("Transcription failed")
        alert("Transcription failed. Please try again.")
      }
    } catch (error) {
      console.error("Error transcribing audio:", error)
      alert("Error transcribing audio. Please try again.")
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  return (
    <Card className={`transition-colors ${isRecording ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Controls */}
          <div className="flex space-x-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full w-16 h-16"
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </div>

          {/* Recording Status */}
          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600">Recording...</span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                {audioUrl ? "Recording complete" : "Tap to start recording"}
              </span>
            )}
          </div>

          {/* Playback Controls */}
          {audioUrl && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={playRecording}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center max-w-xs">
            {isRecording
              ? "Speak clearly and naturally. Your voice will be transcribed automatically."
              : "Click the microphone to start voice input. Your speech will be converted to text."}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
