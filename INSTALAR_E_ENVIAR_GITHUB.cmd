@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title ORACULOS.TS - Mobile pronto para producao
echo ============================================================
echo ORACULOS.TS - INSTALAR, VALIDAR E ABRIR PULL REQUEST
echo ============================================================
echo.

where git >nul 2>nul || goto :git_missing
where node >nul 2>nul || goto :node_missing
where npm >nul 2>nul || goto :node_missing

for /f "delims=" %%V in ('node --version') do set "ORACULOS_NODE_VERSION=%%V"
echo Node encontrado: %ORACULOS_NODE_VERSION%
echo.

git switch fix/mobile-producao-avancado || goto :failure
call npm ci || goto :failure
call npm run lint || goto :failure
call npm test || goto :failure
call npm run build || goto :failure
call npm run smoke:production || goto :failure
call npm run smoke:serverless || goto :failure

echo.
echo Enviando a branch corrigida para o GitHub...
git push -u origin fix/mobile-producao-avancado || goto :push_failure

start "" "https://github.com/brasilportalvip-png/Oraculos.ts/compare/main...fix/mobile-producao-avancado?expand=1"
echo.
echo ============================================================
echo PRONTO: todos os testes passaram e o GitHub foi aberto.
echo 1. Clique em Create pull request.
echo 2. Aguarde as verificacoes ficarem verdes.
echo 3. Clique em Merge pull request e depois Confirm merge.
echo ============================================================
pause
exit /b 0

:git_missing
echo ERRO: Git nao foi encontrado.
echo Instale pelo endereco: https://git-scm.com/download/win
pause
exit /b 1

:node_missing
echo ERRO: Node.js e npm nao foram encontrados.
echo Instale o Node.js 22 LTS pelo endereco: https://nodejs.org/
pause
exit /b 1

:push_failure
echo.
echo ERRO: nao foi possivel enviar ao GitHub.
echo Entre na sua conta do GitHub quando o Git solicitar autenticacao e execute o instalador novamente.
pause
exit /b 1

:failure
echo.
echo ERRO: uma validacao falhou. Nada foi enviado ao GitHub.
pause
exit /b 1
