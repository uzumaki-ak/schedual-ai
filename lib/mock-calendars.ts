import type { ParticipantCalendar } from "@/types/scheduling"

export const mockCalendars: Record<string, ParticipantCalendar> = {
  Alice: {
    name: "Alice",
    events: [
      {
        title: "Team Standup",
        date: "2024-01-15",
        time: "09:00",
        duration: 30,
        priority: "high",
        canReschedule: false,
      },
      { title: "Client Call", date: "2024-01-16", time: "14:00", duration: 60, priority: "high", canReschedule: false },
      {
        title: "Code Review",
        date: "2024-01-17",
        time: "11:00",
        duration: 45,
        priority: "medium",
        canReschedule: true,
      },
    ],
    preferences: {
      timeZone: "EST",
      preferredHours: ["10:00", "11:00", "14:00", "15:00"],
    },
  },
  Bob: {
    name: "Bob",
    events: [
      {
        title: "Design Review",
        date: "2024-01-15",
        time: "10:00",
        duration: 90,
        priority: "high",
        canReschedule: false,
      },
      { title: "All Hands", date: "2024-01-15", time: "16:00", duration: 60, priority: "high", canReschedule: false },
      {
        title: "Sprint Planning",
        date: "2024-01-16",
        time: "09:00",
        duration: 120,
        priority: "high",
        canReschedule: false,
      },
      { title: "Weekly Review", date: "2024-01-17", time: "17:00", duration: 30, priority: "low", canReschedule: true },
    ],
    preferences: {
      noMornings: true,
      timeZone: "PST",
      preferredHours: ["13:00", "14:00", "15:00", "16:00"],
    },
  },
  Claire: {
    name: "Claire",
    events: [
      {
        title: "Marketing Sync",
        date: "2024-01-15",
        time: "11:00",
        duration: 45,
        priority: "medium",
        canReschedule: true,
      },
      {
        title: "Product Demo",
        date: "2024-01-16",
        time: "15:00",
        duration: 60,
        priority: "high",
        canReschedule: false,
      },
      {
        title: "Budget Meeting",
        date: "2024-01-18",
        time: "10:00",
        duration: 90,
        priority: "high",
        canReschedule: false,
      },
    ],
    preferences: {
      timeZone: "GMT",
      preferredHours: ["09:00", "10:00", "11:00", "14:00"],
    },
  },
  Dave: {
    name: "Dave",
    events: [
      {
        title: "Engineering Sync",
        date: "2024-01-15",
        time: "08:00",
        duration: 30,
        priority: "high",
        canReschedule: false,
      },
      {
        title: "Architecture Review",
        date: "2024-01-16",
        time: "10:00",
        duration: 120,
        priority: "high",
        canReschedule: false,
      },
      { title: "Tech Talk", date: "2024-01-17", time: "16:00", duration: 60, priority: "medium", canReschedule: true },
    ],
    preferences: {
      timeZone: "EST",
      preferredHours: ["08:00", "09:00", "10:00", "11:00"],
    },
  },
}
