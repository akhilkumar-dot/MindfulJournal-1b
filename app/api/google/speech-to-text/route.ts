import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio file to base64
    const audioBytes = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(audioBytes).toString("base64")

    // Google Speech-to-Text API request
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 16000,
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
            model: "latest_long",
            useEnhanced: true,
          },
          audio: {
            content: audioBase64,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Google Speech-to-Text API error:", error)
      return NextResponse.json({ error: "Speech recognition failed" }, { status: 500 })
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ transcript: "" })
    }

    const transcript = data.results.map((result: any) => result.alternatives[0].transcript).join(" ")

    return NextResponse.json({
      transcript,
      confidence: data.results[0]?.alternatives[0]?.confidence || 0,
    })
  } catch (error) {
    console.error("Error in speech-to-text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
