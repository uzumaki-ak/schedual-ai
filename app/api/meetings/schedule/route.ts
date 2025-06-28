import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/database"
import { CoordinatorAgent } from "@/lib/ai-agents/coordinator-agent"

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

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting meeting scheduling process...")

    const user = await getAuthenticatedUser(request)

    if (!user) {
      console.error("❌ No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { title, description, duration, priority, participantEmails } = body

    // Validate required fields
    if (!title || !participantEmails || participantEmails.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Title and participants are required",
        },
        { status: 400 },
      )
    }

    // Get current user from database
    console.log("🔍 Finding user in database...")
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!currentUser) {
      console.error("❌ User not found in database:", user.email)
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    console.log("✅ Current user found:", currentUser.name)

    // Get or create participant users
    console.log("👥 Processing participants...")
    const participants = []
    for (const email of participantEmails) {
      let participant = await prisma.user.findUnique({
        where: { email },
      })

      if (!participant) {
        console.log("➕ Creating new user:", email)
        participant = await prisma.user.create({
          data: {
            email,
            name: email.split("@")[0], // Use email prefix as name
            timeZone: "UTC",
          },
        })
      }

      participants.push(participant)
    }

    console.log(
      "✅ Participants processed:",
      participants.map((p) => p.email),
    )

    // Create meeting
    console.log("📅 Creating meeting...")
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || "",
        duration: Number.parseInt(duration) || 30,
        priority: priority.toUpperCase(),
        ownerId: currentUser.id,
        participants: {
          create: participants.map((p) => ({
            userId: p.id,
          })),
        },
      },
    })

    console.log("✅ Meeting created:", meeting.id)

    // Create coordinator agent session
    console.log("🤖 Creating coordinator agent...")
    const coordinatorSession = await prisma.agentSession.create({
      data: {
        meetingId: meeting.id,
        userId: currentUser.id,
        agentType: "COORDINATOR",
        status: "ACTIVE",
      },
    })

    console.log("✅ Coordinator agent created:", coordinatorSession.id)

    // Initialize coordinator agent and start scheduling
    const coordinator = new CoordinatorAgent(currentUser.id, meeting.id, coordinatorSession.id)

    console.log("🎯 Starting scheduling orchestration...")
    const result = await coordinator.orchestrateScheduling()

    console.log("✅ Scheduling completed:", result)

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      result,
    })
  } catch (error) {
    console.error("💥 Meeting scheduling error:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to schedule meeting",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
