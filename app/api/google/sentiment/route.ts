import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Google Natural Language API request
    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: {
            type: "PLAIN_TEXT",
            content: text,
          },
          encodingType: "UTF8",
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Google Natural Language API error:", error)
      return NextResponse.json({ error: "Sentiment analysis failed" }, { status: 500 })
    }

    const data = await response.json()

    // Also get entity analysis for additional insights
    const entityResponse = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: {
            type: "PLAIN_TEXT",
            content: text,
          },
          encodingType: "UTF8",
        }),
      },
    )

    let entities = []
    if (entityResponse.ok) {
      const entityData = await entityResponse.json()
      entities = entityData.entities || []
    }

    return NextResponse.json({
      documentSentiment: data.documentSentiment,
      sentences: data.sentences,
      entities: entities,
      language: data.language,
    })
  } catch (error) {
    console.error("Error in sentiment analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
