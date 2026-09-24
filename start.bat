@echo off
title JEE ASCENT
cd /d "%~dp0"
echo Starting JEE ASCENT...
start "" http://localhost:5173
node server.js
pause
