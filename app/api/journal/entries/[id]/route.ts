import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entryId = Number.parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 })
    }

    // Get user from database
    const users = await sql`
      SELECT id FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    const entries = await sql`
      SELECT 
        je.*,
        array_agg(et.name) FILTER (WHERE et.name IS NOT NULL) as emotions
      FROM journal_entries je
      LEFT JOIN journal_emotions jemo ON je.id = jemo.journal_entry_id
      LEFT JOIN emotion_tags et ON jemo.emotion_tag_id = et.id
      WHERE je.id = ${entryId} AND je.user_id = ${user.id}
      GROUP BY je.id
    `

    if (entries.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ entry: entries[0] })
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entryId = Number.parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, mood_score, emotions = [], is_draft = false } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Get user from database
    const users = await sql`
      SELECT id FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]
    const wordCount = content.split(/\s+/).filter((word: string) => word.length > 0).length

    // Update journal entry
    const entries = await sql`
      UPDATE journal_entries 
      SET title = ${title}, 
          content = ${content}, 
          mood_score = ${mood_score || null}, 
          word_count = ${wordCount}, 
          is_draft = ${is_draft},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${entryId} AND user_id = ${user.id}
      RETURNING *
    `

    if (entries.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // Remove existing emotions
    await sql`
      DELETE FROM journal_emotions WHERE journal_entry_id = ${entryId}
    `

    // Add new emotions
    if (emotions.length > 0) {
      for (const emotionName of emotions) {
        // Get or create emotion tag
        let emotionTags = await sql`
          SELECT id FROM emotion_tags WHERE name = ${emotionName}
        `

        if (emotionTags.length === 0) {
          emotionTags = await sql`
            INSERT INTO emotion_tags (name, color) 
            VALUES (${emotionName}, 'bg-blue-100 text-blue-800')
            RETURNING id
          `
        }

        if (emotionTags.length > 0) {
          await sql`
            INSERT INTO journal_emotions (journal_entry_id, emotion_tag_id)
            VALUES (${entryId}, ${emotionTags[0].id})
            ON CONFLICT (journal_entry_id, emotion_tag_id) DO NOTHING
          `
        }
      }
    }

    return NextResponse.json({ entry: entries[0] })
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entryId = Number.parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 })
    }

    // Get user from database
    const users = await sql`
      SELECT id FROM users WHERE clerk_user_id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Delete associated emotions first
    await sql`
      DELETE FROM journal_emotions WHERE journal_entry_id = ${entryId}
    `

    // Delete the journal entry
    const result = await sql`
      DELETE FROM journal_entries 
      WHERE id = ${entryId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
