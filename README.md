# 💰 FinanceIQ — Smart Finance Tracker

FinanceIQ is a premium, feature-rich full-stack personal finance application designed to help users manage, visualize, and optimize their daily transactions, recurring subscriptions, and category budgets. The application is built with **Spring Boot 3** (backend) and **React 19 + Vite** (frontend), with a schema-free **MongoDB** database, secure JWT authorization, and rich data visualization pipelines.

---

## ✨ Premium Core Features

- **🔐 Secure Stateless Auth**: Full JWT authentication framework with 10-hour tokens, supporting user registration, login, profile management, and secure profile picture storage.
- **📧 OTP Password Recovery**: Forgot-password pipeline triggering automated 6-digit OTP emails (valid for 10 minutes) with developer console-logging fallback.
- **📊 Real-time Financial Dashboard**: Interactive charts (`Recharts`) depicting cumulative Income vs Expenses trends, dynamic KPI cards, and Category spending breakdown.
- **📈 Advanced Reporting Engine**:
  - **Weekly Report**: Day-by-day bar charts and progress bars comparing category spending.
  - **Monthly Report**: Historical review with weekly breakdown bar charts and category listings.
- **💵 Live Multi-Currency Conversion**: Integrated currency switcher utilizing the `frankfurter.app` API, enabling users to convert and view financial records dynamically across `INR`, `USD`, `EUR`, `GBP`, `JPY`, `AED`, `SGD`, `CAD`, and `AUD`.
- **🎯 Category-based Budgeting**: Establish monthly spending limits per category, monitor real-time consumption progress bars, and automatically flags near-threshold spending.
- **🔁 Background Scheduler**: Automatic Spring scheduler (`@Scheduled`) executing every 5 minutes to generate active recurring transactions (daily, weekly, monthly, yearly frequency) up to optional end dates.
- **📤 Data Export**: Download transaction history instantly as clean **PDF documents** (using `jsPDF` and `jspdf-autotable`) or **Excel spreadsheets** (using `xlsx`).
- **🌓 Adaptive Theme Engine**: Custom system offering seamless switching between dark-mode (default, rich dark aesthetic) and light-mode.

---

## 🏗️ Project Architecture & Tech Stack

```
                     ┌───────────────────┐
                     │   React Frontend  │
                     │  (Vite + React)   │
                     └─────────┬─────────┘
                               │
                      HTTPS / JSON / JWT
                               │
                               ▼
                     ┌───────────────────┐
                     │   Spring Boot 3   │
                     │    REST Engine    │
                     └────┬─────────┬────┘
                          │         │
                   Spring │         │ Spring
                 Security │         │ Mailer
                          ▼         ▼
             ┌──────────────┐     ┌──────────────┐
             │   MongoDB    │     │ SMTP Server  │
             │   Database   │     │  (or Mock)   │
             └──────────────┘     └──────────────┘
```

### Backend (Java 21, Spring Boot 3.2.3)
- **Framework**: Spring Boot 3 with Web and Security starters.
- **Security**: Spring Security & stateless JWT-based filters (`jjwt`).
- **Database**: Spring Data MongoDB with Audit auditing capabilities (`@CreatedDate`, `@LastModifiedDate`).
- **Mailing**: Spring Boot Starter Mail configured for SMTP/Gmail, fallback to local developer console OTP logging if variables are unset.
- **Scheduling**: Enabled background scheduler (`@EnableScheduling`) processing recurring transaction cron jobs.

### Frontend (React 19, Vite)
- **Vite & React**: Lightweight development server and bundler.
- **State Management & Routing**: `react-router-dom` (v7) for secure, JWT-guarded routes.
- **Charting**: `Recharts` for interactive SVGs (area, donut, bar charts).
- **Icons**: `react-icons` (Lucide/Feather icons).
- **Libraries**: `axios` for HTTP request/interceptors, `jspdf`/`jspdf-autotable` for PDF exports, and `xlsx` for Excel generation.

---

## 📂 Project Directory Structure

```
financialApp/
├── backend/
│   ├── src/main/java/com/finance/app/
│   │   ├── config/                 # Security, Web, CORS, Password Encoder configurations
│   │   ├── controller/             # REST controllers (Auth, User, Transactions, Budgets, Reports)
│   │   ├── dto/                    # Request/Response Data Transfer Objects
│   │   ├── model/                  # MongoDB documents (User, Transaction, Budget, OTP)
│   │   ├── repository/             # Spring Data MongoDB Repositories
│   │   ├── security/               # JWT Util, Token validation filter, and filters
│   │   └── service/                # Business logic (User, Transaction, Email, Budget, Report, OTP)
│   ├── Dockerfile              # Docker image packaging definition
│   ├── build.gradle.kts        # Kotlin Gradle dependencies
│   ├── start-backend.bat       # Local backend startup script
│   └── setup-secrets.bat       # One-time secret provisioner
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI modals (ChangePassword, QuickAdd)
│   │   ├── context/                # Theme and Currency Context Providers
│   │   ├── pages/                  # Views (Dashboard, Reports, Auth, Transactions, Budgets)
│   │   ├── api.js                  # Axios network configuration and endpoint mappings
│   │   └── App.jsx                 # Sidebar layout, Routing, and main entry
│   ├── Dockerfile              # Production Nginx image configuration
│   └── start-app.js            # Node startup helper
├── start-app.bat               # Direct root launch script
└── DEPLOYMENT.md               # Google Cloud Run guides
```

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** (JDK installed and configured)
- **Node.js 18+**
- **MongoDB** running locally on port `27017`

### Option A — One-command Launch (Recommended)
From the project root directory, run:
```cmd
start-app.bat
```
This script launches the backend service on a dynamic port, creates a build-time reference for the frontend, and initializes the Vite development server automatically.

### Option B — Manual Launch

1. **Start the Backend:**
   ```cmd
   cd backend
   gradlew.bat bootRun
   ```

2. **Start the Frontend** (In a new terminal):
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

> 🔑 **Demo Credentials**: A pre-seeded mock account is ready on first run:
> - **Username**: `demo` 
> - **Password**: `demo123`
> - *Automatically seeds 6 months of historical transactions for mock statistics on startup.*

---

## 📋 Comprehensive API Endpoints Registry

All endpoints prefixed with `/api` are subject to JWT token verification (Authorization header: `Bearer <token>`), unless designated as **Public**.

| Service / Category | Method | URL Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | POST | `/api/auth/register` | Sign up new user and auto-login | Public |
| | POST | `/api/auth/login` | Log in user, returns JWT and username | Public |
| | POST | `/api/auth/forgot-password` | Generates and sends a 6-digit OTP code | Public |
| | POST | `/api/auth/verify-otp` | Validates active OTP verification code | Public |
| | POST | `/api/auth/reset-password` | Resets user password using verified OTP | Public |
| **User Settings** | GET | `/api/users/profile` | Retrieves current profile details | 🔒 Auth |
| | POST | `/api/users/profile-picture` | Uploads dynamic profile avatar image | 🔒 Auth |
| | POST | `/api/users/change-password` | Updates password from active profile modal | 🔒 Auth |
| **Transactions** | GET | `/api/transactions` | Retrieves all transactions for user | 🔒 Auth |
| | POST | `/api/transactions` | Creates new income or expense record | 🔒 Auth |
| | PUT | `/api/transactions/{id}` | Updates existing transaction fields | 🔒 Auth |
| | DELETE | `/api/transactions/{id}` | Deletes transaction record | 🔒 Auth |
| **Recurring Txn** | GET | `/api/recurring-transactions` | Retrieves all recurring transaction items | 🔒 Auth |
| | POST | `/api/recurring-transactions` | Adds a recurring item scheduler rule | 🔒 Auth |
| | PUT | `/api/recurring-transactions/{id}` | Updates recurring transaction details | 🔒 Auth |
| | DELETE | `/api/recurring-transactions/{id}`| Removes recurring transaction rule | 🔒 Auth |
| **Budgets** | GET | `/api/budgets` | Retrieves user's category limits list | 🔒 Auth |
| | POST | `/api/budgets` | Creates/updates category monthly budget | 🔒 Auth |
| | DELETE | `/api/budgets/{category}` | Deletes budget threshold for category | 🔒 Auth |
| | GET | `/api/budgets/status` | Current spending vs limits report | 🔒 Auth |
| **Reports & Trends**| GET | `/api/reports/dashboard` | KPI metrics + overall monthly trend data | 🔒 Auth |
| | GET | `/api/reports/weekly` | This week's day-by-day financial report | 🔒 Auth |
| | GET | `/api/reports/monthly` | Navigates monthly detailed financial breakdowns| 🔒 Auth |
| | GET | `/api/reports/future-projection` | Projects future balance using recurring rules | 🔒 Auth |

---

