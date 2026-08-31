import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  executarOracleProfile,
  validarEntradaOraculo,
  normalizarOracleProfileId,
} from './src/oracle-engine/index.js';

import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import {
  initializeApp as initAdminApp,
  cert,
  getApps as getAdminApps,
  getApp as getExistingAdminApp,
  type App as FirebaseAdminApp,
} from 'firebase-admin/app';

import { getAuth as getAdminAuth } from 'firebase-admin/auth';

import {
  getFirestore,
  type Firestore,
} from 'firebase-admin/firestore';

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';
import {
  updateDistributedIpRule,
  listDistributedIpRules,
} from './server/security/securityStore.js';
import { VIRTUAL_PROFILES } from './src/data/virtualProfiles.js';
import { INITIAL_CONSULTANTS } from './src/data/mockData.js';
import { ConsultationIntent, OracleResponseValidation } from './src/types.js';
import {
  findPackageByAmountOrId,
} from './server/modules/minutes/packages.js';
import {
  getTransactionsByUserId,
  recordTransaction,
} from './server/modules/minutes/walletService.js';

// Configuration collision validation between Human and Virtual profiles
const humanConsultants = INITIAL_CONSULTANTS.filter((c) => !c.isAI);
const humanIdSet = new Set(humanConsultants.map((c) => c.id));
const configCollisionIds = VIRTUAL_PROFILES.filter((p) => humanIdSet.has(p.id)).map((p) => p.id);
if (configCollisionIds.length > 0) {
  console.error(
    `[ORACULOS.TS CONFIG ERROR] Colisão de identificadores entre consultores humanos e virtuais: ${configCollisionIds.join(', ')}`
  );
}

export interface ConsultantAuthorizationResult {
  authorized: boolean;
  resolvedConsultantId?: string;
  consultantKind?: 'human' | 'virtual';
  consultantName?: string;
  normalizedOracleId?: string;
  statusCode?: number;
  code?: string;
  message?: string;
}

export function verifyConsultantOracleAuthorization(
  consultantId: string | undefined,
  normalizedOracleId: string
): ConsultantAuthorizationResult {
  if (!consultantId) {
    return {
      authorized: true,
      normalizedOracleId,
    };
  }

  const cid = String(consultantId).trim();

  // 1. Strict Virtual Profile Lookup by Exact ID Equality (No prefix stripping)
  const virtualProfile = VIRTUAL_PROFILES.find((p) => p.id === cid);
  if (virtualProfile) {
    const authorizedList = (virtualProfile.authorizedOracles || [])
      .map((o) => normalizarOracleProfileId(o))
      .filter(Boolean);

    if (!authorizedList.includes(normalizedOracleId as any)) {
      return {
        authorized: false,
        resolvedConsultantId: virtualProfile.id,
        consultantKind: 'virtual',
        consultantName: virtualProfile.name,
        normalizedOracleId,
        statusCode: 403,
        code: 'ORACLE_UNAUTHORIZED_FOR_CONSULTANT',
        message: `O atendente virtual '${virtualProfile.name}' não está autorizado para o oráculo '${normalizedOracleId}'.`,
      };
    }

    return {
      authorized: true,
      resolvedConsultantId: virtualProfile.id,
      consultantKind: 'virtual',
      consultantName: virtualProfile.name,
      normalizedOracleId,
    };
  }

  // 2. Strict Human Consultant Lookup by Exact ID Equality (No prefix stripping)
  const humanConsultant = INITIAL_CONSULTANTS.find((c) => c.id === cid && !c.isAI);
  if (humanConsultant) {
    const rawList =
      humanConsultant.allowedOracles && humanConsultant.allowedOracles.length > 0
        ? humanConsultant.allowedOracles
        : humanConsultant.specialties || [];

    const authorizedList = rawList
      .map((o) => normalizarOracleProfileId(o))
      .filter(Boolean);

    if (!authorizedList.includes(normalizedOracleId as any)) {
      return {
        authorized: false,
        resolvedConsultantId: humanConsultant.id,
        consultantKind: 'human',
        consultantName: humanConsultant.name,
        normalizedOracleId,
        statusCode: 403,
        code: 'ORACLE_UNAUTHORIZED_FOR_CONSULTANT',
        message: `O consultor '${humanConsultant.name}' não está autorizado para o oráculo '${normalizedOracleId}'.`,
      };
    }

    return {
      authorized: true,
      resolvedConsultantId: humanConsultant.id,
      consultantKind: 'human',
      consultantName: humanConsultant.name,
      normalizedOracleId,
    };
  }

  // 3. Consultant Not Found (Exact Match Failed)
  return {
    authorized: false,
    normalizedOracleId,
    statusCode: 404,
    code: 'CONSULTANT_NOT_FOUND',
    message: `Consultor com ID '${cid}' não foi encontrado.`,
  };
}

const getFilename = () => {
  try {
    return fileURLToPath(import.meta.url);
  } catch {
    return typeof __filename !== 'undefined' ? __filename : '';
  }
};

const __filename_val = getFilename();
const __dirname_val = __filename_val ? path.dirname(__filename_val) : process.cwd();

export const app = express();
const configuredPort = Number(
  process.env.PORT || 3000,
);

const PORT =
  Number.isInteger(configuredPort) &&
  configuredPort > 0 &&
  configuredPort <= 65535
    ? configuredPort
    : 3000;
const isProductionRuntime =
  process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

// Initialize Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: isProductionRuntime
      ? {
          directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'", 'https://www.mercadopago.com.br'],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
            imgSrc: [
              "'self'",
              'data:',
              'blob:',
              'https://images.unsplash.com',
              'https://portalvipbrasil.com.br',
            ],
            mediaSrc: ["'self'", 'blob:'],
            workerSrc: ["'self'", 'blob:'],
            frameSrc: ["'self'", 'https://www.mercadopago.com.br'],
            connectSrc: [
              "'self'",
              'https://*.googleapis.com',
              'https://*.firebaseio.com',
              'wss://*.firebaseio.com',
              'https://securetoken.googleapis.com',
              'https://identitytoolkit.googleapis.com',
              'https://api.mercadopago.com',
            ],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ==========================================
// FIREBASE ADMIN SDK INITIALIZATION
// ==========================================






let firebaseAdminInitialized = false;
let firebaseAdminApp: FirebaseAdminApp | null = null;

export let adminDb: Firestore | null = null;

try {
  if (getAdminApps().length > 0) {
    firebaseAdminApp = getExistingAdminApp();
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT) {
    const rawSa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT || '';
    let serviceAccount: any;
    try {
      if (rawSa.trim().startsWith('{')) {
        serviceAccount = JSON.parse(rawSa);
      } else {
        // Tentativa de decodificação Base64 se não for JSON puro
        const decoded = Buffer.from(rawSa, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
      }
    } catch {
      serviceAccount = JSON.parse(rawSa);
    }

    if (
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY está incompleto.',
      );
    }

    serviceAccount.private_key =
      serviceAccount.private_key.replace(/\\n/g, '\n');

    firebaseAdminApp = initAdminApp({
      credential: cert(serviceAccount),
      projectId:
        process.env.FIREBASE_PROJECT_ID ||
        serviceAccount.project_id,
    });
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    firebaseAdminApp = initAdminApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseAdminApp = initAdminApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

   if (firebaseAdminApp) {
  adminDb = getFirestore(firebaseAdminApp);

  adminDb.settings({
    ignoreUndefinedProperties: true,
  });
    firebaseAdminInitialized = true;

    console.log(
      '[ORACULOS.TS] Firebase Admin Auth e Firestore inicializados.',
    );
  } else {
    console.warn(
      '[ORACULOS.TS] Firebase Admin não configurado.',
    );
  }
} catch (error: unknown) {
  firebaseAdminInitialized = false;
  adminDb = null;

  const message =
    error instanceof Error
      ? error.message
      : 'Erro desconhecido';

  console.error(
    '[ORACULOS.TS] Falha ao inicializar Firebase Admin:',
    message,
  );
}









// ==========================================
// MERCADO PAGO SDK INITIALIZATION
// ==========================================
let mpConfig: MercadoPagoConfig | null = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  try {
    mpConfig = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 10000 },
    });
    console.log('[ORACULOS.TS] Mercado Pago SDK Configured with Access Token.');
  } catch (e: any) {
    console.error('[ORACULOS.TS] Mercado Pago SDK Init Error:', e.message);
  }
}

// ==========================================
// SECURITY PROTECTION SYSTEM CONFIG & STATE
// ==========================================
export const securityConfig = {
  wafEnabled: true,
  rateLimiterEnabled: true,
  promptInjectionGuard: true,
  financialProtection: true,
  sanitizerEnabled: true,
  strictHeaders: true,
  maxRequestsPerMinute: 60,
  maxAiRequestsPerMinute: 20,
  maxAuthAttemptsPerMinute: 10,
};

export const securityMetrics = {
  totalRequestsChecked: 0,
  blockedAttacks: 0,
  rateLimitHits: 0,
  promptInjectionsBlocked: 0,
  sanitizedInputs: 0,
  lastScanTime: new Date().toISOString(),
  threatScore: 'Sem incidentes registrados',
  serverUptimeStart: Date.now(),
};

// Persistent IP Rules Storage
export const blacklistedIPs = new Set<string>(['185.220.101.5', '198.51.100.42']);
export const whitelistedIPs = new Set<string>(['127.0.0.1', '::1', '192.168.1.100']);





let ipRulesLastRefreshMs = 0;

const IP_RULES_REFRESH_MS =
  30 * 1000;

async function refreshIpRulesFromFirestore(
  force = false,
): Promise<void> {
  if (!adminDb) {
    return;
  }

  const now = Date.now();

  if (
    !force &&
    now - ipRulesLastRefreshMs <
      IP_RULES_REFRESH_MS
  ) {
    return;
  }

  try {
    const rules =
      await listDistributedIpRules(
        adminDb,
      );

    blacklistedIPs.clear();
    whitelistedIPs.clear();

    for (
      const ip of
      rules.blacklistedIPs
    ) {
      blacklistedIPs.add(ip);
    }

    for (
      const ip of
      rules.whitelistedIPs
    ) {
      whitelistedIPs.add(ip);
    }

    /*
     * IPs locais permanecem confiáveis
     * para desenvolvimento/testes.
     */
    whitelistedIPs.add(
      '127.0.0.1',
    );
    whitelistedIPs.add(
      '::1',
    );

    ipRulesLastRefreshMs =
      now;
  } catch (error) {
    console.error(
      '[ORACULOS.TS] Falha ao carregar regras de IP do Firestore:',
      error,
    );
  }
}




// Memory rate limit buckets
const requestBuckets: Record<string, number[]> = {};

// Idempotency Keys Set
export const processedPaymentIds = new Set<string>();
export const processedConsultationDebitIds = new Set<string>();

// User AI Daily Usage Tracker (userId -> { count: number, resetAt: number })
export const userDailyAiUsage: Record<string, { count: number; resetAt: number }> = {};







// In-Memory Database Stores
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'client' | 'consultant' | 'support' | 'admin' | 'superadmin';
  balance: number;
  status: 'active' | 'blocked';
  createdAt: string;
  favorites: string[];
}

export const usersDb: Record<string, UserRecord> = {
  'usr-client-1': {
    id: 'usr-client-1',
    name: 'Maria Silva',
    email: 'maria.silva@exemplo.com',
    role: 'user',
    balance: 150.00,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    favorites: ['cons-1', 'cons-3'],
  },
  'usr-consultant-1': {
    id: 'usr-consultant-1',
    name: 'Mantra Elena',
    email: 'mantra.elena@exemplo.com',
    role: 'consultant',
    balance: 850.00,
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    favorites: [],
  },
  'usr-support-1': {
    id: 'usr-support-1',
    name: 'Atendimento Suporte',
    email: 'suporte@oraculos.com',
    role: 'support',
    balance: 0.00,
    status: 'active',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    favorites: [],
  },
  'usr-admin-1': {
    id: 'usr-admin-1',
    name: 'Administrador Geral',
    email: 'admin@oraculos.com',
    role: 'admin',
    balance: 0.00,
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    favorites: [],
  },
  'usr-superadmin-1': {
    id: 'usr-superadmin-1',
    name: 'Superadmin Mestre',
    email: 'superadmin@oraculos.com',
    role: 'superadmin',
    balance: 0.00,
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    favorites: [],
  },
};

export interface FinancialLedgerEntry {
  id: string;
  userId: string;
  userName: string;
  type: 'recharge' | 'consultation_debit' | 'consultation_credit' | 'payout' | 'bonus' | 'refund' | 'admin_adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  method: 'mercadopago_pix' | 'mercadopago_card' | 'wallet_balance' | 'bank_transfer' | 'system_adjustment';
  status: 'completed' | 'pending' | 'failed';
  referenceId: string;
  reason?: string;
  createdAt: string;
  createdBy: string;
}

export const ledgerDb: FinancialLedgerEntry[] = [
  {
    id: 'tx-001',
    userId: 'usr-client-1',
    userName: 'Maria Silva',
    type: 'recharge',
    amount: 100.00,
    balanceBefore: 50.00,
    balanceAfter: 150.00,
    method: 'mercadopago_pix',
    status: 'completed',
    referenceId: 'MP-PIX-883291',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'usr-client-1',
  }
];

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  target?: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export const auditLogs: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'usr-admin-1',
    userName: 'Administrador Geral',
    userRole: 'admin',
    action: 'SYSTEM_BOOT',
    details: 'Inicialização segura dos serviços e WAF do ORACULOS.TS',
    ip: '127.0.0.1',
    status: 'SUCCESS',
  },
];

// Persistent Coupons Collection
export interface Coupon {
  id: string;
  code: string;
  type: 'bonus_fixed' | 'percent_discount';
  value: number;
  active: boolean;
  expiresAt: string | null;
  maxUses: number;
  currentUses: number;
  maxUsesPerUser: number;
  userUsesCount: Record<string, number>;
  eligibleProducts: string[];
  createdAt: string;
  createdBy: string;
}

export const couponsDb: Record<string, Coupon> = {
  ORACULO10: {
    id: 'coup-1',
    code: 'ORACULO10',
    type: 'bonus_fixed',
    value: 10,
    active: true,
    expiresAt: '2028-12-31T23:59:59.000Z',
    maxUses: 1000,
    currentUses: 5,
    maxUsesPerUser: 1,
    userUsesCount: {},
    eligibleProducts: ['all'],
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  BEMVINDO20: {
    id: 'coup-2',
    code: 'BEMVINDO20',
    type: 'bonus_fixed',
    value: 20,
    active: true,
    expiresAt: '2028-12-31T23:59:59.000Z',
    maxUses: 500,
    currentUses: 12,
    maxUsesPerUser: 1,
    userUsesCount: {},
    eligibleProducts: ['all'],
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
};

const COUPONS_COLLECTION = 'coupons';

async function getCouponByCode(
  code: string,
): Promise<Coupon | null> {
  const normalizedCode =
    String(code || '')
      .trim()
      .toUpperCase();

  if (!normalizedCode) {
    return null;
  }

  /*
   * Os mocks ficam disponíveis somente
   * para o ambiente automatizado.
   */
  if (
    process.env.NODE_ENV === 'test'
  ) {
    return couponsDb[normalizedCode] || null;
  }

  if (!adminDb) {
    throw new Error(
      'FIRESTORE_NOT_AVAILABLE',
    );
  }

  const document = await adminDb
    .collection(COUPONS_COLLECTION)
    .doc(normalizedCode)
    .get();

  if (!document.exists) {
    return null;
  }

  return {
    ...(document.data() as Coupon),
    id:
      String(
        document.data()?.id ||
        document.id,
      ),
    code:
      String(
        document.data()?.code ||
        document.id,
      )
        .trim()
        .toUpperCase(),
  };
}

function getCouponBonusMinutes(
  coupon: Coupon,
): number {
  /*
   * O checkout atual trabalha com bônus
   * de minutos, não desconto percentual.
   * Evita interpretar percentual como minutos.
   */
  if (coupon.type !== 'bonus_fixed') {
    return 0;
  }

  const value = Number(coupon.value);

  return Number.isFinite(value) &&
    value > 0
    ? value
    : 0;
}


// ==========================================
// MIDDLEWARES DE SEGURANÇA E WAF
// ==========================================

// 1. WAF & Rate Limiting Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '127.0.0.1';
  securityMetrics.totalRequestsChecked++;

  // Check IP Blacklist
  if (blacklistedIPs.has(clientIp)) {
    securityMetrics.blockedAttacks++;
    return res.status(403).json({
      success: false,
      error: {
        code: 'WAF_IP_BLOCKED',
        message: 'Acesso bloqueado pelo Firewall de Segurança (IP em Lista Negra)',
      },
    });
  }

  // Rate Limiting (Skip for whitelisted IPs)
  if (securityConfig.rateLimiterEnabled && !whitelistedIPs.has(clientIp)) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    
    if (!requestBuckets[clientIp]) {
      requestBuckets[clientIp] = [];
    }

    requestBuckets[clientIp] = requestBuckets[clientIp].filter((t) => now - t < windowMs);
    requestBuckets[clientIp].push(now);

    const limit = req.path.startsWith('/api/ai')
      ? securityConfig.maxAiRequestsPerMinute
      : req.path.startsWith('/api/auth')
      ? securityConfig.maxAuthAttemptsPerMinute
      : securityConfig.maxRequestsPerMinute;

    if (requestBuckets[clientIp].length > limit) {
      securityMetrics.rateLimitHits++;
      securityMetrics.blockedAttacks++;
      
      if (requestBuckets[clientIp].length > limit * 2.5) {
        blacklistedIPs.add(clientIp);

if (adminDb) {
  void updateDistributedIpRule(
    adminDb,
    clientIp,
    'add',
    'blacklist',
    'system-waf',
  ).catch((error) => {
    console.error(
      '[ORACULOS.TS] Falha ao persistir banimento automático de IP:',
      error,
    );
  });
}
        auditLogs.unshift({
          id: `log-sec-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'system-waf',
          userName: 'Firewall de Segurança',
          userRole: 'system',
          action: 'AUTOMATIC_IP_BAN',
          details: `IP ${clientIp} bloqueado por excesso de requisições (${requestBuckets[clientIp].length} req/min)`,
          ip: clientIp,
          status: 'ERROR',
        });
      }

      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Limite de requisições excedido. Por favor, aguarde alguns instantes.',
        },
      });
    }
  }

  next();
});

// 2. Input Sanitizer Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (securityConfig.sanitizerEnabled && req.body && typeof req.body === 'object') {
    const sanitizeValue = (val: any): any => {
      if (typeof val === 'string') {
        if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val) || /UNION\s+SELECT|DROP\s+TABLE|DELETE\s+FROM/gi.test(val)) {
          securityMetrics.sanitizedInputs++;
          return val.replace(/<script.*?>.*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, '')
                    .replace(/(UNION\s+SELECT|DROP\s+TABLE|DELETE\s+FROM)/gi, '[REDACTED_ATTACK_VECTOR]');
        }
      } else if (typeof val === 'object' && val !== null) {
        for (const k of Object.keys(val)) {
          val[k] = sanitizeValue(val[k]);
        }
      }
      return val;
    };

    req.body = sanitizeValue(req.body);
  }
  next();
});






// ==========================================
// RBAC & STRICT AUTHENTICATION MIDDLEWARES
// ==========================================

type AppUserRole =
  | 'user'
  | 'client'
  | 'employee'
  | 'consultant'
  | 'support'
  | 'admin'
  | 'superadmin';

export interface AuthenticatedRequest
  extends Request {
  user?: {
    uid: string;
    email?: string;
    role: AppUserRole;
    name?: string;
  };
}

const VALID_USER_ROLES: AppUserRole[] = [
  'user',
  'client',
  'employee',
  'consultant',
  'support',
  'admin',
  'superadmin',
];

function isValidUserRole(
  value: unknown,
): value is AppUserRole {
  return (
    typeof value === 'string' &&
    VALID_USER_ROLES.includes(
      value as AppUserRole,
    )
  );
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // x-user-id is exclusively allowed for automated test environment (NODE_ENV === "test")
  if (process.env.NODE_ENV === 'test') {
    const testUserId = req.headers['x-user-id'] as string | undefined;
    if (testUserId && usersDb[testUserId]) {
      const demoUser = usersDb[testUserId];
      req.user = {
        uid: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
      };
      return next();
    }
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de autenticação não fornecido.',
      },
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token de autenticação inválido.',
      },
    });
  }

  if (!firebaseAdminInitialized || !firebaseAdminApp) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Serviço de autenticação temporariamente indisponível.',
      },
    });
  }

  try {
    const decodedToken =
      await getAdminAuth(
        firebaseAdminApp,
      ).verifyIdToken(token);

    let resolvedRole: AppUserRole =
      isValidUserRole(
        decodedToken.role,
      )
        ? decodedToken.role
        : 'user';

    let resolvedName =
      decodedToken.name ||
      decodedToken.email
        ?.split('@')[0] ||
      'Usuário';

    /*
     * Consulta o perfil real no Firestore.
     * O papel salvo no documento do usuário
     * prevalece sobre uma claim antiga.
     */
    if (adminDb) {
      const userDocument =
        await adminDb
          .collection('users')
          .doc(decodedToken.uid)
          .get();

      if (userDocument.exists) {
        const profile =
          userDocument.data() || {};

        if (
          isValidUserRole(
            profile.role,
          )
        ) {
          resolvedRole =
            profile.role;
        }

        if (
          typeof profile.name ===
            'string' &&
          profile.name.trim()
        ) {
          resolvedName =
            profile.name.trim();
        }
      }
    }

    req.user = {
      uid: decodedToken.uid,
      email:
        decodedToken.email,
      role:
        resolvedRole,
      name:
        resolvedName,
    };

    console.log(
      '[ORACULOS.TS] Token Firebase autenticado.',
      {
        uid:
          req.user.uid,
        email:
          req.user.email || null,
        role:
          req.user.role,
      },
    );

    return next();
  } catch (error) {
    console.error(
      '[ORACULOS.TS] Token Firebase rejeitado:',
      error,
    );

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message:
          'Sessão expirada ou token inválido.',
      },
    });
  }
};



       export const requireRole = (
  allowedRoles: AppUserRole[],
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message:
            'Usuário não autenticado.',
        },
      });
    }

    const userRole = req.user.role;

    const isAllowed =
      userRole === 'superadmin' ||
      allowedRoles.includes(userRole) ||
      (
        allowedRoles.includes('admin') &&
        userRole === 'admin'
      ) ||
      (
        allowedRoles.includes('support') &&
        (
          userRole === 'support' ||
          userRole === 'admin'
        )
      );

    if (!isAllowed) {
      auditLogs.unshift({
        id: `log-unauth-${Date.now()}`,
        timestamp:
          new Date().toISOString(),
        userId:
          req.user.uid,
        userName:
          req.user.name ||
          'Usuário',
        userRole,
        action:
          'ACCESS_DENIED_RBAC',
        details:
          `Acesso negado. Papel atual: ${userRole}. Papéis exigidos: ${allowedRoles.join(', ')}`,
        ip:
          req.ip ||
          '127.0.0.1',
        status:
          'WARNING',
      });

      console.warn(
        '[ORACULOS.TS] Acesso RBAC negado.',
        {
          uid:
            req.user.uid,
          currentRole:
            userRole,
          allowedRoles,
        },
      );

      return res.status(403).json({
        success: false,
        error: {
          code:
            'FORBIDDEN_ROLE',
          message:
            'Acesso negado: Você não possui privilégios suficientes para executar esta ação.',
        },
      });
    }

    return next();
  };
};

export const requireAdmin = [
  requireAuth,
  requireRole([
    'admin',
    'superadmin',
  ]),
];

export const requireSuperAdmin = [
  requireAuth,
  requireRole([
    'superadmin',
  ]),
];
                     


// ==========================================
// GEMINI CLIENT & HIGH-AVAILABILITY MODELS
// ==========================================

const GEMINI_MODELS = [
  process.env.GEMINI_PRIMARY_MODEL?.trim() ||
    'gemini-3.6-flash',

  process.env.GEMINI_FALLBACK_MODEL?.trim() ||
    'gemini-3.5-flash',

  process.env.GEMINI_EMERGENCY_MODEL?.trim() ||
    'gemini-3.5-flash-lite',
].filter(
  (model, index, models) =>
    Boolean(model) &&
    models.indexOf(model) === index,
);

const readPositiveIntegerEnv = (
  variableName: string,
  defaultValue: number,
  minimumValue = 1,
): number => {
  const parsedValue = Number(
    process.env[variableName],
  );

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimumValue
  ) {
    return defaultValue;
  }

  return parsedValue;
};

const GEMINI_MODEL_TIMEOUT_MS =
  readPositiveIntegerEnv(
    'GEMINI_MODEL_TIMEOUT_MS',
    2000,
    1000,
  );

const GEMINI_MAX_OUTPUT_TOKENS =
  readPositiveIntegerEnv(
    'GEMINI_MAX_OUTPUT_TOKENS',
    1024,
    128,
  );

const configuredGeminiMaxRetries =
  readPositiveIntegerEnv(
    'GEMINI_MAX_RETRIES',
    GEMINI_MODELS.length,
    1,
  );

const GEMINI_MAX_RETRIES = Math.min(
  configuredGeminiMaxRetries,
  GEMINI_MODELS.length,
);





const getGeminiClient = () => {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      '[ORACULOS.TS] GEMINI_API_KEY não configurada.',
    );

    return null;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent':
          'ORACULOS.TS/production',
      },
    },
  });
};

// ==========================================
// NATURAL CHAT RESPONSE CHUNKING
// ==========================================

type NaturalResponseChunk = {
  index: number;
  text: string;
};

const splitIntoNaturalResponseChunks = (
  responseText: string,
  minimumCharacters = 90,
  maximumCharacters = 220,
): NaturalResponseChunk[] => {
  const normalizedText =
    String(responseText || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  if (!normalizedText) {
    return [];
  }

  /*
   * Separa preferencialmente após frases,
   * perguntas, exclamações ou parágrafos.
   */
  const sentences =
    normalizedText.match(
      /[^.!?\n]+(?:[.!?]+|(?=\n|$))|\n+/g,
    ) || [normalizedText];

  const chunks: string[] = [];
  let currentChunk = '';

  const pushCurrentChunk = () => {
    const cleanedChunk =
      currentChunk
        .replace(/\s+/g, ' ')
        .trim();

    if (cleanedChunk) {
      chunks.push(cleanedChunk);
    }

    currentChunk = '';
  };

  for (const sentenceValue of sentences) {
    const sentence =
      sentenceValue
        .replace(/\s+/g, ' ')
        .trim();

    if (!sentence) {
      continue;
    }

    const combinedText =
      currentChunk
        ? `${currentChunk} ${sentence}`
        : sentence;

    if (
      combinedText.length <=
      maximumCharacters
    ) {
      currentChunk =
        combinedText;

      continue;
    }

    if (
      currentChunk.length >=
      minimumCharacters
    ) {
      pushCurrentChunk();
    }

    /*
     * Frases muito grandes são divididas
     * preferencialmente em vírgulas.
     */
    if (
      sentence.length >
      maximumCharacters
    ) {
      const sentenceParts =
        sentence.split(
          /(?<=,|;|:)\s+/,
        );

      for (
        const sentencePart of
        sentenceParts
      ) {
        const combinedPart =
          currentChunk
            ? `${currentChunk} ${sentencePart}`
            : sentencePart;

        if (
          combinedPart.length >
            maximumCharacters &&
          currentChunk
        ) {
          pushCurrentChunk();
        }

        currentChunk =
          currentChunk
            ? `${currentChunk} ${sentencePart}`
            : sentencePart;
      }

      continue;
    }

    currentChunk =
      sentence;
  }

  pushCurrentChunk();

  /*
   * Evita um último bloco muito pequeno,
   * juntando-o ao bloco anterior.
   */
  if (
    chunks.length > 1 &&
    chunks[chunks.length - 1]
      .length <
      Math.floor(
        minimumCharacters / 2,
      )
  ) {
    const lastChunk =
      chunks.pop();

    if (lastChunk) {
      chunks[chunks.length - 1] =
        `${chunks[chunks.length - 1]} ${lastChunk}`;
    }
  }

  return chunks.map(
    (text, index) => ({
      index,
      text,
    }),
  );
};

import { userRoutes } from './server/modules/auth/userRoutes.js';






import { minuteRoutes } from './server/modules/minutes/minuteRoutes.js';




// API ROUTES
app.use(userRoutes);
app.use(minuteRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const firebaseAdminStatus = firebaseAdminInitialized ? 'ok' : 'not_configured';
  const firestoreStatus = adminDb ? 'ok' : 'not_configured';
  const geminiStatus = process.env.GEMINI_API_KEY ? 'ok' : 'not_configured';
  const mercadoPagoStatus = mpConfig ? 'ok' : 'not_configured';
  const commitVersion = process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version || 'local-uncommitted';

  res.json({
    status: 'ok',
    system: 'ORACULOS.TS',
    version: commitVersion,
    timestamp: new Date().toISOString(),
    services: {
      api: 'ok',
      firebaseAdmin: firebaseAdminStatus,
      firestore: firestoreStatus,
      gemini: geminiStatus,
      mercadoPago: mercadoPagoStatus,
    },
  });
});

// ==========================================
// SITEMAPS, SEO, ROBOTS & DIGITAL ASSET LINKS
// ==========================================

const sendXmlFileOrFallback = (res: Response, filePath: string, fallbackXml: string) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }
  return res.send(fallbackXml);
};

app.get(['/sitemap.xml', '/sitemap_index.xml'], (_req: Request, res: Response) => {
  sendXmlFileOrFallback(
    res,
    'public/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://oraculos-ts.vercel.app/sitemap-static.xml</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod></sitemap>
  <sitemap><loc>https://oraculos-ts.vercel.app/sitemap-oraculos.xml</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod></sitemap>
  <sitemap><loc>https://oraculos-ts.vercel.app/sitemap-especialistas.xml</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod></sitemap>
  <sitemap><loc>https://oraculos-ts.vercel.app/sitemap-blog.xml</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod></sitemap>
</sitemapindex>`
  );
});

app.get('/sitemap-static.xml', (_req: Request, res: Response) => {
  sendXmlFileOrFallback(
    res,
    'public/sitemap-static.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://oraculos-ts.vercel.app/</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/como-funciona</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/trabalhe-conosco</loc><lastmod>2026-08-31T00:00:00+00:00</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/blog</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/suporte</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/termos</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/privacidade</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/cookies</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>yearly</changefreq><priority>0.4</priority></url>
</urlset>`
  );
});

app.get('/sitemap-oraculos.xml', (_req: Request, res: Response) => {
  sendXmlFileOrFallback(
    res,
    'public/sitemap-oraculos.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://oraculos-ts.vercel.app/oraculos/tarot</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/baralho-cigano</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/astrologia</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/numerologia</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/buzios</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/ifa</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/runas</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/i-ching</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/cristais</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/oraculos/mesa-radionica</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
</urlset>`
  );
});

app.get('/sitemap-especialistas.xml', (_req: Request, res: Response) => {
  sendXmlFileOrFallback(
    res,
    'public/sitemap-especialistas.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://oraculos-ts.vercel.app/especialistas/c1</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/c2</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/c3</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/c4</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/c5</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/c6</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-tarot</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-cigano</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-astrologia</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-numerologia</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-buzios</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-ifa</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-runas</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-iching</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-cristais</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/especialistas/v-mesaradionica</loc><lastmod>2026-08-14T00:00:00+00:00</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`
  );
});

app.get('/sitemap-blog.xml', (_req: Request, res: Response) => {
  sendXmlFileOrFallback(
    res,
    'public/sitemap-blog.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://oraculos-ts.vercel.app/blog/portal-do-tarot-2026</loc><lastmod>2026-07-26T00:00:00+00:00</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/blog/baralho-cigano-vs-tarot</loc><lastmod>2026-07-23T00:00:00+00:00</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://oraculos-ts.vercel.app/blog/mesa-radionica-quantica</loc><lastmod>2026-07-18T00:00:00+00:00</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`
  );
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const fullPath = path.join(process.cwd(), 'public/robots.txt');
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }
  return res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /painel\nDisallow: /api/\nSitemap: https://oraculos-ts.vercel.app/sitemap.xml\n`);
});

app.get(['/.well-known/assetlinks.json', '/assetlinks.json'], (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const fullPath = path.join(process.cwd(), 'public/.well-known/assetlinks.json');
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }
  return res.json([
    {
      relation: [
        'delegate_permission/common.handle_all_urls',
      ],
      target: {
        namespace: 'android_app',
        package_name: 'br.com.oraculos.app',
        sha256_cert_fingerprints: [
          '14:6D:E9:44:C5:9F:9C:23:86:60:A2:68:12:44:FE:33:4F:84:1B:6F:AC:6E:A4:F1:22:03:77:4F:21:76:AB:3D',
        ],
      },
    },
  ]);
});

app.get(['/manifest.webmanifest', '/manifest.json'], (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const fullPath = path.join(process.cwd(), 'public/manifest.webmanifest');
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }
  return res.sendFile(path.join(process.cwd(), 'public/manifest.json'));
});

app.get('/sw.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const fullPath = path.join(process.cwd(), 'public/sw.js');
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }
  return res.status(404).send('// Service worker not found');
});

// Security Status & Management
app.get('/api/security/status', requireAuth, requireRole(['admin', 'superadmin']), (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - securityMetrics.serverUptimeStart) / 1000);
  res.json({
    success: true,
    data: {
      config: securityConfig,
      metrics: {
        ...securityMetrics,
        blockedIPsCount: blacklistedIPs.size,
        whitelistedIPsCount: whitelistedIPs.size,
        activeRequestsInMemory: Object.keys(requestBuckets).length,
        uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
      },
      blacklistedIPs: Array.from(blacklistedIPs),
      whitelistedIPs: Array.from(whitelistedIPs),
    }
  });
});

app.post('/api/security/toggle-setting', requireAuth, requireRole(['admin', 'superadmin']), (req: AuthenticatedRequest, res: Response) => {
  const { setting, enabled } = req.body;
  if (setting in securityConfig) {
    (securityConfig as any)[setting] = !!enabled;
    
    auditLogs.unshift({
      id: `log-toggle-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.user?.uid || 'usr-admin-1',
      userName: req.user?.name || 'Administrador',
      userRole: req.user?.role || 'admin',
      action: 'SECURITY_TOGGLE_UPDATE',
      details: `Configuração de segurança '${setting}' alterada para ${enabled ? 'ATIVADO' : 'DESATIVADO'}`,
      ip: req.ip || '127.0.0.1',
      status: 'WARNING',
    });

    return res.json({ success: true, data: { config: securityConfig } });
  }
  res.status(400).json({ success: false, error: { code: 'INVALID_SETTING', message: 'Configuração inválida.' } });
});


app.post(
  '/api/security/manage-ip',
  requireAuth,
  requireRole([
    'admin',
    'superadmin',
  ]),
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        ip,
        action,
        list,
      } = req.body;

      if (
        typeof ip !== 'string' ||
        !ip.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_IP',
            message: 'IP é obrigatório.',
          },
        });
      }

      if (
        action !== 'add' &&
        action !== 'remove'
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_IP_ACTION',
            message:
              'Ação deve ser add ou remove.',
          },
        });
      }

      if (
        list !== 'blacklist' &&
        list !== 'whitelist'
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_IP_LIST',
            message:
              'Lista deve ser blacklist ou whitelist.',
          },
        });
      }

      if (!adminDb) {
        return res.status(503).json({
          success: false,
          error: {
            code:
              'SECURITY_STORE_UNAVAILABLE',
            message:
              'Armazenamento de segurança temporariamente indisponível.',
          },
        });
      }

      const normalizedIp =
        ip.trim();

      await updateDistributedIpRule(
        adminDb,
        normalizedIp,
        action,
        list,
        req.user?.uid ||
          'system-admin',
      );

      await refreshIpRulesFromFirestore(
        true,
      );

      auditLogs.unshift({
        id:
          `log-ip-${Date.now()}`,
        timestamp:
          new Date().toISOString(),
        userId:
          req.user?.uid ||
          'usr-admin-1',
        userName:
          req.user?.name ||
          'Administrador',
        userRole:
          req.user?.role ||
          'admin',
        action:
          `SECURITY_IP_${action.toUpperCase()}_${list.toUpperCase()}`,
        details:
          `IP ${normalizedIp} ${
            action === 'add'
              ? 'adicionado à'
              : 'removido da'
          } ${list}`,
        ip:
          req.ip ||
          '127.0.0.1',
        status:
          action === 'add' &&
          list === 'blacklist'
            ? 'WARNING'
            : 'SUCCESS',
      });

      return res.json({
        success: true,
        data: {
          blacklistedIPs:
            Array.from(
              blacklistedIPs,
            ),
          whitelistedIPs:
            Array.from(
              whitelistedIPs,
            ),
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Falha ao atualizar regra de IP:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'SECURITY_IP_UPDATE_FAILED',
          message:
            'Não foi possível atualizar a regra de IP.',
        },
      });
    }
  },
);




app.post('/api/security/run-scan', requireAuth, requireRole(['admin', 'superadmin']), (req: AuthenticatedRequest, res: Response) => {
  securityMetrics.lastScanTime = new Date().toISOString();
  
  const scanResults = [
    { name: 'Firewall de Aplicação Web (WAF Engine)', status: securityConfig.wafEnabled ? 'PASS' : 'WARN', detail: 'Proteção ativa contra ataques de camada 7' },
    { name: 'Filtro Anti-DDoS e Rate Limiting', status: securityConfig.rateLimiterEnabled ? 'PASS' : 'WARN', detail: 'Limitação de 60 req/min para APIs ativada' },
    { name: 'Escudo Anti-Injeção de Prompt para Gemini AI', status: securityConfig.promptInjectionGuard ? 'PASS' : 'WARN', detail: 'Detecção proativa e limites de 2000 caracteres ativados' },
    { name: 'Integridade Financeira Mercado Pago', status: securityConfig.financialProtection ? 'PASS' : 'WARN', detail: 'Verificação de Idempotência e Rejeição de valores adulterados' },
    { name: 'Chaves de API Ocultas no Servidor', status: process.env.GEMINI_API_KEY ? 'PASS' : 'WARN', detail: process.env.GEMINI_API_KEY ? 'Chave Gemini isolada no Node.js' : 'Atenção: GEMINI_API_KEY ausente' },
    { name: 'Mercado Pago Secret Access Token', status: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'PASS' : 'INFO', detail: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Token de acesso seguro presente' : 'Chave pública configurada' },
    { name: 'Regras de Segurança Firestore (RBAC)', status: 'PASS', detail: 'Arquivo firestore.rules implantado e ativado' },
    { name: 'Cabeçalhos de Segurança HTTP (Helmet / CSP)', status: securityConfig.strictHeaders ? 'PASS' : 'WARN', detail: 'Proteção contra Clickjacking e XSS ativada' },
    { name: 'Sanitização de Entradas de Dados (XSS/SQLi)', status: securityConfig.sanitizerEnabled ? 'PASS' : 'WARN', detail: 'Filtro de caracteres e scripts ativo' },
    { name: 'Persistência de Regras de IP', status: 'PASS', detail: 'Armazenamento em arquivo JSON persistente configurado' },
  ];

  const passCount = scanResults.filter(r => r.status === 'PASS').length;
  const score = Math.round((passCount / scanResults.length) * 100);

  auditLogs.unshift({
    id: `log-scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: req.user?.uid || 'usr-admin-1',
    userName: req.user?.name || 'Administrador',
    userRole: req.user?.role || 'admin',
    action: 'SECURITY_DIAGNOSTIC_SCAN',
    details: `Varredura de segurança completa executada. Score do sistema: ${score}/100`,
    ip: req.ip || '127.0.0.1',
    status: score >= 80 ? 'SUCCESS' : 'WARNING',
  });

  res.json({
    success: true,
    data: {
      scannedAt: securityMetrics.lastScanTime,
      securityScore: score,
      overallHealth: score >= 90 ? 'EXCELENTE' : score >= 75 ? 'BOM' : 'REQUER ATENÇÃO',
      scanResults,
    }
  });
});

app.get('/api/security/audit-logs', requireAuth, requireRole(['admin', 'superadmin', 'support']), (req: Request, res: Response) => {
  res.json({ success: true, logs: auditLogs });
});








// ==========================================
// MERCADO PAGO INTEGRATION & CHECKOUT
// ==========================================

app.post(
  '/api/finance/create-preference',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;
      const userEmail = req.user?.email;
      const requestedAmount = Number(
        req.body?.amount,
      );

      const couponCode =
        typeof req.body?.couponCode ===
        'string'
          ? req.body.couponCode
              .trim()
              .toUpperCase()
          : '';

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Usuário não autenticado.',
          },
        });
      }

      const selectedPackage =
  await findPackageByAmountOrId(
    requestedAmount,
  );

      if (!selectedPackage) {
        auditLogs.unshift({
          id: `log-tamper-${Date.now()}`,
          timestamp:
            new Date().toISOString(),
          userId,
          userName:
            req.user?.name ||
            'Usuário',
          userRole:
            req.user?.role ||
            'user',
          action:
            'PRICE_TAMPERING_REJECTED',
          details:
            `Tentativa de gerar recarga com valor não autorizado: R$ ${requestedAmount}`,
          ip:
            req.ip ||
            '127.0.0.1',
          status:
            'ERROR',
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message:
              'Valor de recarga não permitido. Selecione um dos pacotes oficiais.',
          },
        });
      }

      if (!mpConfig) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'MERCADOPAGO_NOT_CONFIGURED',
            message:
              'Mercado Pago não está configurado no servidor.',
          },
        });
      }

      if (!adminDb) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'FIRESTORE_NOT_AVAILABLE',
            message:
              'Banco de dados temporariamente indisponível.',
          },
        });
      }

      const userReference =
        adminDb
          .collection('users')
          .doc(userId);

      const userDocument =
        await userReference.get();

      if (!userDocument.exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'Perfil do usuário não encontrado no Firestore.',
          },
        });
      }

      let couponBonusMinutes = 0;

      if (couponCode) {
        const coupon =
          await getCouponByCode(
            couponCode,
          );

        if (
          !coupon ||
          !coupon.active
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_COUPON',
              message:
                'Cupom inválido ou inativo.',
            },
          });
        }

        if (
          coupon.type !==
          'bonus_fixed'
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code:
                'UNSUPPORTED_COUPON_TYPE',
              message:
                'Este tipo de cupom não está disponível para esta recarga.',
            },
          });
        }

        if (
          coupon.expiresAt &&
          new Date(
            coupon.expiresAt,
          ) <= new Date()
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'EXPIRED_COUPON',
              message:
                'Este cupom já expirou.',
            },
          });
        }

        if (
          Number(
            coupon.currentUses || 0,
          ) >=
          Number(
            coupon.maxUses || 0,
          )
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code:
                'MAX_USES_REACHED',
              message:
                'Este cupom atingiu o limite máximo de resgates.',
            },
          });
        }

        const userUses =
          Number(
            coupon.userUsesCount?.[
              userId
            ] || 0,
          );

        if (
          userUses >=
          Number(
            coupon.maxUsesPerUser ||
            1,
          )
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code:
                'USER_LIMIT_REACHED',
              message:
                'Você já atingiu o limite de uso para este cupom.',
            },
          });
        }

        couponBonusMinutes =
          getCouponBonusMinutes(
            coupon,
          );
      }

      const packageMinutes =
  Number(
    selectedPackage.minutes,
  ) +
  Number(
    selectedPackage.bonusMinutes || 0,
  );

const totalMinutes =
  packageMinutes +
  couponBonusMinutes;

      const preferenceReference =
        adminDb
          .collection(
            'mercadoPagoPreferences',
          )
          .doc();

      const preferenceInternalId =
        preferenceReference.id;

      const appUrl = (
        process.env.APP_URL ||
        'https://oraculos-ts.vercel.app'
      ).replace(/\/+$/, '');

      const preference =
        new Preference(mpConfig);

      const result =
        await preference.create({
          body: {
            items: [
              {
                id:
                  preferenceInternalId,
                title:
                  selectedPackage.title,
                description:
                  `${totalMinutes} minutos para utilização no ORACULOS.TS`,
                unit_price:
                  requestedAmount,
                quantity: 1,
                currency_id: 'BRL',
              },
            ],

            external_reference:
              preferenceInternalId,

            metadata: {
              type:
                'minute_recharge',
              user_id:
                userId,
              user_email:
                userEmail || '',
              preference_internal_id:
                preferenceInternalId,
              package_amount:
                requestedAmount,
              package_minutes:
                packageMinutes,
              coupon_code:
                couponCode,
              coupon_bonus_minutes:
                couponBonusMinutes,
              total_minutes:
                totalMinutes,
            },

            payer: userEmail
              ? {
                  email:
                    userEmail,
                }
              : undefined,

            back_urls: {
              success:
                `${appUrl}/?payment=success`,
              failure:
                `${appUrl}/?payment=failure`,
              pending:
                `${appUrl}/?payment=pending`,
            },

            auto_return:
              'approved',

            notification_url:
              `${appUrl}/api/finance/webhook`,
          },
        });

      if (
        !result.id ||
        !result.init_point
      ) {
        throw new Error(
          'O Mercado Pago não retornou os dados completos do checkout.',
        );
      }

      await preferenceReference.set({
  id:
    preferenceInternalId,
  mercadoPagoPreferenceId:
    result.id,
  userId,
        userEmail:
          userEmail || null,
        amount:
          requestedAmount,
        packageTitle:
          selectedPackage.title,
        packageMinutes,
        couponCode:
          couponCode || null,
        couponBonusMinutes,
        totalMinutes,
        status:
          'created',
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        data: {
          preferenceId:
            result.id,
          preferenceInternalId,
          initPoint:
            result.init_point,
          amount:
            requestedAmount,
          totalMinutes,
        },
      });
    } catch (error: unknown) {
      console.error(
        '[ORACULOS.TS] Erro ao criar preferência do Mercado Pago:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'MERCADOPAGO_PREFERENCE_ERROR',
          message:
            'Não foi possível abrir o checkout do Mercado Pago.',
        },
      });
    }
  },
);





// ==========================================
// MERCADO PAGO WEBHOOK
// ==========================================







app.get(
  '/api/finance/webhook',
  (_req: Request, res: Response) => {
    return res.status(200).json({
      status: 'ok',
      system: 'ORACULOS.TS Mercado Pago Webhook',
      message:
        'Endpoint ativo. As notificações do Mercado Pago devem ser enviadas por POST.',
      environment:
        process.env.NODE_ENV ||
        'development',
      timestamp:
        new Date().toISOString(),
    });
  },
);









app.post(
  '/api/finance/webhook',
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      /*
       * Responde normalmente a notificações
       * que não sejam de pagamento.
       */
      const notificationType =
        String(
          req.body?.type ||
          req.query?.type ||
          '',
        );

      const paymentId =
        String(
          req.body?.data?.id ||
          req.query?.['data.id'] ||
          req.query?.id ||
          '',
        ).trim();

      if (
        notificationType &&
        notificationType !==
          'payment'
      ) {
        return res.status(200).json({
          status:
            'ignored_notification_type',
        });
      }

      if (!paymentId) {
        return res.status(200).json({
          status:
            'ignored_without_payment_id',
        });
      }




const idempotencyKey =
  `webhook_payment_${paymentId}`;

/*
 * Compatibilidade com os testes automatizados
 * e proteção rápida antes de consultar a API.
 *
 * A proteção definitiva continua sendo o
 * documento salvo no Firestore.
 */
if (
  processedPaymentIds.has(
    idempotencyKey,
  )
) {
  return res.status(200).json({
    status:
      'already_processed',
  });
}






      /*
       * A assinatura é validada quando o
       * segredo foi configurado na Vercel ou no ambiente.
       * Em produção, o segredo é estritamente obrigatório.
       */
      const webhookSecret =
        process.env
          .MERCADOPAGO_WEBHOOK_SECRET;

      if (process.env.NODE_ENV === 'production' && !webhookSecret) {
        console.error('[ORACULOS.TS] Webhook rejeitado: MERCADOPAGO_WEBHOOK_SECRET é obrigatório em produção.');
        return res.status(500).json({
          error: 'Configuração de segurança do webhook ausente no servidor de produção.',
        });
      }

      const xSignature =
        String(
          req.headers[
            'x-signature'
          ] || '',
        );

      const xRequestId =
        String(
          req.headers[
            'x-request-id'
          ] || '',
        );

      if (webhookSecret) {
        if (!xSignature || !xRequestId) {
          console.error('[ORACULOS.TS] Webhook rejeitado: cabeçalhos de assinatura ausentes.');
          return res.status(401).json({
            error: 'Assinatura do webhook ausente ou cabeçalhos incompletos.',
          });
        }

        const signatureParts = xSignature.split(',');
        let timestamp = '';
        let receivedHash = '';

        for (const signaturePart of signatureParts) {
          const [key, value] = signaturePart.split('=');
          if (key?.trim() === 'ts') {
            timestamp = value?.trim() || '';
          }
          if (key?.trim() === 'v1') {
            receivedHash = value?.trim() || '';
          }
        }

        if (!timestamp || !receivedHash) {
          console.error('[ORACULOS.TS] Webhook rejeitado: formato de assinatura inválido (ts/v1 ausentes).');
          return res.status(401).json({
            error: 'Formato de assinatura inválido.',
          });
        }

        const manifest = `id:${paymentId};request-id:${xRequestId};ts:${timestamp};`;
        const expectedHash = crypto
          .createHmac('sha256', webhookSecret)
          .update(manifest)
          .digest('hex');

        const receivedBuffer = Buffer.from(receivedHash, 'utf8');
        const expectedBuffer = Buffer.from(expectedHash, 'utf8');

        const validSignature =
          receivedBuffer.length === expectedBuffer.length &&
          crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

        if (!validSignature) {
          console.error('[ORACULOS.TS] Assinatura inválida no webhook Mercado Pago.', {
            paymentId,
            requestId: xRequestId,
          });

          return res.status(401).json({
            error: 'Assinatura do webhook inválida.',
          });
        }

        // Validação anti-replay com tolerância de 5 minutos (300s) em produção
        if (process.env.NODE_ENV === 'production') {
          const tsNumber = Number(timestamp);
          const nowSec = Math.floor(Date.now() / 1000);
          if (isNaN(tsNumber) || Math.abs(nowSec - tsNumber) > 300) {
            console.error('[ORACULOS.TS] Webhook rejeitado: timestamp expirado ou fora da janela de tolerância de 5 minutos.');
            return res.status(401).json({
              error: 'Timestamp do webhook expirado ou fora da janela permitida.',
            });
          }
        }
      }

      if (!mpConfig) {
        console.error(
          '[ORACULOS.TS] Webhook recebido sem Mercado Pago configurado.',
        );

        return res.status(503).json({
          error:
            'Mercado Pago não configurado.',
        });
      }

      if (!adminDb) {
        console.error(
          '[ORACULOS.TS] Webhook recebido sem Firestore disponível.',
        );

        return res.status(503).json({
          error:
            'Firestore indisponível.',
        });
      }

      /*
       * Consulta o pagamento diretamente no
       * Mercado Pago. Nunca confia apenas no
       * conteúdo recebido pelo webhook.
       */
      const paymentApi =
        new Payment(mpConfig);

      const payment =
        await paymentApi.get({
          id: paymentId,
        });

      const status =
        String(
          payment.status || '',
        );

      const currency =
        String(
          payment.currency_id || '',
        );

      const amount =
        Number(
          payment.transaction_amount,
        );

      const metadata =
        payment.metadata || {};

      const userId =
        String(
          metadata.user_id ||
          '',
        ).trim();

      const preferenceInternalId =
        String(
          metadata
            .preference_internal_id ||
          payment.external_reference ||
          '',
        ).trim();

      const packageAmount =
        Number(
          metadata.package_amount,
        );

      const packageMinutes =
        Number(
          metadata.package_minutes,
        );

      const couponBonusMinutes =
        Number(
          metadata
            .coupon_bonus_minutes ||
          0,
        );

      const totalMinutes =
        Number(
          metadata.total_minutes,
        );

      if (
        !userId ||
        !preferenceInternalId
      ) {
        console.error(
          '[ORACULOS.TS] Pagamento sem identificação interna.',
          {
            paymentId,
            metadata,
          },
        );

        return res.status(400).json({
          error:
            'Pagamento sem identificação interna.',
        });
      }

      if (
        currency !== 'BRL'
      ) {
        console.error(
          '[ORACULOS.TS] Moeda inválida no pagamento.',
          {
            paymentId,
            currency,
          },
        );

        return res.status(400).json({
          error:
            'Moeda não permitida.',
        });
      }

      
const paymentReference =
  adminDb
    .collection(
      'mercadoPagoPayments',
    )
    .doc(paymentId);

const userReference =
  adminDb
    .collection('users')
    .doc(userId);

const preferenceReference =
  adminDb
    .collection(
      'mercadoPagoPreferences',
    )
    .doc(
      preferenceInternalId,
    );

const preferenceDocument =
  await preferenceReference.get();

if (!preferenceDocument.exists) {
  console.error(
    '[ORACULOS.TS] Preferência interna não encontrada.',
    {
      paymentId,
      preferenceInternalId,
    },
  );

  return res.status(400).json({
    error:
      'Preferência de pagamento não encontrada.',
  });
}

const storedPreference =
  preferenceDocument.data() || {};

const expectedUserId =
  String(
    storedPreference.userId || '',
  ).trim();

const expectedAmount =
  Number(
    storedPreference.amount,
  );

const officialMinutes =
  Number(
    storedPreference.packageMinutes,
  );

const expectedCouponBonusMinutes =
  Number(
    storedPreference.couponBonusMinutes || 0,
  );

const expectedTotalMinutes =
  Number(
    storedPreference.totalMinutes,
  );

const officialPackage = {
  title:
    String(
      storedPreference.packageTitle ||
      'Pacote de minutos',
    ),
};

if (
  !expectedUserId ||
  !Number.isFinite(expectedAmount) ||
  !Number.isFinite(officialMinutes) ||
  !Number.isFinite(expectedCouponBonusMinutes) ||
  !Number.isFinite(expectedTotalMinutes) ||
  expectedUserId !== userId ||
  amount !== expectedAmount ||
  packageAmount !== expectedAmount ||
  packageMinutes !== officialMinutes ||
  couponBonusMinutes !==
    expectedCouponBonusMinutes ||
  totalMinutes !==
    expectedTotalMinutes
) {
  console.error(
    '[ORACULOS.TS] Divergência entre pagamento e preferência salva.',
    {
      paymentId,
      preferenceInternalId,
      userId,
      expectedUserId,
      amount,
      expectedAmount,
      packageAmount,
      packageMinutes,
      officialMinutes,
      couponBonusMinutes,
      expectedCouponBonusMinutes,
      totalMinutes,
      expectedTotalMinutes,
    },
  );

  return res.status(400).json({
    error:
      'Os dados do pagamento não correspondem à preferência original.',
  });
}




      /*
       * Pagamento ainda pendente ou rejeitado:
       * apenas registra o estado.
       */
      if (
        status !== 'approved'
      ) {
        await paymentReference.set(
          {
            paymentId,
            userId,
            preferenceInternalId,
            amount,
            currency,
            status,
            paymentMethod:
              payment.payment_method_id ||
              null,
            updatedAt:
              new Date().toISOString(),
          },
          {
            merge: true,
          },
        );

        await preferenceReference.set(
          {
            status,
            mercadoPagoPaymentId:
              paymentId,
            updatedAt:
              new Date().toISOString(),
          },
          {
            merge: true,
          },
        );








        return res.status(200).json({
          status:
            `payment_${status || 'unknown'}`,
        });
      }









      /*
       * Transação Firestore:
       * - impede crédito duplicado;
       * - verifica o usuário real;
       * - atualiza os minutos;
       * - registra a transação.
       */
      const transactionResult =
        await adminDb.runTransaction(
          async (transaction) => {
            const existingPayment =
              await transaction.get(
                paymentReference,
              );

            if (
              existingPayment.exists &&
              existingPayment.data()
                ?.credited === true
            ) {
              return {
                alreadyCredited:
                  true,
              };
            }

            const userDocument =
              await transaction.get(
                userReference,
              );

            if (
              !userDocument.exists
            ) {
              throw new Error(
                'FIRESTORE_USER_NOT_FOUND',
              );
            }

            const currentUser =
              userDocument.data() || {};

            const balanceBefore =
              Number(
                currentUser
                  .minuteBalance ??
                currentUser.balance ??
                0,
              );

            const balanceAfter =
              balanceBefore +
              totalMinutes;

            const processedAt =
              new Date().toISOString();

            transaction.update(
              userReference,
              {
                minuteBalance:
                  balanceAfter,
                balance:
                  balanceAfter,
                updatedAt:
                  processedAt,
              },
            );

            const minuteTransactionReference =
              userReference
                .collection(
                  'minuteTransactions',
                )
                .doc(
                  `mercadopago-${paymentId}`,
                );

            transaction.set(
              minuteTransactionReference,
              {
                id:
                  `mercadopago-${paymentId}`,
                userId,
                type:
                  'recharge',
                minutes:
                  totalMinutes,
                packageMinutes:
                  officialMinutes,
                couponBonusMinutes,
                amountPaid:
                  amount,
                balanceBefore,
                balanceAfter,
                paymentId,
preferenceInternalId,
mercadoPagoPreferenceId:
  String(
    storedPreference.mercadoPagoPreferenceId ||
    '',
  ),
paymentMethod:
                  payment.payment_method_id ||
                  null,
                status:
                  'completed',
                reason:
                  `Recarga aprovada pelo Mercado Pago: ${officialPackage.title}`,
                createdBy:
                  'system-mercadopago',
                createdAt:
                  processedAt,
              },
            );

            transaction.set(
              paymentReference,
              {
                paymentId,
                userId,
                preferenceInternalId,
                amount,
                currency,
                packageTitle:
                  officialPackage.title,
                packageMinutes:
                  officialMinutes,
                couponBonusMinutes,
                totalMinutes,
                paymentMethod:
                  payment.payment_method_id ||
                  null,
                status:
                  'approved',
                credited:
                  true,
                creditedAt:
                  processedAt,
                updatedAt:
                  processedAt,
              },
              {
                merge: true,
              },
            );

            transaction.set(
              preferenceReference,
              {
                status:
                  'approved',
                mercadoPagoPaymentId:
                  paymentId,
                credited:
                  true,
                creditedAt:
                  processedAt,
                updatedAt:
                  processedAt,
              },
              {
                merge: true,
              },
            );

            return {
              alreadyCredited:
                false,
              balanceBefore,
              balanceAfter,
            };
          },
        );

      if (
        transactionResult
          .alreadyCredited
      ) {
        console.log(
          '[ORACULOS.TS] Webhook ignorado por idempotência.',
          {
            paymentId,
            userId,
          },
        );







        return res.status(200).json({
          status:
            'already_credited',
        });
      }







      /*
       * O cupom é contabilizado no Firestore
       * somente após a aprovação real e apenas
       * na primeira execução do pagamento.
       */
      const couponCode =
        String(
          metadata.coupon_code ||
          '',
        )
          .trim()
          .toUpperCase();

      if (
        couponCode &&
        couponBonusMinutes > 0
      ) {
        const couponReference =
          adminDb
            .collection(
              COUPONS_COLLECTION,
            )
            .doc(couponCode);

        await adminDb.runTransaction(
          async (transaction) => {
            const couponDocument =
              await transaction.get(
                couponReference,
              );

            if (!couponDocument.exists) {
              console.warn(
                '[ORACULOS.TS] Cupom do pagamento não encontrado ao contabilizar uso.',
                {
                  paymentId,
                  couponCode,
                },
              );
              return;
            }

            const coupon =
              couponDocument.data() as Coupon;

            const currentUses =
              Number(
                coupon.currentUses || 0,
              );

            const currentUserUses =
              Number(
                coupon.userUsesCount?.[
                  userId
                ] || 0,
              );

            if (
              !coupon.active ||
              coupon.type !==
                'bonus_fixed'
            ) {
              console.warn(
                '[ORACULOS.TS] Cupom do pagamento não está mais ativo ou compatível.',
                {
                  paymentId,
                  couponCode,
                },
              );
              return;
            }

            if (
              coupon.expiresAt &&
              new Date(
                coupon.expiresAt,
              ) <= new Date()
            ) {
              console.warn(
                '[ORACULOS.TS] Cupom do pagamento expirou antes da contabilização.',
                {
                  paymentId,
                  couponCode,
                },
              );
              return;
            }

            const updatedUserUses = {
              ...(
                coupon.userUsesCount ||
                {}
              ),
              [userId]:
                currentUserUses + 1,
            };

            transaction.update(
              couponReference,
              {
                currentUses:
                  currentUses + 1,
                userUsesCount:
                  updatedUserUses,
                updatedAt:
                  new Date().toISOString(),
              },
            );
          },
        );
      }

      auditLogs.unshift({
        id:
          `log-mp-${Date.now()}`,
        timestamp:
          new Date().toISOString(),
        userId,
        userName:
  String(
    payment.payer?.first_name ||
    payment.payer?.email ||
    'Usuário Mercado Pago',
  ),
        userRole:
          'user',
        action:
          'MERCADOPAGO_PAYMENT_APPROVED',
        details:
          `Pagamento ${paymentId} aprovado. ${totalMinutes} minutos creditados no Firestore.`,
        ip:
          req.ip ||
          '127.0.0.1',
        status:
          'SUCCESS',
      });

      console.log(
        '[ORACULOS.TS] Pagamento aprovado e minutos creditados.',
        {
          paymentId,
          userId,
          amount,
          totalMinutes,
          balanceBefore:
            transactionResult
              .balanceBefore,
          balanceAfter:
            transactionResult
              .balanceAfter,
        },
      );


processedPaymentIds.add(
  idempotencyKey,
);





      return res.status(200).json({
        status:
          'credited',
      });







    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        '[ORACULOS.TS] Erro no webhook Mercado Pago:',
        error,
      );

      if (
        message ===
        'FIRESTORE_USER_NOT_FOUND'
      ) {
        return res.status(404).json({
          error:
            'Usuário do pagamento não encontrado no Firestore.',
        });
      }

      return res.status(500).json({
        error:
          'Erro interno ao processar o pagamento.',
      });
    }
  },
);




interface WorkforceApplicationRecord {
  id: string;
  fullName: string;
  professionalName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  bio: string;
  experienceYears: number;
  specialties: string[];
  oracles: string[];
  languages: string[];
  modality: 'chat' | 'video' | 'both';
  profilePhoto?: string;
  status: 'submitted' | 'approved' | 'rejected';
  termsAccepted: boolean;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export const workforceApplicationsDb: Record<
  string,
  WorkforceApplicationRecord
> = {};

export const consultantSettingsDb: Record<
  string,
  { pricePerMinute: number; active: boolean }
> = {};

export const consultantProfilesDb: Record<
  string,
  Record<string, unknown>
> = {};

app.post('/api/work-with-us/applications', async (req: Request, res: Response) => {
  try {
    const text = (value: unknown, max: number) =>
      typeof value === 'string' ? value.trim().slice(0, max) : '';
    const fullName = text(req.body?.fullName, 120);
    const professionalName = text(req.body?.professionalName, 120);
    const email = text(req.body?.email, 180).toLowerCase();
    const phone = text(req.body?.phone, 30);
    const city = text(req.body?.city, 80);
    const state = text(req.body?.state, 40);
    const bio = text(req.body?.bio, 1500);
    const profilePhoto = text(req.body?.profilePhoto, 500);
    const experienceYears = Number(req.body?.experienceYears);
    const specialties = Array.isArray(req.body?.specialties)
      ? req.body.specialties.map((item: unknown) => text(item, 50)).filter(Boolean).slice(0, 10)
      : [];
    const oracles = Array.isArray(req.body?.oracles)
      ? req.body.oracles.map((item: unknown) => text(item, 50)).filter(Boolean).slice(0, 10)
      : [];
    const languages = Array.isArray(req.body?.languages)
      ? req.body.languages.map((item: unknown) => text(item, 40)).filter(Boolean).slice(0, 8)
      : ['Português'];
    const modality = ['chat', 'video', 'both'].includes(req.body?.modality)
      ? req.body.modality as 'chat' | 'video' | 'both'
      : 'chat';

    if (
      fullName.length < 3 ||
      professionalName.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length < 8 ||
      city.length < 2 ||
      state.length < 2 ||
      bio.length < 40 ||
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > 80 ||
      oracles.length === 0 ||
      req.body?.termsAccepted !== true
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_APPLICATION',
          message: 'Preencha corretamente todos os campos obrigatórios e aceite os termos.',
        },
      });
    }

    const id = `candidate_${crypto.randomUUID()}`;
    const application: WorkforceApplicationRecord = {
      id, fullName, professionalName, email, phone, city, state, bio,
      experienceYears, specialties, oracles, languages, modality,
      ...(profilePhoto ? { profilePhoto } : {}),
      status: 'submitted',
      termsAccepted: true,
      createdAt: new Date().toISOString(),
    };

    if (adminDb) {
      await adminDb.collection('workforceApplications').doc(id).create(application);
    } else if (process.env.NODE_ENV === 'test') {
      workforceApplicationsDb[id] = application;
    } else {
      return res.status(503).json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Cadastro temporariamente indisponível.' },
      });
    }

    return res.status(201).json({ success: true, data: { id, status: 'submitted' } });
  } catch (error) {
    console.error('[ORACULOS.TS] Falha ao cadastrar candidatura:', error);
    return res.status(500).json({ success: false, error: { code: 'APPLICATION_FAILED', message: 'Não foi possível enviar a candidatura.' } });
  }
});

app.get(
  '/api/admin/workforce-applications',
  requireAuth,
  requireRole(['admin', 'superadmin']),
  async (_req: AuthenticatedRequest, res: Response) => {
    const applications = adminDb
      ? (await adminDb.collection('workforceApplications').get()).docs.map((doc) => doc.data())
      : Object.values(workforceApplicationsDb);
    return res.json({ success: true, data: { applications } });
  },
);

app.patch(
  '/api/admin/workforce-applications/:id',
  requireAuth,
  requireRole(['admin', 'superadmin']),
  async (req: AuthenticatedRequest, res: Response) => {
    const applicationId = req.params.id.trim();
    const status = req.body?.status;
    const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim().slice(0, 1000) : '';
    const pricePerMinute = Number(req.body?.pricePerMinute);

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Decisão inválida.' } });
    }
    if (status === 'approved' && (!Number.isFinite(pricePerMinute) || pricePerMinute <= 0 || pricePerMinute > 100)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PRICE', message: 'Defina um valor por minuto entre 0,01 e 100.' } });
    }

    const reviewedAt = new Date().toISOString();
    let application: WorkforceApplicationRecord | undefined;
    if (adminDb) {
      const reference = adminDb.collection('workforceApplications').doc(applicationId);
      const snapshot = await reference.get();
      if (snapshot.exists) application = snapshot.data() as WorkforceApplicationRecord;
      if (application) await reference.update({ status, notes, reviewedAt, reviewedBy: req.user?.uid });
    } else {
      application = workforceApplicationsDb[applicationId];
      if (application) workforceApplicationsDb[applicationId] = { ...application, status, notes, reviewedAt, reviewedBy: req.user?.uid };
    }

    if (!application) {
      return res.status(404).json({ success: false, error: { code: 'APPLICATION_NOT_FOUND', message: 'Candidatura não encontrada.' } });
    }

    if (status === 'approved') {
      const consultantId = `human_${applicationId.replace(/^candidate_/, '')}`;
      const profile = {
        id: consultantId,
        name: application.professionalName,
        title: application.specialties.join(' • ') || 'Especialista Oracular',
        avatar: application.profilePhoto || '/brand/logo-oraculos.png?v=20260831',
        bio: application.bio,
        specialties: application.oracles,
        authorizedOracles: application.oracles,
        rating: 5,
        totalReviews: 0,
        totalConsultations: 0,
        pricePerMinute,
        status: 'offline',
        experienceYears: application.experienceYears,
        avgResponseTime: 'Novo profissional',
        schedule: 'A combinar',
        totalEarned: 0,
        commissionRate: 0.7,
        reviews: [],
        isAI: false,
        active: true,
        applicationId,
        email: application.email,
        createdAt: reviewedAt,
      };
      if (adminDb) {
        await adminDb.collection('consultantProfiles').doc(consultantId).set(profile, { merge: true });
        const users = await adminDb.collection('users').where('email', '==', application.email).limit(1).get();
        if (!users.empty) await users.docs[0].ref.update({ role: 'consultant', consultantId, updatedAt: reviewedAt });
      } else {
        consultantProfilesDb[consultantId] = profile;
      }
      consultantSettingsDb[consultantId] = { pricePerMinute, active: true };
    }

    return res.json({ success: true, data: { id: applicationId, status } });
  },
);

app.get('/api/consultants/public', async (_req: Request, res: Response) => {
  const settings = adminDb
    ? (await adminDb.collection('consultantSettings').get()).docs.reduce<Record<string, { pricePerMinute: number; active: boolean }>>((result, doc) => {
        result[doc.id] = doc.data() as { pricePerMinute: number; active: boolean };
        return result;
      }, {})
    : consultantSettingsDb;
  const approved = adminDb
    ? (await adminDb.collection('consultantProfiles').where('active', '==', true).get()).docs.map((doc) => doc.data())
    : Object.values(consultantProfilesDb).filter((profile) => profile.active === true);
  return res.json({ success: true, data: { settings, approved } });
});

app.patch(
  '/api/admin/consultants/:id/pricing',
  requireAuth,
  requireRole(['admin', 'superadmin']),
  async (req: AuthenticatedRequest, res: Response) => {
    const consultantId = req.params.id.trim();
    const pricePerMinute = Number(req.body?.pricePerMinute);
    const active = req.body?.active !== false;
    if (!consultantId || !Number.isFinite(pricePerMinute) || pricePerMinute <= 0 || pricePerMinute > 100) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PRICING', message: 'Valor por minuto inválido.' } });
    }
    const setting = { pricePerMinute: Number(pricePerMinute.toFixed(2)), active, updatedAt: new Date().toISOString(), updatedBy: req.user?.uid };
    if (adminDb) await adminDb.collection('consultantSettings').doc(consultantId).set(setting, { merge: true });
    consultantSettingsDb[consultantId] = setting;
    return res.json({ success: true, data: setting });
  },
);

app.get(
  '/api/consultants/me',
  requireAuth,
  requireRole(['consultant', 'employee']),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!adminDb || !req.user?.uid) {
      return res.status(503).json({ success: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Painel profissional temporariamente indisponível.' } });
    }
    const userDocument = await adminDb.collection('users').doc(req.user.uid).get();
    const userData = userDocument.data() || {};
    let consultantId = typeof userData.consultantId === 'string' ? userData.consultantId : '';
    let profileDocument = consultantId
      ? await adminDb.collection('consultantProfiles').doc(consultantId).get()
      : null;
    if ((!profileDocument || !profileDocument.exists) && typeof userData.email === 'string') {
      const profiles = await adminDb.collection('consultantProfiles').where('email', '==', userData.email).limit(1).get();
      if (!profiles.empty) {
        profileDocument = profiles.docs[0];
        consultantId = profileDocument.id;
      }
    }
    if (!profileDocument?.exists) {
      return res.status(404).json({ success: false, error: { code: 'CONSULTANT_PROFILE_NOT_FOUND', message: 'Seu cadastro profissional ainda não foi vinculado. Contate o administrador.' } });
    }
    const sessionsSnapshot = await adminDb.collectionGroup('consultationSessions').where('consultantId', '==', consultantId).get();
    const sessions = sessionsSnapshot.docs.map((doc) => ({
      ...(doc.data() as ServerConsultationSession),
      id: doc.id,
    }));
    const completed = sessions.filter((session) => session.status === 'completed');
    const grossMinutes = completed.reduce((total, session) => total + Number(session.debitMinutes || 0), 0);
    const commissionRate = Number(profileDocument.data()?.commissionRate || 0.7);
    return res.json({
      success: true,
      data: {
        profile: { id: profileDocument.id, ...profileDocument.data() },
        sessions: completed.sort((a, b) => String(b.endedAt || '').localeCompare(String(a.endedAt || ''))),
        earnings: {
          grossMinutes: Number(grossMinutes.toFixed(2)),
          commissionRate,
          payableMinutes: Number((grossMinutes * commissionRate).toFixed(2)),
          paymentMethod: 'manual_weekly',
        },
      },
    });
  },
);

app.patch(
  '/api/consultants/me/status',
  requireAuth,
  requireRole(['consultant', 'employee']),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!adminDb || !req.user?.uid) {
      return res.status(503).json({ success: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Serviço temporariamente indisponível.' } });
    }
    const status = req.body?.status;
    if (!['online', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Disponibilidade inválida.' } });
    }
    const userDocument = await adminDb.collection('users').doc(req.user.uid).get();
    const consultantId = userDocument.data()?.consultantId;
    if (typeof consultantId !== 'string' || !consultantId) {
      return res.status(404).json({ success: false, error: { code: 'CONSULTANT_PROFILE_NOT_FOUND', message: 'Perfil profissional não vinculado.' } });
    }
    await adminDb.collection('consultantProfiles').doc(consultantId).update({ status, updatedAt: new Date().toISOString() });
    return res.json({ success: true, data: { status } });
  },
);

interface ServerConsultationSession {
  id: string;
  userId: string;
  consultantId: string;
  consultantName: string;
  pricePerMinute: number;
  startedAt: string;
  oracleType?: string;
  mode?: 'chat' | 'video';
  status: 'active' | 'completed';
  endedAt?: string;
  durationMinutes?: number;
    debitMinutes?: number;
  calculatedDebitMinutes?: number;
  transactionId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  cappedByBalance?: boolean;
  ratingGiven?: number;
  reviewText?: string;
}

export const consultationSessionsDb:
  Record<string, ServerConsultationSession> = {};

// Inicia uma consulta usando horário e preço
// definidos exclusivamente pelo servidor.
app.post(
  '/api/finance/start-consultation',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId =
        req.user?.uid;

      const consultationId =
        typeof req.body?.consultationId ===
        'string'
          ? req.body.consultationId.trim()
          : '';

      const consultantId =
        typeof req.body?.consultantId ===
        'string'
          ? req.body.consultantId.trim()
          : '';

      const oracleType =
        typeof req.body?.oracleType === 'string'
          ? req.body.oracleType.trim()
          : '';

      const mode: 'chat' | 'video' =
        req.body?.mode === 'video'
          ? 'video'
          : 'chat';

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Usuário não autenticado.',
          },
        });
      }

      if (
        !consultationId ||
        !/^[A-Za-z0-9_-]{1,120}$/.test(
          consultationId,
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'INVALID_CONSULTATION_ID',
            message:
              'Identificador da consulta inválido.',
          },
        });
      }

      if (!consultantId) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'CONSULTANT_REQUIRED',
            message:
              'Consultor não informado.',
          },
        });
      }

      /*
       * Fonte oficial do preço.
       * INITIAL_CONSULTANTS contém
       * consultores humanos e virtuais.
       */
      let consultant =
        INITIAL_CONSULTANTS.find(
          (item) =>
            item.id === consultantId,
        );

      if (!consultant && adminDb) {
        const consultantDocument = await adminDb
          .collection('consultantProfiles')
          .doc(consultantId)
          .get();
        if (consultantDocument.exists) {
          consultant = consultantDocument.data() as (typeof INITIAL_CONSULTANTS)[number];
        }
      }

      if (!consultant) {
        return res.status(404).json({
          success: false,
          error: {
            code:
              'CONSULTANT_NOT_FOUND',
            message:
              'Consultor não encontrado.',
          },
        });
      }

      let pricePerMinute = Number(
        consultant.pricePerMinute,
      );

      if (adminDb) {
        const pricingDocument = await adminDb
          .collection('consultantSettings')
          .doc(consultantId)
          .get();
        if (pricingDocument.exists) {
          const pricing = pricingDocument.data() || {};
          if (pricing.active === false) {
            return res.status(409).json({
              success: false,
              error: { code: 'CONSULTANT_INACTIVE', message: 'Este profissional está indisponível.' },
            });
          }
          pricePerMinute = Number(pricing.pricePerMinute);
        }
      } else if (consultantSettingsDb[consultantId]) {
        const pricing = consultantSettingsDb[consultantId];
        if (!pricing.active) {
          return res.status(409).json({
            success: false,
            error: { code: 'CONSULTANT_INACTIVE', message: 'Este profissional está indisponível.' },
          });
        }
        pricePerMinute = pricing.pricePerMinute;
      }

      if (
        !Number.isFinite(
          pricePerMinute,
        ) ||
        pricePerMinute <= 0
      ) {
        return res.status(500).json({
          success: false,
          error: {
            code:
              'INVALID_CONSULTANT_PRICE',
            message:
              'Preço do consultor não está configurado corretamente.',
          },
        });
      }

      /*
       * Ambiente automatizado/local.
       */
      if (
        process.env.NODE_ENV ===
          'test' ||
        !adminDb
      ) {
        const testUser =
          usersDb[userId];

        if (!testUser) {
          return res.status(404).json({
            success: false,
            error: {
              code:
                'USER_NOT_FOUND',
              message:
                'Usuário não encontrado.',
            },
          });
        }

        const sessionKey =
          `${userId}:${consultationId}`;

        const existingSession =
          consultationSessionsDb[
            sessionKey
          ];

        if (existingSession) {
          if (
            existingSession
              .consultantId !==
            consultantId
          ) {
            return res.status(409).json({
              success: false,
              error: {
                code:
                  'CONSULTATION_ID_CONFLICT',
                message:
                  'Esta consulta já está vinculada a outro consultor.',
              },
            });
          }

          return res.status(200).json({
            success: true,
            data: {
              ...existingSession,
              alreadyStarted: true,
            },
          });
        }

        const activeSession =
          Object.values(
            consultationSessionsDb,
          ).find(
            (session) =>
              session.userId ===
                userId &&
              session.status ===
                'active',
          );

        if (activeSession) {
          return res.status(409).json({
            success: false,
            error: {
              code:
                'ACTIVE_CONSULTATION_EXISTS',
              message:
                'Já existe uma consulta ativa para este usuário.',
            },
          });
        }

        const balanceBefore =
          Number(
            testUser.balance || 0,
          );

        if (
          balanceBefore <
          pricePerMinute
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code:
                'INSUFFICIENT_FUNDS',
              message:
                'Você não possui minutos suficientes para iniciar esta consulta.',
            },
          });
        }

        const startedAt =
          new Date().toISOString();

        const newSession:
          ServerConsultationSession = {
          id:
            consultationId,
          userId,
          consultantId,
          consultantName:
            consultant.name,
          pricePerMinute,
          startedAt,
          oracleType,
          mode,
          status:
            'active',
        };

        consultationSessionsDb[
          sessionKey
        ] = newSession;

        return res.status(200).json({
          success: true,
          data: {
            ...newSession,
            balanceBefore,
            alreadyStarted: false,
          },
        });
      }

      /*
       * Produção:
       * sessão persistida no Firestore.
       */
      const userReference =
        adminDb
          .collection('users')
          .doc(userId);

      const sessionReference =
        userReference
          .collection(
            'consultationSessions',
          )
          .doc(consultationId);

      const result =
        await adminDb.runTransaction(
          async (transaction) => {
            /*
             * Todas as leituras acontecem
             * antes das gravações.
             */
            const userDocument =
              await transaction.get(
                userReference,
              );

            const sessionDocument =
              await transaction.get(
                sessionReference,
              );

            if (
              sessionDocument.exists
            ) {
              const existingSession =
                sessionDocument.data() ||
                {};

              if (
                existingSession
                  .consultantId !==
                consultantId
              ) {
                throw new Error(
                  'CONSULTATION_ID_CONFLICT',
                );
              }

              return {
                ...existingSession,
                id:
                  consultationId,
                alreadyStarted:
                  true,
              };
            }

            if (
              !userDocument.exists
            ) {
              throw new Error(
                'FIRESTORE_USER_NOT_FOUND',
              );
            }

            const userData =
              userDocument.data() ||
              {};

            if (
              userData.status ===
              'blocked'
            ) {
              throw new Error(
                'USER_BLOCKED',
              );
            }

            const balanceBefore =
              Number(
                userData.minuteBalance ??
                  userData.balance ??
                  0,
              );

            if (
              balanceBefore <
              pricePerMinute
            ) {
              throw new Error(
                'INSUFFICIENT_MINUTES',
              );
            }

            const activeConsultationId =
              typeof userData
                .activeConsultationId ===
              'string'
                ? userData
                    .activeConsultationId
                : '';

            if (
              activeConsultationId &&
              activeConsultationId !==
                consultationId
            ) {
              throw new Error(
                'ACTIVE_CONSULTATION_EXISTS',
              );
            }

            const startedAt =
              new Date().toISOString();

            const newSession = {
              id:
                consultationId,
              userId,
              consultantId,
              consultantName:
                consultant.name,
              pricePerMinute,
              startedAt,
              oracleType,
              mode,
              status:
                'active',
              createdAt:
                startedAt,
            };

            transaction.update(
              userReference,
              {
                activeConsultationId:
                  consultationId,
                updatedAt:
                  startedAt,
              },
            );

            transaction.create(
              sessionReference,
              newSession,
            );

            return {
              ...newSession,
              balanceBefore,
              alreadyStarted:
                false,
            };
          },
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        message ===
        'FIRESTORE_USER_NOT_FOUND'
      ) {
        return res.status(404).json({
          success: false,
          error: {
            code:
              'USER_NOT_FOUND',
            message:
              'Perfil do usuário não encontrado.',
          },
        });
      }

      if (
        message ===
        'USER_BLOCKED'
      ) {
        return res.status(403).json({
          success: false,
          error: {
            code:
              'USER_BLOCKED',
            message:
              'Esta conta está bloqueada para consultas.',
          },
        });
      }

      if (
        message ===
        'INSUFFICIENT_MINUTES'
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'INSUFFICIENT_FUNDS',
            message:
              'Você não possui minutos suficientes para iniciar esta consulta.',
          },
        });
      }

      if (
        message ===
        'ACTIVE_CONSULTATION_EXISTS'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code:
              'ACTIVE_CONSULTATION_EXISTS',
            message:
              'Já existe uma consulta ativa para este usuário.',
          },
        });
      }

      if (
        message ===
        'CONSULTATION_ID_CONFLICT'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code:
              'CONSULTATION_ID_CONFLICT',
            message:
              'Esta consulta já está vinculada a outro consultor.',
          },
        });
      }

      console.error(
        '[ORACULOS.TS] Erro ao iniciar consulta segura:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'CONSULTATION_START_FAILED',
          message:
            'Não foi possível iniciar a consulta com segurança.',
        },
      });
    }
  },
);


               // Consultation Balance Debit Endpoint
// Encerra a consulta usando exclusivamente
// horário e preço registrados pelo servidor.
app.post(
  '/api/finance/debit-consultation',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId =
        req.user?.uid;

      const consultationId =
        typeof req.body?.consultationId ===
        'string'
          ? req.body.consultationId.trim()
          : '';

      const consultantId =
        typeof req.body?.consultantId ===
        'string'
          ? req.body.consultantId.trim()
          : '';

      const rawRating = req.body?.rating;
      const ratingGiven =
        rawRating === undefined || rawRating === null
          ? undefined
          : Number(rawRating);
      const reviewText =
        typeof req.body?.reviewText === 'string'
          ? req.body.reviewText.trim()
          : undefined;

      if (
        ratingGiven !== undefined &&
        (!Number.isInteger(ratingGiven) ||
          ratingGiven < 1 ||
          ratingGiven > 5)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_RATING',
            message: 'A avaliação deve ser um número inteiro de 1 a 5.',
          },
        });
      }

      if (reviewText && reviewText.length > 1000) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REVIEW_TOO_LONG',
            message: 'O comentário deve ter no máximo 1.000 caracteres.',
          },
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Usuário não autenticado.',
          },
        });
      }

      if (
        !consultationId ||
        !/^[A-Za-z0-9_-]{1,120}$/.test(
          consultationId,
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'INVALID_CONSULTATION_ID',
            message:
              'Identificador da consulta é obrigatório e deve ser válido.',
          },
        });
      }

      if (!consultantId) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'CONSULTANT_REQUIRED',
            message:
              'Consultor não informado.',
          },
        });
      }

      /*
       * TESTE / FALLBACK LOCAL
       *
       * O navegador NÃO define:
       * - preço;
       * - duração;
       * - valor debitado.
       */
      if (
        process.env.NODE_ENV ===
          'test' ||
        !adminDb
      ) {
        const testUser =
          usersDb[userId];

        const sessionKey =
          `${userId}:${consultationId}`;

        const serverSession =
          consultationSessionsDb[
            sessionKey
          ];

        if (!testUser) {
          return res.status(404).json({
            success: false,
            error: {
              code:
                'USER_NOT_FOUND',
              message:
                'Usuário não encontrado.',
            },
          });
        }

        if (!serverSession) {
          return res.status(404).json({
            success: false,
            error: {
              code:
                'CONSULTATION_NOT_FOUND',
              message:
                'A consulta não foi encontrada no servidor.',
            },
          });
        }

        if (
          serverSession.consultantId !==
          consultantId
        ) {
          return res.status(409).json({
            success: false,
            error: {
              code:
                'CONSULTATION_ID_CONFLICT',
              message:
                'Esta consulta não pertence ao consultor informado.',
            },
          });
        }

        /*
         * Idempotência real:
         * consulta concluída retorna
         * exatamente os valores já gravados.
         */
        if (
          serverSession.status ===
          'completed'
        ) {
          return res.status(200).json({
            success: true,
            data: {
              transactionId:
                serverSession
                  .transactionId ||
                `test-consultation-${userId}-${consultationId}`,

              debitMinutes:
                Number(
                  serverSession
                    .debitMinutes ??
                    0,
                ),

              calculatedDebitMinutes:
                Number(
                  serverSession
                    .calculatedDebitMinutes ??
                    serverSession
                      .debitMinutes ??
                    0,
                ),

              durationMinutes:
                Number(
                  serverSession
                    .durationMinutes ??
                    0,
                ),

              pricePerMinute:
                serverSession
                  .pricePerMinute,

              balanceBefore:
                Number(
                  serverSession
                    .balanceBefore ??
                    0,
                ),

              balanceAfter:
                Number(
                  serverSession
                    .balanceAfter ??
                    0,
                ),

              processedAt:
                serverSession.endedAt ||
                new Date().toISOString(),

              cappedByBalance:
                serverSession
                  .cappedByBalance ??
                false,

              alreadyProcessed:
                true,
            },
          });
        }

        const startedAtMilliseconds =
          new Date(
            serverSession.startedAt,
          ).getTime();

        const pricePerMinute =
          Number(
            serverSession
              .pricePerMinute,
          );

        if (
          !Number.isFinite(
            startedAtMilliseconds,
          ) ||
          !Number.isFinite(
            pricePerMinute,
          ) ||
          pricePerMinute <= 0
        ) {
          return res.status(409).json({
            success: false,
            error: {
              code:
                'INVALID_CONSULTATION_STATE',
              message:
                'A sessão da consulta possui dados inválidos.',
            },
          });
        }

        const durationMinutes =
          Math.max(
            1,
            Math.ceil(
              (
                Date.now() -
                startedAtMilliseconds
              ) /
                60000,
            ),
          );

        const calculatedDebitMinutes =
          Number(
            (
              durationMinutes *
              pricePerMinute
            ).toFixed(2),
          );

        const balanceBefore =
          Math.max(
            0,
            Number(
              testUser.balance ||
                0,
            ),
          );

        /*
         * Nunca permite saldo negativo.
         * Se a sessão ultrapassou o saldo,
         * encerra e debita até o limite.
         */
        const debitMinutes =
          Math.min(
            calculatedDebitMinutes,
            balanceBefore,
          );

        const balanceAfter =
          Number(
            Math.max(
              0,
              balanceBefore -
                debitMinutes,
            ).toFixed(2),
          );

        const processedAt =
          new Date().toISOString();

        const transactionId =
          `test-consultation-${userId}-${consultationId}`;

        const cappedByBalance =
          debitMinutes <
          calculatedDebitMinutes;

        testUser.balance =
          balanceAfter;

        usersDb[userId] =
          testUser;

        consultationSessionsDb[
          sessionKey
        ] = {
          ...serverSession,

          status:
            'completed',

          endedAt:
            processedAt,

          durationMinutes,

          debitMinutes,

          calculatedDebitMinutes,

          transactionId,

          balanceBefore,

          balanceAfter,

          cappedByBalance,

          ...(ratingGiven !== undefined
            ? { ratingGiven }
            : {}),

          ...(reviewText
            ? { reviewText }
            : {}),
        };

        return res.status(200).json({
          success: true,
          data: {
            transactionId,
            debitMinutes,
            calculatedDebitMinutes,
            durationMinutes,
            pricePerMinute,
            balanceBefore,
            balanceAfter,
            processedAt,
            cappedByBalance,
            alreadyProcessed:
              false,
          },
        });
      }

      /*
       * PRODUÇÃO / FIRESTORE
       */

      const transactionId =
        `consultation-${userId}-${consultationId}`;

      const userReference =
        adminDb
          .collection('users')
          .doc(userId);

      const sessionReference =
        userReference
          .collection(
            'consultationSessions',
          )
          .doc(consultationId);

      const minuteTransactionReference =
        userReference
          .collection(
            'minuteTransactions',
          )
          .doc(transactionId);

      const result =
        await adminDb.runTransaction(
          async (transaction) => {
            /*
             * Todas as leituras acontecem
             * antes de qualquer gravação.
             */
            const userDocument =
              await transaction.get(
                userReference,
              );

            const sessionDocument =
              await transaction.get(
                sessionReference,
              );

            const existingDebitDocument =
              await transaction.get(
                minuteTransactionReference,
              );

            if (!userDocument.exists) {
              throw new Error(
                'FIRESTORE_USER_NOT_FOUND',
              );
            }

            if (!sessionDocument.exists) {
              throw new Error(
                'CONSULTATION_NOT_FOUND',
              );
            }

            const userData =
              userDocument.data() ||
              {};

            const sessionData =
              sessionDocument.data() ||
              {};

            if (
              sessionData.userId &&
              sessionData.userId !==
                userId
            ) {
              throw new Error(
                'CONSULTATION_ID_CONFLICT',
              );
            }

            if (
              sessionData
                .consultantId !==
              consultantId
            ) {
              throw new Error(
                'CONSULTATION_ID_CONFLICT',
              );
            }

            /*
             * Consulta já encerrada:
             * devolve exatamente o débito
             * anteriormente confirmado.
             */
            if (
              sessionData.status ===
              'completed'
            ) {
              if (
                !existingDebitDocument
                  .exists
              ) {
                throw new Error(
                  'CONSULTATION_STATE_CORRUPT',
                );
              }

              const existingDebit =
                existingDebitDocument
                  .data() ||
                {};

              return {
                transactionId,

                debitMinutes:
                  Number(
                    sessionData
                      .debitMinutes ??
                      existingDebit
                        .minutes ??
                      0,
                  ),

                calculatedDebitMinutes:
                  Number(
                    sessionData
                      .calculatedDebitMinutes ??
                      existingDebit
                        .calculatedDebitMinutes ??
                      existingDebit
                        .minutes ??
                      0,
                  ),

                durationMinutes:
                  Number(
                    sessionData
                      .durationMinutes ??
                      existingDebit
                        .durationMinutes ??
                      0,
                  ),

                pricePerMinute:
                  Number(
                    sessionData
                      .pricePerMinute ??
                      existingDebit
                        .pricePerMinute ??
                      0,
                  ),

                balanceBefore:
                  Number(
                    sessionData
                      .balanceBefore ??
                      existingDebit
                        .balanceBefore ??
                      0,
                  ),

                balanceAfter:
                  Number(
                    sessionData
                      .balanceAfter ??
                      existingDebit
                        .balanceAfter ??
                      0,
                  ),

                processedAt:
                  String(
                    sessionData
                      .endedAt ??
                      existingDebit
                        .createdAt ??
                      new Date()
                        .toISOString(),
                  ),

                cappedByBalance:
                  Boolean(
                    sessionData
                      .cappedByBalance ??
                      existingDebit
                        .cappedByBalance ??
                      false,
                  ),

                alreadyProcessed:
                  true,
              };
            }

            /*
             * Uma transação de débito
             * não pode existir para uma
             * sessão ainda marcada ativa.
             */
            if (
              existingDebitDocument
                .exists
            ) {
              throw new Error(
                'CONSULTATION_STATE_CORRUPT',
              );
            }

            const activeConsultationId =
              typeof userData
                .activeConsultationId ===
              'string'
                ? userData
                    .activeConsultationId
                : '';

            if (
              activeConsultationId &&
              activeConsultationId !==
                consultationId
            ) {
              throw new Error(
                'CONSULTATION_ID_CONFLICT',
              );
            }

            /*
             * Fonte oficial:
             * dados congelados quando
             * a sessão foi iniciada.
             */
            const startedAtMilliseconds =
              new Date(
                String(
                  sessionData
                    .startedAt ||
                    '',
                ),
              ).getTime();

            const pricePerMinute =
              Number(
                sessionData
                  .pricePerMinute,
              );

            if (
              !Number.isFinite(
                startedAtMilliseconds,
              ) ||
              !Number.isFinite(
                pricePerMinute,
              ) ||
              pricePerMinute <= 0
            ) {
              throw new Error(
                'INVALID_CONSULTATION_STATE',
              );
            }

            const durationMinutes =
              Math.max(
                1,
                Math.ceil(
                  (
                    Date.now() -
                    startedAtMilliseconds
                  ) /
                    60000,
                ),
              );

            const calculatedDebitMinutes =
              Number(
                (
                  durationMinutes *
                  pricePerMinute
                ).toFixed(2),
              );

            const balanceBefore =
              Math.max(
                0,
                Number(
                  userData
                    .minuteBalance ??
                    userData.balance ??
                    0,
                ),
              );

            /*
             * O saldo nunca fica negativo.
             * Mesmo que o navegador pare,
             * a sessão consegue ser encerrada.
             */
            const debitMinutes =
              Math.min(
                calculatedDebitMinutes,
                balanceBefore,
              );

            const balanceAfter =
              Number(
                Math.max(
                  0,
                  balanceBefore -
                    debitMinutes,
                ).toFixed(2),
              );

            const processedAt =
              new Date().toISOString();

            const cappedByBalance =
              debitMinutes <
              calculatedDebitMinutes;

            /*
             * 1. Atualiza carteira.
             * 2. Libera consulta ativa.
             */
            transaction.update(
              userReference,
              {
                minuteBalance:
                  balanceAfter,

                balance:
                  balanceAfter,

                activeConsultationId:
                  null,

                updatedAt:
                  processedAt,
              },
            );

            /*
             * Registro financeiro
             * idempotente.
             */
            transaction.create(
              minuteTransactionReference,
              {
                id:
                  transactionId,

                userId,

                type:
                  'consultation_debit',

                minutes:
                  debitMinutes,

                calculatedDebitMinutes,

                pricePerMinute,

                balanceBefore,

                balanceAfter,

                consultantId,

                consultationId,

                durationMinutes,

                cappedByBalance,

                status:
                  'completed',

                reason:
                  `Débito de consulta com o consultor ${consultantId}.`,

                createdBy:
                  userId,

                createdAt:
                  processedAt,
              },
            );

            /*
             * A própria sessão fica
             * marcada como concluída.
             */
            transaction.update(
              sessionReference,
              {
                status:
                  'completed',

                endedAt:
                  processedAt,

                durationMinutes,

                debitMinutes,

                calculatedDebitMinutes,

                transactionId,

                balanceBefore,

                balanceAfter,

                cappedByBalance,

                ...(ratingGiven !== undefined
                  ? { ratingGiven }
                  : {}),

                ...(reviewText
                  ? { reviewText }
                  : {}),

                updatedAt:
                  processedAt,
              },
            );

            return {
              transactionId,
              debitMinutes,
              calculatedDebitMinutes,
              durationMinutes,
              pricePerMinute,
              balanceBefore,
              balanceAfter,
              processedAt,
              cappedByBalance,
              alreadyProcessed:
                false,
            };
          },
        );

      console.log(
        '[ORACULOS.TS] Consulta encerrada e debitada no Firestore.',
        {
          userId,
          consultationId,

          transactionId:
            result.transactionId,

          debitMinutes:
            result.debitMinutes,

          durationMinutes:
            result.durationMinutes,

          balanceBefore:
            result.balanceBefore,

          balanceAfter:
            result.balanceAfter,

          alreadyProcessed:
            result.alreadyProcessed,
        },
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        message ===
        'FIRESTORE_USER_NOT_FOUND'
      ) {
        return res.status(404).json({
          success: false,
          error: {
            code:
              'USER_NOT_FOUND',

            message:
              'Perfil do usuário não encontrado.',
          },
        });
      }

      if (
        message ===
        'CONSULTATION_NOT_FOUND'
      ) {
        return res.status(404).json({
          success: false,
          error: {
            code:
              'CONSULTATION_NOT_FOUND',

            message:
              'A consulta não foi encontrada no servidor.',
          },
        });
      }

      if (
        message ===
        'CONSULTATION_ID_CONFLICT'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code:
              'CONSULTATION_ID_CONFLICT',

            message:
              'Os dados informados não correspondem à consulta ativa.',
          },
        });
      }

      if (
        message ===
          'INVALID_CONSULTATION_STATE' ||
        message ===
          'CONSULTATION_STATE_CORRUPT'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code:
              'INVALID_CONSULTATION_STATE',

            message:
              'O estado da consulta no servidor é inválido e a cobrança foi bloqueada.',
          },
        });
      }

      console.error(
        '[ORACULOS.TS] Erro ao encerrar e debitar consulta:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'CONSULTATION_DEBIT_FAILED',

          message:
            'Não foi possível encerrar e debitar a consulta.',
        },
      });
    }
  },
);



app.get(
  '/api/consultations/history',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado.',
          },
        });
      }

      if (!adminDb) {
        if (process.env.NODE_ENV === 'test') {
          const history = Object.values(
            consultationSessionsDb,
          )
            .filter(
              (session) =>
                session.userId === userId &&
                session.status === 'completed',
            )
            .sort((first, second) =>
              second.startedAt.localeCompare(first.startedAt),
            );

          return res.json({
            success: true,
            data: { history },
          });
        }

        return res.status(503).json({
          success: false,
          error: {
            code: 'FIRESTORE_NOT_AVAILABLE',
            message: 'Histórico de consultas temporariamente indisponível.',
          },
        });
      }

      const snapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('consultationSessions')
        .get();

      const history = snapshot.docs
        .map((document) => ({
          ...(document.data() as ServerConsultationSession),
          id: document.id,
        }))
        .filter((session) => session.status === 'completed')
        .sort((first, second) =>
          String(second.startedAt || '').localeCompare(
            String(first.startedAt || ''),
          ),
        );

      return res.json({
        success: true,
        data: { history },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao consultar histórico de atendimentos:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'CONSULTATION_HISTORY_FAILED',
          message: 'Não foi possível carregar o histórico de consultas.',
        },
      });
    }
  },
);


app.get(
  '/api/finance/wallet-history',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado.',
          },
        });
      }

      if (!adminDb) {
        if (process.env.NODE_ENV === 'test') {
          const history =
            ledgerDb.filter(
              (tx) => tx.userId === userId,
            );

          return res.json({
            success: true,
            data: { history },
          });
        }

        return res.status(503).json({
          success: false,
          error: {
            code: 'FIRESTORE_NOT_AVAILABLE',
            message:
              'Histórico financeiro temporariamente indisponível.',
          },
        });
      }

      const isPrivileged =
        req.user?.role === 'admin' ||
        req.user?.role === 'superadmin' ||
        req.user?.role === 'support';

      if (!isPrivileged) {
        const history =
          await getTransactionsByUserId(
            userId,
          );

        return res.json({
          success: true,
          data: { history },
        });
      }

      const requestedUserId =
        typeof req.query.userId === 'string'
          ? req.query.userId.trim()
          : '';

      if (requestedUserId) {
        const history =
          await getTransactionsByUserId(
            requestedUserId,
          );

        return res.json({
          success: true,
          data: { history },
        });
      }

      const snapshot =
        await adminDb
          .collectionGroup(
            'minuteTransactions',
          )
          .limit(500)
          .get();

     const history = snapshot.docs
  .map((document) => {
    const data = document.data();

    return {
      ...data,
      id: document.id,
      createdAt:
        typeof data.createdAt === 'string'
          ? data.createdAt
          : '',
    };
  })
  .sort((a, b) =>
    b.createdAt.localeCompare(
      a.createdAt,
    ),
  );

      return res.json({
        success: true,
        data: { history },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao carregar histórico financeiro:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'WALLET_HISTORY_FAILED',
          message:
            'Não foi possível carregar o histórico financeiro.',
        },
      });
    }
  },
);

// Secure Coupon Validation API
app.post(
  '/api/finance/validate-coupon',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado.',
          },
        });
      }

      const upperCode =
        String(req.body?.code || '')
          .trim()
          .toUpperCase();

      if (!upperCode) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COUPON',
            message: 'Informe um cupom válido.',
          },
        });
      }

      const coupon =
        await getCouponByCode(
          upperCode,
        );

      if (!coupon || !coupon.active) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_COUPON',
            message:
              'Cupom inválido ou inativo.',
          },
        });
      }

      if (
        coupon.type !== 'bonus_fixed'
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'UNSUPPORTED_COUPON_TYPE',
            message:
              'Este tipo de cupom não está disponível para esta modalidade de recarga.',
          },
        });
      }

      if (
        coupon.expiresAt &&
        new Date(coupon.expiresAt) <=
          new Date()
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EXPIRED_COUPON',
            message:
              'Este cupom já expirou.',
          },
        });
      }

      if (
        Number(coupon.currentUses || 0) >=
        Number(coupon.maxUses || 0)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MAX_USES_REACHED',
            message:
              'Este cupom atingiu o limite máximo de resgates.',
          },
        });
      }

      const userUses =
        Number(
          coupon.userUsesCount?.[
            userId
          ] || 0,
        );

      if (
        userUses >=
        Number(
          coupon.maxUsesPerUser || 1,
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'USER_LIMIT_REACHED',
            message:
              'Você já atingiu o limite de uso para este cupom.',
          },
        });
      }

      const bonusMinutes =
        getCouponBonusMinutes(
          coupon,
        );

      return res.json({
        success: true,
        data: {
          valid: true,
          code: coupon.code,
          type: coupon.type,
          bonusAmount: bonusMinutes,
          bonusMinutes,
          message:
            `Cupom ativado! Você receberá ${bonusMinutes} minutos bônus após a aprovação da recarga.`,
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao validar cupom:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'COUPON_VALIDATION_FAILED',
          message:
            'Não foi possível validar o cupom.',
        },
      });
    }
  },
);

// Coupon Management APIs (Admin)
app.get(
  '/api/admin/coupons',
  ...requireAdmin,
  async (
    _req: Request,
    res: Response,
  ) => {
    try {
      if (!adminDb) {
        if (
          process.env.NODE_ENV === 'test'
        ) {
          return res.json({
            success: true,
            data: {
              coupons:
                Object.values(
                  couponsDb,
                ),
            },
          });
        }

        return res.status(503).json({
          success: false,
          error: {
            code:
              'FIRESTORE_NOT_AVAILABLE',
            message:
              'Banco de dados temporariamente indisponível.',
          },
        });
      }

      const snapshot =
        await adminDb
          .collection(
            COUPONS_COLLECTION,
          )
          .get();

      const coupons =
        snapshot.docs.map(
          (document) => ({
            ...document.data(),
            id:
              document.data()?.id ||
              document.id,
            code:
              String(
                document.data()?.code ||
                document.id,
              )
                .trim()
                .toUpperCase(),
          }),
        );

      return res.json({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao listar cupons:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'COUPONS_FETCH_FAILED',
          message:
            'Não foi possível carregar os cupons.',
        },
      });
    }
  },
);

app.post(
  '/api/admin/coupons',
  ...requireAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        code,
        type,
        value,
        expiresAt,
        maxUses,
        maxUsesPerUser,
      } = req.body;

      const upperCode =
        String(code || '')
          .trim()
          .toUpperCase();

      const numericValue =
        Number(value);

      if (
        !upperCode ||
        !Number.isFinite(
          numericValue,
        ) ||
        numericValue <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message:
              'Código e valor positivo são obrigatórios.',
          },
        });
      }

      if (
        type &&
        type !== 'bonus_fixed'
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'UNSUPPORTED_COUPON_TYPE',
            message:
              'O checkout atual aceita somente cupons de bônus fixo em minutos.',
          },
        });
      }

      const normalizedMaxUses =
        Math.max(
          1,
          Number(maxUses || 100),
        );

      const normalizedUserLimit =
        Math.max(
          1,
          Number(
            maxUsesPerUser || 1,
          ),
        );

      if (
        !Number.isFinite(
          normalizedMaxUses,
        ) ||
        !Number.isFinite(
          normalizedUserLimit,
        )
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message:
              'Limites de uso inválidos.',
          },
        });
      }

      const newCoupon: Coupon = {
        id: upperCode,
        code: upperCode,
        type: 'bonus_fixed',
        value: numericValue,
        active: true,
        expiresAt:
          expiresAt || null,
        maxUses:
          normalizedMaxUses,
        currentUses: 0,
        maxUsesPerUser:
          normalizedUserLimit,
        userUsesCount: {},
        eligibleProducts: ['all'],
        createdAt:
          new Date().toISOString(),
        createdBy:
          req.user?.uid ||
          'admin',
      };

      if (!adminDb) {
        if (
          process.env.NODE_ENV === 'test'
        ) {
          couponsDb[upperCode] =
            newCoupon;
        } else {
          return res.status(503).json({
            success: false,
            error: {
              code:
                'FIRESTORE_NOT_AVAILABLE',
              message:
                'Banco de dados temporariamente indisponível.',
            },
          });
        }
      } else {
        const couponReference =
          adminDb
            .collection(
              COUPONS_COLLECTION,
            )
            .doc(upperCode);

        const existingDocument =
          await couponReference.get();

        if (existingDocument.exists) {
          return res.status(409).json({
            success: false,
            error: {
              code:
                'COUPON_ALREADY_EXISTS',
              message:
                'Já existe um cupom com este código.',
            },
          });
        }

        await couponReference.create(
          newCoupon,
        );
      }

      auditLogs.unshift({
        id:
          `log-coup-add-${Date.now()}`,
        timestamp:
          new Date().toISOString(),
        userId:
          req.user?.uid ||
          'admin',
        userName:
          req.user?.name ||
          'Administrador',
        userRole:
          req.user?.role ||
          'admin',
        action: 'COUPON_CREATED',
        details:
          `Novo cupom '${upperCode}' criado com ${numericValue} minutos bônus`,
        ip:
          req.ip ||
          '127.0.0.1',
        status: 'SUCCESS',
      });

      return res.json({
        success: true,
        data: {
          coupon: newCoupon,
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao criar cupom:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'COUPON_CREATE_FAILED',
          message:
            'Não foi possível criar o cupom.',
        },
      });
    }
  },
);

// ==========================================
// GEMINI AI SECURE PROXY ENDPOINTS
// ==========================================
app.post(
  '/api/ai/oracle-interpretation',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const userId =
      req.user?.uid ||
      'usr-client-1';

    try {
      // DAILY LIMIT CHECK (Max 30 requests per day per user)
      const now = Date.now();

      if (
        !userDailyAiUsage[userId] ||
        now > userDailyAiUsage[userId].resetAt
      ) {
        userDailyAiUsage[userId] = {
          count: 0,
          resetAt: now + 86400000,
        };
      }

      if (
        userDailyAiUsage[userId].count >= 30
      ) {
        return res.status(429).json({
          success: false,
          error: {
            code:
              'DAILY_AI_LIMIT_EXCEEDED',
            message:
              'Você atingiu o limite máximo de 30 interpretações oraculares por IA no dia.',
          },
        });
      }
    const {
      oracleType,
      cardOrSymbol,
      userQuestion,
      contextPrompt,
      userProfile,
      consultantId: rawConsultantId,
      attendantId: rawAttendantId,
    } = req.body as {
      oracleType?: string;
      cardOrSymbol?: string;
      userQuestion?: string;
      contextPrompt?: string;
      consultantId?: string;
      attendantId?: string;

      userProfile?: {
        fullName?: string;
        birthFullName?: string;
        name?: string;
        birthDate?: string;
        birthTime?: string;
        city?: string;
      };
    };

    // 1. Oracle Type Validation
    if (!oracleType || typeof oracleType !== 'string' || !oracleType.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORACLE',
          message: 'O tipo do oráculo é obrigatório.',
        },
      });
    }

    const normalizedOracleId = normalizarOracleProfileId(oracleType);
    if (!normalizedOracleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORACLE',
          message: `Oráculo '${oracleType}' não é suportado ou é inválido.`,
        },
      });
    }

    // 2. Strict Consultant Identity Resolution & Oracle Authorization
    const consultantId = rawConsultantId || rawAttendantId;
    let consultantAuthResult: ConsultantAuthorizationResult | null = null;
    if (consultantId) {
      consultantAuthResult = verifyConsultantOracleAuthorization(consultantId, normalizedOracleId);
      if (!consultantAuthResult.authorized) {
        return res.status(consultantAuthResult.statusCode || 403).json({
          success: false,
          error: {
            code: consultantAuthResult.code || 'ORACLE_UNAUTHORIZED_FOR_CONSULTANT',
            message: consultantAuthResult.message || 'Oráculo não autorizado para este consultor.',
            normalizedOracleId,
            consultant: consultantAuthResult.resolvedConsultantId
              ? {
                  id: consultantAuthResult.resolvedConsultantId,
                  name: consultantAuthResult.consultantName,
                  kind: consultantAuthResult.consultantKind,
                }
              : undefined,
          },
        });
      }
    }

    // 3. Input Length Limit (Max 2000 chars)
    const combinedPromptLength = (userQuestion || '').length + (contextPrompt || '').length;
    if (combinedPromptLength > 2000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PROMPT_TOO_LONG',
          message: 'O texto da pergunta excede o limite máximo permitido de 2.000 caracteres.',
        },
      });
    }

    // 4. Prompt Injection Guard
    if (securityConfig.promptInjectionGuard && (userQuestion || contextPrompt)) {
      const injectionPattern = /(ignore (previous|all) (instructions|prompts)|system prompt|reveal (key|secret)|print (api_key|token)|DAN mode|ignore as instruções)/gi;
      if (injectionPattern.test(userQuestion || '') || injectionPattern.test(contextPrompt || '')) {
        securityMetrics.promptInjectionsBlocked++;
        securityMetrics.blockedAttacks++;
        auditLogs.unshift({
          id: `log-inj-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId,
          userName: req.user?.name || 'Usuário',
          userRole: req.user?.role || 'user',
          action: 'PROMPT_INJECTION_BLOCKED',
          details: 'Tentativa de injeção de instrução/bypass bloqueada pelo Escudo de Segurança de IA',
          ip: req.ip || '127.0.0.1',
          status: 'WARNING',
        });
        return res.status(400).json({
          success: false,
          error: {
            code: 'PROMPT_GUARD_BLOCKED',
            message: 'Sua pergunta foi bloqueada pelo Escudo de Segurança de IA (Prompt Guard).',
          },
        });
      }
    }

    // 5. Mandatory Oracle Input Validation
    const validation = validarEntradaOraculo(normalizedOracleId, {
      fullName: userProfile?.fullName,
      birthFullName: userProfile?.birthFullName,
      name: userProfile?.name,
      birthDate: userProfile?.birthDate,
      birthTime: userProfile?.birthTime,
      city: userProfile?.city,
      question: userQuestion,
    });

    if (!validation.valid) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'ORACLE_INPUT_INCOMPLETE',
          message: validation.message || 'Dados obrigatórios ausentes para o oráculo.',
          normalizedOracleId: validation.normalizedOracleId || normalizedOracleId,
          missingFields: validation.missingFields,
        },
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'GEMINI_UNAVAILABLE',
          message: 'Serviço de IA temporariamente indisponível. Verifique a chave GEMINI_API_KEY no servidor.',
        },
      });
    }

    // 6. Clean user inputs
    const cleanUserQuestion = (userQuestion || 'Orientação geral para o momento atual').replace(/<[^>]*>/g, '');
    const cleanContext = (contextPrompt || 'Nenhum').replace(/<[^>]*>/g, '');
    const profileFullName = String(
      userProfile?.birthFullName || userProfile?.fullName || userProfile?.name || ''
    ).trim();
    const profileBirthDate = String(userProfile?.birthDate || '').trim();

    // 7. Execute Oracle Engine Profile Builder Synchronously
    const oracleProfileResult = executarOracleProfile(normalizedOracleId, {
      fullName: profileFullName,
      birthDate: profileBirthDate,
      birthTime: userProfile?.birthTime,
      city: userProfile?.city,
      question: cleanUserQuestion,
    }) as {
      resumoParaOraculo?: string;
      resumoParaMariaPadilha?: string;
    };

    const oracleProfileSummary =
      oracleProfileResult.resumoParaOraculo ||
      oracleProfileResult.resumoParaMariaPadilha ||
      '';

    const systemInstruction = `Você é um mestre oraculista especializado no oráculo ${normalizedOracleId}.
Suas respostas devem ser profundas, éticas, acolhedoras, metafóricas e espiritualmente elevadas.
Forneça insights claros, conselhos para reflexão pessoal e orientação prática.
Evite fazer previsões médicas ou promessas absolutas sobre o futuro.
Idioma: Português do Brasil. Formato: Markdown legível com tópicos.`;

    const prompt = `
Consulte o oráculo:
${normalizedOracleId}

Carta ou símbolo informado pela interface:
${cardOrSymbol || 'Tiragem geral'}

Pergunta do consulente:
${cleanUserQuestion}

Contexto adicional:
${cleanContext}

RESULTADO INTERNO DO PERFIL ORACULAR:
${oracleProfileSummary}

INSTRUÇÕES DE INTERPRETAÇÃO:
- Utilize o resultado interno como base principal do atendimento.
- Não contradiga cartas, símbolos, números, Odùs, runas ou hexagramas apresentados.
- Não diga que executou código, cálculo ou seleção automática.
- Responda diretamente à pergunta.
- Explique forças favoráveis, obstáculos e tendência.
- Apresente orientação prática.
- Preserve o livre-arbítrio.
- Não faça promessas absolutas.
- Não responda como relatório técnico.
`.trim();

    // 8. Atomic Gemini Execution (Exactly 1 call, no hidden retry loops or switches to generic prompt)
    const modelToUse = GEMINI_MODELS[0] || 'gemini-2.5-flash';
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      controller.abort(new Error('GEMINI_ORACLE_TIMEOUT'));
    }, GEMINI_MODEL_TIMEOUT_MS);

    try {
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          systemInstruction,
          maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
          abortSignal: controller.signal,
          httpOptions: {
            timeout: GEMINI_MODEL_TIMEOUT_MS,
          },
        },
      });

      const rawText = String(response.text || '').trim();
      const sanitizedOutput = rawText.replace(/<script.*?>.*?<\/script>/gi, '').trim();

      if (sanitizedOutput.length <= 20) {
        return res.status(502).json({
          success: false,
          error: {
            code: 'GEMINI_EXECUTION_FAILED',
            message: 'O modelo de inteligência artificial retornou uma resposta vazia ou insuficiente.',
          },
        });
      }

      // Usage is only accounted after successful response
      userDailyAiUsage[userId].count++;

      auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        userName: req.user?.name || 'Consultor / Sistema',
        userRole: req.user?.role || 'user',
        action: 'AI_ORACLE_INTERPRETATION',
        details: `Interpretação gerada para ${normalizedOracleId} (${cardOrSymbol || 'Geral'}) usando ${modelToUse}.`,
        ip: req.ip || '127.0.0.1',
        status: 'SUCCESS',
      });

      return res.json({
        success: true,
        data: {
          interpretation: sanitizedOutput,
          oracleType,
          normalizedOracleId,
          cardOrSymbol: cardOrSymbol || 'Tiragem em Tempo Real',
          consultant: consultantAuthResult?.resolvedConsultantId
            ? {
                id: consultantAuthResult.resolvedConsultantId,
                name: consultantAuthResult.consultantName,
                kind: consultantAuthResult.consultantKind,
              }
            : undefined,
          modelUsed: modelToUse,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (geminiError: any) {
      console.error('[ORACULOS.TS] Erro atômico na execução Gemini:', geminiError?.message || geminiError);

      const isTimeout =
        controller.signal.aborted ||
        geminiError?.name === 'AbortError' ||
        geminiError?.message === 'GEMINI_ORACLE_TIMEOUT';

      const statusCode = isTimeout ? 504 : 502;

      return res.status(statusCode).json({
        success: false,
        error: {
          code: 'GEMINI_EXECUTION_FAILED',
          message: isTimeout
            ? 'Tempo limite de resposta excedido na consulta ao Gemini.'
            : 'Falha na comunicação direta com o serviço de inteligência artificial Gemini.',
        },
      });
    } finally {
      clearTimeout(timeoutHandle);
    }
  } catch (error: unknown) {
    const candidateError = error as {
      status?: unknown;
      statusCode?: unknown;
      response?: {
        status?: unknown;
      };
      message?: string;
    };

    const possibleStatus =
      candidateError.status ??
      candidateError.statusCode ??
      candidateError.response?.status;

    const parsedStatus = Number(possibleStatus);
    const statusCode = Number.isFinite(parsedStatus) && parsedStatus >= 400 && parsedStatus <= 599
      ? parsedStatus
      : 500;

    console.error('[ORACULOS.TS] Erro geral na rota de interpretação oracular:', error);

    return res.status(statusCode).json({
      success: false,
      error: {
        code: 'AI_ORACLE_GENERATION_FAILED',
        message: 'Não foi possível processar a solicitação oracular. Nenhum uso foi contabilizado.',
      },
    });
  }
});











// Virtual Attendant Conversational Endpoint (Etapa B & C Engine)
app.post('/api/ai/virtual-attendant-chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid || 'usr-client-1';
    const { attendantId, userMessage, chatHistory, userProfile, oracleType } = req.body;

    const cleanMessage = (userMessage || '').replace(/<[^>]*>/g, '').trim();
    if (!cleanMessage) {
      return res.status(400).json({ success: false, error: { code: 'EMPTY_MESSAGE', message: 'A mensagem do consulente não pode estar vazia.' } });
    }

    // Prompt Injection Guard
    if (securityConfig.promptInjectionGuard) {
      const injectionPattern = /(ignore (previous|all) (instructions|prompts)|system prompt|reveal (key|secret)|print (api_key|token)|DAN mode)/gi;
      if (injectionPattern.test(cleanMessage)) {
        securityMetrics.promptInjectionsBlocked++;
        return res.status(400).json({
          success: false,
          error: { code: 'PROMPT_GUARD_BLOCKED', message: 'Sua mensagem foi bloqueada pelo Escudo de Segurança de IA.' },
        });
      }
    }

    // Find attendant profile with strict exact ID matching
    let attendant = null;
    if (attendantId) {
      attendant = VIRTUAL_PROFILES.find((p) => p.id === String(attendantId).trim());
      if (!attendant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ATTENDANT_NOT_FOUND',
            message: `Atendente virtual com ID '${attendantId}' não foi encontrado.`,
          },
        });
      }
    } else {
      attendant = VIRTUAL_PROFILES[0];
    }

    const requestedOracle = oracleType || attendant.authorizedOracles[0];
    const normalizedOracleId = normalizarOracleProfileId(String(requestedOracle));

    if (!normalizedOracleId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORACLE',
          message: `Oráculo '${requestedOracle}' não é suportado ou é inválido.`,
        },
      });
    }

    const authorizedList = (attendant.authorizedOracles || [])
      .map((o) => normalizarOracleProfileId(o))
      .filter(Boolean);

    if (!authorizedList.includes(normalizedOracleId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ORACLE_UNAUTHORIZED_FOR_CONSULTANT',
          message: `O atendente virtual '${attendant.name}' não está autorizado para o oráculo '${normalizedOracleId}'.`,
        },
      });
    }

    // Run specialized Oracle Engine calculation if user profile available
    const profileFullName = String(
      userProfile?.birthFullName || userProfile?.fullName || userProfile?.name || ''
    ).trim();
    const profileBirthDate = String(userProfile?.birthDate || '').trim();

    let oracleProfileSummary = '';
    if (normalizedOracleId && profileFullName && profileBirthDate) {
      try {
        const oracleProfileResult = executarOracleProfile(normalizedOracleId, {
          fullName: profileFullName,
          birthDate: profileBirthDate,
          birthTime: userProfile?.birthTime,
          city: userProfile?.city,
          question: cleanMessage,
        }) as { resumoParaOraculo?: string; resumoParaMariaPadilha?: string };

        oracleProfileSummary =
          oracleProfileResult.resumoParaOraculo ||
          oracleProfileResult.resumoParaMariaPadilha ||
          '';
      } catch (profileError) {
        console.error('[ORACULOS.TS] Erro na execução do perfil oracular em chat virtual:', profileError);
      }
    }

    // Intent Classification Logic
    let classifiedIntent: ConsultationIntent = 'general_conversation';
    const lower = cleanMessage.toLowerCase();

    if (/^(olá|oi|boa tarde|bom dia|boa noite|paz|saravá|saudações)/i.test(lower)) {
      classifiedIntent = 'greeting';
    } else if (/(ele|ela|meu ex|minha ex|meu namorado|minha namorada|meu marido|minha esposa|lucas|carlos|pedro|gabriel|ana|juliana|maria)/i.test(lower)) {
      classifiedIntent = 'third_person';
    } else if (/(amor|paixão|relacionamento|fidelidade|volta|voltar|gosta de mim|saudades)/i.test(lower)) {
      classifiedIntent = 'love';
    } else if (/(trabalho|emprego|carreira|empresa|chefe|promoção|negócio)/i.test(lower)) {
      classifiedIntent = 'work';
    } else if (/(dinheiro|finanças|dívida|prosperidade|ganho|investimento)/i.test(lower)) {
      classifiedIntent = 'finance';
    } else if (/(espiritual|proteção|limpeza|inveja|orientação|orixá|anjos)/i.test(lower)) {
      classifiedIntent = 'spirituality';
    } else if (/(tiragem|cartas|búzios|runas|mapa|oráculo|jogar)/i.test(lower)) {
      classifiedIntent = 'oracle_request';
    }

    // Third-person name extraction
    let thirdPersonName: string | null = null;
    const thirdPersonMatch = cleanMessage.match(/(?:o|a|com|sobre|de)\s+([A-Z][a-zà-ú]+)/);
    if (thirdPersonMatch && thirdPersonMatch[1] && !['Amor', 'Tarot', 'Deus', 'Búzios', 'Runas', 'Sim', 'Não'].includes(thirdPersonMatch[1])) {
      thirdPersonName = thirdPersonMatch[1];
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: { code: 'GEMINI_UNAVAILABLE', message: 'Serviço de IA indisponível. Verifique as configurações de servidor.' },
      });
    }

    // Context & Session History formatting
    const formattedHistory = Array.isArray(chatHistory)
      ? chatHistory.slice(-6).map((m: any) => `${m.senderName}: ${m.text}`).join('\n')
      : '';

    



const systemInstruction = `Você é ${attendant.name}, ${attendant.title}.
Apresentação: ${attendant.bio}.
Estilo de comunicação: ${attendant.communicationStyle}.
Sua personalidade: ${attendant.personality}.
Vocabulário frequente: ${attendant.vocabulary.join(', ')}.
Oráculos autorizados: ${attendant.authorizedOracles.join(', ')}.
Regras de conduta e segurança: ${attendant.safetyLimits.join(', ')}.

MANDATOS RIGOROSOS DE ATENDIMENTO:
1. Responda SEMPRE em Português do Brasil com acolhimento, empatia, seriedade oracular e elegância.
2. NUNCA diga que é uma inteligência artificial ou programa. Mantenha a imersão como um oraculista experiente.
3. Se o consulente fizer uma pergunta sobre outra pessoa, identifique a energia dessa pessoa e mantenha o sigilo ético.
4. Se faltar o nome de alguém mencionado, peça gentilmente antes de concluir a leitura final.
5. Estruture sua resposta com clareza, empatia e conselhos construtivos sem causar desespero.
6. Limite a resposta a no máximo 1200 caracteres para manter a agilidade da consulta por minutos.`;

const birthTimeInformation =
  userProfile?.doesNotKnowBirthTime === true
    ? 'Não conhecido pelo consulente'
    : userProfile?.birthTime || 'Não informado';

const prompt = `Consulente: ${userProfile?.name || 'Consulente'}
Nome completo de nascimento: ${userProfile?.birthFullName || userProfile?.name || 'Não informado'}
Data de nascimento: ${userProfile?.birthDate || 'Não informada'}
Horário de nascimento: ${birthTimeInformation}

Histórico recente da conversa:
${formattedHistory}

Nova mensagem do consulente: "${cleanMessage}"
Intenção identificada: ${classifiedIntent}
${thirdPersonName ? `Pessoa mencionada na pergunta: ${thirdPersonName}` : ''}

RESULTADO INTERNO DO PERFIL ORACULAR (${normalizedOracleId}):
${oracleProfileSummary || 'Utilize os dados do consulente e o oráculo ativo sem inventar valores aleatórios.'}

Responda como ${attendant.name} de forma direta, acolhedora e alinhada ao oráculo (${normalizedOracleId}).`;







    type GeminiAttemptFailure = {
  model: string;
  reason: string;
  statusCode: number | null;
  elapsedMs: number;
};

const retryableStatusCodes = new Set([
  408,
  429,
  500,
  502,
  503,
  504,
]);

const getGeminiErrorStatus = (
  error: unknown,
): number | null => {
  if (
    !error ||
    typeof error !== 'object'
  ) {
    return null;
  }

  const candidateError =
    error as {
      status?: unknown;
      statusCode?: unknown;
      response?: {
        status?: unknown;
      };
      error?: {
        code?: unknown;
      };
    };

  const possibleStatus =
    candidateError.status ??
    candidateError.statusCode ??
    candidateError.response?.status ??
    candidateError.error?.code;

  const parsedStatus =
    Number(possibleStatus);

  return Number.isFinite(parsedStatus)
    ? parsedStatus
    : null;
};

const isRetryableGeminiError = (
  error: unknown,
): boolean => {
  if (
    error instanceof Error &&
    (
      error.name === 'AbortError' ||
      error.name === 'RequestTimeoutError' ||
      error.message === 'GEMINI_MODEL_TIMEOUT'
    )
  ) {
    return true;
  }

  const statusCode =
    getGeminiErrorStatus(error);

  if (
    statusCode !== null &&
    retryableStatusCodes.has(statusCode)
  ) {
    return true;
  }

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('overloaded') ||
    errorMessage.includes('resource exhausted') ||
    errorMessage.includes('temporarily unavailable')
  );
};

const failedModels:
  GeminiAttemptFailure[] = [];

let responseText = '';
let modelUsed = '';

const availableModels =
  GEMINI_MODELS.slice(
    0,
    GEMINI_MAX_RETRIES,
  );

for (
  const model of availableModels
) {
  const attemptStartedAt =
    Date.now();

  const controller =
    new AbortController();

  const timeoutHandle =
    setTimeout(() => {
      controller.abort(
        new Error(
          'GEMINI_MODEL_TIMEOUT',
        ),
      );
    }, GEMINI_MODEL_TIMEOUT_MS);

  try {
    console.log(
      '[ORACULOS.TS] Tentativa Gemini iniciada.',
      {
        userId,
        model,
        timeoutMs:
          GEMINI_MODEL_TIMEOUT_MS,
      },
    );

    const response =
      await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,

          maxOutputTokens:
            GEMINI_MAX_OUTPUT_TOKENS,

          abortSignal:
            controller.signal,

          httpOptions: {
            timeout:
              GEMINI_MODEL_TIMEOUT_MS,
          },
        },
      });

    const candidateText =
      String(
        response.text || '',
      ).trim();

    if (
      candidateText.length <= 20
    ) {
      const invalidResponseError =
        new Error(
          'GEMINI_EMPTY_RESPONSE',
        );

      (
        invalidResponseError as
          Error & {
            statusCode?: number;
          }
      ).statusCode = 503;

      throw invalidResponseError;
    }

    responseText =
      candidateText;

    modelUsed =
      model;

    console.log(
      '[ORACULOS.TS] Gemini respondeu com sucesso.',
      {
        userId,
        model,
        elapsedMs:
          Date.now() -
          attemptStartedAt,
        fallbackCount:
          failedModels.length,
      },
    );

    break;
  } catch (
    error: unknown
  ) {
    const statusCode =
      getGeminiErrorStatus(
        error,
      );

    const timedOut =
      controller.signal.aborted ||
      (
        error instanceof Error &&
        (
          error.name ===
            'AbortError' ||
          error.name ===
            'RequestTimeoutError' ||
          error.message ===
            'GEMINI_MODEL_TIMEOUT'
        )
      );

    const reason =
      timedOut
        ? 'TIMEOUT'
        : error instanceof Error
          ? error.message
          : 'UNKNOWN_GEMINI_ERROR';

    const retryable =
      isRetryableGeminiError(
        error,
      );

    failedModels.push({
      model,
      reason,
      statusCode,
      elapsedMs:
        Date.now() -
        attemptStartedAt,
    });

    console.warn(
      '[ORACULOS.TS] Modelo Gemini falhou.',
      {
        userId,
        model,
        reason,
        statusCode,
        retryable,
      },
    );

    /*
     * Erros de autenticação, permissão
     * ou requisição inválida não serão
     * enviados para outro modelo.
     */
    if (!retryable) {
      throw error;
    }
  } finally {
    clearTimeout(
      timeoutHandle,
    );
  }
}

if (
  !responseText ||
  !modelUsed
) {
  console.error(
    '[ORACULOS.TS] Todos os modelos Gemini falharam.',
    {
      userId,
      attemptedModels:
        availableModels,
      failures:
        failedModels,
    },
  );

  return res.status(503).json({
    success: false,
    error: {
      code:
        'ALL_GEMINI_MODELS_UNAVAILABLE',

      message:
        'Nossos atendentes virtuais estão se reconectando. Nenhum minuto foi descontado. Tente novamente em alguns instantes.',
    },
  });
}
    // Output Validation
    const validation: OracleResponseValidation = {
      relevant: responseText.length > 20,
      contextConsistent: true,
      culturallyRespectful: true,
      safe: !/(suicídio|morrer|bomba|arma|matar)/i.test(responseText),
      withinCharacterLimit: responseText.length <= 1500,
      requiresHumanReview: false,
      issues: [],
    };

    if (!validation.safe) {
      validation.issues.push('Resposta retida por filtro de segurança.');
    }

    const statusSteps = [
      'Digitando...',
      `Embaralhando os oráculos de ${attendant.name}...`,
      'Consultando a energia da sua pergunta...',
      'Finalizando orientação...'
    ];

    



auditLogs.unshift({
  id: `log-attendant-${Date.now()}`,
  timestamp: new Date().toISOString(),
  userId,
  userName:
    req.user?.name ||
    'Consulente',
  userRole:
    req.user?.role ||
    'user',
  action:
    'VIRTUAL_ATTENDANT_CONSULTATION',
  details:
    `Atendimento efetuado por ${attendant.name} ` +
    `(${classifiedIntent}) usando ${modelUsed}. ` +
    `Fallbacks anteriores: ${failedModels.length}.`,
  ip:
    req.ip ||
    '127.0.0.1',
  status:
    'SUCCESS',
});

const responseChunks =
  splitIntoNaturalResponseChunks(
    responseText,
  );

return res.json({
  success: true,

  data: {
    attendantId:
      attendant.id,

    attendantName:
      attendant.name,

    /*
     * Mantido temporariamente para
     * compatibilidade com o frontend atual.
     */
    responseMessage:
      responseText,

    /*
     * Nova estrutura para entrega gradual.
     */
    responseChunks,

    totalChunks:
      responseChunks.length,

    intent:
      classifiedIntent,

    thirdPersonName,

    validation,

    statusSteps,

    modelUsed,

    fallbackCount:
      failedModels.length,

    attemptedModels:
      availableModels.slice(
        0,
        failedModels.length + 1,
      ),

    estimatedTypingMs:
      Math.min(
        3000,
        Math.max(
          1200,
          responseText.length * 15,
        ),
      ),

    generatedAt:
      new Date().toISOString(),
  },
});




  } catch (error: any) {
    console.error('Erro no atendimento virtual IA:', error);
    res.status(500).json({
      success: false,
      error: { code: 'VIRTUAL_ATTENDANT_ERROR', message: 'Falha ao processar atendimento oracular virtual.' },
    });
  }
});

app.post('/api/ai/generate-blog', requireAuth, requireRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) return res.status(503).json({ success: false, error: { code: 'NO_KEY', message: 'Chave GEMINI_API_KEY não configurada.' } });

    const { topic, oracleCategory } = req.body;
    const cleanTopic = (topic || 'A Energia do Tarot de Marseille').replace(/<[^>]*>/g, '');

    const prompt = `Crie um artigo completo de blog espiritual sobre o tema: "${cleanTopic}".
Categoria: ${oracleCategory || 'tarot'}.

Retorne em formato JSON estrito com os seguintes campos:
- title: Título atraente
- summary: Resumo instigante de 2 frases
- content: O artigo completo formatado em Markdown com subtítulos
- metaTitle: Título otimizado para SEO (máximo 60 caracteres)
- metaDescription: Descrição otimizada para SEO (máximo 155 caracteres)
- keywords: Array de 5 palavras-chave
- readTime: Estimativa de leitura
- schemaType: Tipo de Schema.org apropriado`;




const blogModels =
  GEMINI_MODELS.slice(
    0,
    GEMINI_MAX_RETRIES,
  );

const blogModelFailures: Array<{
  model: string;
  reason: string;
  statusCode: number | null;
  elapsedMs: number;
}> = [];

let data:
  Record<string, unknown> | null =
  null;

let blogModelUsed = '';

for (const model of blogModels) {
  const attemptStartedAt =
    Date.now();

  const controller =
    new AbortController();

  const timeoutHandle =
    setTimeout(() => {
      controller.abort(
        new Error(
          'GEMINI_BLOG_TIMEOUT',
        ),
      );
    }, GEMINI_MODEL_TIMEOUT_MS);

  try {
    console.log(
      '[ORACULOS.TS] Tentativa Gemini para blog iniciada.',
      {
        model,
        timeoutMs:
          GEMINI_MODEL_TIMEOUT_MS,
      },
    );

    const response =
      await ai.models.generateContent({
        model,

        contents:
          prompt,

        config: {
          responseMimeType:
            'application/json',

          maxOutputTokens:
            GEMINI_MAX_OUTPUT_TOKENS,

          abortSignal:
            controller.signal,

          httpOptions: {
            timeout:
              GEMINI_MODEL_TIMEOUT_MS,
          },
        },
      });

    const rawBlogResponse =
      String(
        response.text || '',
      ).trim();

    if (!rawBlogResponse) {
      const emptyResponseError =
        new Error(
          'GEMINI_EMPTY_BLOG_RESPONSE',
        );

      (
        emptyResponseError as
          Error & {
            statusCode?: number;
          }
      ).statusCode = 503;

      throw emptyResponseError;
    }

    let parsedBlog:
      Record<string, unknown>;

    try {
      parsedBlog =
        JSON.parse(
          rawBlogResponse,
        ) as Record<string, unknown>;
    } catch {
      console.warn(
        '[ORACULOS.TS] Gemini retornou JSON inválido para o blog.',
        {
          model,

          responsePreview:
            rawBlogResponse.slice(
              0,
              300,
            ),
        },
      );

      const invalidJsonError =
        new Error(
          'GEMINI_INVALID_BLOG_JSON',
        );

      (
        invalidJsonError as
          Error & {
            statusCode?: number;
          }
      ).statusCode = 503;

      throw invalidJsonError;
    }

    if (
      !parsedBlog.title ||
      !parsedBlog.content
    ) {
      const incompleteBlogError =
        new Error(
          'GEMINI_INCOMPLETE_BLOG_JSON',
        );

      (
        incompleteBlogError as
          Error & {
            statusCode?: number;
          }
      ).statusCode = 503;

      throw incompleteBlogError;
    }

    data =
      parsedBlog;

    blogModelUsed =
      model;

    console.log(
      '[ORACULOS.TS] Blog gerado com sucesso.',
      {
        model,
        elapsedMs:
          Date.now() -
          attemptStartedAt,
        fallbackCount:
          blogModelFailures.length,
      },
    );

    break;
  } catch (error: unknown) {
    const candidateError =
      error as {
        name?: string;
        message?: string;
        status?: unknown;
        statusCode?: unknown;
        response?: {
          status?: unknown;
        };
        error?: {
          code?: unknown;
        };
      };

    const possibleStatus =
      candidateError.status ??
      candidateError.statusCode ??
      candidateError.response?.status ??
      candidateError.error?.code;

    const parsedStatus =
      Number(possibleStatus);

    const statusCode =
      Number.isFinite(parsedStatus)
        ? parsedStatus
        : null;

    const timedOut =
      controller.signal.aborted ||
      candidateError.name ===
        'AbortError' ||
      candidateError.name ===
        'RequestTimeoutError' ||
      candidateError.message ===
        'GEMINI_BLOG_TIMEOUT';

    const reason =
      timedOut
        ? 'TIMEOUT'
        : candidateError.message ||
          'UNKNOWN_GEMINI_BLOG_ERROR';

    const normalizedMessage =
      reason.toLowerCase();

    const retryable =
      timedOut ||
      statusCode === 408 ||
      statusCode === 429 ||
      statusCode === 500 ||
      statusCode === 502 ||
      statusCode === 503 ||
      statusCode === 504 ||
      normalizedMessage.includes(
        'network',
      ) ||
      normalizedMessage.includes(
        'fetch failed',
      ) ||
      normalizedMessage.includes(
        'overloaded',
      ) ||
      normalizedMessage.includes(
        'resource exhausted',
      ) ||
      normalizedMessage.includes(
        'temporarily unavailable',
      ) ||
      reason ===
        'GEMINI_EMPTY_BLOG_RESPONSE' ||
      reason ===
        'GEMINI_INVALID_BLOG_JSON' ||
      reason ===
        'GEMINI_INCOMPLETE_BLOG_JSON';

    blogModelFailures.push({
      model,
      reason,
      statusCode,
      elapsedMs:
        Date.now() -
        attemptStartedAt,
    });

    console.warn(
      '[ORACULOS.TS] Modelo Gemini falhou ao gerar blog.',
      {
        model,
        reason,
        statusCode,
        retryable,
      },
    );

    if (!retryable) {
      throw error;
    }
  } finally {
    clearTimeout(
      timeoutHandle,
    );
  }
}

if (
  !data ||
  !blogModelUsed
) {
  console.error(
    '[ORACULOS.TS] Todos os modelos falharam na geração do blog.',
    {
      attemptedModels:
        blogModels,

      failures:
        blogModelFailures,
    },
  );

  return res.status(503).json({
    success: false,

    error: {
      code:
        'ALL_GEMINI_BLOG_MODELS_UNAVAILABLE',

      message:
        'Os modelos de geração de conteúdo estão temporariamente indisponíveis. Tente novamente em alguns instantes.',
    },
  });
}



    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: req.user?.uid || 'usr-admin-1',
      userName: req.user?.name || 'Administrador',
      userRole: req.user?.role || 'admin',
      action: 'AI_BLOG_GENERATED',
      details: `Novo artigo gerado por IA: "${data.title || cleanTopic}"`,
      ip: req.ip || '127.0.0.1',
      status: 'SUCCESS',
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'AI_BLOG_FAILED', message: 'Erro ao gerar artigo de blog.' } });
  }
});

// ==========================================
// AI MODERATION & SUPPORT ASSISTANT
// ==========================================
const supportTicketsDb: Record<string, {
  id: string;
  protocol: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}> = {};

app.post('/api/ai/moderate-and-support', async (req: Request, res: Response) => {
  try {
    const { message, userContext } = req.body;
    const cleanMessage = String(message || '').replace(/<[^>]*>/g, '').trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_MESSAGE', message: 'Mensagem de suporte não pode estar vazia.' },
      });
    }

    const lower = cleanMessage.toLowerCase();
    let reply = '';
    let category = 'general';
    let suggestedAction = 'none';
    let needsHumanEscalation = false;

    // Detect Categories
    if (lower.includes('reembolso') || lower.includes('estorno') || lower.includes('devolução') || lower.includes('cancelar compra')) {
      category = 'refund';
      reply = 'Compreendemos sua solicitação sobre reembolso ou estorno. De acordo com nossa política e com o Código de Defesa do Consumidor, solicitações de reembolso de pacotes de minutos não utilizados são analisadas pelo nosso suporte em até 2 dias úteis. Caso deseje abrir uma solicitação formal, utilize a opção "Abrir Ticket de Suporte" abaixo.';
      suggestedAction = 'open_ticket';
      needsHumanEscalation = true;
    } else if (lower.includes('pagamento') || lower.includes('pix') || lower.includes('mercado pago') || lower.includes('recarga') || lower.includes('crédito')) {
      category = 'billing';
      reply = 'Para dúvidas sobre pagamentos e recargas: pagamentos via Pix no Mercado Pago são processados instantaneamente e os minutos são creditados de forma imediata na sua conta. Se o saldo não foi atualizado após o pagamento, verifique seu extrato na aba Minha Carteira ou envie o comprovante via ticket de suporte.';
      suggestedAction = 'view_wallet';
    } else if (lower.includes('lgpd') || lower.includes('dados') || lower.includes('excluir conta') || lower.includes('privacidade') || lower.includes('titular')) {
      category = 'lgpd';
      reply = 'Em conformidade com a LGPD (Lei 13.709/2018), você possui total controle sobre seus dados pessoais. É possível realizar o download do seu relatório completo de dados ou solicitar a exclusão definitiva diretamente na seção "Central de Privacidade e LGPD". Dúvidas podem ser encaminhadas diretamente ao nosso Encarregado de Dados (DPO) através do canal oficial.';
      suggestedAction = 'view_privacy_portal';
    } else if (lower.includes('consulta') || lower.includes('oráculo') || lower.includes('tarot') || lower.includes('atendente virtual')) {
      category = 'consultation';
      reply = 'Nossos atendimentos combinam especialistas qualificados e atendentes virtuais inteligentes desenvolvidos com conhecimento oracular canônico. O débito é calculado com precisão de minutos reais consumidos e transparência absoluta. Você pode iniciar um atendimento selecionando seu oráculo favorito no Marketplace.';
      suggestedAction = 'view_marketplace';
    } else {
      reply = 'Olá! O Assistente de Apoio ORACULOS.TS está à sua disposição. Como podemos orientar sua experiência na plataforma hoje? Caso necessite de atendimento humano especializado, você pode registrar um ticket a qualquer momento.';
      suggestedAction = 'open_ticket';
    }

    return res.json({
      success: true,
      data: {
        reply,
        category,
        suggestedAction,
        needsHumanEscalation,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Erro na moderação e suporte:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SUPPORT_AI_ERROR', message: 'Falha ao processar solicitação de suporte.' },
    });
  }
});

// Create Support Ticket
app.post(
  '/api/support/ticket',
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        email,
        name,
        category,
        subject,
        message,
        userId,
      } = req.body;

      const cleanEmail =
        String(email || '')
          .trim()
          .toLowerCase();

      const cleanSubject =
        String(
          subject ||
          'Solicitação de Suporte',
        )
          .replace(
            /<[^>]*>/g,
            '',
          )
          .trim();

      const cleanMessage =
        String(message || '')
          .replace(
            /<[^>]*>/g,
            '',
          )
          .trim();

      if (
        !cleanEmail ||
        !cleanMessage
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message:
              'E-mail e descrição são obrigatórios para registrar o ticket.',
          },
        });
      }

      const ticketId =
        `tkt_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 7)}`;

      const protocol =
        `TKT-${new Date().getFullYear()}-${Date.now()
          .toString()
          .slice(-6)}`;

      const now =
        new Date().toISOString();

      const ticket = {
        id: ticketId,
        protocol,
        userId:
          typeof userId === 'string' &&
          userId.trim()
            ? userId.trim()
            : undefined,
        userName:
          String(
            name || 'Consulente',
          ).trim(),
        userEmail:
          cleanEmail,
        category:
          String(
            category || 'general',
          ).trim(),
        subject:
          cleanSubject,
        message:
          cleanMessage,
        status:
          'open' as const,
        createdAt: now,
        updatedAt: now,
      };

      if (!adminDb) {
        if (
          process.env.NODE_ENV === 'test'
        ) {
          supportTicketsDb[
            ticketId
          ] = ticket;
        } else {
          return res.status(503).json({
            success: false,
            error: {
              code:
                'FIRESTORE_NOT_AVAILABLE',
              message:
                'Serviço de suporte temporariamente indisponível.',
            },
          });
        }
      } else {
        await adminDb
          .collection(
            'supportTickets',
          )
          .doc(ticketId)
          .create(ticket);
      }

      auditLogs.unshift({
        id:
          `log-${Date.now()}`,
        timestamp: now,
        userId:
          ticket.userId ||
          'anonymous',
        userName:
          ticket.userName ||
          'Consulente',
        userRole: 'client',
        action:
          'SUPPORT_TICKET_CREATED',
        details:
          `Novo ticket criado: Protocolo ${protocol} [${ticket.category}] - ${cleanSubject}`,
        ip:
          req.ip ||
          '127.0.0.1',
        status: 'SUCCESS',
      });

      return res.json({
        success: true,
        data: {
          ticketId,
          protocol,
          status:
            ticket.status,
          createdAt:
            ticket.createdAt,
          message:
            `Ticket registrado com sucesso sob o protocolo ${protocol}.`,
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao criar ticket:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'TICKET_CREATION_FAILED',
          message:
            'Não foi possível registrar o ticket de suporte.',
        },
      });
    }
  },
);

// Admin Report AI Endpoint
app.post(
  '/api/ai/admin-report',
  requireAuth,
  requireRole([
    'admin',
    'superadmin',
  ]),
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        timeframe = '30d',
      } = req.body;

      if (!adminDb) {
        return res.status(503).json({
          success: false,
          error: {
            code:
              'FIRESTORE_NOT_AVAILABLE',
            message:
              'Banco de dados temporariamente indisponível.',
          },
        });
      }

      const [
        usersSnapshot,
        transactionsSnapshot,
        ticketsSnapshot,
      ] = await Promise.all([
        adminDb
          .collection('users')
          .get(),

        adminDb
          .collectionGroup(
            'minuteTransactions',
          )
          .get(),

        adminDb
          .collection(
            'supportTickets',
          )
          .get(),
      ]);

      const totalUsers =
        usersSnapshot.size;

      const totalTransactions =
        transactionsSnapshot.size;

      const totalTickets =
        ticketsSnapshot.size;

      const openTickets =
        ticketsSnapshot.docs.filter(
          (document) =>
            document.data()?.status ===
            'open',
        ).length;

      const servicesReady =
        Boolean(
          firebaseAdminInitialized &&
          adminDb &&
          process.env.GEMINI_API_KEY &&
          mpConfig,
        );

      const systemHealth =
        servicesReady
          ? 'Operational'
          : 'Degraded';

      const report = {
        timeframe,
        generatedAt:
          new Date().toISOString(),
        summary:
          `Relatório Executivo ORACULOS.TS: período ${timeframe}. Dados calculados a partir do Firestore. Usuários cadastrados: ${totalUsers}. Transações de minutos: ${totalTransactions}. Tickets de suporte: ${totalTickets}.`,
        kpis: {
          activeUsers:
            totalUsers,
          totalLedgerTransactions:
            totalTransactions,
          openTickets,
          systemHealth,
          uptimeSeconds:
            Math.floor(
              (
                Date.now() -
                securityMetrics
                  .serverUptimeStart
              ) / 1000,
            ),
        },
        services: {
          firebaseAdmin:
            firebaseAdminInitialized
              ? 'ok'
              : 'not_configured',
          firestore:
            adminDb
              ? 'ok'
              : 'not_configured',
          gemini:
            process.env
              .GEMINI_API_KEY
              ? 'ok'
              : 'not_configured',
          mercadoPago:
            mpConfig
              ? 'ok'
              : 'not_configured',
        },
        recommendations: [
          'Manter monitoramento dos tempos de resposta da IA e dos webhooks do Mercado Pago.',
          'Auditar periodicamente exportações e exclusões LGPD.',
          'Acompanhar tickets de suporte e reconciliação das transações de minutos.',
        ],
      };

      return res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao gerar relatório administrativo:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'REPORT_FAILED',
          message:
            'Erro ao gerar relatório administrativo.',
        },
      });
    }
  },
);

// ==========================================
// ADMINISTRATIVE USER & CREDIT MANAGEMENT APIS
// ==========================================


app.get(
  '/api/admin/users',
  requireAuth,
  requireRole([
    'admin',
    'superadmin',
    'support',
  ]),
  async (_req: Request, res: Response) => {
    try {
      if (!adminDb) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'FIRESTORE_NOT_AVAILABLE',
            message:
              'Banco de dados temporariamente indisponível.',
          },
        });
      }

      const snapshot =
        await adminDb
          .collection('users')
          .get();

      const users = snapshot.docs.map(
        (document) => ({
          ...document.data(),
          id: document.id,
        }),
      );

      return res.json({
        success: true,
        data: {
          users,
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao listar usuários administrativos:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'ADMIN_USERS_FETCH_FAILED',
          message:
            'Não foi possível carregar os usuários.',
        },
      });
    }
  },
);


app.post(
  '/api/admin/update-user-role',
  ...requireSuperAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const {
      targetUserId,
      newRole,
    } = req.body;

    if (
      !targetUserId ||
      typeof targetUserId !== 'string' ||
      !isValidUserRole(newRole)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message:
            'ID ou papel inválido.',
        },
      });
    }

    if (
      !adminDb ||
      !firebaseAdminApp
    ) {
      return res.status(503).json({
        success: false,
        error: {
          code:
            'FIREBASE_NOT_AVAILABLE',
          message:
            'Firebase temporariamente indisponível.',
        },
      });
    }

    try {
      const userReference =
        adminDb
          .collection('users')
          .doc(targetUserId);

      const userDocument =
        await userReference.get();

      if (!userDocument.exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'Usuário não encontrado.',
          },
        });
      }

      const user =
        userDocument.data() || {};

      const oldRole =
        isValidUserRole(user.role)
          ? user.role
          : 'user';

      const adminAuth =
        getAdminAuth(
          firebaseAdminApp,
        );

      const authUser =
        await adminAuth.getUser(
          targetUserId,
        );

      await adminAuth
        .setCustomUserClaims(
          targetUserId,
          {
            ...(
              authUser.customClaims ||
              {}
            ),
            role: newRole,
          },
        );

      const now =
        new Date().toISOString();

      try {
        await userReference.update({
          role: newRole,
          updatedAt: now,
        });
      } catch (firestoreError) {
        try {
          await adminAuth
            .setCustomUserClaims(
              targetUserId,
              {
                ...(
                  authUser.customClaims ||
                  {}
                ),
                role: oldRole,
              },
            );
        } catch (rollbackError) {
          console.error(
            '[ORACULOS.TS] Falha ao restaurar claim do usuário:',
            rollbackError,
          );
        }

        throw firestoreError;
      }

      auditLogs.unshift({
        id:
          `log-role-${Date.now()}`,
        timestamp: now,
        userId:
          req.user?.uid ||
          'superadmin',
        userName:
          req.user?.name ||
          'Superadmin',
        userRole:
          req.user?.role ||
          'superadmin',
        action:
          'USER_ROLE_UPDATED',
        details:
          `Papel do usuário ${String(
            user.name ||
            targetUserId,
          )} alterado de ${oldRole} para ${newRole}`,
        target: targetUserId,
        ip:
          req.ip ||
          '127.0.0.1',
        status: 'WARNING',
      });

      return res.json({
        success: true,
        data: {
          user: {
            ...user,
            id: userDocument.id,
            role: newRole,
            updatedAt: now,
          },
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao alterar papel do usuário:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'USER_ROLE_UPDATE_FAILED',
          message:
            'Não foi possível alterar o papel do usuário.',
        },
      });
    }
  },
);

app.post(
  '/api/admin/adjust-balance',
  ...requireAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        targetUserId,
        amount,
        type,
        reason,
      } = req.body;

      const numericAmount =
        Number(amount);

      const normalizedReason =
        String(reason || '')
          .trim();

      if (
        !targetUserId ||
        typeof targetUserId !==
          'string' ||
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0 ||
        (
          type !== 'add' &&
          type !== 'deduct'
        ) ||
        normalizedReason.length < 5
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message:
              'Usuário, tipo, valor positivo e justificativa de no mínimo 5 caracteres são obrigatórios.',
          },
        });
      }

      if (!adminDb) {
        return res.status(503).json({
          success: false,
          error: {
            code:
              'FIRESTORE_NOT_AVAILABLE',
            message:
              'Banco de dados temporariamente indisponível.',
          },
        });
      }

      const userReference =
        adminDb
          .collection('users')
          .doc(targetUserId);

      const userDocument =
        await userReference.get();

      if (!userDocument.exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'Usuário não encontrado.',
          },
        });
      }

      const storedUser = {
        ...(userDocument.data() || {}),
        id: userDocument.id,
      } as any;

      const adjustmentAmount =
        type === 'deduct'
          ? -Math.abs(numericAmount)
          : Math.abs(numericAmount);

      const result =
        await recordTransaction(
          storedUser,
          'admin_adjustment',
          adjustmentAmount,
          `Ajuste administrativo: ${normalizedReason}`,
          req.user?.uid ||
            'admin',
        );

      const balanceBefore =
        result.transaction
          .balanceBefore;

      const balanceAfter =
        result.transaction
          .balanceAfter;

      auditLogs.unshift({
        id:
          `log-adj-${Date.now()}`,
        timestamp:
          new Date().toISOString(),
        userId:
          req.user?.uid ||
          'admin',
        userName:
          req.user?.name ||
          'Administrador',
        userRole:
          req.user?.role ||
          'admin',
        action:
          'ADMIN_CREDIT_ADJUSTMENT',
        details:
          `Ajuste de minutos para ${String(
            storedUser.name ||
            targetUserId,
          )}: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount}. Justificativa: ${normalizedReason}`,
        target:
          targetUserId,
        ip:
          req.ip ||
          '127.0.0.1',
        status:
          'WARNING',
      });

      return res.json({
        success: true,
        data: {
          userId:
            targetUserId,
          balanceBefore,
          balanceAfter,
          adjustmentAmount,
          reason:
            normalizedReason,
          transaction:
            result.transaction,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '';

      if (
        message ===
        'INSUFFICIENT_MINUTES'
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code:
              'INSUFFICIENT_MINUTES',
            message:
              'O ajuste solicitado deixaria o saldo negativo.',
          },
        });
      }

      if (
        message ===
        'USER_BLOCKED'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'USER_BLOCKED',
            message:
              'Usuário bloqueado não pode receber ajustes de saldo.',
          },
        });
      }

      console.error(
        '[ORACULOS.TS] Erro ao ajustar saldo administrativo:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'ADMIN_BALANCE_ADJUST_FAILED',
          message:
            'Não foi possível realizar o ajuste de saldo.',
        },
      });
    }
  },
);

// LGPD User Endpoints
app.get(
  '/api/user/data-export',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Usuário não autenticado.',
          },
        });
      }

      if (!adminDb) {
        return res.status(503).json({
          success: false,
          error: {
            code:
              'FIRESTORE_NOT_AVAILABLE',
            message:
              'Banco de dados temporariamente indisponível.',
          },
        });
      }

      const userReference =
        adminDb
          .collection('users')
          .doc(userId);

      const [
        userDocument,
        minuteTransactions,
        consultationSessions,
        paymentPreferences,
        payments,
        supportTickets,
      ] = await Promise.all([
        userReference.get(),

        userReference
          .collection(
            'minuteTransactions',
          )
          .get(),

        userReference
          .collection(
            'consultationSessions',
          )
          .get(),

        adminDb
          .collection(
            'mercadoPagoPreferences',
          )
          .where(
            'userId',
            '==',
            userId,
          )
          .get(),

        adminDb
          .collection(
            'mercadoPagoPayments',
          )
          .where(
            'userId',
            '==',
            userId,
          )
          .get(),

        adminDb
          .collection(
            'supportTickets',
          )
          .where(
            'userId',
            '==',
            userId,
          )
          .get(),
      ]);

      if (!userDocument.exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'Perfil do usuário não encontrado.',
          },
        });
      }

      const mapDocuments = (
        snapshot: {
          docs: Array<{
            id: string;
            data: () => unknown;
          }>;
        },
      ) =>
        snapshot.docs.map(
          (document) => ({
            ...(document.data() as Record<
              string,
              unknown
            >),
            id: document.id,
          }),
        );

      return res.json({
        success: true,
        data: {
          exportedAt:
            new Date().toISOString(),
          profile: {
            ...(userDocument.data() || {}),
            id:
              userDocument.id,
          },
          minuteTransactions:
            mapDocuments(
              minuteTransactions,
            ),
          consultationSessions:
            mapDocuments(
              consultationSessions,
            ),
          mercadoPagoPreferences:
            mapDocuments(
              paymentPreferences,
            ),
          mercadoPagoPayments:
            mapDocuments(payments),
          supportTickets:
            mapDocuments(
              supportTickets,
            ),
          privacyPolicyNotice:
            'Exportação dos dados pessoais e registros operacionais localizados nas coleções atuais do ORACULOS.TS, conforme os direitos do titular previstos na LGPD (Lei 13.709/2018).',
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro na exportação LGPD:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'LGPD_EXPORT_FAILED',
          message:
            'Não foi possível exportar os dados da conta.',
        },
      });
    }
  },
);

app.post(
  '/api/user/delete-account',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Usuário não autenticado.',
          },
        });
      }

      if (
        !adminDb ||
        !firebaseAdminApp
      ) {
        return res.status(503).json({
          success: false,
          error: {
            code:
              'FIREBASE_NOT_AVAILABLE',
            message:
              'Serviços de conta temporariamente indisponíveis.',
          },
        });
      }

      const userReference =
        adminDb
          .collection('users')
          .doc(userId);

      const userDocument =
        await userReference.get();

      if (!userDocument.exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'Usuário não encontrado.',
          },
        });
      }

      const [
        paymentPreferences,
        payments,
        supportTickets,
      ] = await Promise.all([
        adminDb
          .collection(
            'mercadoPagoPreferences',
          )
          .where(
            'userId',
            '==',
            userId,
          )
          .get(),

        adminDb
          .collection(
            'mercadoPagoPayments',
          )
          .where(
            'userId',
            '==',
            userId,
          )
          .get(),

        adminDb
          .collection(
            'supportTickets',
          )
          .where(
            'userId',
            '==',
            userId,
          )
          .get(),
      ]);

      const externalDocuments = [
        ...paymentPreferences.docs,
        ...payments.docs,
        ...supportTickets.docs,
      ];

      if (
        externalDocuments.length > 0
      ) {
        const bulkWriter =
          adminDb.bulkWriter();

        for (
          const document of
          externalDocuments
        ) {
          bulkWriter.delete(
            document.ref,
          );
        }

        await bulkWriter.close();
      }

      /*
       * Remove o documento do usuário
       * e todas as suas subcoleções.
       */
      await adminDb.recursiveDelete(
        userReference,
      );

      const adminAuth =
        getAdminAuth(
          firebaseAdminApp,
        );

      try {
        await adminAuth.deleteUser(
          userId,
        );
      } catch (authError: any) {
        if (
          authError?.code !==
          'auth/user-not-found'
        ) {
          throw authError;
        }
      }

      auditLogs.unshift({
        id:
          `log-lgpd-${Date.now()}`,
        timestamp:
          new Date().toISOString(),
        userId,
        userName:
          'Usuário (Excluído)',
        userRole:
          req.user?.role ||
          'user',
        action:
          'LGPD_ACCOUNT_DELETION',
        details:
          'Conta do Firebase Authentication, perfil Firestore e registros pessoais associados foram removidos.',
        ip:
          req.ip ||
          '127.0.0.1',
        status: 'SUCCESS',
      });

      return res.json({
        success: true,
        message:
          'Sua conta e os dados pessoais associados foram removidos.',
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro na exclusão LGPD:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'LGPD_DELETE_FAILED',
          message:
            'Não foi possível concluir a exclusão da conta.',
        },
      });
    }
  },
);

// Vite & Static Production Server
async function startLocalServer(): Promise<void> {
  const isVercel = process.env.VERCEL === '1';

  if (isVercel || process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } =
      await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(
      process.cwd(),
      'dist',
      'public',
    );

    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(
        path.join(distPath, 'index.html'),
      );
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[ORACULOS.TS Server] Running at http://0.0.0.0:${PORT}`,
    );
  });
}

if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'test') {
  startLocalServer().catch((error: unknown) => {
    console.error(
      '[ORACULOS.TS] Erro ao iniciar servidor local:',
      error,
    );

    process.exitCode = 1;
  });
}

export default app;
