# Team Task Manager

A full-stack web application for managing teams and tasks, built with React, Node.js, Express.js, and PostgreSQL. The application provides authentication, team management, task tracking, and a responsive dashboard.

## Live Demo

**Live Application:** https://team-task-manager-one-lac.vercel.app

## Features

- User registration and login
- Session-based authentication using Passport.js
- Password hashing using bcryptjs
- Create, view, update, and delete teams
- Create, view, update, and delete tasks
- Task status management: Pending, In Progress, and Completed
- Search and filter tasks
- Assign tasks to team members
- Team membership management
- REST API with input validation using Joi
- PostgreSQL database integration
- PostgreSQL-backed session storage
- HTTP-only session cookies
- Responsive interface for desktop and mobile devices

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- Passport.js
- Express Session
- Joi validation
- bcryptjs

### Database
- PostgreSQL
- Neon PostgreSQL
- connect-pg-simple for PostgreSQL-backed sessions

### Development and Deployment
- Git and GitHub
- Visual Studio Code
- npm
- Vercel

## Project Structure

```text
team-task-manager/
├── backend/
│   ├── auth.js
│   ├── authMiddleware.js
│   ├── db.js
│   ├── passport.js
│   ├── server.js
│   ├── tasks.js
│   ├── teams.js
│   ├── validators.js
│   ├── schema.sql
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

## Prerequisites

Before running the project locally, install:

- Node.js and npm
- PostgreSQL or a Neon PostgreSQL database
- Git

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/khurramnaeem128/team-task-manager.git
cd team-task-manager
```

### 2. Install Dependencies

Install the backend dependencies:

```bash
npm install --prefix backend
```

Install the frontend dependencies:

```bash
npm install --prefix frontend
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Configure your local database connection and session secret:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_long_random_secret
NODE_ENV=development
```

Replace the example values with your own configuration. Never commit `.env` files, database passwords, or production secrets to GitHub.

### 4. Set Up the Database

The database schema is provided in `backend/schema.sql`.

Create or select a PostgreSQL database, configure `DATABASE_URL`, and execute the schema against that database. Ensure the required tables are created before running the application.

### 5. Start
