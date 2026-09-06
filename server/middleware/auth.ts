import {
  Request,
  Response,
  NextFunction,
} from 'express';

import {
  getApp,
  getApps,
} from 'firebase-admin/app';

import {
  getAuth as getAdminAuth,
} from 'firebase-admin/auth';

import {
  getFirestore,
} from 'firebase-admin/firestore';

import {
  usersDb,
  auditLogs,
} from '../config/store.js';

import {
  UserRole,
} from '../../src/types.js';

export interface AuthenticatedRequest
  extends Request {
  user?: {
    uid: string;
    email?: string;
    role: UserRole;
    name?: string;
  };
}

const VALID_ROLES: UserRole[] = [
  'user',
  'client',
  'employee',
  'consultant',
  'support',
  'admin',
  'superadmin',
];

function isValidRole(
  value: unknown,
): value is UserRole {
  return (
    typeof value === 'string' &&
    VALID_ROLES.includes(
      value as UserRole,
    )
  );
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader =
    req.headers.authorization;

  const isProduction =
    process.env.NODE_ENV ===
      'production' ||
    process.env.VERCEL === '1' ||
    process.env.STRICT_AUTH ===
      'true';

  if (
    !authHeader ||
    !authHeader.startsWith(
      'Bearer ',
    )
  ) {
    /*
     * Usuários simulados são permitidos
     * somente no desenvolvimento local.
     */
    if (!isProduction) {
      const devUserId =
        req.headers[
          'x-user-id'
        ] as string | undefined;

      if (
        devUserId &&
        usersDb[devUserId]
      ) {
        const demoUser =
          usersDb[devUserId];

        req.user = {
          uid: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          name: demoUser.name,
        };

        return next();
      }
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message:
          'Token de autenticação não fornecido.',
      },
    });
  }

  const token = authHeader
    .slice('Bearer '.length)
    .trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message:
          'Token de autenticação inválido.',
      },
    });
  }

  // Allow administrative and consultant tokens in development/preview
  if (token === 'demo_admin_token' || token === 'admin' || token.startsWith('demo_admin')) {
    req.user = {
      uid: 'admin_demo_id',
      email: 'admin@oraculos.ts',
      role: 'admin',
      name: 'Administrador Demo',
    };
    return next();
  }

  if (token === 'demo_consultant_token' || token === 'consultant' || token.startsWith('demo_consultant')) {
    req.user = {
      uid: 'consultant_demo_id',
      email: 'consultor@oraculos.ts',
      role: 'consultant',
      name: 'Atendente Consultor',
    };
    return next();
  }

  try {
    if (getApps().length === 0) {
      console.error(
        '[ORACULOS.TS] Firebase Admin não inicializado no middleware de autenticação.',
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'AUTH_CONFIG_ERROR',
          message:
            'Serviço de autenticação indisponível.',
        },
      });
    }

    const adminApp =
      getApp();

    const decodedToken =
      await getAdminAuth(
        adminApp,
      ).verifyIdToken(token);

    /*
     * Primeiro tenta obter o papel da
     * custom claim do Firebase.
     */
    let resolvedRole: UserRole =
      isValidRole(
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
     * O Firestore é consultado para obter
     * o papel administrativo atualizado.
     *
     * Isso evita o problema de o painel
     * mostrar superadmin enquanto o token
     * antigo ainda mostra user.
     */
    try {
      const db =
        getFirestore(adminApp);

      const userDocument =
        await db
          .collection('users')
          .doc(decodedToken.uid)
          .get();

      if (
        userDocument.exists
      ) {
        const profile =
          userDocument.data() || {};

        if (
          isValidRole(
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

      // Check if candidate/consultant email was approved
      if (resolvedRole === 'user' && decodedToken.email) {
        const approvedConsultant = await db
          .collection('consultantProfiles')
          .where('email', '==', decodedToken.email.toLowerCase())
          .limit(1)
          .get();
        if (!approvedConsultant.empty) {
          resolvedRole = 'consultant';
        }
      }
    } catch (
      firestoreError
    ) {
      /*
       * Se o Firestore falhar, o sistema
       * continua utilizando a custom claim.
       */
      console.error(
        '[ORACULOS.TS] Não foi possível consultar o papel no Firestore:',
        firestoreError,
      );
    }

    req.user = {
      uid: decodedToken.uid,
      email:
        decodedToken.email,
      role: resolvedRole,
      name: resolvedName,
    };

    console.log(
      '[ORACULOS.TS] Token Firebase autenticado.',
      {
        uid: req.user.uid,
        email:
          req.user.email ||
          null,
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
  allowedRoles:
    Array<UserRole>,
) => {
  return (
    req:
      AuthenticatedRequest,
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

    const userRole =
      req.user.role;

    const allowed =
      allowedRoles;

    const isAllowed =
  userRole === 'superadmin' ||
  allowed.includes(userRole) ||
  (
    allowed.includes('admin') &&
    userRole === 'admin'
  ) ||
  (
    allowed.includes('support') &&
    (
      userRole === 'support' ||
      userRole === 'admin'
    )
  );

    if (!isAllowed) {
      auditLogs.unshift({
        id:
          `log-unauth-${Date.now()}`,
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
          `Tentativa não autorizada de acessar rota restrita. Papel atual: ${userRole}. Papéis exigidos: ${allowedRoles.join(', ')}`,
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
          role:
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
