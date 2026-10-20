# Team Task Manager

A full-stack web application for managing teams and tasks, built with React, Node.js, Express.js, and PostgreSQL. The application provides secure authentication, team management, task tracking, and a responsive dashboard.

## Features

- User registration and login
- Session-based authentication using Passport.js
- Password hashing with bcrypt
- Create, view, update, and delete teams
- Create, view, update, and delete tasks
- Task status management: Pending, In Progress, and Completed
- Search and filter tasks
- Assign tasks to team members
- Team membership management
- REST API with input validation using Joi
- PostgreSQL database integration
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
- bcrypt

### Database
- PostgreSQL
- `connect-pg-simple` for PostgreSQL-backed sessions

### Development Tools
- Git and GitHub
- Visual Studio Code
- npm

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
└── README.md
```

## Prerequisites

Before running the project, install:

- Node.js and npm
- PostgreSQL
- Git

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/khurramnaeem128/team-task-manager.git
cd team-task-manager
```

### 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Add your own local PostgreSQL credentials and session secret:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=team_task_manager
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
SESSION_SECRET=your_long_random_secret
```

Replace the example values with your actual local configuration. Never commit `.env` files, database passwords, or production secrets to GitHub.

### 4. Set Up the Database

Create a PostgreSQL database named `team_task_manager`.

Apply the project's database schema to create the required tables for users, teams, team memberships, and tasks.

Ensure PostgreSQL is running and that the credentials in `backend/.env` are correct.

### 5. Start the Backend

Open a terminal in the project directory:

```bash
cd backend
node server.js
```

The backend normally runs at:

`http://localhost:5000`

### 6. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Open the local frontend URL displayed in the terminal, normally:

`http://localhost:5173`

## API Overview

| Route | Purpose |
|---|---|
| `/auth` | Registration, login, session information, and logout |
| `/teams` | Team creation, retrieval, updating, and deletion |
| `/tasks` | Task creation, retrieval, updating, and deletion |

Protected endpoints require an authenticated session. Request validation and team membership checks are used where implemented.

## Security

- Passwords are hashed using bcrypt.
- Passport.js manages authentication.
- Express Session maintains authenticated sessions.
- PostgreSQL stores session data.
- HTTP-only cookies help protect session cookies from client-side JavaScript access.
- Joi validates task request data.
- Authentication middleware protects restricted endpoints.
- Environment variables keep local credentials out of source code.

Production deployment requires appropriate HTTPS cookie settings, a strong session secret, and secure database credentials.

## Git Workflow

The project uses Git for version control and GitHub for source-code hosting.

- `main` is the primary branch.
- Feature and documentation changes can be developed on separate branches.
- Changes can be reviewed through Pull Requests before merging into `main`.

## Project Status

- Frontend and backend implemented.
- PostgreSQL configured for local development.
- Core authentication, team, and task functionality tested locally.
- GitHub repository created and source code uploaded.
- Google Cloud deployment and final live testing are pending.

## Future Improvements

- Deploy the application and database to Google Cloud.
- Add role-based permissions for team owners and members.
- Add email invitations and task reminders.
- Improve automated testing and error handling.

## Author

**Khurram Naeem**

- GitHub: [khurramnaeem128](https://github.com/khurramnaeem128)
- Repository: [Team Task Manager](https://github.com/khurramnaeem128/team-task-manager)
