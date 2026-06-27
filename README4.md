# Assignment 4 - Full-stack Quiz Application

This folder keeps the previous Project 1/2/3 Express application and adds Assignment 4 inside the same `Project` directory.

## What Was Added

- React frontend in `client/`.
- Redux Toolkit state management for authentication and quiz data.
- React Router pages for login, signup, quiz list, taking a quiz, finish result and admin CRUD.
- Bootstrap 5 styling.
- Assignment 4 API namespace under `/api/app`.
- React production build served by Express at `/app`.
- Admin-only CRUD APIs for quizzes and questions.
- Normal user quiz-taking flow with answer submission and score result.
- Seed script for demo users and demo quiz data.

## Main Flow

1. User opens `http://localhost:3000/app`.
2. User logs in or signs up.
3. After login, React stores the token in local storage and Redux state.
4. React fetches quizzes from `/api/app/quizzes`.
5. Normal user selects a quiz, chooses answers and submits.
6. Backend checks submitted answers and returns score plus per-question result.
7. Admin user can open `/app/admin`.
8. Admin can create, update and delete questions and quizzes.
9. Normal user cannot access admin page and cannot call admin CRUD APIs.

## Demo Accounts

Run the seed command first:

```powershell
npm run seed:assignment4
```

Then use:

```text
Normal user: user4 / 123456
Admin user:  admin4 / 123456
```

## How To Run

Install dependencies:

```powershell
npm install
```

Seed demo data:

```powershell
npm run seed:assignment4
```

Build the React frontend:

```powershell
npm run build:client
```

Start the Express server:

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

The root URL redirects directly to the Assignment 4 login page. The old Project 1/2/3 landing page is still available at `/legacy` if you need to review it.

## Development Mode

Run backend:

```powershell
npm run dev
```

Run React/Vite frontend:

```powershell
npm run client
```

Open Vite URL:

```text
http://localhost:5173/app
```

Vite proxies `/api` requests to `http://localhost:3000`.

## Important API Routes

Authentication:

```text
POST /api/app/users/signup
POST /api/app/users/login
```

Quiz user flow:

```text
GET  /api/app/quizzes
GET  /api/app/quizzes/:quizId
POST /api/app/quizzes/:quizId/submit
```

Admin quiz CRUD:

```text
POST   /api/app/quizzes
PUT    /api/app/quizzes/:quizId
DELETE /api/app/quizzes/:quizId
```

Admin question CRUD:

```text
GET    /api/app/questions
POST   /api/app/questions
GET    /api/app/questions/:questionId
PUT    /api/app/questions/:questionId
DELETE /api/app/questions/:questionId
```

## Authorization Rules

- All `/api/app/quizzes` and `/api/app/questions` routes require login.
- Normal users can fetch quizzes and submit quiz answers.
- Admin users can CRUD quizzes and questions.
- Normal users receive `403 Forbidden` when calling admin-only CRUD APIs.

## Checks Performed

```text
npm run check          PASS
npm test               PASS
npm run build:client   PASS
npm audit              0 vulnerabilities
Assignment 4 API smoke PASS
Express /app serve     PASS
```

## Notes

- Existing Project 1/2/3 UI and API routes are still available.
- Assignment 4 uses the new `/api/app` namespace so it does not break the older routes.
- React build output is stored in `public/app`.
