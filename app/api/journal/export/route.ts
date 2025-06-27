import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database using the correct column name
    const users = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Get all journal entries with emotions
    const entries = await sql`
      SELECT 
        je.*,
        COALESCE(
          array_agg(et.name) FILTER (WHERE et.name IS NOT NULL), 
          ARRAY[]::text[]
        ) as emotions
      FROM journal_entries je
      LEFT JOIN entry_emotion_tags eet ON je.id = eet.entry_id
      LEFT JOIN emotion_tags et ON eet.emotion_tag_id = et.id
      WHERE je.user_id = ${user.id}
      GROUP BY je.id
      ORDER BY je.created_at DESC
    `

    // Get all mood logs
    const moodLogs = await sql`
      SELECT * FROM mood_logs 
      WHERE user_id = ${user.id}
      ORDER BY logged_at DESC
    `

    // Get user stats
    const stats = await sql`
      SELECT 
        COUNT(je.id) as total_entries,
        AVG(je.mood_score) as avg_mood,
        SUM(je.word_count) as total_words,
        AVG(je.word_count) as avg_words_per_entry,
        COUNT(DISTINCT DATE(je.created_at)) as days_journaled,
        MIN(je.created_at) as first_entry_date,
        MAX(je.created_at) as last_entry_date
      FROM journal_entries je
      WHERE je.user_id = ${user.id}
    `

    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        export_version: "1.0",
        total_entries: entries.length,
        total_mood_logs: moodLogs.length,
      },
      user_profile: {
        email: user.email,
        name: user.name,
        member_since: user.created_at,
      },
      statistics: stats[0] || {
        total_entries: 0,
        avg_mood: null,
        total_words: 0,
        avg_words_per_entry: null,
        days_journaled: 0,
        first_entry_date: null,
        last_entry_date: null,
      },
      journal_entries: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        mood_score: entry.mood_score,
        word_count: entry.word_count,
        emotions: entry.emotions || [],
        is_draft: entry.is_draft || false,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      })),
      mood_logs: moodLogs.map((log) => ({
        id: log.id,
        mood_score: log.mood_score,
        energy_level: log.energy_level,
        stress_level: log.stress_level,
        notes: log.notes,
        logged_at: log.logged_at,
      })),
    }

    const fileName = `mindfulness-journal-${user.name?.replace(/\s+/g, "-") || "user"}-${new Date().toISOString().split("T")[0]}.json`

    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    })

    return response
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
