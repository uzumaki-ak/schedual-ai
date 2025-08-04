"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Calendar, Clock, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Notification {
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
}

interface NotificationSystemProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
}

export function NotificationSystem({ notifications, onMarkAsRead, onClearAll }: NotificationSystemProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsOpen(true)
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const generateCalendarLink = (meeting: Notification["meetingDetails"]) => {
    if (!meeting) return ""

    const startTime = new Date(meeting.scheduledAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const endTime =
      new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z"

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(meeting.description || "")}`
  }

  return (
    <>
      <Card className="relative">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    notification.read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                  } hover:bg-gray-100`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.type === "meeting_scheduled" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {notification.type === "meeting_rescheduled" && <Calendar className="h-4 w-4 text-blue-600" />}
                        {notification.type === "meeting_failed" && <X className="h-4 w-4 text-red-600" />}
                        <span className="font-medium text-sm">{notification.title}</span>
                        {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification?.type === "meeting_scheduled" && <CheckCircle className="h-5 w-5 text-green-600" />}
              {selectedNotification?.type === "meeting_rescheduled" && <Calendar className="h-5 w-5 text-blue-600" />}
              {selectedNotification?.type === "meeting_failed" && <X className="h-5 w-5 text-red-600" />}
              {selectedNotification?.title}
            </DialogTitle>
            <DialogDescription>{new Date(selectedNotification?.timestamp || "").toLocaleString()}</DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <p className="text-gray-700">{selectedNotification.message}</p>

              {selectedNotification.meetingDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Meeting Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Title:</strong> {selectedNotification.meetingDetails.title}
                    </div>
                    <div>
                      <strong>Priority:</strong>
                      <Badge
                        variant={
                          selectedNotification.meetingDetails.priority === "URGENT" ? "destructive" : "secondary"
                        }
                        className="ml-2"
                      >
                        {selectedNotification.meetingDetails.priority}
                      </Badge>
                    </div>
                    <div>
                      <strong>Date & Time:</strong>{" "}
                      {new Date(selectedNotification.meetingDetails.scheduledAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <strong>Duration:</strong> {selectedNotification.meetingDetails.duration} minutes
                    </div>
                    <div className="md:col-span-2">
                      <strong>Participants:</strong> {selectedNotification.meetingDetails.participants.join(", ")}
                    </div>
                    {selectedNotification.meetingDetails.description && (
                      <div className="md:col-span-2">
                        <strong>Description:</strong> {selectedNotification.meetingDetails.description}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => window.open(generateCalendarLink(selectedNotification.meetingDetails), "_blank")}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Add to Google Calendar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const meeting = selectedNotification.meetingDetails!
                        const startTime =
                          new Date(meeting.scheduledAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
                        const endTime =
                          new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000)
                            .toISOString()
                            .replace(/[-:]/g, "")
                            .split(".")[0] + "Z"
                        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(meeting.title)}&startdt=${startTime}&enddt=${endTime}&body=${encodeURIComponent(meeting.description || "")}`
                        window.open(outlookUrl, "_blank")
                      }}
                    >
                      Add to Outlook
                    </Button>
                  </div>
                </div>
              )}

              {selectedNotification.rescheduledEvents && selectedNotification.rescheduledEvents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🔄 Meetings Rescheduled by AI:</h4>
                  <div className="space-y-2">
                    {selectedNotification.rescheduledEvents.map((meeting, index) => (
                      <div key={index} className="bg-white border border-blue-200 rounded p-3 text-sm">
                        <strong>{meeting.title}</strong>
                        <br />
                        <span className="text-gray-600">
                          Moved from {meeting.originalTime} to {meeting.newTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
