@echo off
REM ===========================================================================
REM GCP Secret Manager - One-Time Setup Script TEMPLATE
REM Copy this file to setup-secrets.bat and replace the MONGODB_VALUE below
REM with your actual production MongoDB connection string.
REM ===========================================================================

set PROJECT_ID=your-gcp-project-id
set REGION=us-central1
set SERVICE_NAME=financial-app-backend
set SECRET_NAME=MONGODB_URI
set MONGODB_VALUE=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dbname

echo.
echo [1/4] Enabling Secret Manager API...
gcloud services enable secretmanager.googleapis.com --project=%PROJECT_ID%

echo.
echo [2/4] Creating secret "%SECRET_NAME%"...
gcloud secrets create %SECRET_NAME% ^
    --replication-policy="automatic" ^
    --project=%PROJECT_ID%

echo.
echo [3/4] Adding secret value...
echo %MONGODB_VALUE%| gcloud secrets versions add %SECRET_NAME% --data-file=- --project=%PROJECT_ID%

echo.
echo [4/4] Granting Cloud Run service account access to the secret...
for /f "tokens=*" %%i in ('gcloud iam service-accounts list --project=%PROJECT_ID% --filter="displayName:Compute Engine default service account" --format="value(email)"') do set SA_EMAIL=%%i
echo Service Account: %SA_EMAIL%

gcloud secrets add-iam-policy-binding %SECRET_NAME% ^
    --member="serviceAccount:%SA_EMAIL%" ^
    --role="roles/secretmanager.secretAccessor" ^
    --project=%PROJECT_ID%

echo.
echo ============================================================
echo  SUCCESS! Secret "%SECRET_NAME%" has been created in GCP.
echo ============================================================
echo.
pause
