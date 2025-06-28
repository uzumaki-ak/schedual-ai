import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Auth Debug - Starting...")

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("🔐 Supabase auth result:", {
      user: user ? { id: user.id, email: user.email } : null,
      error: authError?.message,
    })

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || "No user found",
        cookies: request.headers.get("cookie") || "No cookies",
      })
    }

    // Check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    return NextResponse.json({
      authenticated: true,
      supabaseUser: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      databaseUser: dbUser
        ? {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
          }
        : null,
      cookies: request.headers.get("cookie") || "No cookies",
    })
  } catch (error) {
    console.error("💥 Auth debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
