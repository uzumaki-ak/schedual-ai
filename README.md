




sample <img width="1476" height="892" alt="image" src="https://github.com/user-attachments/assets/bd0da545-04cf-4bf3-bede-59cffe15e829" />
<img width="1893" height="836" alt="image" src="https://github.com/user-attachments/assets/bf932ef1-71ef-47ae-a7da-3c1d320d892b" />
<img width="1843" height="357" alt="image" src="https://github.com/user-attachments/assets/137c0f8e-afe5-4206-9457-ac1490c0758b" />


# SchedulAI 🤖📅

**Your Autonomous Meeting Coordinator**

SchedulAI is an intelligent meeting scheduling platform that uses multiple AI agents to negotiate and find the perfect time for everyone. Instead of the traditional back-and-forth emails, our AI agents communicate with each other in real-time to automatically schedule meetings, reschedule conflicts, and send calendar invites.

## ✨ Features

### 🤖 Multi-Agent AI Negotiation
- **3-4 AI agents** work together to find optimal meeting times
- **Real-time negotiation** visible to users
- **Intelligent conflict resolution** with automatic rescheduling
- **Priority-based scheduling** (Low, Medium, High, Urgent)

### 📅 Smart Calendar Management
- **Automatic calendar integration** 
- **Conflict detection and resolution**
- **Intelligent rescheduling** of existing meetings when necessary
- **Cross-timezone support** with automatic detection

### 📧 Automated Communication
- **Automatic email invitations** with .ics calendar files
- **Real-time notifications** for scheduling updates
- **Participant management** with email validation
- **Meeting confirmation system**

### 🎯 User Experience
- **Live negotiation feed** - watch AI agents work in real-time
- **Smart notifications panel** with meeting details
- **Responsive design** for desktop and mobile
- **One-click meeting creation**

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icon library

### Backend & API
- **Next.js API Routes** - Server-side API endpoints
- **RESTful Architecture** - Clean API design
- **Calendar API Integration** - Google Calendar, Outlook, etc.
- **Email Service Integration** - Automated email sending

### Authentication & Security
- **Custom Auth Provider** - Secure user authentication
- **JWT/Session Management** - Secure session handling
- **Email Verification** - Account security

### AI & Intelligence
- **Multi-Agent System** - Cooperative AI agents
- **Natural Language Processing** - Understanding meeting requirements
- **Conflict Resolution Algorithm** - Smart scheduling decisions
- **Priority-based Logic** - Intelligent meeting prioritization

### State Management
- **React Hooks** - useState, useEffect for local state
- **Custom Providers** - Auth and notification contexts
- **Real-time Updates** - Live negotiation feeds

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm
- Email service API key (SendGrid, Resend, etc.)
- Calendar API credentials (Google Calendar, Outlook)

### Installation







5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### 1. Meeting Request Creation
Users create a meeting request with:
- **Title & Description** - Meeting details
- **Duration** - 15 minutes to 2 hours
- **Priority Level** - Low, Medium, High, Urgent
- **Participants** - Email addresses of attendees

### 2. AI Agent Negotiation
When you click "Schedule with AI":

1. **Agent Initialization** - 3-4 AI agents are spawned
2. **Calendar Analysis** - Each agent analyzes participant calendars
3. **Conflict Detection** - Identifies scheduling conflicts
4. **Negotiation Phase** - Agents communicate to find optimal slots
5. **Resolution** - Agreement on best time slot
6. **Execution** - Meeting scheduled and invites sent

### 3. Real-time Feedback
- **Live negotiation feed** shows agent communications
- **Progress indicators** for each negotiation phase
- **Smart notifications** for scheduling updates
- **Automatic calendar updates**

### 4. Meeting Confirmation
- **Email invites** sent automatically with .ics files
- **Calendar integration** for all participants
- **Rescheduling notifications** if conflicts were resolved
- **Meeting reminders** (future feature)

## 📱 Usage Examples

### Basic Meeting Scheduling
```typescript
const meetingRequest = {
  title: "Project Sync Meeting",
  description: "Weekly team sync to discuss project progress",
  duration: 60, // minutes
  priority: "medium",
  participantEmails: [
    "john@company.com",
    "sarah@company.com",
    "mike@company.com"
  ]
}
```

### High Priority Urgent Meeting
```typescript
const urgentMeeting = {
  title: "Emergency Bug Fix Discussion",
  description: "Critical production issue needs immediate attention",
  duration: 30,
  priority: "urgent", // Will override lower priority meetings
  participantEmails: ["devteam@company.com", "manager@company.com"]
}
```

## 🔧 API Endpoints

### Meeting Scheduling
```
POST /api/meetings/schedule
- Schedules a new meeting using AI agents
- Body: MeetingRequest object
- Returns: SchedulingResult with negotiation details
```

### Calendar Management
```
GET /api/calendar/events
- Retrieves user's calendar events
- Returns: Array of calendar events

POST /api/calendar/events
- Adds new event to calendar
- Body: Event details
- Returns: Created event
```

### Authentication
```
POST /api/auth/signin
- User authentication
- Body: Credentials
- Returns: User session

POST /api/auth/signout
- User logout
- Clears session
```

## 🎨 UI Components

### Core Components
- **SchedulAI** - Main application component
- **CalendarManager** - Calendar event management
- **NotificationSystem** - Real-time notifications
- **AuthProvider** - Authentication wrapper

### UI Elements
- **Meeting Form** - Create meeting requests
- **Negotiation Feed** - Live AI agent communications
- **Results Panel** - Scheduling outcomes
- **Participant Management** - Add/remove attendees

## 🚧 Future Enhancements

### 🤖 AI Improvements
- **Machine Learning** - Learn from scheduling patterns
- **Natural Language** - Voice-based meeting requests
- **Predictive Scheduling** - Suggest optimal meeting times
- **Smart Conflicts** - Better conflict resolution algorithms

### 📅 Calendar Features
- **Multi-Calendar Support** - Google, Outlook, Apple Calendar
- **Recurring Meetings** - Schedule repeating meetings
- **Meeting Templates** - Pre-configured meeting types
- **Availability Sharing** - Public availability calendars

### 🌐 Integrations
- **Zoom/Teams Integration** - Automatic video call links
- **Slack/Discord Bots** - Schedule meetings from chat
- **CRM Integration** - Salesforce, HubSpot connections
- **Mobile Apps** - iOS and Android applications

### 📊 Analytics
- **Meeting Analytics** - Success rates, conflicts resolved
- **Team Insights** - Meeting patterns and productivity
- **AI Performance** - Agent negotiation effectiveness
- **Usage Statistics** - Platform utilization metrics

## 🤝 Contributing

We welcome contributions!
### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development** - React/Next.js interface
- **Backend Development** - API and AI agent systems
- **AI Engineering** - Multi-agent negotiation algorithms
- **UI/UX Design** - User experience and interface design


## 🎉 Acknowledgments

- Thanks to all contributors who helped build this project
- Inspired by the need for intelligent meeting coordination
- Built with modern web technologies and AI innovation

---

**Made with ❤️ by the SchedulAI Team**

*"Because scheduling meetings shouldn't be harder than the meeting itself."*
