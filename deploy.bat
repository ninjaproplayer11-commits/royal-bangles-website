@echo off
echo 🚀 Starting Deployment...
git add .
git commit -m "Auto-update from deploy script"
git push
echo.
echo ✅ Deployment pushed to GitHub! 
echo 📺 Check your Railway dashboard to see the live update.
echo.
pause
