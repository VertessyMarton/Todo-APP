# Full-Stack Todo App

A full-stack todo application with user authentication, protected todo routes, and user-scoped CRUD operations. The project includes an Angular frontend, an Express API, Prisma ORM, PostgreSQL, JWT authentication, validation, centralized error handling, and Docker-based local development.

## Live Demo

On first call, backend service could take up to 50s to wake up!

The project is deployed on Render:

- Angular frontend: https://todo-app-98g2.onrender.com
- Express API: https://todo-api-n26l.onrender.com

## Features

- Register and log in with a username and password
- Password hashing with `bcryptjs`
- JWT-based authentication
- Angular route guard for protected pages
- HTTP interceptor that attaches bearer tokens to API requests
- Create, read, update, and delete todos
- Todos are scoped to the authenticated user
- Request validation with Zod
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
| DevOps     | Docker Compose            |

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

The frontend runs on:
http://localhost:4200

The backend runs on:
http://localhost:3000

## API Endpoints

| Method | Endpoint         | Auth Required | Description                  |
| ------ | ---------------- | ------------- | ---------------------------- |
| GET    | `/`              | No            | Health check                 |
| POST   | `/auth/register` | No            | Register a new user          |
| POST   | `/auth/login`    | No            | Log in and receive a JWT     |
| GET    | `/todos`         | Yes           | List the user's todos        |
| POST   | `/todos`         | Yes           | Create a todo                |
| PUT    | `/todos/:id`     | Yes           | Update todo completion state |
| DELETE | `/todos/:id`     | Yes           | Delete a todo                |

Protected endpoints require an authorization header:

```http
Authorization: Bearer <accessToken>
```
