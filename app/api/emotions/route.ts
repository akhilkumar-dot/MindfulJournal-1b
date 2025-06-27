import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emotions = await sql`
      SELECT * FROM emotion_tags ORDER BY name ASC
    `

    return NextResponse.json({ emotions })
  } catch (error) {
    console.error("Error fetching emotions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
