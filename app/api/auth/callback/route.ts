import { createServiceClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createServiceClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create or update user in our database
      await prisma.user.upsert({
        where: { email: data.user.email! },
        update: {
          name: data.user.user_metadata?.full_name || data.user.email!,
          updatedAt: new Date(),
        },
        create: {
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || data.user.email!,
          timeZone: "UTC",
        },
      })

      // Set cookies manually
      const response = NextResponse.redirect(`${origin}${next}`)
      if (data.session) {
        response.cookies.set("sb-access-token", data.session.access_token, {
          maxAge: 3600,
          path: "/",
          sameSite: "lax",
        })
        response.cookies.set("sb-refresh-token", data.session.refresh_token, {
          maxAge: 604800,
          path: "/",
          sameSite: "lax",
        })
      }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
