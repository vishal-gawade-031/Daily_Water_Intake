# Water Intake Tracker

A simple full-stack application for tracking daily water intake.

The frontend is built with React, TypeScript, Vite, and Tailwind CSS. The backend uses Django REST Framework, JWT authentication, and SQLite.

## Main Features

- Create an account and log in securely.
- Add water using quick buttons: 250 ml, 500 ml, 750 ml, or 1000 ml.
- Enter a custom amount from 1 ml to 5000 ml.
- Add an optional note with the water intake.
- View today's total, daily goal, remaining amount, and progress.
- View water intake analytics for the last 7 days.
- Earn achievements for reaching goals and maintaining streaks.
- See hydration tips and coaching messages.

## Water Intake Rule

- Users can add water intake only for the current date.
- A user can add water multiple times during the same day.
- Every new amount is added to the previous amount for that day.

Example:

- First entry: 250 ml
- Second entry: 500 ml
- Total water intake for today: 750 ml

The total starts again for each new day. Previous days are available only for history and analytics.

## Project Structure

```text
backend/       Python virtual environment
backend_api/   Django project and SQLite database
records/       Django app for users, water entries, and achievements
frontend/      React application
```

## Run the Backend

From the project folder, run:

```powershell
backend\venv\Scripts\python backend_api\manage.py migrate
backend\venv\Scripts\python backend_api\manage.py runserver
```
or
 venv\Scripts\activate
python manage.py runserver

The API will run at:

```text
http://127.0.0.1:8000/api/
```

## Run the Frontend

Open another terminal and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite in the terminal.

## Main API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/` | Create an account |
| POST | `/api/auth/login/` | Log in and receive JWT tokens |
| POST | `/api/auth/refresh/` | Refresh the access token |
| GET | `/api/auth/profile/` | View the logged-in user's profile |
| GET | `/api/entries/` | View water intake entries |
| POST | `/api/entries/` | Add water for today |
| DELETE | `/api/entries/<id>/` | Delete a water intake entry |
| GET | `/api/daily-summary/` | View today's progress |
| GET | `/api/analytics/seven-days/` | View the last 7 days of data |
| GET | `/api/achievements/` | View earned achievements |
| GET | `/api/coaching/` | View a hydration message |

## Default Daily Goal

The default daily water goal is **2000 ml**.

## Note

This project is configured for local development. Django allows local frontend requests through CORS, and the React app connects to `http://127.0.0.1:8000/api`.
