@echo off
setlocal EnableExtensions
title ORACULOS.TS - Correcao operacional V2
cd /d "%~dp0"

echo.
echo ========================================================
echo   ORACULOS.TS - CORRECAO OPERACIONAL V2
echo ========================================================
echo.

where git >nul 2>nul || goto :git_error
where node >nul 2>nul || goto :node_error

set "BRANCH=fix/operacao-admin-auditoria-20260908"

git status --porcelain >nul 2>nul || goto :repo_error
git switch -c "%BRANCH%" 2>nul
if errorlevel 1 git switch "%BRANCH%" || goto :branch_error

echo [1/5] Instalando dependencias exatas do projeto...
call npx -y npm@10.9.2 ci || goto :fail

echo [2/5] Verificando TypeScript...
call npm run lint || goto :fail

echo [3/5] Executando todos os testes...
call npm test || goto :fail

echo [4/5] Gerando a versao de producao...
call npm run build || goto :fail

echo [5/5] Criando commit e enviando ao GitHub...
git add server.ts src/context/ConsultationContext.tsx src/components/ConsultationRoom.tsx src/components/LegalPage.tsx src/components/consultant/ConsultantDashboard.tsx src/components/admin/AdminDashboard.tsx src/components/admin/AdminAccountsPanel.tsx src/components/admin/AdminConsultationAudit.tsx test/workforce-production.test.ts test/admin-operational-controls.test.ts INSTALAR_TESTAR_E_ABRIR_PR_V2.cmd LEIA-ME-CORRECAO-V2.txt
git commit -m "fix: conclui chamadas e controles administrativos" || goto :commit_error
git push -u origin "%BRANCH%" || goto :push_error

echo.
echo ========================================================
echo   CONCLUIDO COM SUCESSO
echo ========================================================
echo O GitHub sera aberto agora.
echo Clique em Create pull request.
echo Depois aguarde os testes e clique em Merge pull request.
echo.
start "" "https://github.com/brasilportalvip-png/Oraculos.ts/compare/main...fix/operacao-admin-auditoria-20260908?expand=1"
pause
exit /b 0

:git_error
echo ERRO: Git nao encontrado. Instale o Git para Windows.
goto :stop
:node_error
echo ERRO: Node.js nao encontrado. Instale o Node.js 22.
goto :stop
:repo_error
echo ERRO: os dados do repositorio nao foram encontrados nesta pasta.
echo Extraia o ZIP completo antes de executar este arquivo.
goto :stop
:branch_error
echo ERRO: nao foi possivel criar ou abrir a branch de correcao.
goto :stop
:commit_error
echo ERRO: nao foi possivel criar o commit. Confira a mensagem acima.
goto :stop
:push_error
echo ERRO: o envio ao GitHub falhou. Confira sua conexao e login do Git.
goto :stop
:fail
echo.
echo ERRO: uma verificacao falhou. Nada foi enviado ao GitHub.
:stop
echo.
pause
exit /b 1
