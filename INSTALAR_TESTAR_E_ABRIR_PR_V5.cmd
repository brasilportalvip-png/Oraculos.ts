@echo off
setlocal EnableExtensions
title ORACULOS.TS - Operacao completa V5
cd /d "%~dp0"
echo.
echo ========================================================
echo   ORACULOS.TS - OPERACAO COMPLETA V5
echo ========================================================
echo.
where git >nul 2>nul || goto :git_error
where node >nul 2>nul || goto :node_error
set "BRANCH=fix/campainha-video-auditoria-marketplace-v5-20260909"
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
git add package.json package-lock.json server.ts src/types.ts src/context/ConsultationContext.tsx src/components/VideoMeeting.tsx src/components/ConsultantCard.tsx src/components/ConsultantProfileModal.tsx src/components/SpecialistDetailPage.tsx src/components/ConsultationRoom.tsx src/components/LegalPage.tsx src/components/consultant/ConsultantDashboard.tsx src/components/admin/AdminConsultationAudit.tsx src/components/admin/AdminWorkforcePanel.tsx test/admin-operational-controls.test.ts test/workforce-production.test.ts test/ui-real-components.test.tsx INSTALAR_TESTAR_E_ABRIR_PR_V5.cmd LEIA-ME-CORRECAO-V5.txt
git commit -m "feat: completa campainha video auditoria e marketplace" || goto :commit_error
git push -u origin "%BRANCH%" || goto :push_error
echo.
echo ========================================================
echo   CONCLUIDO COM SUCESSO
echo ========================================================
echo O GitHub sera aberto agora.
echo Clique em Create pull request e aguarde os testes.
start "" "https://github.com/brasilportalvip-png/Oraculos.ts/compare/main...fix/campainha-video-auditoria-marketplace-v5-20260909?expand=1"
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
