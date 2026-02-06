@echo off
echo ========================================
echo Flutter Finance Tracker Setup
echo ========================================
echo.

echo Step 1: Checking Flutter installation...
where flutter >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Flutter not found!
    echo.
    echo Please install Flutter:
    echo 1. Download: https://docs.flutter.dev/get-started/install/windows
    echo 2. Extract to C:\flutter
    echo 3. Add C:\flutter\bin to PATH
    echo 4. Run this script again
    echo.
    pause
    exit /b
) else (
    echo [OK] Flutter found!
    flutter --version
)

echo.
echo Step 2: Creating Flutter project...
cd ..
flutter create finance_tracker_app
cd finance_tracker_app

echo.
echo Step 3: Copying web files...
mkdir assets\web
xcopy /E /I /Y ..\Personal-Finance-Tracker\*.html assets\web\
xcopy /E /I /Y ..\Personal-Finance-Tracker\*.css assets\web\
xcopy /E /I /Y ..\Personal-Finance-Tracker\*.js assets\web\
xcopy /E /I /Y ..\Personal-Finance-Tracker\assets assets\web\assets\

echo.
echo Step 4: Setup complete!
echo.
echo Next steps:
echo 1. cd finance_tracker_app
echo 2. flutter pub get
echo 3. Connect Android phone
echo 4. flutter run
echo.
pause
