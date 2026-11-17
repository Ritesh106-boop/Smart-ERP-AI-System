# SmartERP AI - Intelligent Academic Operating System

SmartERP AI is a full-stack, role-based academic ERP system designed for Students, Faculty, and Administrators. It features real-time attendance tracking with smart insights, grade management, assignment submissions, fee management, and announcements.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Auth**: JWT (JSON Web Tokens) + bcrypt

## Prerequisites
- Node.js (v18 or higher)
- MySQL Server (via XAMPP or standalone)

## Setup Instructions

### 1. Database Setup
1. Start your MySQL database (e.g., via XAMPP Control Panel).
2. Open your MySQL client or phpMyAdmin.
3. Create the database: `CREATE DATABASE smarterp;`

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` folder and add your database config:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=####
   DB_PASSWORD=####
   DB_NAME=smarterp
   JWT_SECRET=####
   ```
4. Run the database migration and seeding script:
   ```bash
   node run-migration.js
   ```
5. Fix the demo passwords:
   ```bash
   node fix-passwords.js
   ```
6. Start the server:
   ```bash
   node src/server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the app at `http://localhost:5173`

## Demo Accounts
*(Password for all demo accounts is **password123**)*
- **Student**: alice@smarterp.com
- **Faculty**: prof.kumar@smarterp.com
- **Admin**: admin@smarterp.com

## Features by Role
- **Student**: Dashboard, Attendance Insights, View Marks, Submit Assignments, Download Materials.
- **Faculty**: Mark Attendance, Enter Marks, Create Assignments, Upload Materials.
- **Admin**: System Analytics, Manage Students, Manage Subjects, Collect Fees, Broadcast Announcements.
