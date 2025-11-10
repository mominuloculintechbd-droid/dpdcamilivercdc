# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application for querying an Oracle 19c database and displaying reports. The application uses a monolithic architecture with a Node.js/Express backend API and a React frontend SPA.

**Database Connection:**
- Oracle 19c database
- Connection details in `src/config/db.js`
- Credentials stored in `.env.local` file (not tracked by git)
- Environment variables: `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING`
- Uses `dotenv` package to load environment variables
- Host: c2m-dr-scan:1521/c2mprddr2.dpdc.org.bd
- User: cisread (read-only access)
- **IMPORTANT:** Password contains special characters and must be quoted in `.env.local` file (e.g., `DB_PASSWORD="cisread#2022"`)

## Architecture

### Backend Structure (Node.js + Express)

**Entry Points:**
- `src/server.js` - Server initialization and port configuration (default: 3001)
- `src/app.js` - Express app setup, middleware, and route mounting

**Core Modules:**
- `src/config/db.js` - Oracle database connection handler with `execute()` method
  - Creates a new connection per query (no connection pooling)
  - Returns results in object format (column names as keys)
  - Handles connection cleanup in finally blocks
- `src/api/reports.js` - RESTful API router for reports
  - Route pattern: `GET /api/reports/:reportName`
  - Reads SQL files from `reports/` directory
  - Executes queries and returns JSON

**SQL Reports:**
- Stored as individual `.sql` files in `reports/` directory
- 50+ predefined reports covering billing, meters, customers, and connectivity
- Report naming convention: snake_case (e.g., `active_customers_at_date.sql`)

### Frontend Structure (React)

**Key Files:**
- `client/src/App.js` - Main component with routing and navigation sidebar
  - Hardcoded list of all available reports
  - Uses React Router for navigation
  - Two-column layout: sidebar navigation + report content area
- `client/src/pages/ReportPage.js` - Dynamic report page component
  - Fetches report data from backend API via axios
  - Passes data to Report component for rendering
- `client/src/components/Report.js` - Generic report renderer
  - Displays data in tabular format
  - Includes client-side filtering capability
  - Uses custom table components imported from `@/components/ui/table`

**Path Aliases:**
- `@/components/*` → `client/src/components/*`
- `@/lib/utils` → `client/src/lib/utils`
- Configured in `client/jsconfig.json`

**Styling:**
- Tailwind CSS v3.x configured with PostCSS
- Configuration in `client/tailwind.config.js` and `client/postcss.config.js`
- Custom table components implemented in `client/src/components/ui/table.js`

## Development Commands

### Backend

**Install dependencies:**
```bash
npm install
```

**Run backend server:**
```bash
# Database credentials are loaded from .env.local automatically
node src/server.js
```

The server will automatically load environment variables from `.env.local` including:
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_CONNECT_STRING` - Full Oracle connection string
- `PORT` - Server port (default: 3001)

**Run in background (PowerShell):**
```powershell
Start-Process -FilePath "node" -ArgumentList "src/server.js" -RedirectStandardOutput "backend_stdout.log" -RedirectStandardError "backend_stderr.log" -NoNewWindow
```

### Frontend

**Navigate to client directory:**
```bash
cd client
```

**Install dependencies:**
```bash
npm install
```

**Run development server:**
```bash
npm start
```
Opens browser to http://localhost:3000

**Build for production:**
```bash
npm run build
```
Creates optimized build in `client/build/` directory

**Run tests:**
```bash
npm test
```
Launches Jest test runner in watch mode

**Run frontend in background (PowerShell):**
```powershell
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -WorkingDirectory "client" -RedirectStandardOutput "../frontend_stdout.log" -RedirectStandardError "../frontend_stderr.log" -NoNewWindow
```

## Key Patterns and Conventions

### Adding a New Report

1. Create SQL file in `reports/` directory with snake_case name
2. Add report name to the `reports` array in `client/src/App.js`
3. No backend code changes needed (dynamic routing handles it)

### API Communication

- Backend listens on port 3001
- Frontend makes requests to `http://localhost:3001/api/reports/:reportName`
- Hardcoded API URL in `client/src/pages/ReportPage.js:14`

### Database Query Execution

All queries go through `src/config/db.js` `execute()` function:
- Accepts SQL string and optional bind parameters
- Automatically trims whitespace from SQL
- Returns array of objects (column names as keys)
- Creates new connection per query (not pooled)
- Always closes connection in finally block

### Error Handling

- 404 responses for missing SQL files
- 500 responses for query execution errors
- Frontend displays error messages via error state
- Backend logs errors to console

## File Organization

```
sqlai/
├── src/                    # Backend source
│   ├── api/               # Express route handlers
│   ├── config/            # Database and configuration
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── reports/               # SQL query files (50+ reports)
├── client/                # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions
│   │   └── App.js        # Main app component
│   └── package.json      # Frontend dependencies
├── dbschema/             # Database schema documentation
│   └── schema.txt        # Schema definitions (2MB+)
├── package.json          # Backend dependencies
├── GEMINI.md            # Project context for Gemini AI
└── PLAN.md              # Original implementation plan
```

## Important Notes

- Git repository initialized with comprehensive .gitignore
- Database credentials stored in `.env.local` (safely excluded from git)
- `.env.local` contains Oracle database connection details - never commit this file
- **Passwords with special characters (like `#`) must be quoted in `.env.local`**
- Frontend expects specific column names from database queries
- All 50+ report names must be manually added to frontend `reports` array
- Custom UI component library implemented in `client/src/components/ui/`
- Backend uses Express 5.x (latest major version)
- Frontend uses React 19.x (latest major version)
- Tailwind CSS v3.x for styling (downgraded from v4 for Create React App compatibility)
