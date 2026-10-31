@echo off
setlocal EnableExtensions
title ORACULOS.TS - V10
echo.
echo ========================================================
echo   ORACULOS.TS - V10: TRAFEGO ORGANICO
echo   GOOGLE E BING ENXERGANDO O SITE DE VERDADE
echo ========================================================
echo.

set "PACOTE=%~dp0"
set "PACOTE=%PACOTE:~0,-1%"
set "ARQUIVOS=%PACOTE%\V10_ARQUIVOS"
set "PROJETO=%PACOTE%\Oraculos.ts-V10"
set "BRANCH=feat/v10-trafego-organico-20261031"
set "REPO=brasilportalvip-png/Oraculos.ts"

echo Pasta do pacote : "%PACOTE%"
echo Pasta do projeto: "%PROJETO%"
echo.

where git >nul 2>nul || goto :git_error
where node >nul 2>nul || goto :node_error
if not exist "%ARQUIVOS%\src\seo\paginasPublicas.ts" goto :zip_error

echo [1/11] Baixando o projeto atualizado do GitHub...
if exist "%PROJETO%\.git\" goto :atualizar_clone
if exist "%PROJETO%\" rmdir /S /Q "%PROJETO%"
git clone "https://github.com/%REPO%.git" "%PROJETO%" || goto :clone_error
goto :clone_ok
:atualizar_clone
git -C "%PROJETO%" fetch origin main || goto :clone_error
git -C "%PROJETO%" checkout -f -B main origin/main || goto :clone_error
git -C "%PROJETO%" clean -fd -e node_modules || goto :clone_error
:clone_ok

echo [2/11] Copiando as atualizacoes da V10 para o projeto...
robocopy "%ARQUIVOS%" "%PROJETO%" /E /NFL /NDL /NJH /NJS /NP /R:2 /W:1
if errorlevel 8 goto :copy_error
copy /Y "%~f0" "%PROJETO%\INSTALAR_TESTAR_E_ABRIR_PR_V10.cmd" >nul

cd /d "%PROJETO%" || goto :repo_error

echo [3/11] Abrindo a branch da V10...
git switch -C "%BRANCH%" || goto :branch_error

echo [4/11] Instalando dependencias (pode demorar alguns minutos)...
call npx -y npm@10.9.2 ci --no-audit --no-fund || goto :fail
echo [5/11] Conferindo seguranca das dependencias (mesma regra do GitHub)...
call npx -y npm@10.9.2 audit --omit=dev --audit-level=high || goto :audit_error
echo [6/11] Verificando TypeScript...
call npm run lint || goto :fail
echo [7/11] Executando todos os testes automaticos...
call npm test || goto :fail
echo [8/11] Validando imagens e arquivos oficiais...
call npm run validate:assets || goto :fail
echo [9/11] Gerando versao de producao...
call npm run build || goto :fail
call npm run smoke:serverless || goto :fail
call npm run smoke:production || goto :fail

echo [10/11] TESTE DE USUARIO REAL (navegador de verdade, computador e celular)...
call npx -y npm@10.9.2 install --no-save --no-audit --no-fund playwright@1 || goto :e2e_setup_error
call npx playwright install chromium || goto :e2e_setup_error
call node scripts\e2e-usuario-real.cjs
set "E2E=%errorlevel%"
if exist "TESTE_USUARIO_REAL\relatorio.html" start "" "TESTE_USUARIO_REAL\relatorio.html"
if not "%E2E%"=="0" goto :e2e_error

echo [11/11] Enviando ao GitHub e abrindo o Pull Request...
git config user.email >nul 2>nul || git config user.email "brasilportalvip@gmail.com"
git config user.name >nul 2>nul || git config user.name "brasilportalvip-png"
git config core.autocrlf false
git add -A
git commit -m "feat: SEO organico - paginas prontas para buscadores, blog, sitemaps e dados estruturados (V10)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01VZGem7ThS5peZNyxHDvSYH" || goto :commit_error
git push -u --force origin "%BRANCH%" || goto :push_error

where gh >nul 2>nul || goto :pr_browser
gh pr create --repo "%REPO%" --base main --head "%BRANCH%" --title "V10: trafego organico - paginas prontas para Google e Bing, blog e sitemaps" --body-file "LEIA-ME-CORRECAO-V10.txt" >nul 2>nul
gh pr view "%BRANCH%" --repo "%REPO%" --web && goto :done
:pr_browser
start "" "https://github.com/%REPO%/compare/main...%BRANCH%?expand=1"
echo No GitHub, clique em "Create pull request".

:done
echo.
echo ========================================================
echo   CONCLUIDO COM SUCESSO
echo ========================================================
echo O relatorio do teste de usuario real foi aberto no navegador.
echo Aguarde os testes do GitHub ficarem verdes e clique em "Merge pull request".
echo Depois que a Vercel publicar: npm run seo:indexnow  (nesta pasta) e reenvie o sitemap no Google Search Console.
pause
exit /b 0

:e2e_setup_error
echo ERRO: nao foi possivel instalar o navegador de teste (Playwright/Chromium). Verifique a internet e rode de novo.
goto :stop
:e2e_error
echo ERRO: o teste de usuario real encontrou problema GRAVE (veja o relatorio que abriu). Nada foi enviado ao GitHub.
echo Me mande o print do relatorio para eu corrigir.
goto :stop
:audit_error
echo ERRO: ha vulnerabilidade alta/critica nas dependencias (veja a lista acima). Nada foi enviado ao GitHub.
goto :stop
:git_error
echo ERRO: Git nao encontrado. Instale em https://git-scm.com e rode de novo.
goto :stop
:node_error
echo ERRO: Node.js nao encontrado. Instale a versao 22 em https://nodejs.org e rode de novo.
goto :stop
:zip_error
echo ERRO: a pasta V10_ARQUIVOS nao foi encontrada ao lado deste instalador.
echo Extraia o ZIP inteiro (use "Extrair tudo") e rode o instalador de dentro da pasta extraida.
goto :stop
:clone_error
echo ERRO: nao foi possivel baixar o projeto do GitHub. Verifique a internet e o login do GitHub.
goto :stop
:copy_error
echo ERRO: falha ao copiar os arquivos da V10. Feche programas abertos nessa pasta e rode de novo.
goto :stop
:repo_error
echo ERRO: nao foi possivel abrir a pasta do projeto.
goto :stop
:branch_error
echo ERRO: nao foi possivel abrir a branch.
goto :stop
:commit_error
echo ERRO: nao foi possivel criar o commit.
goto :stop
:push_error
echo ERRO: nao foi possivel enviar ao GitHub. Confira se esta logado (git / gh auth login).
goto :stop
:fail
echo ERRO: uma verificacao falhou (veja a mensagem acima). Nada foi enviado ao GitHub.
:stop
echo.
pause
exit /b 1
