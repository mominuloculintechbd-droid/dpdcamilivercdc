# Vue.js RC/DC Analytics Dashboard

A modern Material Design web application built with Vue.js 3 and Vuetify 3 for displaying RC/DC (Remote Connect/Disconnect) analytics data.

## Features

- **Material Design UI** - Built with Vuetify 3 for a modern, polished interface
- **Real-time Data** - Fetches data from the backend API (Oracle 19c database)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Statistics Dashboard** - Displays comprehensive RC/DC command statistics:
  - Total commands
  - Remote Connect (RC) success and in-progress counts
  - Remote Disconnect (DC) success, in-progress, and failed counts
  - Success rate calculations
  - NOCS-wise breakdown in a data table

## Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Lightning-fast build tool
- **Vuetify 3** - Material Design component framework
- **TypeScript** - Type-safe development
- **Axios** - HTTP client for API calls
- **Vue Router** - Client-side routing
- **Pinia** - State management (ready to use)

## Prerequisites

- Node.js (v18 or higher)
- Backend server running on `http://localhost:3001`

## Installation

1. Navigate to the client-vue directory:
   ```bash
   cd client-vue
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at **http://localhost:8080**

The dev server includes:
- Hot Module Replacement (HMR)
- Vue DevTools integration
- Fast refresh on code changes

### Build for Production

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
client-vue/
├── src/
│   ├── assets/          # Static assets (images, styles)
│   ├── components/      # Reusable Vue components
│   ├── plugins/         # Plugin configurations
│   │   └── vuetify.ts   # Vuetify setup and theme
│   ├── router/          # Vue Router configuration
│   │   └── index.ts     # Route definitions
│   ├── services/        # API service layer
│   │   └── api.ts       # Backend API calls
│   ├── stores/          # Pinia state management
│   ├── views/           # Page components
│   │   └── RCDCDashboard.vue  # Main dashboard
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Public static files
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## API Configuration

The application connects to the backend API at `http://localhost:3001/api`

To change the API endpoint, edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3001/api'
```

## Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Dashboard Features

### Statistics Cards
- **Total Commands** - Overall command count for the day
- **RC Success** - Completed remote connect commands
- **RC In Progress** - Remote connect commands in progress
- **DC Success** - Completed remote disconnect commands
- **DC In Progress** - Remote disconnect commands in progress
- **DC Failed** - Failed or discarded disconnect commands

### Summary Section
- RC Success Rate (percentage)
- DC Success Rate (percentage)
- Total RC Commands
- Total DC Commands

### NOCS-wise Breakdown Table
Interactive data table showing statistics grouped by NOCS (Network Operations Center Station):
- Sortable columns
- Pagination
- Color-coded status chips
- Success percentages

### Features
- **Auto-refresh** - Click the refresh button to update data
- **Error Handling** - Clear error messages for connection issues
- **Loading States** - Visual feedback during data fetching
- **Responsive Layout** - Adapts to different screen sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The app uses Vue 3 Composition API with `<script setup>` syntax
- TypeScript is configured for type safety
- Vuetify 3 provides Material Design components
- Vite offers fast hot reload during development

## Troubleshooting

### Port Already in Use
If port 8080 is already in use, you can change it in `vite.config.ts`:
```typescript
server: {
  port: 8081, // Change to any available port
  open: true,
}
```

### Backend Connection Issues
Ensure the backend server is running on `http://localhost:3001` and is accessible. Check:
1. Backend server is running: `node src/server.js`
2. VPN connection is active (if required)
3. Database credentials are configured in `.env.local`

### CORS Issues
If you encounter CORS errors, ensure the backend Express server has CORS enabled for `http://localhost:8080`
