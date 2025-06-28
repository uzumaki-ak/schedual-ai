import { BaseAgent, type TimeSlot, type NegotiationContext, type CalendarEvent } from "./base-agent"
import { prisma } from "@/lib/database"
import { addHours, addMinutes, startOfDay, endOfDay, isWithinInterval } from "date-fns"

export class ParticipantAgent extends BaseAgent {
  async analyzeAvailability(): Promise<TimeSlot[]> {
    // Get user and their calendar events
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      include: { calendarEvents: true },
    })

    if (!user) throw new Error("User not found")

    const meeting = await prisma.meeting.findUnique({
      where: { id: this.meetingId },
    })

    if (!meeting) throw new Error("Meeting not found")

    // Generate available slots for the next 7 days
    const availableSlots: TimeSlot[] = []
    const today = new Date()

    for (let day = 0; day < 7; day++) {
      const currentDay = addHours(startOfDay(today), day * 24)
      const dayEnd = endOfDay(currentDay)

      // Check each hour of the day (9 AM to 6 PM)
      for (let hour = 9; hour < 18; hour++) {
        const slotStart = addHours(currentDay, hour)
        const slotEnd = addMinutes(slotStart, meeting.duration)

        // If user has no events, they're available during business hours
        if (user.calendarEvents.length === 0) {
          let confidence = 0.8

          // Apply user preferences if they exist
          const preferences = user.preferences as any
          if (preferences?.noMornings && hour < 12) confidence -= 0.3
          if (preferences?.noEvenings && hour > 16) confidence -= 0.3
          if (preferences?.preferredHours?.includes(`${hour}:00`)) confidence += 0.2

          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            confidence: Math.max(0.1, confidence),
          })
        } else {
          // Check if this slot conflicts with existing events
          const hasConflict = user.calendarEvents.some(
            (event) =>
              isWithinInterval(slotStart, { start: event.startTime, end: event.endTime }) ||
              isWithinInterval(slotEnd, { start: event.startTime, end: event.endTime }) ||
              (slotStart <= event.startTime && slotEnd >= event.endTime),
          )

          if (!hasConflict && slotEnd <= dayEnd) {
            // Apply user preferences
            const preferences = user.preferences as any
            let confidence = 0.8

            if (preferences?.noMornings && hour < 12) confidence -= 0.3
            if (preferences?.noEvenings && hour > 16) confidence -= 0.3
            if (preferences?.preferredHours?.includes(`${hour}:00`)) confidence += 0.2

            availableSlots.push({
              start: slotStart,
              end: slotEnd,
              confidence: Math.max(0.1, confidence),
            })
          }
        }
      }
    }

    // Update agent session with available slots
    await prisma.agentSession.update({
      where: { id: this.agentSessionId },
      data: {
        availableSlots: JSON.stringify(availableSlots),
        updatedAt: new Date(),
      },
    })

    return availableSlots
  }

  async negotiate(context: NegotiationContext): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
    })

    if (!user) throw new Error("User not found")

    const availableSlots = await this.analyzeAvailability()
    const topSlots = availableSlots.sort((a, b) => b.confidence - a.confidence).slice(0, 3)

    const prompt = `
    You are an AI scheduling agent representing ${user.name}. 
    
    Meeting: "${context.meeting.title}" (${context.meeting.duration} minutes, Priority: ${context.meeting.priority})
    
    Your available slots:
    ${topSlots.map((slot, i) => `${i + 1}. ${slot.start.toLocaleString()} (Confidence: ${slot.confidence})`).join("\n")}
    
    Other participants: ${context.participants
      .filter((p) => p.id !== this.userId)
      .map((p) => p.name)
      .join(", ")}
    
    Current conflicts: ${context.conflicts.length} scheduling conflicts detected
    
    Propose your top 3 available slots and be willing to negotiate. Be professional and collaborative.
    If you have low-priority meetings that could be rescheduled, mention them.
    `

    const systemPrompt = `You are a professional AI scheduling assistant. Be polite, concise, and solution-oriented. 
    Focus on finding mutually beneficial scheduling solutions. Always maintain a collaborative tone.`

    const response = await this.generateAIResponse(prompt, systemPrompt)

    // Log this negotiation
    await this.logNegotiation(context.meeting.ownerId, response, "PROPOSE_SLOT", topSlots)

    return response
  }

  async proposeAlternatives(conflicts: CalendarEvent[]): Promise<TimeSlot[]> {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      include: { calendarEvents: true },
    })

    if (!user) throw new Error("User not found")

    // Find reschedulable meetings
    const reschedulableEvents = conflicts.filter((event) => event.canReschedule && event.priority !== "URGENT")

    if (reschedulableEvents.length === 0) {
      return []
    }

    // For each reschedulable event, propose alternative times
    const alternatives: TimeSlot[] = []

    for (const event of reschedulableEvents) {
      const eventDuration = event.endTime.getTime() - event.startTime.getTime()
      const originalStart = event.startTime

      // Propose 3 alternative slots for this event
      for (let offset = 1; offset <= 3; offset++) {
        const newStart = addHours(originalStart, offset)
        const newEnd = new Date(newStart.getTime() + eventDuration)

        // Check if the new slot is free
        const hasConflict = user.calendarEvents.some(
          (otherEvent) =>
            otherEvent.id !== event.id &&
            (isWithinInterval(newStart, { start: otherEvent.startTime, end: otherEvent.endTime }) ||
              isWithinInterval(newEnd, { start: otherEvent.startTime, end: otherEvent.endTime })),
        )

        if (!hasConflict) {
          alternatives.push({
            start: newStart,
            end: newEnd,
            confidence: 0.7 - offset * 0.1, // Prefer earlier alternatives
          })
        }
      }
    }

    return alternatives
  }
}
