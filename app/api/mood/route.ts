import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Get user from database
    const users = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    const moodLogs = await sql`
      SELECT * FROM mood_logs 
      WHERE user_id = ${user.id}
      AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `

    return NextResponse.json({ moodLogs })
  } catch (error) {
    console.error("Error fetching mood logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { mood_score, energy_level, stress_level, notes } = body

    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return NextResponse.json({ error: "Valid mood score (1-10) is required" }, { status: 400 })
    }

    // Get user from database
    const users = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    const moodLogs = await sql`
      INSERT INTO mood_logs (user_id, mood_score, energy_level, stress_level, notes)
      VALUES (${user.id}, ${mood_score}, ${energy_level || null}, ${stress_level || null}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json({ moodLog: moodLogs[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating mood log:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
