import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

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
  "What does success mean to you right now, and how has this definition evolved?",
  "Describe a moment when you felt truly connected to nature or your surroundings.",
  "What fear have you been avoiding, and what would happen if you faced it with compassion?",
  "How do you show love to yourself, and what new ways could you explore?",
  "What lesson did you learn this week that you want to remember?",
  "If your emotions could speak, what would they tell you about your current state?",
  "What tradition or ritual brings you comfort, and why is it meaningful?",
  "How has your relationship with yourself changed over the past year?",
  "What would you do if you knew you couldn't fail?",
  "Describe a person who has positively influenced your life and how they've shaped you.",
]

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get a random prompt
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    return NextResponse.json({
      prompt: randomPrompt,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating prompt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get a random prompt (same as GET for now)
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    return NextResponse.json({
      prompt: randomPrompt,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating prompt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
