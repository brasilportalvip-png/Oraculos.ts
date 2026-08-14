# Integração Android, TWA, Google Play e PWA — ORACULOS.TS

Este documento técnico consolida a arquitetura, configurações de build, políticas do Google Play, permissões de sistema e Digital Asset Links para o aplicativo **ORACULOS.TS**.

---

## 1. Identificação do Aplicativo (Preservação Estrita)

* **Nome do Aplicativo**: ORACULOS.TS — Tarot, Astrologia e Oráculos Online
* **Package Name / Application ID**: `br.com.oraculos.app` (ou o package name registrado no Google Play Console)
* **Domínio Oficial**: `https://oraculos-ts.vercel.app`
* **Arquitetura Homologada**: Trusted Web Activity (TWA) com fallback para Chrome Custom Tabs e PWA instalável.

> **Regra de Ouro**: Nunca alterar o `package_name` ou as chaves de assinatura (`keystore` / `upload-key.jks`) de um aplicativo já em esteira de testes fechados no Google Play Console, sob pena de perda de histórico de atualizações e rejeição de upload do bundle `.aab`.

---

## 2. Digital Asset Links (`.well-known/assetlinks.json`)

Para habilitar a experiência em tela cheia (sem barra de URL do navegador no Android TWA) e associar deep links e App Links com verificação automática (`autoVerify="true"`):

### Endpoint de Produção:
`https://oraculos-ts.vercel.app/.well-known/assetlinks.json`

### Conteúdo Configurado:
```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.get_login_creds"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "br.com.oraculos.app",
      "sha256_cert_fingerprints": [
        "14:6D:E9:44:C5:9F:9C:23:86:60:A2:68:12:44:FE:33:4F:84:1B:6F:AC:6E:A4:F1:22:03:77:4F:21:76:AB:3D"
      ]
    }
  }
]
```

---

## 3. Configuração do `AndroidManifest.xml` (Princípio do Menor Privilégio)

O aplicativo solicita estritamente as permissões essenciais para conexão de rede e atendimento interativo:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="br.com.oraculos.app">

    <!-- Permissões Estritas e Necessárias -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Opcionais apenas se habilitado recurso de áudio/vídeo em tempo real -->
    <!-- <uses-permission android:name="android.permission.RECORD_AUDIO" /> -->
    <!-- <uses-permission android:name="android.permission.CAMERA" /> -->

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.OraculosTS">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.LauncherActivity">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- App Links com Verificação Automática do Domínio -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="oraculos-ts.vercel.app"
                    android:pathPrefix="/" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 4. Conformidade com as Políticas do Google Play

### A. Data Safety (Segurança dos Dados)
* **Dados Pessoais Coletados**: Nome, e-mail e data de nascimento (opcional para Mapa Astral/Numerologia, com consentimento expresso).
* **Finalidade**: Prestação de serviços oraculares, autenticação e suporte.
* **Criptografia**: Todos os dados são transmitidos via HTTPS/TLS 1.3 e armazenados no Google Cloud Firestore com regras de segurança ativas.
* **Exclusão de Conta**: Rota web e in-app disponível em `/conta/excluir` ou via solicitação direta em conformidade com o Artigo 18 da LGPD.

### B. Pagamentos e Recargas de Minutos
* Transações web são processadas via gateway oficial Mercado Pago com idempotência e auditoria de ledger no backend.
* O fluxo Android respeita as diretrizes de faturamento e serviços pessoais do Google Play.

### C. Transparência de Inteligência Artificial
* Todos os atendentes virtuais são explicitamente identificados com rótulos `[Atendente Virtual IA]`.
* É vedada a simulação de comportamento humano ou promessas enganosas.

---

## 5. Roteiro de Atualização de Versão no Google Play Console

1. No `build.gradle` do módulo `app`:
   - Incrementar `versionCode` (ex: `24` -> `25`).
   - Atualizar `versionName` (ex: `"2.4.0"` -> `"2.4.1"`).
2. Gerar o Android App Bundle assinado:
   ```bash
   ./gradlew bundleRelease
   ```
3. Fazer o upload do arquivo `app-release.aab` na faixa de **Teste Fechado (Closed Testing)** no Google Play Console.
4. Validar o relatório de pré-lançamento (Pre-launch Report) quanto a falhas em dispositivos reais, ANRs e crashes de inicialização.
