# CampusConnect — College Management Portal (Frontend Demo)

A responsive HTML/CSS/JavaScript prototype for a college portal with:
- Animated landing screen
- Student registration and sign-in demo
- Demo admin and faculty sign-in
- Dashboard and profile card
- Attendance calculations and status bands
- Exam marks and schedules
- Class timetable
- Fee summary
- Transport details
- Faculty feedback form
- Semester-wise subjects/labs
- Management overview
- Local browser storage for demo data

## Run it
1. Extract the ZIP.
2. Open `index.html` in Chrome, or open the folder in Visual Studio Code and use the Live Server extension.
3. Press **Enter portal** to open the sign-in screen.

## Demo credentials
All passwords below are sample-only. Do not reuse them.

| Role | ID / roll number | Password |
|---|---|---|
| Student | `23CSE001` | `Student@123` |
| Student | `23ECE014` | `Student@123` |
| Admin | `ADMIN001` | `Admin@123` |
| Faculty | `FAC001` | `Faculty@123` |

## Important limitations
This is a learning prototype, not a production college information system:
- Authentication is simulated in browser JavaScript.
- Passwords and records are stored in browser `localStorage` and are not secure.
- A student can potentially inspect or alter local data; do not put real student data or real passwords in this demo.
- Newly registered students are created locally in this browser only.
- The demo does not process fee payments or generate official receipts.
- Timetable, marks, fee, bus and curriculum data are illustrative examples.
- The attendance labels follow the requested sample thresholds and are not a legal/official detention decision.

## Before real deployment
Use a backend and a proper database. Firebase Authentication or a server-side authentication system can manage identities, but access rules must be designed and tested. Enforce roles and student-record ownership on the server/database, validate inputs, protect sensitive data, use HTTPS, enable backups, and create an audit trail. Only authorized college management should approve official attendance, marks, fees, timetables and curriculum data.
