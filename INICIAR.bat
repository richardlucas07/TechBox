@echo off
cd /d "%~dp0"
if not exist node_modules\mysql2 (
  echo Instalando a conexao com o MySQL...
  call npm.cmd install --no-audit --no-fund
)
powershell -NoProfile -Command "Start-Process node -ArgumentList 'server.js' -WorkingDirectory '%~dp0.' -WindowStyle Hidden"
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo TechBox iniciado em http://localhost:3000
echo Pode fechar esta janela e o VS Code. Para parar, use PARAR.bat
pause
