@echo off
setlocal EnableExtensions
title ORACULOS.TS - Entrega de chamadas V4
cd /d "%~dp0"
echo.
echo ========================================================
echo   ORACULOS.TS - ENTREGA DE CHAMADAS V4
echo ========================================================
echo.
where git >nul 2>nul || goto :git_error
where node >nul 2>nul || goto :node_error
set "BRANCH=fix/entrega-chamadas-profissional-v4-20260908"
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
git add server.ts test/admin-operational-controls.test.ts INSTALAR_TESTAR_E_ABRIR_PR_V4.cmd LEIA-ME-CORRECAO-V4.txt
git commit -m "fix: entrega chamadas reais ao painel profissional" || goto :commit_error
git push -u origin "%BRANCH%" || goto :push_error
echo.
echo ========================================================
echo   CONCLUIDO COM SUCESSO
echo ========================================================
echo O GitHub sera aberto agora.
echo Clique em Create pull request e depois em Merge pull request.
start "" "https://github.com/brasilportalvip-png/Oraculos.ts/compare/main...fix/entrega-chamadas-profissional-v4-20260908?expand=1"
pause
exit /b 0
:git_error
echo ERRO: Git nao encontrado.
goto :stop
:node_error
echo ERRO: Node.js nao encontrado.
goto :stop
:repo_error
echo ERRO: repositorio Git nao encontrado.
goto :stop
:branch_error
echo ERRO: nao foi possivel abrir a branch.
goto :stop
:commit_error
echo ERRO: nao foi possivel criar o commit.
goto :stop
:push_error
echo ERRO: nao foi possivel enviar ao GitHub.
goto :stop
:fail
echo ERRO: uma verificacao falhou. Nada foi enviado ao GitHub.
:stop
pause
exit /b 1
