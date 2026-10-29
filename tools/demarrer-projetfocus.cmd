@echo off
rem Démarre projetfocus sur ce PC : le petit serveur local (port 8417) s'il ne tourne pas
rem déjà, puis l'appli dans une fenêtre Chrome à part (sans barre d'adresse).
rem Raccourci sur le bureau : « projetfocus » (créé une fois, voir REGLES.md).

cd /d "%~dp0.."

netstat -ano | findstr ":8417 " | findstr LISTENING >nul
if errorlevel 1 (
  start "projetfocus - serveur (ne pas fermer)" /min python -m http.server 8417 --bind 127.0.0.1
  timeout /t 2 /nobreak >nul
)

start "" chrome --app=http://localhost:8417/ --window-size=900,1000
