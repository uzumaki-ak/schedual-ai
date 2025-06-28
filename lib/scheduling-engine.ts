import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type {
  MeetingRequest,
  SchedulingResult,
  NegotiationMessage,
  TimeSlot,
  RescheduledMeeting,
} from "@/types/scheduling"
import { mockCalendars } from "./mock-calendars"

export async function scheduleWithAI(
  request: MeetingRequest,
  onMessage: (message: NegotiationMessage) => void,
): Promise<SchedulingResult> {
  // Simulate AI agent initialization
  await delay(500)
  onMessage({
    agent: "SchedulAI",
    content: `Initializing agents for ${request.participants.join(", ")}...`,
    timestamp: new Date().toLocaleTimeString(),
  })

  // Step 1: Scan calendars
  await delay(800)
  onMessage({
    agent: "SchedulAI",
    content: "Scanning participant calendars and preferences...",
    timestamp: new Date().toLocaleTimeString(),
    action: "CALENDAR_SCAN",
  })

  // Step 2: Find conflicts and available slots
  const availableSlots = await findAvailableSlots(request, onMessage)

  if (availableSlots.length === 0) {
    // Step 3: Negotiate and reschedule if needed
    const negotiationResult = await negotiateReschedule(request, onMessage)
    return negotiationResult
  }

  // Step 4: Select best slot using AI
  const bestSlot = await selectBestSlot(availableSlots, request, onMessage)

  // Step 5: Generate confirmation messages
  await delay(500)
  onMessage({
    agent: "SchedulAI",
    content: `Perfect! Found optimal slot: ${bestSlot.date} at ${bestSlot.time}. Generating confirmation messages...`,
    timestamp: new Date().toLocaleTimeString(),
    action: "CONFIRM_SLOT",
  })

  return {
    success: true,
    scheduledSlot: bestSlot,
    conflictsResolved: 0,
    rescheduledMeetings: [],
  }
}

async function findAvailableSlots(
  request: MeetingRequest,
  onMessage: (message: NegotiationMessage) => void,
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = []
  const dates = ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18"]
  const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

  for (const participant of request.participants) {
    await delay(300)
    onMessage({
      agent: `Agent_${participant}`,
      content: `Analyzing ${participant}'s calendar... Found ${mockCalendars[participant]?.events.length || 0} existing meetings.`,
      timestamp: new Date().toLocaleTimeString(),
      action: "ANALYZE_CALENDAR",
    })
  }

  // Find common free slots
  for (const date of dates) {
    for (const time of times) {
      const isAvailable = request.participants.every((participant) => {
        const calendar = mockCalendars[participant]
        if (!calendar) return true

        return !calendar.events.some((event) => event.date === date && event.time === time)
      })

      if (isAvailable) {
        slots.push({ date, time, duration: request.duration })
      }
    }
  }

  await delay(500)
  onMessage({
    agent: "SchedulAI",
    content: `Found ${slots.length} potential time slots without conflicts.`,
    timestamp: new Date().toLocaleTimeString(),
    action: "SLOTS_FOUND",
  })

  return slots
}

async function negotiateReschedule(
  request: MeetingRequest,
  onMessage: (message: NegotiationMessage) => void,
): Promise<SchedulingResult> {
  await delay(800)
  onMessage({
    agent: "SchedulAI",
    content: "No common free slots found. Initiating negotiation protocol...",
    timestamp: new Date().toLocaleTimeString(),
    action: "START_NEGOTIATION",
  })

  const rescheduledMeetings: RescheduledMeeting[] = []

  // Simulate negotiation with each participant
  for (const participant of request.participants) {
    const calendar = mockCalendars[participant]
    if (!calendar) continue

    const reschedulableMeetings = calendar.events.filter((event) => event.canReschedule && event.priority !== "high")

    if (reschedulableMeetings.length > 0) {
      const meeting = reschedulableMeetings[0]

      await delay(600)
      onMessage({
        agent: `Agent_${participant}`,
        content: `I can reschedule "${meeting.title}" from ${meeting.time} to make room for this ${request.importance} priority meeting.`,
        timestamp: new Date().toLocaleTimeString(),
        action: "PROPOSE_RESCHEDULE",
      })

      // Generate AI response for rescheduling
      const { text: negotiationResponse } = await generateText({
        model: openai("gpt-4o"),
        prompt: `You are an AI scheduling agent for ${participant}. You need to politely propose rescheduling "${meeting.title}" to accommodate a new ${request.importance} priority meeting "${request.title}". Be professional and helpful.`,
        system: "You are a polite and professional AI scheduling assistant. Keep responses concise and friendly.",
      })

      await delay(400)
      onMessage({
        agent: `Agent_${participant}`,
        content: negotiationResponse,
        timestamp: new Date().toLocaleTimeString(),
        action: "AI_NEGOTIATION",
      })

      rescheduledMeetings.push({
        title: meeting.title,
        participant,
        originalTime: `${meeting.date} ${meeting.time}`,
        newTime: `${meeting.date} ${getAlternativeTime(meeting.time)}`,
      })
    }
  }

  if (rescheduledMeetings.length > 0) {
    await delay(500)
    onMessage({
      agent: "SchedulAI",
      content: `Successfully negotiated ${rescheduledMeetings.length} reschedules. Finding new optimal slot...`,
      timestamp: new Date().toLocaleTimeString(),
      action: "NEGOTIATION_SUCCESS",
    })

    return {
      success: true,
      scheduledSlot: { date: "2024-01-17", time: "14:00", duration: request.duration },
      conflictsResolved: rescheduledMeetings.length,
      rescheduledMeetings,
    }
  }

  return {
    success: false,
    conflictsResolved: 0,
    reason: "Unable to find suitable time slot even after negotiation attempts.",
    suggestions: [
      "Try reducing meeting duration",
      "Consider scheduling for next week",
      "Remove some participants to find common availability",
      "Schedule multiple shorter meetings instead",
    ],
  }
}

async function selectBestSlot(
  slots: TimeSlot[],
  request: MeetingRequest,
  onMessage: (message: NegotiationMessage) => void,
): Promise<TimeSlot> {
  await delay(600)
  onMessage({
    agent: "SchedulAI",
    content: "Using AI to analyze participant preferences and select optimal time slot...",
    timestamp: new Date().toLocaleTimeString(),
    action: "AI_OPTIMIZATION",
  })

  // Use AI to select the best slot based on preferences
  const { text: aiRecommendation } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Given these available time slots: ${slots.map((s) => `${s.date} ${s.time}`).join(", ")}, 
    and participant preferences: ${request.participants
      .map((p) => {
        const cal = mockCalendars[p]
        return `${p}: ${cal?.preferences.preferredHours?.join(", ") || "flexible"} (${cal?.preferences.timeZone})`
      })
      .join("; ")},
    recommend the best slot considering time zones and preferences. Respond with just the date and time.`,
    system: "You are an AI scheduling optimizer. Consider time zones, preferences, and meeting importance.",
  })

  await delay(400)
  onMessage({
    agent: "SchedulAI",
    content: `AI recommendation: ${aiRecommendation.trim()}`,
    timestamp: new Date().toLocaleTimeString(),
    action: "AI_RECOMMENDATION",
  })

  // Return the first available slot (in a real implementation, this would use the AI recommendation)
  return slots[0] || { date: "2024-01-17", time: "14:00", duration: request.duration }
}

function getAlternativeTime(originalTime: string): string {
  const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
  const currentIndex = times.indexOf(originalTime)
  return times[(currentIndex + 1) % times.length]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
