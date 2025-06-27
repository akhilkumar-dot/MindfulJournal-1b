import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, sentiment, mood } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const sentimentInfo = sentiment
      ? `Sentiment analysis shows: ${sentiment.documentSentiment?.score > 0 ? "positive" : sentiment.documentSentiment?.score < 0 ? "negative" : "neutral"} sentiment (score: ${sentiment.documentSentiment?.score?.toFixed(2)}, magnitude: ${sentiment.documentSentiment?.magnitude?.toFixed(2)})`
      : ""

    // Google Generative AI (Gemini) API request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a compassionate mindfulness coach providing feedback on a journal entry. Your role is to:
- Acknowledge the person's feelings and experiences with empathy
- Highlight positive insights or growth moments in their reflection
- Offer gentle, constructive observations that encourage deeper self-awareness
- Suggest mindful practices or perspectives that might be helpful
- Keep the tone warm, supportive, and non-judgmental
- Keep the response to 2-3 sentences

Journal Entry: "${text}"

User's mood level: ${mood}/10
${sentimentInfo}

Provide empathetic, encouraging feedback:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Google Generative AI API error:", error)
      return NextResponse.json({ error: "Feedback generation failed" }, { status: 500 })
    }

    const data = await response.json()
    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!feedback) {
      return NextResponse.json({ error: "No feedback generated" }, { status: 500 })
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
