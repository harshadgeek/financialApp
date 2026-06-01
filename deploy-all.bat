@echo off
setlocal

echo =========================================================
echo              FinanceIQ Deployment Script
echo =========================================================
echo This script will build and deploy both the Backend and Frontend
echo to Google Cloud Run natively.
echo.

set PROJECT_ID=finicalapp
set REGION=us-central1
set BACKEND_SERVICE=financial-app-backend
set FRONTEND_SERVICE=financial-app-frontend
set BACKEND_URL=https://financial-app-backend-600881932726.us-central1.run.app

REM ---------------------------------------------------------
REM 1. Build & Deploy Backend
REM ---------------------------------------------------------
echo [1/4] Building Backend locally...
cd backend
call gradlew.bat build -x test
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend local build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Deploying Backend to Cloud Run...
call gcloud run deploy %BACKEND_SERVICE% ^
  --source . ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --update-secrets=MONGODB_URI=MONGODB_URI:latest,SPRING_MAIL_USERNAME=SPRING_MAIL_USERNAME:latest,SPRING_MAIL_PASSWORD=SPRING_MAIL_PASSWORD:latest ^
  --quiet

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend deployment failed!
    exit /b %ERRORLEVEL%
)
cd ..

REM ---------------------------------------------------------
REM 2. Build & Deploy Frontend
REM ---------------------------------------------------------
echo.
echo [3/4] Building Frontend locally...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend local build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [4/4] Deploying Frontend to Cloud Run...
call gcloud run deploy %FRONTEND_SERVICE% ^
  --source . ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --set-build-env-vars="VITE_API_URL=%BACKEND_URL%" ^
  --quiet

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend deployment failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo =========================================================
echo SUCCESS! Both Backend and Frontend deployed to Cloud Run.
echo =========================================================
pause
