# Gemini Project Context (`GEMINI.md`)

This file provides essential context for the Gemini AI assistant to understand and effectively assist with this project.

---

## Project Type

This is a **Code Project**.

---

### **Code Project**

**Project Overview:**

*   **Purpose:** To build a web application that can query an Oracle 19c database and generate reports.
*   **Technologies:** 
    *   **Backend:** Node.js with Express.js
    *   **Frontend:** React
    *   **Database:** Oracle 19c
    *   **User Name:** cisread
    *   **Host Name:** c2m-dr-scan
    *   **Port:** 1521
    *   **Service Name:** c2mprddr2.dpdc.org.bd
    *   **Password:** (Handle securely, e.g., via environment variables)
    *   **Reporting Library:** Recharts
*   **Architecture:** Monolithic (Backend API + Frontend SPA)

**Project Structure:**

```
sqlai/
|-- client/                 # Frontend React application
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- charts/
|   |   |   |-- Report.js
|   |   |-- pages/
|   |   |   |-- ReportPage.js
|   |   |-- App.js
|   |   |-- index.js
|   |-- package.json
|-- dbschema/               # Database schema details
|   |-- schema.txt
|-- reports/                # SQL queries for reports
|   |-- *.sql
|-- src/                    # Backend Node.js application
|   |-- api/
|   |   |-- reports.js
|   |-- config/
|   |   |-- db.js
|   |-- app.js
|   |-- server.js
|-- package.json            # Backend dependencies
|-- GEMINI.md
|-- PLAN.md
```

**Building and Running:**

*   **Prerequisites:** `npm install` (in both root and `client` directories)
*   **Running the Application:**
    *   **Backend:** Set `DB_PASSWORD` environment variable, then run `Start-Process -FilePath "node" -ArgumentList "src/server.js" -RedirectStandardOutput "backend_stdout.log" -RedirectStandardError "backend_stderr.log" -NoNewWindow`
    *   **Frontend:** Navigate to `client` directory, then run `Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -WorkingDirectory "client" -RedirectStandardOutput "../frontend_stdout.log" -RedirectStandardError "../frontend_stderr.log" -NoNewWindow`
    *   **Note:** Check `backend_stdout.log`, `backend_stderr.log`, `frontend_stdout.log`, and `frontend_stderr.log` for output and errors.
*   **Running Tests:** (TODO: Provide the command to run tests, e.g., `pytest`)

**Development Conventions:**

*   **Coding Style:** (TODO: Describe any coding style guidelines, e.g., "Follows PEP 8 for Python.")
*   **Branching Strategy:** (TODO: Describe the branching strategy, e.g., "Feature branches are created from `main`.")
*   **Commits:** (TODO: Describe commit message conventions.)

---
*Self-correction: Removed the "Non-Code Project" section as it is not relevant.*