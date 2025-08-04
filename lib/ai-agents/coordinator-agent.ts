// import { BaseAgent, type TimeSlot, type NegotiationContext } from "./base-agent"
// import { ParticipantAgent } from "./participant-agent"
// import { prisma } from "@/lib/database"
// import { sendEmail } from "@/lib/email"
// import { generateCalendarInvite } from "@/lib/calendar"
// import { generateText } from "ai"
// import { google } from "@ai-sdk/google"

// export class CoordinatorAgent extends BaseAgent {
//   async analyzeAvailability(): Promise<TimeSlot[]> {
//     return []
//   }

//   async negotiate(context: NegotiationContext): Promise<string> {
//     const prompt = `
//     You are SchedulAI, the main coordinator for scheduling meetings.
    
//     Meeting: "${context.meeting.title}" (${context.meeting.duration} minutes, Priority: ${context.meeting.priority})
//     Participants: ${context.participants.map((p) => p.name).join(", ")}
    
//     Current situation:
//     - ${context.currentSlots.length} potential time slots identified
//     - ${context.conflicts.length} scheduling conflicts detected
    
//     Your role is to:
//     1. Analyze all participant availability
//     2. Find optimal meeting times
//     3. Coordinate rescheduling when needed
//     4. Ensure all participants are satisfied
    
//     Provide a summary of the scheduling analysis and next steps.
//     `

//     const systemPrompt = `You are SchedulAI, an expert meeting coordinator. Be authoritative yet diplomatic. 
//     Focus on efficient scheduling solutions and clear communication.`

//     return await this.generateAIResponse(prompt, systemPrompt)
//   }

//   async proposeAlternatives(conflicts: any[]): Promise<TimeSlot[]> {
//     return []
//   }

//   async orchestrateScheduling(): Promise<{
//     success: boolean
//     scheduledSlot?: TimeSlot
//     rescheduledEvents?: any[]
//     message: string
//     negotiations?: any[]
//   }> {
//     try {
//       console.log("🎯 Starting AI orchestration...")

//       // Step 1: Get meeting and participants
//       const meeting = await prisma.meeting.findUnique({
//         where: { id: this.meetingId },
//         include: {
//           participants: {
//             include: { user: true },
//           },
//           owner: true,
//         },
//       })

//       if (!meeting) throw new Error("Meeting not found")

//       console.log("📋 Meeting details:", {
//         title: meeting.title,
//         duration: meeting.duration,
//         priority: meeting.priority,
//         participants: meeting.participants.length,
//       })

//       const negotiations: any[] = []

//       // Step 2: Create participant agents and analyze availability
//       console.log("🤖 Creating participant agents...")
//       const participantAgents: { agent: ParticipantAgent; user: any }[] = []

//       for (const participant of meeting.participants) {
//         const agentSession = await prisma.agentSession.create({
//           data: {
//             meetingId: this.meetingId,
//             userId: participant.userId,
//             agentType: "PARTICIPANT",
//             status: "ACTIVE",
//           },
//         })

//         const agent = new ParticipantAgent(participant.userId, this.meetingId, agentSession.id)
//         participantAgents.push({ agent, user: participant.user })

//         console.log(`✅ Created agent for ${participant.user.name}`)
//       }

//       // Step 3: Each agent analyzes their availability
//       console.log("📊 Analyzing participant availability...")
//       const allAvailableSlots: { user: any; slots: TimeSlot[] }[] = []

//       for (const { agent, user } of participantAgents) {
//         console.log(`🔍 Analyzing availability for ${user.name}...`)
//         const slots = await agent.analyzeAvailability()
//         allAvailableSlots.push({ user, slots })

//         // Log negotiation message
//         const negotiationMessage = await this.generateNegotiationMessage(user, slots, meeting)
//         negotiations.push({
//           agent: `Agent_${user.name}`,
//           message: negotiationMessage,
//           timestamp: new Date().toISOString(),
//           action: "ANALYZE_AVAILABILITY",
//         })

//         console.log(`✅ ${user.name} has ${slots.length} available slots`)
//       }

//       // Step 4: Find common available slots
//       console.log("🔍 Finding common available slots...")
//       const commonSlots = this.findCommonSlots(allAvailableSlots, meeting.duration)

//       console.log(`📅 Found ${commonSlots.length} common slots`)

//       if (commonSlots.length > 0) {
//         // Step 5: AI selects the best slot
//         console.log("🧠 AI selecting optimal slot...")
//         const bestSlot = await this.selectOptimalSlotWithAI(commonSlots, meeting, allAvailableSlots)

//         // Step 6: Generate AI confirmation message
//         const confirmationMessage = await this.generateConfirmationMessage(bestSlot, meeting)
//         negotiations.push({
//           agent: "SchedulAI_Coordinator",
//           message: confirmationMessage,
//           timestamp: new Date().toISOString(),
//           action: "CONFIRM_SLOT",
//         })

//         // Step 7: Schedule the meeting
//         await this.scheduleMeeting(bestSlot)

//         // Step 8: Send emails
//         await this.sendConfirmationEmails(bestSlot, meeting)

//         return {
//           success: true,
//           scheduledSlot: bestSlot,
//           message: `Successfully scheduled "${meeting.title}" for ${bestSlot.start.toLocaleString()}`,
//           negotiations,
//         }
//       } else {
//         // Step 5: No common slots - initiate AI negotiation
//         console.log("⚡ No common slots found - starting AI negotiation...")
//         return await this.handleConflictsWithAI(participantAgents, meeting, negotiations)
//       }
//     } catch (error) {
//       console.error("💥 Scheduling orchestration failed:", error)
//       return {
//         success: false,
//         message: `Scheduling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
//         negotiations: [],
//       }
//     }
//   }

//   private async generateNegotiationMessage(user: any, slots: TimeSlot[], meeting: any): Promise<string> {
//     const topSlots = slots.slice(0, 3)

//     const prompt = `
//     You are an AI scheduling agent representing ${user.name}.
    
//     Meeting request: "${meeting.title}" (${meeting.duration} minutes, Priority: ${meeting.priority})
    
//     Your available time slots:
//     ${topSlots.map((slot, i) => `${i + 1}. ${slot.start.toLocaleString()} (Confidence: ${slot.confidence.toFixed(2)})`).join("\n")}
    
//     Respond as the agent proposing your availability. Be professional and collaborative.
//     Keep it concise (1-2 sentences).
//     `

//     const systemPrompt = `You are a professional AI scheduling assistant representing a specific person. 
//     Be polite, concise, and solution-oriented.`

//     const { text } = await generateText({
//       model: google("gemini-1.5-flash"),
//       prompt,
//       system: systemPrompt,
//     })

//     return text
//   }

//   private async generateConfirmationMessage(slot: TimeSlot, meeting: any): Promise<string> {
//     const prompt = `
//     You are SchedulAI coordinator. You've successfully found a meeting time.
    
//     Meeting: "${meeting.title}"
//     Scheduled time: ${slot.start.toLocaleString()}
//     Duration: ${meeting.duration} minutes
    
//     Generate a brief, professional confirmation message announcing the successful scheduling.
//     Mention that calendar invites will be sent.
//     `

//     const systemPrompt = `You are SchedulAI, an expert meeting coordinator. Be authoritative yet friendly.`

//     const { text } = await generateText({
//       model: google("gemini-1.5-flash"),
//       prompt,
//       system: systemPrompt,
//     })

//     return text
//   }

//   private findCommonSlots(allAvailableSlots: { user: any; slots: TimeSlot[] }[], duration: number): TimeSlot[] {
//     if (allAvailableSlots.length === 0) return []

//     const commonSlots: TimeSlot[] = []
//     const firstUserSlots = allAvailableSlots[0].slots

//     for (const slot of firstUserSlots) {
//       // Check if this slot is available for ALL participants
//       const isCommonSlot = allAvailableSlots.every(({ slots }) =>
//         slots.some((userSlot) => Math.abs(userSlot.start.getTime() - slot.start.getTime()) < 60000),
//       )

//       if (isCommonSlot) {
//         // Calculate average confidence
//         const avgConfidence =
//           allAvailableSlots.reduce((sum, { slots }) => {
//             const matchingSlot = slots.find(
//               (userSlot) => Math.abs(userSlot.start.getTime() - slot.start.getTime()) < 60000,
//             )
//             return sum + (matchingSlot?.confidence || 0)
//           }, 0) / allAvailableSlots.length

//         commonSlots.push({
//           ...slot,
//           confidence: avgConfidence,
//         })
//       }
//     }

//     return commonSlots.sort((a, b) => b.confidence - a.confidence)
//   }

//   private async selectOptimalSlotWithAI(
//     slots: TimeSlot[],
//     meeting: any,
//     participantData: { user: any; slots: TimeSlot[] }[],
//   ): Promise<TimeSlot> {
//     const prompt = `
//     You are an AI scheduling optimizer. Select the best meeting slot from these options:
    
//     Available slots:
//     ${slots
//       .slice(0, 5)
//       .map(
//         (slot, i) =>
//           `${i + 1}. ${slot.start.toLocaleString()} - ${slot.end.toLocaleString()} (Avg Confidence: ${slot.confidence.toFixed(2)})`,
//       )
//       .join("\n")}
    
//     Meeting: "${meeting.title}" (Priority: ${meeting.priority}, Duration: ${meeting.duration} min)
//     Participants: ${participantData.map((p) => p.user.name).join(", ")}
    
//     Consider:
//     - Participant confidence scores
//     - Time zone friendliness (business hours)
//     - Meeting priority level
//     - Day of week preferences
    
//     Respond with ONLY the number of your choice (1, 2, 3, etc.).
//     `

//     const systemPrompt = `You are an expert AI scheduling optimizer. Choose the most suitable meeting time.`

//     const { text } = await generateText({
//       model: google("gemini-1.5-flash"),
//       prompt,
//       system: systemPrompt,
//     })

//     const selectedIndex = Number.parseInt(text.trim()) - 1
//     return slots[selectedIndex] || slots[0]
//   }

//   private async handleConflictsWithAI(
//     participantAgents: { agent: ParticipantAgent; user: any }[],
//     meeting: any,
//     negotiations: any[],
//   ): Promise<{
//     success: boolean
//     scheduledSlot?: TimeSlot
//     rescheduledEvents?: any[]
//     message: string
//     negotiations: any[]
//   }> {
//     console.log("🤝 Starting AI-powered conflict resolution...")

//     // Get all calendar events for conflict analysis
//     const allConflicts: any[] = []
//     for (const { user } of participantAgents) {
//       const userWithEvents = await prisma.user.findUnique({
//         where: { id: user.id },
//         include: { calendarEvents: true },
//       })
//       if (userWithEvents) {
//         allConflicts.push(...userWithEvents.calendarEvents)
//       }
//     }

//     // Find reschedulable events
//     const reschedulableEvents = allConflicts.filter((event) => event.canReschedule && event.priority !== "URGENT")

//     console.log(`📋 Found ${reschedulableEvents.length} reschedulable events`)

//     if (reschedulableEvents.length > 0) {
//       // AI decides which events to reschedule
//       const reschedulingDecision = await this.makeReschedulingDecision(reschedulableEvents, meeting)

//       negotiations.push({
//         agent: "SchedulAI_Coordinator",
//         message: reschedulingDecision.message,
//         timestamp: new Date().toISOString(),
//         action: "PROPOSE_RESCHEDULE",
//       })

//       if (reschedulingDecision.shouldReschedule) {
//         // Perform the rescheduling
//         const rescheduledEvents = await this.performRescheduling(reschedulingDecision.eventsToReschedule)

//         // Try scheduling again after rescheduling
//         const retryResult = await this.orchestrateScheduling()

//         return {
//           ...retryResult,
//           rescheduledEvents,
//           negotiations: [...negotiations, ...(retryResult.negotiations || [])],
//         }
//       }
//     }

//     // Generate AI failure message
//     const failureMessage = await this.generateFailureMessage(meeting, allConflicts)
//     negotiations.push({
//       agent: "SchedulAI_Coordinator",
//       message: failureMessage,
//       timestamp: new Date().toISOString(),
//       action: "SCHEDULING_FAILED",
//     })

//     return {
//       success: false,
//       message: "Unable to find suitable time slot even after AI negotiation attempts",
//       negotiations,
//     }
//   }

//   private async makeReschedulingDecision(
//     reschedulableEvents: any[],
//     meeting: any,
//   ): Promise<{
//     shouldReschedule: boolean
//     eventsToReschedule: any[]
//     message: string
//   }> {
//     const prompt = `
//     You are SchedulAI coordinator analyzing scheduling conflicts.
    
//     New meeting request: "${meeting.title}" (Priority: ${meeting.priority}, Duration: ${meeting.duration} min)
    
//     Conflicting events that could be rescheduled:
//     ${reschedulableEvents
//       .map(
//         (event, i) =>
//           `${i + 1}. "${event.title}" - ${new Date(event.startTime).toLocaleString()} (Priority: ${event.priority})`,
//       )
//       .join("\n")}
    
//     Should I reschedule some of these events to accommodate the new meeting?
//     Consider:
//     - Meeting priorities
//     - Impact on participants
//     - Business importance
    
//     Respond with:
//     1. "YES" or "NO" for whether to reschedule
//     2. If YES, list the event numbers to reschedule (e.g., "1,3")
//     3. A brief explanation message
    
//     Format: YES|1,2|I'll reschedule the lower priority meetings to accommodate this urgent request.
//     `

//     const systemPrompt = `You are an expert AI scheduling coordinator. Make smart rescheduling decisions.`

//     const { text } = await generateText({
//       model: google("gemini-1.5-flash"),
//       prompt,
//       system: systemPrompt,
//     })

//     const parts = text.split("|")
//     const shouldReschedule = parts[0]?.trim() === "YES"
//     const eventIndices = parts[1]?.split(",").map((n) => Number.parseInt(n.trim()) - 1) || []
//     const message = parts[2]?.trim() || "Analyzing rescheduling options..."

//     return {
//       shouldReschedule,
//       eventsToReschedule: eventIndices.map((i) => reschedulableEvents[i]).filter(Boolean),
//       message,
//     }
//   }

//   private async performRescheduling(eventsToReschedule: any[]): Promise<any[]> {
//     const rescheduledEvents = []

//     for (const event of eventsToReschedule) {
//       // Find a new time slot (simple logic - move 2 hours later)
//       const newStart = new Date(event.startTime.getTime() + 2 * 60 * 60 * 1000)
//       const newEnd = new Date(event.endTime.getTime() + 2 * 60 * 60 * 1000)

//       // Update the event
//       await prisma.calendarEvent.update({
//         where: { id: event.id },
//         data: {
//           startTime: newStart,
//           endTime: newEnd,
//         },
//       })

//       // Log the reschedule
//       await prisma.rescheduledMeeting.create({
//         data: {
//           meetingId: this.meetingId,
//           originalEventId: event.id,
//           originalTitle: event.title,
//           originalStart: event.startTime,
//           originalEnd: event.endTime,
//           newStart,
//           newEnd,
//           reason: `Rescheduled by AI to accommodate higher priority meeting`,
//         },
//       })

//       rescheduledEvents.push({
//         title: event.title,
//         originalTime: event.startTime.toLocaleString(),
//         newTime: newStart.toLocaleString(),
//       })

//       // Send reschedule notification
//       await this.sendRescheduleNotification(event, newStart, newEnd)
//     }

//     return rescheduledEvents
//   }

//   private async generateFailureMessage(meeting: any, conflicts: any[]): Promise<string> {
//     const prompt = `
//     You are SchedulAI coordinator. You couldn't find a suitable time for a meeting.
    
//     Meeting: "${meeting.title}" (Priority: ${meeting.priority})
//     Conflicts found: ${conflicts.length} scheduling conflicts
    
//     Generate a professional message explaining why scheduling failed and suggest alternatives.
//     Be helpful and solution-oriented.
//     `

//     const systemPrompt = `You are SchedulAI. Be professional and helpful even when delivering bad news.`

//     const { text } = await generateText({
//       model: google("gemini-1.5-flash"),
//       prompt,
//       system: systemPrompt,
//     })

//     return text
//   }

//   private async scheduleMeeting(slot: TimeSlot): Promise<void> {
//     await prisma.meeting.update({
//       where: { id: this.meetingId },
//       data: {
//         scheduledAt: slot.start,
//         status: "SCHEDULED",
//         updatedAt: new Date(),
//       },
//     })

//     await prisma.meetingParticipant.updateMany({
//       where: { meetingId: this.meetingId },
//       data: { status: "ACCEPTED" },
//     })
//   }

//   private async sendConfirmationEmails(slot: TimeSlot, meeting: any): Promise<void> {
//     const participants = await prisma.user.findMany({
//       where: {
//         participantIn: {
//           some: {
//             meetingId: this.meetingId,
//           },
//         },
//       },
//     })

//     const calendarInvite = generateCalendarInvite({
//       title: meeting.title,
//       description: meeting.description || "",
//       startTime: slot.start,
//       endTime: slot.end,
//       participants: participants.map((p) => p.email),
//     })

//     await sendEmail({
//       to: participants.map((p) => p.email),
//       subject: `Meeting Confirmed: ${meeting.title}`,
//       html: `
//         <h2>🎉 Meeting Scheduled Successfully!</h2>
//         <p><strong>Title:</strong> ${meeting.title}</p>
//         <p><strong>Date & Time:</strong> ${slot.start.toLocaleString()}</p>
//         <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
//         <p><strong>Participants:</strong> ${participants.map((p) => p.name).join(", ")}</p>
        
//         ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ""}
        
//         <p>This meeting was automatically scheduled by SchedulAI. Please add it to your calendar using the attachment.</p>
        
//         <p><strong>Add to Calendar:</strong></p>
//         <p>📅 <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${slot.start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${slot.end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z">Add to Google Calendar</a></p>
//       `,
//       attachments: [
//         {
//           filename: "meeting.ics",
//           content: calendarInvite,
//           contentType: "text/calendar",
//         },
//       ],
//     })
//   }

//   private async sendRescheduleNotification(event: any, newStart: Date, newEnd: Date): Promise<void> {
//     const user = await prisma.user.findUnique({
//       where: { id: event.userId },
//     })

//     if (!user) return

//     await sendEmail({
//       to: [user.email],
//       subject: `Meeting Rescheduled by AI: ${event.title}`,
//       html: `
//         <h2>🤖 Meeting Automatically Rescheduled</h2>
//         <p>Hi ${user.name},</p>
//         <p>Your meeting "<strong>${event.title}</strong>" has been automatically rescheduled by SchedulAI to accommodate a higher priority meeting.</p>
        
//         <p><strong>Original Time:</strong> ${event.startTime.toLocaleString()}</p>
//         <p><strong>New Time:</strong> ${newStart.toLocaleString()}</p>
        
//         <p>This change was made by AI to optimize everyone's schedule. If this doesn't work for you, please reply to reschedule manually.</p>
        
//         <p><strong>Add to Calendar:</strong></p>
//         <p>📅 <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${newStart.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${newEnd.toISOString().replace(/[-:]/g, "").split(".")[0]}Z">Add to Google Calendar</a></p>
//       `,
//     })
//   }
// }


// !new without eemail add email domain to resend to send m]email 

import { BaseAgent, type TimeSlot, type NegotiationContext } from "./base-agent"
import { ParticipantAgent } from "./participant-agent"
import { prisma } from "@/lib/database"
// COMMENTED OUT FOR LOCALHOST DEVELOPMENT - UNCOMMENT FOR DEPLOYMENT
// import { sendEmail } from "@/lib/email"
// import { generateCalendarInvite } from "@/lib/calendar"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export class CoordinatorAgent extends BaseAgent {
  async analyzeAvailability(): Promise<TimeSlot[]> {
    return []
  }

  async negotiate(context: NegotiationContext): Promise<string> {
    const prompt = `
    You are SchedulAI, the main coordinator for scheduling meetings.
    
    Meeting: "${context.meeting.title}" (${context.meeting.duration} minutes, Priority: ${context.meeting.priority})
    Participants: ${context.participants.map((p) => p.name).join(", ")}
    
    Current situation:
    - ${context.currentSlots.length} potential time slots identified
    - ${context.conflicts.length} scheduling conflicts detected
    
    Your role is to:
    1. Analyze all participant availability
    2. Find optimal meeting times
    3. Coordinate rescheduling when needed
    4. Ensure all participants are satisfied
    
    Provide a summary of the scheduling analysis and next steps.
    `

    const systemPrompt = `You are SchedulAI, an expert meeting coordinator. Be authoritative yet diplomatic. 
    Focus on efficient scheduling solutions and clear communication.`

    return await this.generateAIResponse(prompt, systemPrompt)
  }

  async proposeAlternatives(conflicts: any[]): Promise<TimeSlot[]> {
    return []
  }

  async orchestrateScheduling(): Promise<{
    success: boolean
    scheduledSlot?: TimeSlot
    rescheduledEvents?: any[]
    message: string
    negotiations?: any[]
  }> {
    try {
      console.log("🎯 Starting AI orchestration...")

      // Step 1: Get meeting and participants
      const meeting = await prisma.meeting.findUnique({
        where: { id: this.meetingId },
        include: {
          participants: {
            include: { user: true },
          },
          owner: true,
        },
      })

      if (!meeting) throw new Error("Meeting not found")

      console.log("📋 Meeting details:", {
        title: meeting.title,
        duration: meeting.duration,
        priority: meeting.priority,
        participants: meeting.participants.length,
      })

      const negotiations: any[] = []

      // Step 2: Create participant agents and analyze availability
      console.log("🤖 Creating participant agents...")
      const participantAgents: { agent: ParticipantAgent; user: any }[] = []

      for (const participant of meeting.participants) {
        const agentSession = await prisma.agentSession.create({
          data: {
            meetingId: this.meetingId,
            userId: participant.userId,
            agentType: "PARTICIPANT",
            status: "ACTIVE",
          },
        })

        const agent = new ParticipantAgent(participant.userId, this.meetingId, agentSession.id)
        participantAgents.push({ agent, user: participant.user })

        console.log(`✅ Created agent for ${participant.user.name}`)
      }

      // Step 3: Each agent analyzes their availability
      console.log("📊 Analyzing participant availability...")
      const allAvailableSlots: { user: any; slots: TimeSlot[] }[] = []

      for (const { agent, user } of participantAgents) {
        console.log(`🔍 Analyzing availability for ${user.name}...`)
        const slots = await agent.analyzeAvailability()
        allAvailableSlots.push({ user, slots })

        // Log negotiation message
        const negotiationMessage = await this.generateNegotiationMessage(user, slots, meeting)
        negotiations.push({
          agent: `Agent_${user.name}`,
          message: negotiationMessage,
          timestamp: new Date().toISOString(),
          action: "ANALYZE_AVAILABILITY",
        })

        console.log(`✅ ${user.name} has ${slots.length} available slots`)
      }

      // Step 4: Find common available slots
      console.log("🔍 Finding common available slots...")
      const commonSlots = this.findCommonSlots(allAvailableSlots, meeting.duration)

      console.log(`📅 Found ${commonSlots.length} common slots`)

      if (commonSlots.length > 0) {
        // Step 5: AI selects the best slot
        console.log("🧠 AI selecting optimal slot...")
        const bestSlot = await this.selectOptimalSlotWithAI(commonSlots, meeting, allAvailableSlots)

        // Step 6: Generate AI confirmation message
        const confirmationMessage = await this.generateConfirmationMessage(bestSlot, meeting)
        negotiations.push({
          agent: "SchedulAI_Coordinator",
          message: confirmationMessage,
          timestamp: new Date().toISOString(),
          action: "CONFIRM_SLOT",
        })

        // Step 7: Schedule the meeting
        await this.scheduleMeeting(bestSlot)

        // Step 8: Create notification instead of sending emails (localhost mode)
        await this.createNotification(bestSlot, meeting)

        return {
          success: true,
          scheduledSlot: bestSlot,
          message: `Successfully scheduled "${meeting.title}" for ${bestSlot.start.toLocaleString()}`,
          negotiations,
        }
      } else {
        // Step 5: No common slots - initiate AI negotiation
        console.log("⚡ No common slots found - starting AI negotiation...")
        return await this.handleConflictsWithAI(participantAgents, meeting, negotiations)
      }
    } catch (error) {
      console.error("💥 Scheduling orchestration failed:", error)
      return {
        success: false,
        message: `Scheduling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        negotiations: [],
      }
    }
  }

  private async generateNegotiationMessage(user: any, slots: TimeSlot[], meeting: any): Promise<string> {
    const topSlots = slots.slice(0, 3)

    const prompt = `
    You are an AI scheduling agent representing ${user.name}.
    
    Meeting request: "${meeting.title}" (${meeting.duration} minutes, Priority: ${meeting.priority})
    
    Your available time slots:
    ${topSlots.map((slot, i) => `${i + 1}. ${slot.start.toLocaleString()} (Confidence: ${slot.confidence.toFixed(2)})`).join("\n")}
    
    Respond as the agent proposing your availability. Be professional and collaborative.
    Keep it concise (1-2 sentences).
    `

    const systemPrompt = `You are a professional AI scheduling assistant representing a specific person. 
    Be polite, concise, and solution-oriented.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: systemPrompt,
    })

    return text
  }

  private async generateConfirmationMessage(slot: TimeSlot, meeting: any): Promise<string> {
    const prompt = `
    You are SchedulAI coordinator. You've successfully found a meeting time.
    
    Meeting: "${meeting.title}"
    Scheduled time: ${slot.start.toLocaleString()}
    Duration: ${meeting.duration} minutes
    
    Generate a brief, professional confirmation message announcing the successful scheduling.
    Mention that calendar invites will be sent.
    `

    const systemPrompt = `You are SchedulAI, an expert meeting coordinator. Be authoritative yet friendly.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: systemPrompt,
    })

    return text
  }

  private findCommonSlots(allAvailableSlots: { user: any; slots: TimeSlot[] }[], duration: number): TimeSlot[] {
    if (allAvailableSlots.length === 0) return []

    const commonSlots: TimeSlot[] = []
    const firstUserSlots = allAvailableSlots[0].slots

    for (const slot of firstUserSlots) {
      // Check if this slot is available for ALL participants
      const isCommonSlot = allAvailableSlots.every(({ slots }) =>
        slots.some((userSlot) => Math.abs(userSlot.start.getTime() - slot.start.getTime()) < 60000),
      )

      if (isCommonSlot) {
        // Calculate average confidence
        const avgConfidence =
          allAvailableSlots.reduce((sum, { slots }) => {
            const matchingSlot = slots.find(
              (userSlot) => Math.abs(userSlot.start.getTime() - slot.start.getTime()) < 60000,
            )
            return sum + (matchingSlot?.confidence || 0)
          }, 0) / allAvailableSlots.length

        commonSlots.push({
          ...slot,
          confidence: avgConfidence,
        })
      }
    }

    return commonSlots.sort((a, b) => b.confidence - a.confidence)
  }

  private async selectOptimalSlotWithAI(
    slots: TimeSlot[],
    meeting: any,
    participantData: { user: any; slots: TimeSlot[] }[],
  ): Promise<TimeSlot> {
    const prompt = `
    You are an AI scheduling optimizer. Select the best meeting slot from these options:
    
    Available slots:
    ${slots
      .slice(0, 5)
      .map(
        (slot, i) =>
          `${i + 1}. ${slot.start.toLocaleString()} - ${slot.end.toLocaleString()} (Avg Confidence: ${slot.confidence.toFixed(2)})`,
      )
      .join("\n")}
    
    Meeting: "${meeting.title}" (Priority: ${meeting.priority}, Duration: ${meeting.duration} min)
    Participants: ${participantData.map((p) => p.user.name).join(", ")}
    
    Consider:
    - Participant confidence scores
    - Time zone friendliness (business hours)
    - Meeting priority level
    - Day of week preferences
    
    Respond with ONLY the number of your choice (1, 2, 3, etc.).
    `

    const systemPrompt = `You are an expert AI scheduling optimizer. Choose the most suitable meeting time.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: systemPrompt,
    })

    const selectedIndex = Number.parseInt(text.trim()) - 1
    return slots[selectedIndex] || slots[0]
  }

  private async handleConflictsWithAI(
    participantAgents: { agent: ParticipantAgent; user: any }[],
    meeting: any,
    negotiations: any[],
  ): Promise<{
    success: boolean
    scheduledSlot?: TimeSlot
    rescheduledEvents?: any[]
    message: string
    negotiations: any[]
  }> {
    console.log("🤝 Starting AI-powered conflict resolution...")

    // Get all calendar events for conflict analysis
    const allConflicts: any[] = []
    for (const { user } of participantAgents) {
      const userWithEvents = await prisma.user.findUnique({
        where: { id: user.id },
        include: { calendarEvents: true },
      })
      if (userWithEvents) {
        allConflicts.push(...userWithEvents.calendarEvents)
      }
    }

    // Find reschedulable events
    const reschedulableEvents = allConflicts.filter((event) => event.canReschedule && event.priority !== "URGENT")

    console.log(`📋 Found ${reschedulableEvents.length} reschedulable events`)

    if (reschedulableEvents.length > 0) {
      // AI decides which events to reschedule
      const reschedulingDecision = await this.makeReschedulingDecision(reschedulableEvents, meeting)

      negotiations.push({
        agent: "SchedulAI_Coordinator",
        message: reschedulingDecision.message,
        timestamp: new Date().toISOString(),
        action: "PROPOSE_RESCHEDULE",
      })

      if (reschedulingDecision.shouldReschedule) {
        // Perform the rescheduling
        const rescheduledEvents = await this.performRescheduling(reschedulingDecision.eventsToReschedule)

        // Try scheduling again after rescheduling
        const retryResult = await this.orchestrateScheduling()

        return {
          ...retryResult,
          rescheduledEvents,
          negotiations: [...negotiations, ...(retryResult.negotiations || [])],
        }
      }
    }

    // Generate AI failure message
    const failureMessage = await this.generateFailureMessage(meeting, allConflicts)
    negotiations.push({
      agent: "SchedulAI_Coordinator",
      message: failureMessage,
      timestamp: new Date().toISOString(),
      action: "SCHEDULING_FAILED",
    })

    return {
      success: false,
      message: "Unable to find suitable time slot even after AI negotiation attempts",
      negotiations,
    }
  }

  private async makeReschedulingDecision(
    reschedulableEvents: any[],
    meeting: any,
  ): Promise<{
    shouldReschedule: boolean
    eventsToReschedule: any[]
    message: string
  }> {
    const prompt = `
    You are SchedulAI coordinator analyzing scheduling conflicts.
    
    New meeting request: "${meeting.title}" (Priority: ${meeting.priority}, Duration: ${meeting.duration} min)
    
    Conflicting events that could be rescheduled:
    ${reschedulableEvents
      .map(
        (event, i) =>
          `${i + 1}. "${event.title}" - ${new Date(event.startTime).toLocaleString()} (Priority: ${event.priority})`,
      )
      .join("\n")}
    
    Should I reschedule some of these events to accommodate the new meeting?
    Consider:
    - Meeting priorities
    - Impact on participants
    - Business importance
    
    Respond with:
    1. "YES" or "NO" for whether to reschedule
    2. If YES, list the event numbers to reschedule (e.g., "1,3")
    3. A brief explanation message
    
    Format: YES|1,2|I'll reschedule the lower priority meetings to accommodate this urgent request.
    `

    const systemPrompt = `You are an expert AI scheduling coordinator. Make smart rescheduling decisions.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: systemPrompt,
    })

    const parts = text.split("|")
    const shouldReschedule = parts[0]?.trim() === "YES"
    const eventIndices = parts[1]?.split(",").map((n) => Number.parseInt(n.trim()) - 1) || []
    const message = parts[2]?.trim() || "Analyzing rescheduling options..."

    return {
      shouldReschedule,
      eventsToReschedule: eventIndices.map((i) => reschedulableEvents[i]).filter(Boolean),
      message,
    }
  }

  private async performRescheduling(eventsToReschedule: any[]): Promise<any[]> {
    const rescheduledEvents = []

    for (const event of eventsToReschedule) {
      // Find a new time slot (simple logic - move 2 hours later)
      const newStart = new Date(event.startTime.getTime() + 2 * 60 * 60 * 1000)
      const newEnd = new Date(event.endTime.getTime() + 2 * 60 * 60 * 1000)

      // Update the event
      await prisma.calendarEvent.update({
        where: { id: event.id },
        data: {
          startTime: newStart,
          endTime: newEnd,
        },
      })

      // Log the reschedule
      await prisma.rescheduledMeeting.create({
        data: {
          meetingId: this.meetingId,
          originalEventId: event.id,
          originalTitle: event.title,
          originalStart: event.startTime,
          originalEnd: event.endTime,
          newStart,
          newEnd,
          reason: `Rescheduled by AI to accommodate higher priority meeting`,
        },
      })

      rescheduledEvents.push({
        title: event.title,
        originalTime: event.startTime.toLocaleString(),
        newTime: newStart.toLocaleString(),
      })

      // Send reschedule notification
      await this.createRescheduleNotification(event, newStart, newEnd)
    }

    return rescheduledEvents
  }

  private async generateFailureMessage(meeting: any, conflicts: any[]): Promise<string> {
    const prompt = `
    You are SchedulAI coordinator. You couldn't find a suitable time for a meeting.
    
    Meeting: "${meeting.title}" (Priority: ${meeting.priority})
    Conflicts found: ${conflicts.length} scheduling conflicts
    
    Generate a professional message explaining why scheduling failed and suggest alternatives.
    Be helpful and solution-oriented.
    `

    const systemPrompt = `You are SchedulAI. Be professional and helpful even when delivering bad news.`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: systemPrompt,
    })

    return text
  }

  private async scheduleMeeting(slot: TimeSlot): Promise<void> {
    await prisma.meeting.update({
      where: { id: this.meetingId },
      data: {
        scheduledAt: slot.start,
        status: "SCHEDULED",
        updatedAt: new Date(),
      },
    })

    await prisma.meetingParticipant.updateMany({
      where: { meetingId: this.meetingId },
      data: { status: "ACCEPTED" },
    })
  }

  private async createNotification(slot: TimeSlot, meeting: any): Promise<void> {
    // Get all participants
    const participants = await prisma.user.findMany({
      where: {
        participantIn: {
          some: {
            meetingId: this.meetingId,
          },
        },
      },
    })

    // Create notification record in database (we'll add this table)
    // For now, we'll return the notification data to be handled by the frontend
    console.log("📧 Creating notification instead of sending email (localhost mode)")
    console.log("Meeting scheduled successfully:", {
      title: meeting.title,
      scheduledAt: slot.start.toISOString(),
      participants: participants.map((p) => p.email),
    })
  }

  private async createRescheduleNotification(event: any, newStart: Date, newEnd: Date): Promise<void> {
    console.log("📧 Creating reschedule notification instead of sending email (localhost mode)")
    console.log("Meeting rescheduled:", {
      title: event.title,
      originalTime: event.startTime.toISOString(),
      newTime: newStart.toISOString(),
    })
  }
}
