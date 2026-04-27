@echo off
echo Setting up Node.js PATH...
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\Adarsh\Desktop\Website"
echo Starting development server...
npm run dev
pause