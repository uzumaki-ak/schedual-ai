"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Trash2, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  priority: string
  canReschedule: boolean
}

interface CalendarManagerProps {
  events: CalendarEvent[]
  onEventsChange: () => void
}

export function CalendarManager({ events, onEventsChange }: CalendarManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    priority: "medium",
    canReschedule: true,
  })

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      return
    }

    try {
      const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`)
      const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`)

      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          priority: newEvent.priority,
          canReschedule: newEvent.canReschedule,
        }),
      })

      if (response.ok) {
        setNewEvent({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          priority: "medium",
          canReschedule: true,
        })
        setIsOpen(false)
        onEventsChange()
      }
    } catch (error) {
      console.error("Failed to add event:", error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onEventsChange()
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  // Get today's date for the date input minimum
  const today = new Date().toISOString().split("T")[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Calendar
            </CardTitle>
            <CardDescription>Manage your availability for AI scheduling</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
                <DialogDescription>Add events to your calendar so AI agents know when you're busy</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Event Title *</Label>
                  <Input
                    id="event-title"
                    placeholder="e.g., Team Meeting"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    placeholder="Optional description..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="event-date">Date *</Label>
                  <Input
                    id="event-date"
                    type="date"
                    min={today}
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time *</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newEvent.priority}
                      onValueChange={(value) => setNewEvent((prev) => ({ ...prev, priority: value }))}
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
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="can-reschedule"
                      checked={newEvent.canReschedule}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, canReschedule: e.target.checked }))}
                    />
                    <Label htmlFor="can-reschedule" className="text-sm">
                      Can be rescheduled
                    </Label>
                  </div>
                </div>

                <Button onClick={handleAddEvent} className="w-full">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No events scheduled</p>
              <p className="text-sm">Add events to help AI agents understand your availability</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    {event.description && <div className="text-sm text-gray-600 mt-1">{event.description}</div>}
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={event.priority === "HIGH" || event.priority === "URGENT" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {event.priority}
                      </Badge>
                      {event.canReschedule && (
                        <Badge variant="outline" className="text-xs">
                          Reschedulable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
// This component allows users to manage their calendar events, including adding and deleting events.
// It uses a dialog for adding new events and displays a list of existing events with options to