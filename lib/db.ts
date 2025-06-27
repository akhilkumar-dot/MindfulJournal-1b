import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Database utility functions
export async function createUser(clerkUserId: string, email: string, name: string) {
  try {
    const result = await sql`
      INSERT INTO users (clerk_user_id, email, name, created_at, updated_at)
      VALUES (${clerkUserId}, ${email}, ${name}, NOW(), NOW())
      ON CONFLICT (clerk_user_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating/updating user:", error)
    throw error
  }
}

export async function getUserByClerkId(clerkUserId: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${clerkUserId}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function createJournalEntry(
  userId: number,
  title: string,
  content: string,
  moodScore?: number,
  promptUsed?: string,
  sentimentData?: any,
) {
  try {
    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length

    const result = await sql`
      INSERT INTO journal_entries (
        user_id, title, content, mood_score, prompt_used, 
        word_count, sentiment_data, created_at, updated_at
      )
      VALUES (
        ${userId}, ${title}, ${content}, ${moodScore || null}, 
        ${promptUsed || null}, ${wordCount}, ${JSON.stringify(sentimentData) || null}, 
        NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating journal entry:", error)
    throw error
  }
}

export async function getJournalEntries(userId: number, limit = 50, offset = 0) {
  try {
    const result = await sql`
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
      WHERE je.user_id = ${userId}
      GROUP BY je.id
      ORDER BY je.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    throw error
  }
}

export async function getJournalEntry(entryId: number, userId: number) {
  try {
    const result = await sql`
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
      WHERE je.id = ${entryId} AND je.user_id = ${userId}
      GROUP BY je.id
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    throw error
  }
}

export async function updateJournalEntry(
  entryId: number,
  userId: number,
  title: string,
  content: string,
  moodScore?: number,
) {
  try {
    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length

    const result = await sql`
      UPDATE journal_entries 
      SET title = ${title}, content = ${content}, mood_score = ${moodScore || null}, 
          word_count = ${wordCount}, updated_at = NOW()
      WHERE id = ${entryId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating journal entry:", error)
    throw error
  }
}

export async function deleteJournalEntry(entryId: number, userId: number) {
  try {
    const result = await sql`
      DELETE FROM journal_entries 
      WHERE id = ${entryId} AND user_id = ${userId}
      RETURNING id
    `
    return result[0] || null
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    throw error
  }
}

export async function logMood(
  userId: number,
  moodScore: number,
  energyLevel?: number,
  stressLevel?: number,
  notes?: string,
) {
  try {
    const result = await sql`
      INSERT INTO mood_logs (user_id, mood_score, energy_level, stress_level, notes, logged_at)
      VALUES (${userId}, ${moodScore}, ${energyLevel || null}, ${stressLevel || null}, ${notes || null}, NOW())
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error logging mood:", error)
    throw error
  }
}

export async function getMoodLogs(userId: number, days = 30) {
  try {
    const result = await sql`
      SELECT * FROM mood_logs 
      WHERE user_id = ${userId} 
        AND logged_at >= NOW() - INTERVAL '${days} days'
      ORDER BY logged_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching mood logs:", error)
    throw error
  }
}

export async function getUserStats(userId: number) {
  try {
    const stats = await sql`
      SELECT 
        COUNT(je.id) as total_entries,
        AVG(je.mood_score) as avg_mood,
        SUM(je.word_count) as total_words,
        AVG(je.word_count) as avg_words_per_entry,
        COUNT(DISTINCT DATE(je.created_at)) as unique_days,
        MAX(je.created_at) as last_entry_date,
        MIN(je.created_at) as first_entry_date
      FROM journal_entries je
      WHERE je.user_id = ${userId}
    `

    const recentMood = await sql`
      SELECT AVG(mood_score) as recent_avg_mood
      FROM mood_logs 
      WHERE user_id = ${userId} 
        AND logged_at >= NOW() - INTERVAL '7 days'
    `

    const currentStreak = await sql`
      WITH daily_entries AS (
        SELECT DATE(created_at) as entry_date
        FROM journal_entries
        WHERE user_id = ${userId}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
      ),
      streak_calc AS (
        SELECT 
          entry_date,
          entry_date - ROW_NUMBER() OVER (ORDER BY entry_date DESC)::integer as streak_group
        FROM daily_entries
      )
      SELECT COUNT(*) as current_streak
      FROM streak_calc
      WHERE streak_group = (
        SELECT streak_group 
        FROM streak_calc 
        ORDER BY entry_date DESC 
        LIMIT 1
      )
    `

    return {
      ...stats[0],
      recent_avg_mood: recentMood[0]?.recent_avg_mood || null,
      current_streak: currentStreak[0]?.current_streak || 0,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    throw error
  }
}

export async function searchJournalEntries(userId: number, searchTerm: string, limit = 20) {
  try {
    const result = await sql`
      SELECT 
        je.*,
        ts_rank(to_tsvector('english', je.title || ' ' || je.content), plainto_tsquery('english', ${searchTerm})) as rank
      FROM journal_entries je
      WHERE je.user_id = ${userId}
        AND (
          to_tsvector('english', je.title || ' ' || je.content) @@ plainto_tsquery('english', ${searchTerm})
          OR je.title ILIKE ${"%" + searchTerm + "%"}
          OR je.content ILIKE ${"%" + searchTerm + "%"}
        )
      ORDER BY rank DESC, je.created_at DESC
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error searching journal entries:", error)
    throw error
  }
}

export async function getEmotionTags() {
  try {
    const result = await sql`
      SELECT * FROM emotion_tags ORDER BY name ASC
    `
    return result
  } catch (error) {
    console.error("Error fetching emotion tags:", error)
    throw error
  }
}

export async function addEmotionTagToEntry(entryId: number, emotionTagId: number) {
  try {
    const result = await sql`
      INSERT INTO entry_emotion_tags (entry_id, emotion_tag_id)
      VALUES (${entryId}, ${emotionTagId})
      ON CONFLICT (entry_id, emotion_tag_id) DO NOTHING
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error adding emotion tag to entry:", error)
    throw error
  }
}

export async function removeEmotionTagFromEntry(entryId: number, emotionTagId: number) {
  try {
    const result = await sql`
      DELETE FROM entry_emotion_tags 
      WHERE entry_id = ${entryId} AND emotion_tag_id = ${emotionTagId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error removing emotion tag from entry:", error)
    throw error
  }
}

// Add this function at the end of the file

export async function safeQuery<T = any>(queryFn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await queryFn()
  } catch (error) {
    console.error("Database query error:", error)
    return []
  }
}

export async function getUserExportData(userId: number) {
  try {
    // Get all user data in parallel for better performance
    const [entries, moodLogs, achievements, stats] = await Promise.all([
      // Journal entries with emotions
      sql`
        SELECT 
          je.*,
          array_agg(et.name) FILTER (WHERE et.name IS NOT NULL) as emotions
        FROM journal_entries je
        LEFT JOIN journal_emotions jemo ON je.id = jemo.journal_entry_id
        LEFT JOIN emotion_tags et ON jemo.emotion_tag_id = et.id
        WHERE je.user_id = ${userId}
        GROUP BY je.id
        ORDER BY je.created_at DESC
      `,

      // Mood logs
      sql`
        SELECT * FROM mood_logs 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `,

      // Achievements
      sql`
        SELECT * FROM achievements 
        WHERE user_id = ${userId}
        ORDER BY earned_at DESC
      `,

      // Statistics
      sql`
        SELECT 
          COUNT(je.id) as total_entries,
          AVG(je.mood_score) as avg_mood,
          SUM(je.word_count) as total_words,
          AVG(je.word_count) as avg_words_per_entry,
          COUNT(DISTINCT DATE(je.created_at)) as days_journaled,
          MIN(je.created_at) as first_entry_date,
          MAX(je.created_at) as last_entry_date
        FROM journal_entries je
        WHERE je.user_id = ${userId}
      `,
    ])

    return {
      entries,
      moodLogs,
      achievements,
      stats: stats[0] || null,
    }
  } catch (error) {
    console.error("Error getting export data:", error)
    throw error
  }
}
