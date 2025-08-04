// import { Resend } from "resend"
// import { prisma } from "./database"

// const resend = new Resend(process.env.RESEND_API_KEY)

// interface EmailOptions {
//   to: string[]
//   subject: string
//   html: string
//   attachments?: Array<{
//     filename: string
//     content: string
//     contentType: string
//   }>
// }

// export async function sendEmail(options: EmailOptions) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: "SchedulAI <noreply@scheduleai.com>",
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//       attachments: options.attachments,
//     })

//     if (error) {
//       console.error("Email sending failed:", error)

//       // Log failed email
//       await prisma.emailLog.create({
//         data: {
//           to: options.to,
//           subject: options.subject,
//           content: options.html,
//           emailType: "MEETING_INVITATION",
//           status: "FAILED",
//         },
//       })

//       throw error
//     }

//     // Log successful email
//     await prisma.emailLog.create({
//       data: {
//         to: options.to,
//         subject: options.subject,
//         content: options.html,
//         emailType: "MEETING_INVITATION",
//         status: "SENT",
//         resendId: data?.id,
//       },
//     })

//     return data
//   } catch (error) {
//     console.error("Email service error:", error)
//     throw error
//   }
// }


// ! add email domain to resend 

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

// COMMENTED OUT FOR LOCALHOST DEVELOPMENT
// UNCOMMENT FOR PRODUCTION DEPLOYMENT WITH VERIFIED DOMAIN

export async function sendEmail(options: EmailOptions) {
  console.log("📧 EMAIL DISABLED FOR LOCALHOST DEVELOPMENT")
  console.log("Email would be sent to:", options.to)
  console.log("Subject:", options.subject)
  console.log("Content preview:", options.html.substring(0, 100) + "...")

  // For localhost, we'll just log and return success
  return { id: `mock-email-${Date.now()}` }

  /* UNCOMMENT FOR PRODUCTION DEPLOYMENT:
  
  try {
    const { data, error } = await resend.emails.send({
      from: "SchedulAI <noreply@scheduleai.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    })

    if (error) {
      console.error("Email sending failed:", error)

      // Log failed email
      await prisma.emailLog.create({
        data: {
          to: options.to,
          subject: options.subject,
          content: options.html,
          emailType: "MEETING_INVITATION",
          status: "FAILED",
        },
      })

      throw error
    }

    // Log successful email
    await prisma.emailLog.create({
      data: {
        to: options.to,
        subject: options.subject,
        content: options.html,
        emailType: "MEETING_INVITATION",
        status: "SENT",
        resendId: data?.id,
      },
    })

    return data
  } catch (error) {
    console.error("Email service error:", error)
    throw error
  }
  
  */
}
