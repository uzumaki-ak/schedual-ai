// "use client"

// import { useState, useEffect } from "react"
// import { useAuth } from "@/components/auth-provider"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { Calendar, Users, CheckCircle, AlertCircle, Loader2, Globe, MessageSquare } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { CalendarManager } from "@/components/calendar-manager"
// import { useRouter } from "next/navigation"

// interface MeetingRequest {
//   title: string
//   description: string
//   duration: number
//   priority: string
//   participantEmails: string[]
// }

// interface NegotiationMessage {
//   agent: string
//   message: string
//   timestamp: string
//   action: string
// }

// interface SchedulingResult {
//   success: boolean
//   meetingId?: string
//   result?: {
//     success: boolean
//     scheduledSlot?: {
//       start: string
//       end: string
//     }
//     rescheduledEvents?: Array<{
//       title: string
//       originalTime: string
//       newTime: string
//     }>
//     message: string
//     negotiations?: NegotiationMessage[]
//   }
// }

// export default function SchedulAI() {
//   const { user, loading, signOut } = useAuth()
//   const router = useRouter()
//   const [meetingRequest, setMeetingRequest] = useState<MeetingRequest>({
//     title: "",
//     description: "",
//     duration: 30,
//     priority: "medium",
//     participantEmails: [],
//   })

//   const [newParticipantEmail, setNewParticipantEmail] = useState("")
//   const [isScheduling, setIsScheduling] = useState(false)
//   const [result, setResult] = useState<SchedulingResult | null>(null)
//   const [calendarEvents, setCalendarEvents] = useState([])
//   const [negotiations, setNegotiations] = useState<NegotiationMessage[]>([])

//   useEffect(() => {
//     if (user) {
//       fetchCalendarEvents()
//     }
//   }, [user])

//   const fetchCalendarEvents = async () => {
//     try {
//       const response = await fetch("/api/calendar/events")
//       if (response.ok) {
//         const data = await response.json()
//         setCalendarEvents(data.events)
//       }
//     } catch (error) {
//       console.error("Failed to fetch calendar events:", error)
//     }
//   }

//   const handleSchedule = async () => {
//     if (!meetingRequest.title || meetingRequest.participantEmails.length === 0) {
//       return
//     }

//     setIsScheduling(true)
//     setResult(null)
//     setNegotiations([])

//     // Add initial message
//     setNegotiations([
//       {
//         agent: "SchedulAI",
//         message: `Initializing AI agents for ${meetingRequest.participantEmails.length} participants...`,
//         timestamp: new Date().toISOString(),
//         action: "INITIALIZE",
//       },
//     ])

//     try {
//       const response = await fetch("/api/meetings/schedule", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(meetingRequest),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to schedule meeting")
//       }

//       const data = await response.json()
//       setResult(data)

//       // Display negotiations if available
//       if (data.result?.negotiations) {
//         setNegotiations(data.result.negotiations)
//       }

//       await fetchCalendarEvents()
//     } catch (error) {
//       console.error("Scheduling failed:", error)
//       setResult({
//         success: false,
//         result: {
//           success: false,
//           message: error instanceof Error ? error.message : "Unknown error occurred",
//         },
//       })
//     } finally {
//       setIsScheduling(false)
//     }
//   }

//   const handleSignOut = async () => {
//     try {
//       await signOut()
//       router.push("/auth/signin")
//     } catch (error) {
//       console.error("Sign out error:", error)
//     }
//   }

//   const addParticipant = () => {
//     if (newParticipantEmail && !meetingRequest.participantEmails.includes(newParticipantEmail)) {
//       setMeetingRequest((prev) => ({
//         ...prev,
//         participantEmails: [...prev.participantEmails, newParticipantEmail],
//       }))
//       setNewParticipantEmail("")
//     }
//   }

//   const removeParticipant = (email: string) => {
//     setMeetingRequest((prev) => ({
//       ...prev,
//       participantEmails: prev.participantEmails.filter((e) => e !== email),
//     }))
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <CardTitle className="flex items-center justify-center gap-2">
//               <Calendar className="h-6 w-6 text-blue-600" />
//               SchedulAI
//             </CardTitle>
//             <CardDescription>Sign in to start scheduling with AI</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button onClick={() => router.push("/auth/signin")} className="w-full">
//               Sign In
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div className="text-center space-y-2">
//             <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
//               <Calendar className="h-8 w-8 text-blue-600" />
//               SchedulAI
//             </h1>
//             <p className="text-lg text-gray-600">Your Autonomous Meeting Coordinator</p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Globe className="h-4 w-4" />
//               <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
//             </div>
//             <div className="text-sm text-gray-600">Welcome, {user.email}</div>
//             <Button variant="outline" onClick={handleSignOut}>
//               Sign Out
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Meeting Request Form */}
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Users className="h-5 w-5" />
//                 Create Meeting Request
//               </CardTitle>
//               <CardDescription>Let AI agents find the perfect time for everyone</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label htmlFor="title">Meeting Title *</Label>
//                 <Input
//                   id="title"
//                   placeholder="e.g., Project Sync Meeting"
//                   value={meetingRequest.title}
//                   onChange={(e) => setMeetingRequest((prev) => ({ ...prev, title: e.target.value }))}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Brief description of the meeting..."
//                   value={meetingRequest.description}
//                   onChange={(e) => setMeetingRequest((prev) => ({ ...prev, description: e.target.value }))}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="duration">Duration (minutes)</Label>
//                   <Select
//                     value={meetingRequest.duration.toString()}
//                     onValueChange={(value) =>
//                       setMeetingRequest((prev) => ({ ...prev, duration: Number.parseInt(value) }))
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="15">15 minutes</SelectItem>
//                       <SelectItem value="30">30 minutes</SelectItem>
//                       <SelectItem value="45">45 minutes</SelectItem>
//                       <SelectItem value="60">1 hour</SelectItem>
//                       <SelectItem value="90">1.5 hours</SelectItem>
//                       <SelectItem value="120">2 hours</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label>Priority Level</Label>
//                   <Select
//                     value={meetingRequest.priority}
//                     onValueChange={(value) => setMeetingRequest((prev) => ({ ...prev, priority: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="low">Low</SelectItem>
//                       <SelectItem value="medium">Medium</SelectItem>
//                       <SelectItem value="high">High</SelectItem>
//                       <SelectItem value="urgent">Urgent</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div>
//                 <Label>Participants *</Label>
//                 <div className="flex gap-2 mb-2">
//                   <Input
//                     placeholder="Enter email address"
//                     value={newParticipantEmail}
//                     onChange={(e) => setNewParticipantEmail(e.target.value)}
//                     onKeyPress={(e) => e.key === "Enter" && addParticipant()}
//                   />
//                   <Button onClick={addParticipant} disabled={!newParticipantEmail}>
//                     Add
//                   </Button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {meetingRequest.participantEmails.map((email) => (
//                     <Badge
//                       key={email}
//                       variant="secondary"
//                       className="cursor-pointer"
//                       onClick={() => removeParticipant(email)}
//                     >
//                       {email} ×
//                     </Badge>
//                   ))}
//                 </div>
//               </div>

//               <Button
//                 onClick={handleSchedule}
//                 disabled={isScheduling || !meetingRequest.title || meetingRequest.participantEmails.length === 0}
//                 className="w-full"
//               >
//                 {isScheduling ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     AI Agents Negotiating...
//                   </>
//                 ) : (
//                   <>
//                     <Calendar className="h-4 w-4 mr-2" />
//                     Schedule with AI
//                   </>
//                 )}
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Calendar Events */}
//           <CalendarManager events={calendarEvents} onEventsChange={fetchCalendarEvents} />
//         </div>

//         {/* AI Negotiation Messages */}
//         {(negotiations.length > 0 || isScheduling) && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <MessageSquare className="h-5 w-5" />
//                 AI Agent Negotiations
//               </CardTitle>
//               <CardDescription>Watch AI agents negotiate in real-time</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {negotiations.map((message, index) => (
//                   <div key={index} className="border rounded-lg p-3 bg-gray-50">
//                     <div className="flex items-center gap-2 mb-1">
//                       <Badge variant="outline" className="text-xs">
//                         {message.agent}
//                       </Badge>
//                       <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
//                       {message.action && (
//                         <Badge variant="secondary" className="text-xs">
//                           {message.action}
//                         </Badge>
//                       )}
//                     </div>
//                     <p className="text-sm">{message.message}</p>
//                   </div>
//                 ))}

//                 {isScheduling && negotiations.length === 0 && (
//                   <div className="text-center py-4">
//                     <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//                     <p className="text-sm text-gray-500">Initializing AI agents...</p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Results */}
//         {result && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 {result.result?.success ? (
//                   <CheckCircle className="h-5 w-5 text-green-600" />
//                 ) : (
//                   <AlertCircle className="h-5 w-5 text-red-600" />
//                 )}
//                 Scheduling Result
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {result.result?.success ? (
//                 <div className="space-y-4">
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                     <h3 className="font-semibold text-green-800 mb-2">✅ Meeting Scheduled Successfully!</h3>
//                     {result.result.scheduledSlot && (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <strong>Date & Time:</strong> {new Date(result.result.scheduledSlot.start).toLocaleString()}
//                         </div>
//                         <div>
//                           <strong>Duration:</strong> {meetingRequest.duration} minutes
//                         </div>
//                         <div>
//                           <strong>Participants:</strong> {meetingRequest.participantEmails.join(", ")}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {result.result.rescheduledEvents && result.result.rescheduledEvents.length > 0 && (
//                     <div>
//                       <h4 className="font-semibold mb-2">🔄 Meetings Rescheduled by AI:</h4>
//                       <div className="space-y-2">
//                         {result.result.rescheduledEvents.map((meeting, index) => (
//                           <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
//                             <strong>{meeting.title}</strong> moved from {meeting.originalTime} to {meeting.newTime}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <h4 className="font-semibold mb-2">📧 Confirmation Emails Sent</h4>
//                     <p className="text-sm text-gray-600">
//                       Calendar invites with .ics files have been automatically sent to all participants. They can add
//                       the meeting directly to Google Calendar.
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <h3 className="font-semibold text-red-800 mb-2">❌ Scheduling Failed</h3>
//                   <p className="text-red-700">{result.result?.message}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }


//! new without email add email to send emails

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle, AlertCircle, Loader2, Globe, MessageSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarManager } from "@/components/calendar-manager"
import { useRouter } from "next/navigation"
import { NotificationSystem } from "@/components/notification-system"

interface MeetingRequest {
  title: string
  description: string
  duration: number
  priority: string
  participantEmails: string[]
}

interface NegotiationMessage {
  agent: string
  message: string
  timestamp: string
  action: string
}

interface SchedulingResult {
  success: boolean
  meetingId?: string
  result?: {
    success: boolean
    scheduledSlot?: {
      start: string
      end: string
    }
    rescheduledEvents?: Array<{
      title: string
      originalTime: string
      newTime: string
    }>
    message: string
    negotiations?: NegotiationMessage[]
  }
}

export default function SchedulAI() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [meetingRequest, setMeetingRequest] = useState<MeetingRequest>({
    title: "",
    description: "",
    duration: 30,
    priority: "medium",
    participantEmails: [],
  })

  const [newParticipantEmail, setNewParticipantEmail] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)
  const [result, setResult] = useState<SchedulingResult | null>(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [negotiations, setNegotiations] = useState<NegotiationMessage[]>([])
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      type: "meeting_scheduled" | "meeting_rescheduled" | "meeting_failed"
      title: string
      message: string
      meetingDetails?: {
        title: string
        description?: string
        scheduledAt: string
        duration: number
        participants: string[]
        priority: string
      }
      rescheduledEvents?: Array<{
        title: string
        originalTime: string
        newTime: string
      }>
      timestamp: string
      read: boolean
    }>
  >([])

  useEffect(() => {
    if (user) {
      fetchCalendarEvents()
    }
  }, [user])

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch("/api/calendar/events")
      if (response.ok) {
        const data = await response.json()
        setCalendarEvents(data.events)
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error)
    }
  }

  const addNotification = (notification: any) => {
    setNotifications((prev) => [notification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const handleSchedule = async () => {
    if (!meetingRequest.title || meetingRequest.participantEmails.length === 0) {
      return
    }

    setIsScheduling(true)
    setResult(null)
    setNegotiations([])

    // Add initial message
    setNegotiations([
      {
        agent: "SchedulAI",
        message: `Initializing AI agents for ${meetingRequest.participantEmails.length} participants...`,
        timestamp: new Date().toISOString(),
        action: "INITIALIZE",
      },
    ])

    try {
      const response = await fetch("/api/meetings/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingRequest),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule meeting")
      }

      const data = await response.json()
      setResult(data)

      // Display negotiations if available
      if (data.result?.negotiations) {
        setNegotiations(data.result.negotiations)
      }

      // Create notification and add to calendar if successful
      if (data.result?.success && data.result.scheduledSlot) {
        const scheduledTime = new Date(data.result.scheduledSlot.start)

        // Add notification
        addNotification({
          id: `meeting-${Date.now()}`,
          type: "meeting_scheduled",
          title: "🎉 Meeting Scheduled Successfully!",
          message: `"${meetingRequest.title}" has been scheduled for ${scheduledTime.toLocaleString()}`,
          meetingDetails: {
            title: meetingRequest.title,
            description: meetingRequest.description,
            scheduledAt: data.result.scheduledSlot.start,
            duration: meetingRequest.duration,
            participants: meetingRequest.participantEmails,
            priority: meetingRequest.priority.toUpperCase(),
          },
          rescheduledEvents: data.result.rescheduledEvents || [],
          timestamp: new Date().toISOString(),
          read: false,
        })

        // Automatically add to user's calendar
        try {
          await fetch("/api/calendar/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: meetingRequest.title,
              description: `${meetingRequest.description}\n\nParticipants: ${meetingRequest.participantEmails.join(", ")}\n\nScheduled by SchedulAI`,
              startTime: data.result.scheduledSlot.start,
              endTime: data.result.scheduledSlot.end,
              priority: meetingRequest.priority.toUpperCase(),
              canReschedule: false, // AI scheduled meetings are fixed
            }),
          })
          console.log("✅ Meeting automatically added to your calendar")
        } catch (error) {
          console.error("Failed to add meeting to calendar:", error)
        }
      } else if (data.result && !data.result.success) {
        // Add failure notification
        addNotification({
          id: `meeting-failed-${Date.now()}`,
          type: "meeting_failed",
          title: "❌ Meeting Scheduling Failed",
          message: data.result.message || "Unable to find suitable time slot",
          timestamp: new Date().toISOString(),
          read: false,
        })
      }

      await fetchCalendarEvents()
    } catch (error) {
      console.error("Scheduling failed:", error)

      // Add error notification
      addNotification({
        id: `error-${Date.now()}`,
        type: "meeting_failed",
        title: "❌ Scheduling Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        read: false,
      })

      setResult({
        success: false,
        result: {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      })
    } finally {
      setIsScheduling(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const addParticipant = () => {
    if (newParticipantEmail && !meetingRequest.participantEmails.includes(newParticipantEmail)) {
      setMeetingRequest((prev) => ({
        ...prev,
        participantEmails: [...prev.participantEmails, newParticipantEmail],
      }))
      setNewParticipantEmail("")
    }
  }

  const removeParticipant = (email: string) => {
    setMeetingRequest((prev) => ({
      ...prev,
      participantEmails: prev.participantEmails.filter((e) => e !== email),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              SchedulAI
            </CardTitle>
            <CardDescription>Sign in to start scheduling with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/signin")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              SchedulAI
            </h1>
            <p className="text-lg text-gray-600">Your Autonomous Meeting Coordinator</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div className="text-sm text-gray-600">Welcome, {user.email}</div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Meeting Request Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Meeting Request
              </CardTitle>
              <CardDescription>Let AI agents find the perfect time for everyone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Project Sync Meeting"
                  value={meetingRequest.title}
                  onChange={(e) => setMeetingRequest((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the meeting..."
                  value={meetingRequest.description}
                  onChange={(e) => setMeetingRequest((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={meetingRequest.duration.toString()}
                    onValueChange={(value) =>
                      setMeetingRequest((prev) => ({ ...prev, duration: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority Level</Label>
                  <Select
                    value={meetingRequest.priority}
                    onValueChange={(value) => setMeetingRequest((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Participants *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Enter email address"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                  />
                  <Button onClick={addParticipant} disabled={!newParticipantEmail}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meetingRequest.participantEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeParticipant(email)}
                    >
                      {email} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSchedule}
                disabled={isScheduling || !meetingRequest.title || meetingRequest.participantEmails.length === 0}
                className="w-full"
              >
                {isScheduling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI Agents Negotiating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Sidebar - Notifications and Calendar */}
          <div className="lg:col-span-2 space-y-6">
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onClearAll={clearAllNotifications}
            />

            <CalendarManager events={calendarEvents} onEventsChange={fetchCalendarEvents} />
          </div>
        </div>

        {/* AI Negotiation Messages */}
        {(negotiations.length > 0 || isScheduling) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Agent Negotiations
              </CardTitle>
              <CardDescription>Watch AI agents negotiate in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {negotiations.map((message, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {message.agent}
                      </Badge>
                      <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                      {message.action && (
                        <Badge variant="secondary" className="text-xs">
                          {message.action}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}

                {isScheduling && negotiations.length === 0 && (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Initializing AI agents...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.result?.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Scheduling Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.result?.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Meeting Scheduled Successfully!</h3>
                    {result.result.scheduledSlot && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Date & Time:</strong> {new Date(result.result.scheduledSlot.start).toLocaleString()}
                        </div>
                        <div>
                          <strong>Duration:</strong> {meetingRequest.duration} minutes
                        </div>
                        <div>
                          <strong>Participants:</strong> {meetingRequest.participantEmails.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>

                  {result.result.rescheduledEvents && result.result.rescheduledEvents.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">🔄 Meetings Rescheduled by AI:</h4>
                      <div className="space-y-2">
                        {result.result.rescheduledEvents.map((meeting, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                            <strong>{meeting.title}</strong> moved from {meeting.originalTime} to {meeting.newTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">📧 Confirmation Emails Sent</h4>
                    <p className="text-sm text-gray-600">
                      Calendar invites with .ics files have been automatically sent to all participants. They can add
                      the meeting directly to Google Calendar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Scheduling Failed</h3>
                  <p className="text-red-700">{result.result?.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
