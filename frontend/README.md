# 💻 FinanceIQ — Frontend Client

A responsive and visually rich React client for the FinanceIQ personal finance application. Built with **React 19**, **Vite**, and **Vanilla CSS** for premium styling, fluid animations, and real-time user feedback.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: React 19 + Vite (for lightning-fast hot module replacement)
- **Routing**: `react-router-dom` (v7) managing authenticated protected routes and authentication redirects.
- **Charts & Visualizations**: `recharts` for rendering high-performance SVG area charts, bar charts, and donut charts.
- **Iconography**: `react-icons` delivering Lucide and Feather icons.
- **Data Exporting**: 
  - `jspdf` & `jspdf-autotable` for generating transaction PDF logs.
  - `xlsx` for producing standard spreadsheet files.
- **HTTP client**: `axios` with interceptors configured to automatically inject the user's JWT authorization header.

---

## 📂 Folder Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Brand logos and images
│   ├── components/         # Global shared components
│   │   ├── ChangePasswordModal.jsx   # Profile modal for updating passwords
│   │   └── QuickAddModal.jsx         # FAB-triggered dialog to log transaction
│   ├── context/            # React context providers
│   │   ├── CurrencyContext.jsx       # Multi-currency state & exchange rate fetcher
│   │   └── ThemeContext.jsx          # Light / dark mode controller
│   ├── pages/              # Primary routing views
│   │   ├── Budgets.jsx               # Monthly category limits and progress bars
│   │   ├── Dashboard.jsx             # KPI metrics and financial graphs
│   │   ├── ForgotPassword.jsx        # OTP code sender & password resetting
│   │   ├── FutureTrends.jsx          # Savings projections from recurring transaction rules
│   │   ├── MonthlyReport.jsx         # Historical monthly listings and trends
│   │   ├── RecurringTransactions.jsx # Scheduling transactions manager
│   │   ├── SignIn.jsx                # Secure login form with validation
│   │   ├── SignUp.jsx                # New registration form
│   │   ├── Transactions.jsx          # Searchable, paginated transactions grid with exports
│   │   └── WeeklyReport.jsx          # Day-by-day weekly expense review
│   ├── api.js              # Axios services & backend endpoint definitions
│   ├── index.css           # Premium vanilla CSS variables, animations, and typography
│   ├── App.jsx             # Root layout, routing, sidebar, and floating controls
│   └── main.jsx            # React bootstrap entry point
├── package.json            # Node project configuration
└── vite.config.js          # Vite configuration
```

---

## ⚙️ Environment Configuration

By default, the client determines the backend service URL automatically:
- When running on `localhost` or `127.0.0.1`, it binds to `http://localhost:8080`.
- Otherwise, it falls back to the production backend on Cloud Run.

To override this, set the `VITE_API_URL` environment variable during build time:
```cmd
set VITE_API_URL=https://your-custom-backend-url.com
```

---

## 🚀 Development Run

1. **Install Dependencies**:
   ```cmd
   npm install
   ```
2. **Launch Dev Server**:
   ```cmd
   npm run dev
   ```
3. **Execute Tests**:
   ```cmd
   npm run test
   ```
