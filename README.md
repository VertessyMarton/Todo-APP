# Todo API

## Description

A backend learning project built to practice RESTful API concepts

## Features

- User registration and login
- JWT-protected todo routes
- Create, read, update, and delete todos
- User-scoped access
- Containerized with Docker

## Tech Stack

- Runtime: Node.js
- Framework: Express
- Database: PostgreSQL
- ORM: Prisma
- Password hashing: `bcryptjs`
- Auth: JWT

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/VertessyMarton/Todo-API
```

2. Rename environment file and set values:

```bash
mv .env.example .env
```

3. Build containers:

```bash
docker compose build
```

4. Run database migrations:

```bash
docker compose run app npx prisma migrate deploy
```

5. Start the services:

```bash
docker compose up
```

API runs on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT token |
| GET | `/todos` | Yes | List  user's todos |
| POST | `/todos` | Yes | Create a todo | 
| PUT | `/todos/:id` | Yes | Update todo completion state |
| DELETE | `/todos/:id` | Yes |  Delete a todo |

## Database Schema

The full schema is maintained in [`prisma/schema.prisma`](./prisma/schema.prisma).

