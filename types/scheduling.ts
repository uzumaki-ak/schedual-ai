export interface MeetingRequest {
  title: string
  participants: string[]
  duration: number
  preferredDays: string[]
  importance: "low" | "medium" | "high" | "urgent"
  description?: string
}

export interface TimeSlot {
  date: string
  time: string
  duration: number
}

export interface CalendarEvent {
  title: string
  date: string
  time: string
  duration: number
  priority: "low" | "medium" | "high"
  canReschedule: boolean
}

export interface ParticipantCalendar {
  name: string
  events: CalendarEvent[]
  preferences: {
    noMornings?: boolean
    noEvenings?: boolean
    preferredHours?: string[]
    timeZone: string
  }
}

export interface NegotiationMessage {
  agent: string
  content: string
  timestamp: string
  action?: string
}

export interface RescheduledMeeting {
  title: string
  participant: string
  originalTime: string
  newTime: string
}

export interface SchedulingResult {
  success: boolean
  scheduledSlot?: TimeSlot
  conflictsResolved: number
  rescheduledMeetings?: RescheduledMeeting[]
  reason?: string
  suggestions?: string[]
}
