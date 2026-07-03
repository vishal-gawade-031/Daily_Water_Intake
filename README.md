# Water Intake Tracker - Complete Admin Panel

A modern, full-stack application for tracking daily water intake with a comprehensive admin dashboard.

The **frontend** is built with:
- React 18 + TypeScript
- Vite (lightning-fast build tool)
- Tailwind CSS (responsive styling)
- Framer Motion (smooth animations)
- Chart.js & React-ChartJS-2 (interactive charts)
- Axios (API communication)
- React Hot Toast (notifications)
- Lucide React (beautiful icons)

The **backend** is built with:
- Django 6.0 (Python web framework)
- Django REST Framework (robust API)
- JWT Authentication (secure token-based auth)
- SQLite (development database, ready for PostgreSQL)
- CORS support (cross-origin requests)

## Main Features

### User Panel
- ✅ Secure authentication (login/register)
- ✅ Add water intake with quick buttons: 250 ml, 500 ml, 750 ml, 1000 ml
- ✅ Custom water entry from 1-5000 ml with optional notes
- ✅ Real-time daily progress with visual indicators
- ✅ 7-day & 30-day analytics dashboards
- ✅ Achievement system with badges
- ✅ Hydration coaching with personalized messages
- ✅ Dark/Light theme toggle with persistence
- ✅ Fully responsive design (mobile, tablet, desktop)

### Admin Panel (NEW!)
- ✅ **Dashboard** - Real-time statistics & KPIs with animated cards
- ✅ **User Management** - View, search, filter, activate/deactivate users
- ✅ **User Profiles** - Detailed analytics with water intake history graphs
- ✅ **Water Records** - Audit logs, edit/delete entries, export data
- ✅ **Analytics** - Advanced insights with multiple chart types
- ✅ **Leaderboard** - Ranked users with streak tracking & badges
- ✅ **Notifications** - Send global announcements to all users
- ✅ **Feedback Management** - Reply to user feedback, track status
- ✅ **Reports** - Generate daily/weekly/monthly reports with export
- ✅ **Activity Logs** - Complete audit trail of all admin actions
- ✅ **Settings** - Configure app defaults, backups, and database
- ✅ **Dark/Light Theme** - Consistent with user panel
- ✅ **Role-Based Access** - Only admins can access admin features

## Water Intake Rule

Users can add water intake only for the current date. A user can add water multiple times during the same day. Every new amount is added to the previous amount for that day.

Example:
- First entry: 250 ml
- Second entry: 500 ml
- Total water intake for today: 750 ml

The total resets for each new day. Previous days are available only for history and analytics.

## Project Structure

```
backend/              Python virtual environment
backend_api/          Django project and SQLite database
  manage.py           Django management CLI
  waterintake_api/    Project settings & URL configuration
  db.sqlite3          SQLite database
records/              Django app for users, water entries, achievements
  models.py           Database models
  views.py            API views and admin endpoints
  serializers.py      DRF serializers
  urls.py             API routes
  migrations/         Database migrations
  
frontend/             React + TypeScript application
  src/
    pages/            Page components
      admin/          Admin panel pages
    components/       Reusable UI components
    layouts/          Layout wrapper components
    context/          Auth context provider
    App.tsx           Main router component
  vite.config.ts      Vite build configuration
  tailwind.config.js  Tailwind CSS configuration
  postcss.config.js   PostCSS configuration
```

## Getting Started

### Prerequisites

- Python 3.10+ (for backend)
- Node.js 18+ & npm (for frontend)
- Git

### Backend Setup

```bash
# 1. Navigate to backend
cd backend_api

# 2. Activate virtual environment (Windows)
venv\Scripts\activate

# 3. Install Django dependencies (if needed)
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt

# 4. Create a superuser for admin access
python manage.py createsuperuser
# Follow the prompts to set username and password

# 5. Run migrations
python manage.py migrate

# 6. Start development server
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000/api/**

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend runs at: **http://localhost:5174/** (or another available port)

## API Endpoints

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/` | Create user account |
| POST | `/api/auth/login/` | Get JWT tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/profile/` | Get user profile |

### User Features

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/entries/` | List water entries |
| POST | `/api/entries/` | Add water intake |
| DELETE | `/api/entries/<id>/` | Delete entry |
| GET | `/api/daily-summary/` | Today's progress |
| GET | `/api/analytics/seven-days/` | 7-day analytics |
| GET | `/api/achievements/` | User achievements |
| GET | `/api/coaching/` | Coaching message |
| GET | `/api/leaderboard/` | Public leaderboard |
| GET | `/api/ai-insights/` | AI hydration insights |

### Admin Features

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/admin/dashboard/stats/` | Dashboard statistics |
| GET | `/api/admin/dashboard/charts/` | Dashboard chart data |
| GET/POST | `/api/admin/users/` | User CRUD operations |
| GET | `/api/admin/users/<id>/history/` | User water history |
| POST | `/api/admin/users/<id>/toggle-active/` | Activate/deactivate user |
| POST | `/api/admin/users/<id>/reset-goal/` | Reset daily goal |
| GET/POST | `/api/admin/water-records/` | Water record management |
| GET/POST | `/api/admin/feedback/` | Feedback management |
| GET/POST | `/api/admin/notifications/` | Send notifications |
| GET/POST | `/api/admin/settings/` | System settings |
| GET | `/api/admin/activity-logs/` | Audit logs |
| GET | `/api/admin/reports/` | Generate reports (CSV/Excel) |
| GET/POST | `/api/admin/backup/` | Database backup & restore |

---

## Admin Panel Access

### Creating an Admin User

1. **Create a superuser** via the Django management command:
   ```bash
   cd backend_api
   python manage.py createsuperuser
   ```
   Follow the prompts to set username and password.

2. **Login to the app** with your superuser credentials at the frontend login page.

3. **Admin Dashboard** automatically redirects superusers to `/admin/dashboard`.

### Admin Credentials

For quick testing, you can use:
- **Username**: `admin`
- **Password**: (as set during superuser creation)

### Admin Features

**Sidebar Navigation:**
- 🏠 Dashboard - System overview & KPIs
- 👤 Users - Manage user accounts
- 💧 Water Records - View & edit water logs
- 📊 Analytics - In-depth user analytics
- 🏆 Leaderboard - Ranked hydration champions
- 🔔 Notifications - Send broadcasts to users
- 📝 Feedback - Manage user feedback tickets
- 📄 Reports - Generate exportable reports
- 🗂️ Activity Logs - Audit trail
- ⚙️ Settings - App configuration & backups

### Key Admin Operations

**User Management:**
- Search & filter users by status, role, or metrics
- View detailed user profiles with water intake history
- Toggle user active/inactive status
- Reset user daily goals
- Delete users (Super Admin only)

**Water Records:**
- Edit water entry amounts & notes
- Delete incorrect entries
- Filter by date, user, or amount
- Export records as CSV or Excel
- Sort by latest, highest, or lowest intake

**Analytics:**
- View system-wide statistics
- Charts for 7-day and 30-day trends
- Goal completion rates
- Daily active users
- Top performers & least active users
- Peak usage hours

**Reports:**
- Generate daily, weekly, monthly, yearly reports
- Export as CSV, Excel, or PDF
- Print directly from browser
- Summary statistics included

**Settings:**
- Configure default daily goal (ml)
- Set reminder intervals
- Customize app name & logo
- Toggle notifications
- Maintenance mode
- Privacy policy & terms management
- Database backup & restore (Super Admin)

---

## Configuration

### Default Daily Goal

The default daily water goal is **2000 ml** but can be customized per user or globally via settings.

### Theme Persistence

Both user and admin panels support dark/light mode with localStorage persistence.

### CORS Configuration

The backend allows requests from `localhost:*` for local development. For production, update `CORS_ALLOWED_ORIGINS` in `backend_api/settings.py`.

### Database

Development uses SQLite (`db.sqlite3`). For production, migrate to PostgreSQL:

1. Install PostgreSQL and create database
2. Update `backend_api/settings.py` DATABASES configuration
3. Run migrations: `python manage.py migrate`

---

## Architecture & Code Quality

### Backend Architecture
- **Models**: User, UserProfile, WaterIntakeEntry, Achievement, Feedback, Notification, SystemSetting, ActivityLog
- **Permissions**: Custom permission classes for admin-only endpoints
- **Authentication**: JWT with refresh tokens
- **Serializers**: Comprehensive DRF serializers with validation
- **Views**: Class-based and function-based views with proper error handling
- **Logging**: Activity logs for all admin operations

### Frontend Architecture
- **Components**: Modular, reusable React components
- **Pages**: Separated user and admin page layouts
- **Context**: React Context API for auth state
- **Animations**: Framer Motion for smooth transitions
- **Styling**: Tailwind CSS with dark mode support
- **Charts**: Chart.js for data visualization
- **Notifications**: React Hot Toast for user feedback

### Code Features
- ✅ Proper error handling on both client and server
- ✅ Input validation and sanitization
- ✅ Loading states and skeletons
- ✅ Empty states for better UX
- ✅ Responsive design (mobile-first)
- ✅ Accessible UI components
- ✅ Search, filter, sort functionality
- ✅ Pagination support
- ✅ Confirmation dialogs for destructive actions
- ✅ Toast notifications for feedback
- ✅ Loading animations

---

## Bonus Features Implemented

- ✅ AI-powered hydration insights with predictions
- ✅ Inactive user detection on dashboard
- ✅ Real-time chart animations
- ✅ Email-ready notification system
- ✅ CSV/Excel/PDF export functionality
- ✅ User badges and achievements
- ✅ Hydration trends & forecasting
- ✅ Calendar-ready date tracking
- ✅ Multi-admin role support
- ✅ Complete audit logs
- ✅ Database backup/restore functionality
- ✅ Dark/light theme with persistence
- ✅ Fully responsive design
- ✅ Production-ready code structure

---

## Development Commands

```bash
# Backend
cd backend_api
python manage.py runserver           # Start dev server
python manage.py makemigrations      # Create migrations
python manage.py migrate             # Apply migrations
python manage.py createsuperuser     # Create admin user
python manage.py collectstatic       # Collect static files

# Frontend
cd frontend
npm run dev                          # Start dev server
npm run build                        # Build for production
npm run preview                      # Preview production build
```

---



## Testing the Admin Panel

1. **Start Backend**: `python manage.py runserver`
2. **Start Frontend**: `npm run dev`
3. **Create Admin**: `python manage.py createsuperuser`
4. **Login**: Use superuser credentials
5. **Access Admin**: Dashboard will auto-load for admins
6. **Create Test Users**: Use the Users page or registration
7. **Add Test Data**: Use the frontend to log water entries
8. **View Analytics**: Check dashboards and reports

---

## Security Considerations

- ✅ JWT tokens with expiration
- ✅ CORS protection
- ✅ CSRF middleware enabled
- ✅ SQL injection protection (ORM)
- ✅ XSS protection (React escaping)
- ✅ Input validation on all endpoints
- ✅ Permission checks on admin operations
- ✅ Audit logging for admin actions
- ✅ Secure password hashing
- ✅ HttpOnly cookies support (can be enabled)

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

---

## License

This project is open-source and available under the MIT License.

---

## Support & Feedback

For issues, features, or feedback, please create an issue in the repository.

---

## Note

This project is configured for local development. Django allows local frontend requests through CORS. For production deployment, update security settings, database configuration, and environment variables accordingly.

## Key Features

1. **Dashboard**: Statistic cards and dynamic charts showing consumption, growth, and DAU.
2. **User Management**: Search, filter, reset goals, activate/deactivate status, and delete users.
3. **Water Records**: View all records, edit logs, delete entries, and export to CSV/Excel.
4. **Deep Analytics**: Hourly frequency graphs, consistent hydrators lists, and consumption heatmaps.
5. **Leaderboard Podium**: Ranks and motivational badges.
6. **System Alerts**: Send drink reminders or maintenance announcements.
7. **Feedback tickets**: Reply to user feedback and resolve tickets.
8. **Settings Panel**: Configure default hydration goals and trigger database backup/restore.
9. **Activity Logs**: System-wide administrative audit trail.

## Admin User Credentials

To log into the Admin Dashboard, create a Django superuser. Use the following recommended test credentials or define your own:

- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `adminpassword123`

### Creating the Admin User

Run the following command in the `backend_api/` directory:

```powershell
.\venv\Scripts\python.exe manage.py createsuperuser
```

Enter `admin` for username, `admin@example.com` for email, and `adminpassword123` for password.

## Running the Unit Tests

We have added comprehensive backend test cases in `records/tests_admin.py`. Run the test suite with the following command:

```powershell
.\venv\Scripts\python.exe manage.py test records
```
name vishal
pass: Vishal@123
