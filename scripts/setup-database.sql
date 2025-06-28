-- Create database tables
-- Run this with: npx prisma db push

-- This will create all tables based on schema.prisma
-- Make sure your DATABASE_URL is set in .env.local

-- Example data for testing
-- You can run this after the tables are created

-- Insert test users
-- INSERT INTO users (id, email, name, "timeZone", "createdAt", "updatedAt") 
-- VALUES 
--   ('user1', 'test@example.com', 'Test User', 'UTC', NOW(), NOW()),
--   ('user2', 'alice@example.com', 'Alice Smith', 'EST', NOW(), NOW());

-- Insert test calendar events
-- INSERT INTO calendar_events (id, title, description, "startTime", "endTime", priority, "canReschedule", "userId", "createdAt", "updatedAt")
-- VALUES 
--   ('event1', 'Morning Standup', 'Daily team standup', '2024-01-15 09:00:00', '2024-01-15 09:30:00', 'HIGH', false, 'user1', NOW(), NOW()),
--   ('event2', 'Client Call', 'Important client meeting', '2024-01-15 14:00:00', '2024-01-15 15:00:00', 'HIGH', false, 'user1', NOW(), NOW());
