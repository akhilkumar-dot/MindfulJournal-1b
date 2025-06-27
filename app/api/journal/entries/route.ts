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
    const includeDrafts = searchParams.get("includeDrafts") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get user from database
    const users = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Build the query based on draft inclusion
    const draftCondition = includeDrafts ? sql`` : sql`AND (je.is_draft = FALSE OR je.is_draft IS NULL)`

    const entries = await sql`
      SELECT 
        je.*,
        COALESCE(
          json_agg(
            json_build_object('id', et.id, 'name', et.name, 'color', et.color)
          ) FILTER (WHERE et.id IS NOT NULL), 
          '[]'::json
        ) as emotion_tags
      FROM journal_entries je
      LEFT JOIN entry_emotion_tags eet ON je.id = eet.entry_id
      LEFT JOIN emotion_tags et ON eet.emotion_tag_id = et.id
      WHERE je.user_id = ${user.id} ${draftCondition}
      GROUP BY je.id
      ORDER BY je.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Error fetching journal entries:", error)
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
    const { title, content, moodScore, emotionTags = [], promptUsed, isDraft = false } = body

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: "Title or content is required" }, { status: 400 })
    }

    // Get user from database
    const users = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Calculate word count
    const wordCount = content?.split(/\s+/).filter((word: string) => word.length > 0).length || 0

    // Create journal entry
    const entries = await sql`
      INSERT INTO journal_entries (
        user_id, title, content, mood_score, word_count, 
        prompt_used, is_draft, created_at, updated_at
      )
      VALUES (
        ${user.id}, ${title?.trim() || "Untitled Entry"}, ${content?.trim() || ""}, 
        ${moodScore || null}, ${wordCount}, ${promptUsed || null}, 
        ${isDraft}, NOW(), NOW()
      )
      RETURNING *
    `

    const entry = entries[0]

    // Add emotion tags if provided
    if (emotionTags.length > 0) {
      for (const emotionId of emotionTags) {
        await sql`
          INSERT INTO entry_emotion_tags (entry_id, emotion_tag_id)
          VALUES (${entry.id}, ${emotionId})
          ON CONFLICT (entry_id, emotion_tag_id) DO NOTHING
        `
      }
    }

    return NextResponse.json({
      entry,
      message: isDraft ? "Entry saved as draft" : "Entry published successfully",
    })
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
