# Implementation Plan

This document outlines the plan for building the SQL AI web application.

## 1. Backend (Node.js with Express.js)

### 1.1. Project Structure

I will create the following directory structure for the backend:

```
/
|-- reports/
|   |-- *.sql
|-- src/
|   |-- api/
|   |   |-- reports.js
|   |-- config/
|   |   |-- db.js
|   |-- app.js
|   |-- server.js
|-- package.json
|-- GEMINI.md
|-- PLAN.md
```

### 1.2. Database Connection

- The `src/config/db.js` file will handle the Oracle database connection using the `oracledb` package.
- It will use the connection details from `GEMINI.md` and manage a connection pool for efficiency.
- The password will be loaded from an environment variable `DB_PASSWORD`.

### 1.3. API Endpoints

- The `src/api/reports.js` file will define the Express routes for each report.
- Each route will correspond to a `.sql` file in the `reports` directory.
- For each report, the backend will:
    1. Read the corresponding `.sql` file.
    2. Execute the query against the Oracle database.
    3. Return the query result as a JSON response.
- I will create a generic function to handle reading the SQL file and executing the query to avoid code duplication.

### 1.4. Server Setup

- `src/app.js` will initialize the Express application, set up middleware (like `cors` and `json`), and mount the report routes.
- `src/server.js` will start the Express server and listen on a configured port (e.g., 3001).

## 2. Frontend (React)

### 2.1. Project Setup

- I will use `create-react-app` to bootstrap the React application in a `client` subdirectory.
- I will install `recharts` for charting and `axios` for making API requests.

### 2.2. Project Structure

The `client` directory will have the following structure:

```
client/
|-- public/
|-- src/
|   |-- components/
|   |   |-- charts/
|   |   |   |-- BarChart.js
|   |   |   |-- LineChart.js
|   |   |   |-- PieChart.js
|   |   |-- Report.js
|   |-- pages/
|   |   |-- ReportPage.js
|   |-- App.js
|   |-- index.js
|-- package.json
```

### 2.3. Frontend Implementation

- **`App.js`:** This will be the main component, handling routing between different report pages.
- **`pages/ReportPage.js`:** A generic page component that takes a report name as a prop. It will:
    1. Use the report name to make an API call to the backend to fetch the report data.
    2. Pass the fetched data to the `components/Report.js` component.
- **`components/Report.js`:** This component will be responsible for rendering the report. It will:
    1. Take the report data as a prop.
    2. Determine the appropriate chart type based on the data (or use a default).
    3. Use the corresponding chart component from `components/charts/` to render the visualization.
    4. For tabular data, it will render a simple HTML table.
- **`components/charts/`:** Reusable chart components built with `recharts`.

## 3. Implementation Steps

1.  **Backend Setup:**
    - Create the backend directory structure.
    - Implement the database connection module (`db.js`).
    - Create the Express server setup (`app.js`, `server.js`).
    - Implement the generic report endpoint logic.
    - Create a route for each report in `reports.js`.

2.  **Frontend Setup:**
    - Create the React application using `create-react-app`.
    - Install `recharts` and `axios`.
    - Create the frontend directory structure.

3.  **Report Implementation (Iterative):**
    - For each report:
        1. Create a new route in the backend.
        2. Create a new page in the frontend.
        3. Implement the data fetching and visualization.

4.  **Styling and UI:**
    - I will use a simple and clean UI with a sidebar for navigating between reports.
    - I will use a component library like Material-UI or Ant Design for a consistent look and feel.

This plan provides a clear path forward for building the application. I will start with the backend setup in the next step.
