import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Upsert user in database
    const result = await sql`
      INSERT INTO users (clerk_id, email, first_name, last_name, image_url)
      VALUES (
        ${userId}, 
        ${user.emailAddresses[0]?.emailAddress || ""}, 
        ${user.firstName || ""}, 
        ${user.lastName || ""}, 
        ${user.imageUrl || ""}
      )
      ON CONFLICT (clerk_id) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
