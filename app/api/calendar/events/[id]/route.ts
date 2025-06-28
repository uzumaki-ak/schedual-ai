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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const deletedEvent = await prisma.calendarEvent.deleteMany({
      where: {
        id: params.id,
        userId: currentUser.id,
      },
    })

    if (deletedEvent.count === 0) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete calendar event error:", error)
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 })
  }
}
