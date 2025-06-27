import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const users = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Get comprehensive stats
    const stats = await sql`
      SELECT 
        COUNT(je.id) as total_entries,
        COALESCE(AVG(je.mood_score), 0) as avg_mood,
        COALESCE(SUM(je.word_count), 0) as total_words,
        COALESCE(AVG(je.word_count), 0) as avg_words_per_entry
      FROM journal_entries je
      WHERE je.user_id = ${user.id}
      AND (je.is_draft = FALSE OR je.is_draft IS NULL)
    `

    // Get recent mood average (last 7 days)
    const recentMood = await sql`
      SELECT COALESCE(AVG(mood_score), 0) as recent_avg_mood
      FROM journal_entries
      WHERE user_id = ${user.id}
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      AND mood_score IS NOT NULL
      AND (is_draft = FALSE OR is_draft IS NULL)
    `

    // Calculate current streak
    const streakResult = await sql`
      WITH daily_entries AS (
        SELECT DISTINCT DATE(created_at) as entry_date
        FROM journal_entries
        WHERE user_id = ${user.id}
        AND (is_draft = FALSE OR is_draft IS NULL)
        ORDER BY entry_date DESC
      ),
      consecutive_days AS (
        SELECT 
          entry_date,
          ROW_NUMBER() OVER (ORDER BY entry_date DESC) as row_num,
          entry_date - ROW_NUMBER() OVER (ORDER BY entry_date DESC)::integer as streak_group
        FROM daily_entries
      ),
      current_streak_calc AS (
        SELECT COUNT(*) as streak_length
        FROM consecutive_days
        WHERE streak_group = (
          SELECT streak_group 
          FROM consecutive_days 
          WHERE entry_date = CURRENT_DATE
          LIMIT 1
        )
      )
      SELECT COALESCE(streak_length, 0) as current_streak
      FROM current_streak_calc
    `

    // Get this month's entries
    const thisMonth = await sql`
      SELECT COUNT(*) as month_entries
      FROM journal_entries
      WHERE user_id = ${user.id}
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND (is_draft = FALSE OR is_draft IS NULL)
    `

    // Get mood trend for last 7 days
    const moodTrend = await sql`
      SELECT 
        DATE(created_at) as date,
        AVG(mood_score) as avg_mood
      FROM journal_entries
      WHERE user_id = ${user.id}
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      AND mood_score IS NOT NULL
      AND (is_draft = FALSE OR is_draft IS NULL)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    const combinedStats = {
      total_entries: Number.parseInt(stats[0]?.total_entries || "0"),
      avg_mood: Number.parseFloat(stats[0]?.avg_mood || "0"),
      total_words: Number.parseInt(stats[0]?.total_words || "0"),
      avg_words_per_entry: Number.parseFloat(stats[0]?.avg_words_per_entry || "0"),
      recent_avg_mood: Number.parseFloat(recentMood[0]?.recent_avg_mood || "0"),
      current_streak: Number.parseInt(streakResult[0]?.current_streak || "0"),
      month_entries: Number.parseInt(thisMonth[0]?.month_entries || "0"),
      mood_trend: moodTrend || [],
    }

    return NextResponse.json({ stats: combinedStats })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
