import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("👤 Syncing user to database:", email)

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || email,
        updatedAt: new Date(),
      },
      create: {
        email,
        name: name || email,
        timeZone: "UTC",
      },
    })

    console.log("✅ User synced:", user.id)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("💥 User sync error:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
