@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo ORACULOS.TS - AUDITORIA FINAL E ENVIO AO GITHUB
echo ============================================================
where git >nul 2>nul || (echo ERRO: Git nao instalado.& pause & exit /b 1)
where node >nul 2>nul || (echo ERRO: Node.js nao instalado.& pause & exit /b 1)
call npm install || (echo ERRO ao instalar dependencias.& pause & exit /b 1)
call npm run lint || (echo ERRO na validacao TypeScript.& pause & exit /b 1)
call npm test || (echo ERRO nos testes.& pause & exit /b 1)
call npm run build || (echo ERRO no build de producao.& pause & exit /b 1)
git push -u origin fix/painel-funcionario-mobile || (echo ERRO ao enviar para o GitHub.& pause & exit /b 1)
start "" "https://github.com/brasilportalvip-png/Oraculos.ts/compare/main...fix/painel-funcionario-mobile?expand=1"
echo.
echo PRONTO. O GitHub foi aberto. Clique em Create pull request.
pause
