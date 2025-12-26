# Product Requirements Document (PRD)

**Product Name:** TechNexus AI Quiz Platform  
**Version:** v1.0  
**Prepared For:** TechNexus Community

## 1. Purpose
The purpose of this document is to define the product requirements for the TechNexus AI Quiz Platform — a scalable, real-time quiz system with an AI-powered quiz generator that converts speaker presentations (PPT/PDF) into interactive quizzes. The platform is designed to support 1,000+ concurrent users and enhance engagement during tech events, workshops, and community sessions.

## 2. Problem Statement
*   Event organizers struggle to create quizzes quickly after sessions.
*   Manual quiz creation is time-consuming and error-prone.
*   Audience engagement drops after talks.
*   Existing quiz platforms lack AI-driven content generation tailored for live tech events.

## 3. Goals & Objectives

### Primary Goals
*   Enable admins to generate quizzes instantly from speaker PPTs using AI.
*   Support real-time quizzes for large audiences (1000+ users).
*   Increase engagement during TechNexus community events.

### Success Metrics
*   Quiz generation time < 2 minutes
*   Support 1000+ concurrent participants
*   90% quiz completion rate during events
*   Admin quiz creation time reduced by 80%

## 4. Target Users

### 4.1 Admin / Organizer
*   TechNexus team members
*   Event coordinators

### 4.2 Participants
*   Students
*   Developers
*   Tech professionals attending events

## 5. User Stories

### Admin
*   As an admin, I want to upload a PPT and automatically generate quiz questions.
*   As an admin, I want to review and edit AI-generated questions.
*   As an admin, I want to host a live quiz and see participant count in real time.
*   As an admin, I want to download quiz results after the event.

### Participant
*   As a participant, I want to join a quiz using a code or QR.
*   As a participant, I want to answer timed questions smoothly.
*   As a participant, I want to see my score and rank instantly.

## 6. Features & Requirements

### 6.1 Authentication
*   Admin login (Email / OAuth)
*   Optional participant login or guest join

### 6.2 Admin Dashboard
*   Create / manage quizzes
*   AI Quiz Generator section
    *   Upload PPT/PDF
    *   Review & edit questions
*   Start / stop live quiz
*   View live participant count
*   Export results (CSV)

### 6.3 AI Quiz Generator
*   Upload PPT/PDF (max 20MB)
*   Extract slide text
*   Generate MCQs using AI
*   Difficulty selection (Easy / Medium / Hard)
*   Select number of questions
*   Editable output

### 6.4 Quiz Engine (Real-Time)
*   Timed questions
*   Auto-submit answers
*   Live leaderboard
*   Socket-based communication

### 6.5 Participant Experience
*   Join via quiz code / QR
*   Responsive UI
*   Countdown timer
*   Result & rank screen

## 7. Non-Functional Requirements

### Performance
*   Support 1000–5000 concurrent users
*   Question load time < 1 second

### Scalability
*   Stateless backend
*   Horizontal scaling supported

### Security
*   JWT-based authentication
*   Input validation
*   HTTPS enforced

### Reliability
*   Auto-reconnect for dropped users
*   Graceful handling of network issues

## 8. Technical Architecture (High-Level)

### Frontend
*   React.js / Next.js
*   Tailwind CSS
*   WebSockets

### Backend
*   Supabase (Auth, Database, Storage)
*   Supabase Edge Functions (API logic)
*   Node.js Realtime Service (Socket.IO)

### AI Service
*   Python (FastAPI)
*   PPT parsing libraries
*   LLM-based question generation

### Database
*   Supabase PostgreSQL
*   Redis (optional)

### Deployment
*   Supabase Cloud
*   AWS / Render (Realtime + AI)
*   Cloudflare CDN

## 9. Data Model (High-Level)
*   Users
*   Quizzes
*   Questions
*   Submissions
*   Uploaded Files
*   AI Generated Content

## 10. Assumptions
*   Internet connectivity at event venues
*   Speakers provide PPTs before or after sessions
*   Admins review AI-generated questions before publishing

## 11. Risks & Mitigation
*   **Risk:** AI generates incorrect questions -> **Mitigation:** Mandatory admin review
*   **Risk:** High traffic spike -> **Mitigation:** Auto-scaling backend
*   **Risk:** Network drop during quiz -> **Mitigation:** Auto-save responses

## 12. Future Enhancements
*   Certificate generation
*   AI analytics dashboard
*   Multi-language support
*   Mobile app
*   Organization-level accounts
