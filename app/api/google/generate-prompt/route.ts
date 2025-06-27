import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mood, previousPrompts, context } = await request.json()

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
                  text: `Generate a thoughtful, positive mindfulness journaling prompt that encourages self-reflection and personal growth. 

Context:
- User's current mood level: ${mood}/10
- Context: ${context}
- Avoid repeating these previous prompts: ${previousPrompts?.join(", ") || "none"}

The prompt should be:
- Encouraging and supportive in tone
- Focused on positive aspects or growth opportunities  
- Open-ended to allow for deep reflection
- Around 1-2 sentences long
- Tailored to the user's current mood level

Generate one new, unique prompt:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 100,
          },
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Google Generative AI API error:", error)
      return NextResponse.json({ error: "Prompt generation failed" }, { status: 500 })
    }

    const data = await response.json()
    const prompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!prompt) {
      return NextResponse.json({ error: "No prompt generated" }, { status: 500 })
    }

    // Clean up the prompt (remove quotes if present)
    const cleanPrompt = prompt.replace(/^["']|["']$/g, "")

    return NextResponse.json({ prompt: cleanPrompt })
  } catch (error) {
    console.error("Error generating prompt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
