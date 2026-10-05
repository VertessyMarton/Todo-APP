# Full-Stack Todo App

A full-stack todo application with user authentication, protected todo routes, and user-scoped CRUD operations. The project includes an Angular frontend, an Express API, Prisma ORM, PostgreSQL, JWT authentication, validation, centralized error handling, and Docker-based local development.

## Live Demo

- Angular frontend: https://todo-app-4kqc.onrender.com
- Express API: https://todo-app-4kqc.onrender.com/api

## Features

- Register and log in with a username and password
- Password hashing with `bcryptjs`
- Short-lived JWT access tokens with rotating refresh tokens stored in an HttpOnly cookie
- Angular route guard for protected pages
- HTTP interceptor that attaches bearer tokens to API requests
- CRUD operations for todo lists, and todos
- Cursor-based pagination with a load-more view
- Lists and todos are scoped to the authenticated user
- Request validation with Zod and API rate limiting
- Prisma-backed PostgreSQL database
- Production-safe API error responses
- Docker Compose setup for local frontend, backend, and database services

## Tech Stack

| Area       | Technology                |
| ---------- | ------------------------- |
| Frontend   | Angular, TypeScript, SCSS |
| Backend    | Node.js, Express          |
| Database   | PostgreSQL                |
| ORM        | Prisma                    |
| Auth       | JWT, bcryptjs             |
| Validation | Zod                       |
| DevOps     | Docker, Docker Compose    |

## Getting Started

### Run With Docker

1. Clone the repository:

```bash
git clone https://github.com/VertessyMarton/Todo-APP
cd Todo-APP
```

2. Create a backend environment file:

```bash
cp backend/.env.example backend/.env
```

3. Start the app:

```bash
docker compose up --build
```

- Frontend: http://localhost:4200
- API: http://localhost:3000/api

## API Endpoints

| Method | Endpoint               | Authentication | Description                                        |
| ------ | ---------------------- | -------------- | -------------------------------------------------- |
| GET    | `/api/health`          | None           | Health check                                       |
| POST   | `/api/auth/register`   | None           | Register a user and create a default list          |
| POST   | `/api/auth/login`      | None           | Receive an access token and refresh-token cookie   |
| POST   | `/api/auth/refresh`    | Refresh cookie | Rotate the refresh token and issue an access token |
| POST   | `/api/auth/logout`     | Refresh cookie | Revoke the current session's refresh tokens        |
| POST   | `/api/auth/logout/all` | Refresh cookie | Revoke refresh tokens for all the user's sessions  |
| GET    | `/api/lists`           | Bearer token   | List the user's todo lists                         |
| POST   | `/api/lists`           | Bearer token   | Create a list                                      |
| PUT    | `/api/lists/:id`       | Bearer token   | Rename a list                                      |
| DELETE | `/api/lists/:id`       | Bearer token   | Delete a list and its todos                        |
| GET    | `/api/todos`           | Bearer token   | List and filter the user's todos                   |
| POST   | `/api/todos`           | Bearer token   | Create a todo in a list                            |
| PUT    | `/api/todos/:id`       | Bearer token   | Update todo completion state                       |
| PATCH  | `/api/todos/:id`       | Bearer token   | Move a todo to another list                        |
| DELETE | `/api/todos/:id`       | Bearer token   | Delete a todo                                      |

List and todo endpoints require an authorization header:

```http
Authorization: Bearer <accessToken>
```
