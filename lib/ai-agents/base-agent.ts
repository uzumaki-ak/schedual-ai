import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { prisma } from "@/lib/database"
import type { User, CalendarEvent, Meeting } from "@prisma/client"

export interface TimeSlot {
  start: Date
  end: Date
  confidence: number
}

export interface NegotiationContext {
  meeting: Meeting
  participants: User[]
  currentSlots: TimeSlot[]
  conflicts: CalendarEvent[]
}

export abstract class BaseAgent {
  protected userId: string
  protected meetingId: string
  protected agentSessionId: string

  constructor(userId: string, meetingId: string, agentSessionId: string) {
    this.userId = userId
    this.meetingId = meetingId
    this.agentSessionId = agentSessionId
  }

  abstract analyzeAvailability(): Promise<TimeSlot[]>
  abstract negotiate(context: NegotiationContext): Promise<string>
  abstract proposeAlternatives(conflicts: CalendarEvent[]): Promise<TimeSlot[]>

  protected async generateAIResponse(prompt: string, systemPrompt: string): Promise<string> {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: systemPrompt,
    })
    return text
  }

  protected async logNegotiation(receiverId: string, message: string, action: string, proposedSlots?: TimeSlot[]) {
    await prisma.negotiation.create({
      data: {
        meetingId: this.meetingId,
        senderId: this.userId,
        receiverId,
        agentSessionId: this.agentSessionId,
        message,
        action: action as any,
        proposedSlots: proposedSlots ? JSON.stringify(proposedSlots) : undefined,
        aiGenerated: true,
      },
    })
  }
}

// Export all types that might be needed by other modules
export type { CalendarEvent }