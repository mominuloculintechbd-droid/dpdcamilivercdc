# SQL AI - React Frontend

This is the React frontend for the SQL AI application - a web interface for querying Oracle 19c database and displaying reports.

## Tech Stack

- **React 19.x** - Latest major version
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS v3** - Utility-first CSS framework
- **Custom UI Components** - Table components in `src/components/ui/`

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 3001

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm start
```

Opens the app at [http://localhost:3000](http://localhost:3000)

The page will reload when you make changes.

### Production Build

```bash
npm run build
```

Builds the app for production to the `build/` folder.

### Run Tests

```bash
npm test
```

Launches the test runner in interactive watch mode.

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components (Table, etc.)
│   └── Report.js    # Generic report renderer with filtering
├── pages/           # Page components
│   └── ReportPage.js # Dynamic report page
├── lib/             # Utility functions
│   └── utils.js     # Helper functions (cn for className merging)
├── App.js           # Main app with routing and navigation
├── index.js         # Entry point
└── index.css        # Global styles (Tailwind imports)
```

## Available Reports

Reports are loaded dynamically from the backend. The navigation sidebar lists all 50+ available reports including:

- Billing reports
- Meter readings
- Customer information
- Connectivity status
- And more...

## API Integration

The frontend communicates with the backend API at `http://localhost:3001`:

- **GET** `/api/reports/:reportName` - Fetch report data

## Path Aliases

Path aliases are configured in `jsconfig.json`:

- `@/components/*` → `src/components/*`
- `@/lib/utils` → `src/lib/utils`

## Styling

- **Tailwind CSS v3** for utility-first styling
- Custom component styles in `src/components/ui/`
- PostCSS configuration in `postcss.config.js`
- Tailwind config in `tailwind.config.js`

## Features

- Dynamic report loading from backend
- Client-side data filtering
- Responsive table views
- Clean navigation sidebar
- Error handling and loading states

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
