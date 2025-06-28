import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/database"

async function getAuthenticatedUser(request: NextRequest) {
  const cookies = request.headers.get("cookie") || ""
  const accessToken = cookies
    .split(";")
    .find((c) => c.trim().startsWith("sb-access-token="))
    ?.split("=")[1]

  if (!accessToken) {
    return null
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return null
  }

  return user
}

export async function GET(request: NextRequest) {
  try {
    console.log("📅 GET /api/calendar/events - Starting...")

    const user = await getAuthenticatedUser(request)

    if (!user) {
      console.log("❌ Authentication failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        calendarEvents: {
          orderBy: { startTime: "asc" },
        },
      },
    })

    if (!currentUser) {
      console.log("❌ User not found in database:", user.email)
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    console.log("✅ Found user with", currentUser.calendarEvents.length, "events")

    return NextResponse.json({
      events: currentUser.calendarEvents,
    })
  } catch (error) {
    console.error("💥 Calendar events GET error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📅 POST /api/calendar/events - Starting...")

    const user = await getAuthenticatedUser(request)

    if (!user) {
      console.log("❌ Authentication failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { title, description, startTime, endTime, priority, canReschedule } = body

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Title, startTime, and endTime are required",
        },
        { status: 400 },
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!currentUser) {
      console.log("❌ User not found in database:", user.email)
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    console.log("✅ Creating event for user:", currentUser.name)

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || "",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        priority: (priority || "MEDIUM").toUpperCase(),
        canReschedule: canReschedule ?? true,
        userId: currentUser.id,
      },
    })

    console.log("✅ Event created:", event.id)

    return NextResponse.json({ event })
  } catch (error) {
    console.error("💥 Create calendar event error:", error)
    return NextResponse.json(
      {
        error: "Failed to create calendar event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
