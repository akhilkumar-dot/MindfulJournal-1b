import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { entry, mood } = await request.json()

    if (!entry || entry.trim().length === 0) {
      return NextResponse.json({ error: "Journal entry is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a compassionate mindfulness coach providing feedback on a journal entry. Your role is to:
- Acknowledge the person's feelings and experiences with empathy
- Highlight positive insights or growth moments in their reflection
- Offer gentle, constructive observations that encourage deeper self-awareness
- Suggest mindful practices or perspectives that might be helpful
- Keep the tone warm, supportive, and non-judgmental
- Keep the response to 2-3 sentences
- Focus on strengths and growth opportunities

User's mood level: ${mood || "not specified"}/10

Journal Entry: "${entry}"

Provide empathetic, encouraging feedback:`,
    })

    return NextResponse.json({ feedback: text.trim() })
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}
