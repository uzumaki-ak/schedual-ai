interface CalendarEvent {
  title: string
  description: string
  startTime: Date
  endTime: Date
  participants: string[]
}

export function generateCalendarInvite(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SchedulAI//Meeting Scheduler//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@scheduleai.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
ORGANIZER:MAILTO:noreply@scheduleai.com
${event.participants.map((email) => `ATTENDEE:MAILTO:${email}`).join("\n")}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`

  return icsContent
}

export function generateAddToCalendarLinks(event: CalendarEvent) {
  const startTime = event.startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const endTime = event.endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}`

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startTime}&enddt=${endTime}&body=${encodeURIComponent(event.description)}`

  return {
    google: googleCalendarUrl,
    outlook: outlookUrl,
  }
}
