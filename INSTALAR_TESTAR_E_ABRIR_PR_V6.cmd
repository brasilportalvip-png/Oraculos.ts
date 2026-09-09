@echo off
setlocal EnableExtensions
title ORACULOS.TS - Producao completa V6
cd /d "%~dp0"
echo.
echo ========================================================
echo   ORACULOS.TS - PRODUCAO COMPLETA V6
echo ========================================================
echo.
where git >nul 2>nul || goto :git_error
where node >nul 2>nul || goto :node_error
set "BRANCH=fix/producao-completa-v6-20260909"
git status --porcelain >nul 2>nul || goto :repo_error
git switch -c "%BRANCH%" 2>nul
if errorlevel 1 git switch "%BRANCH%" || goto :branch_error
echo [1/7] Instalando dependencias exatas...
call npx -y npm@10.9.2 ci || goto :fail
echo [2/7] Verificando TypeScript...
call npm run lint || goto :fail
echo [3/7] Executando 138 testes...
call npm test || goto :fail
echo [4/7] Validando imagens e arquivos oficiais...
call npm run validate:assets || goto :fail
echo [5/7] Gerando versao de producao...
call npm run build || goto :fail
echo [6/7] Testando servidor e funcao Vercel...
call npm run smoke:serverless || goto :fail
call npm run smoke:production || goto :fail
echo [7/7] Criando commit e enviando ao GitHub...
git add -A
git commit -m "fix: endurece seguranca operacao e financeiro para producao" || goto :commit_error
git push -u origin "%BRANCH%" || goto :push_error
echo.
echo ========================================================
echo   CONCLUIDO COM SUCESSO
echo ========================================================
echo O GitHub sera aberto agora.
echo Clique em Create pull request e aguarde todos os testes.
start "" "https://github.com/brasilportalvip-png/Oraculos.ts/compare/main...fix/producao-completa-v6-20260909?expand=1"
pause
exit /b 0
:git_error
echo ERRO: Git nao encontrado.
goto :stop
:node_error
echo ERRO: Node.js nao encontrado.
goto :stop
:repo_error
echo ERRO: repositorio Git nao encontrado nesta pasta.
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
