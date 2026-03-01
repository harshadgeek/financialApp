# FinanceIQ — Startup Guide

## Prerequisites
- **Java 21** (JDK)
- **Node.js 18+**
- Git (optional)

---

## 🚀 Running the App

### 1. Start the Backend (Java 21 + Spring Boot + Gradle)
```cmd
cd backend
gradlew.bat bootRun
```
> Backend runs on **http://localhost:8080**  
> H2 console: **http://localhost:8080/h2-console** (JDBC: `jdbc:h2:mem:financedb`)  
> Sample data is auto-seeded on startup (6 months of transactions)

### 2. Start the Frontend (React + Vite)
Open a **new terminal**:
```cmd
cd frontend
npm run dev
```
> Frontend runs on **http://localhost:5173**

---

## 📋 API Endpoints
| Method | URL | Description |
|---|---|---|
| GET | `/api/reports/dashboard` | KPI summary + monthly trend |
| GET | `/api/reports/weekly` | This week's daily breakdown |
| GET | `/api/reports/monthly?month=3&year=2026` | Monthly detailed report |
| GET | `/api/transactions` | All transactions |
| POST | `/api/transactions` | Add transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/budgets` | Budget progress for current month |
| POST | `/api/budgets` | Create/update budget |
