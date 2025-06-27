import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required for sentiment analysis" }, { status: 400 })
    }

    const { text: analysisResult } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Analyze the sentiment and emotions in the following journal entry. Provide a detailed analysis in JSON format with the following structure:

{
  "overall": "positive" | "neutral" | "negative",
  "confidence": 0.0-1.0,
  "emotions": {
    "joy": 0.0-1.0,
    "sadness": 0.0-1.0,
    "anger": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0,
    "disgust": 0.0-1.0
  },
  "keywords": ["array", "of", "key", "emotional", "themes"]
}

Guidelines:
- overall: Determine if the overall sentiment is positive, neutral, or negative
- confidence: How confident you are in the overall sentiment (0.0 = not confident, 1.0 = very confident)
- emotions: Rate each emotion from 0.0 (not present) to 1.0 (very strong)
- keywords: Extract 3-8 key emotional themes or important words that capture the essence

Text to analyze: "${text}"

Return only the JSON object, no additional text:`,
    })

    try {
      const analysis = JSON.parse(analysisResult)
      return NextResponse.json(analysis)
    } catch (parseError) {
      // Fallback analysis if JSON parsing fails
      const fallbackAnalysis = {
        overall: "neutral" as const,
        confidence: 0.5,
        emotions: {
          joy: 0.3,
          sadness: 0.2,
          anger: 0.1,
          fear: 0.1,
          surprise: 0.1,
          disgust: 0.1,
        },
        keywords: ["reflection", "thoughts", "feelings"],
      }
      return NextResponse.json(fallbackAnalysis)
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
