# Team Task Manager

A full-stack web application for managing teams and tasks, built with React, Node.js, Express, and PostgreSQL.

## Features

- User registration and login
- Session-based authentication using Passport.js
- Secure password hashing with bcrypt
- Create, view, update, and delete teams
- Create, edit, and delete tasks
- Task status management: Pending, In Progress, and Completed
- Search and filter tasks
- Responsive dashboard for desktop and mobile
- REST API with input validation
- PostgreSQL database integration

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- Passport.js
- Express Session
- Joi validation

**Database**
- PostgreSQL

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
│   └── validators.js
├── frontend/
│   └── src/
├── .gitignore
├── package.json
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/khurramnaeem128/team-task-manager.git
cd team-task-manager
```

### 2. Install dependencies

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` folder and configure your PostgreSQL connection and session secret.

Required variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=team_task_manager
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
SESSION_SECRET=your_long_random_secret
```

Use your own local database credentials. Do not upload `.env` or real passwords to GitHub.

### 4. Set up the database

Create the `team_task_manager` PostgreSQL database and apply the project's database schema.

### 5. Run the application

Start the backend:

```bash
cd backend
