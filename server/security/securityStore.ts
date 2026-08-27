import crypto from 'crypto';

import type {
  Firestore,
} from 'firebase-admin/firestore';

export type SecurityIpList =
  | 'blacklist'
  | 'whitelist';

export type SecurityIpAction =
  | 'add'
  | 'remove';

export interface DistributedSecurityResult {
  blacklisted: boolean;
  whitelisted: boolean;
  rateLimited: boolean;
  autoBanned: boolean;
  requestCount: number;
  blockedUntilMs: number;
}

const SECURITY_COLLECTION =
  'securityIpState';

const RATE_LIMIT_WINDOW_MS =
  60 * 1000;

const AUTOMATIC_BLOCK_MS =
  15 * 60 * 1000;

const getIpDocumentId = (
  ip: string,
): string => {
  return crypto
    .createHash('sha256')
    .update(ip)
    .digest('hex');
};

export async function evaluateDistributedSecurity(
  db: Firestore,
  ip: string,
  requestLimit: number,
  nowMs: number = Date.now(),
): Promise<DistributedSecurityResult> {
  const normalizedIp =
    String(ip || '').trim();

  if (!normalizedIp) {
    throw new Error(
      'IP inválido para avaliação de segurança.',
    );
  }

  const safeRequestLimit =
    Math.max(
      1,
      Math.floor(requestLimit),
    );

  const documentId =
    getIpDocumentId(
      normalizedIp,
    );

  const reference =
    db
      .collection(
        SECURITY_COLLECTION,
      )
      .doc(documentId);

  return db.runTransaction(
    async (transaction) => {
      const snapshot =
        await transaction.get(
          reference,
        );

      const data =
        snapshot.exists
          ? snapshot.data() || {}
          : {};

      const configuredList =
        data.list ===
          'blacklist' ||
        data.list ===
          'whitelist'
          ? data.list
          : null;

      if (
        configuredList ===
        'blacklist'
      ) {
        return {
          blacklisted: true,
          whitelisted: false,
          rateLimited: false,
          autoBanned: false,
          requestCount: 0,
          blockedUntilMs: 0,
        };
      }

      if (
        configuredList ===
        'whitelist'
      ) {
        return {
          blacklisted: false,
          whitelisted: true,
          rateLimited: false,
          autoBanned: false,
          requestCount: 0,
          blockedUntilMs: 0,
        };
      }

      const existingBlockedUntilMs =
        Number(
          data.blockedUntilMs || 0,
        );

      if (
        existingBlockedUntilMs >
        nowMs
      ) {
        return {
          blacklisted: false,
          whitelisted: false,
          rateLimited: true,
          autoBanned: true,
          requestCount:
            Number(
              data.requestCount || 0,
            ),
          blockedUntilMs:
            existingBlockedUntilMs,
        };
      }

      const existingWindowStartMs =
        Number(
          data.windowStartMs || 0,
        );

      const sameWindow =
        existingWindowStartMs > 0 &&
        nowMs -
          existingWindowStartMs <
          RATE_LIMIT_WINDOW_MS;

      const windowStartMs =
        sameWindow
          ? existingWindowStartMs
          : nowMs;

      const requestCount =
        sameWindow
          ? Number(
              data.requestCount || 0,
            ) + 1
          : 1;

      const rateLimited =
        requestCount >
        safeRequestLimit;

      const automaticBlockThreshold =
        Math.ceil(
          safeRequestLimit * 2.5,
        );

      const autoBanned =
        requestCount >
        automaticBlockThreshold;

      const blockedUntilMs =
        autoBanned
          ? nowMs +
            AUTOMATIC_BLOCK_MS
          : 0;

      const nowIso =
        new Date(
          nowMs,
        ).toISOString();

      transaction.set(
        reference,
        {
          ip:
            normalizedIp,
          ipHash:
            documentId,
          windowStartMs,
          requestCount,
          blockedUntilMs,
          lastSeenAt:
            nowIso,
          updatedAt:
            nowIso,
        },
        {
          merge: true,
        },
      );

      return {
        blacklisted: false,
        whitelisted: false,
        rateLimited,
        autoBanned,
        requestCount,
        blockedUntilMs,
      };
    },
  );
}

export async function updateDistributedIpRule(
  db: Firestore,
  ip: string,
  action: SecurityIpAction,
  list: SecurityIpList,
  updatedBy: string,
): Promise<void> {
  const normalizedIp =
    String(ip || '').trim();

  if (!normalizedIp) {
    throw new Error(
      'IP inválido.',
    );
  }

  const documentId =
    getIpDocumentId(
      normalizedIp,
    );

  const reference =
    db
      .collection(
        SECURITY_COLLECTION,
      )
      .doc(documentId);

  await db.runTransaction(
    async (transaction) => {
      const snapshot =
        await transaction.get(
          reference,
        );

      const data =
        snapshot.exists
          ? snapshot.data() || {}
          : {};

      const currentList =
        data.list ===
          'blacklist' ||
        data.list ===
          'whitelist'
          ? data.list
          : null;

      const nextList =
        action === 'add'
          ? list
          : currentList === list
          ? null
          : currentList;

      transaction.set(
        reference,
        {
          ip:
            normalizedIp,
          ipHash:
            documentId,
          list:
            nextList,
          updatedAt:
            new Date()
              .toISOString(),
          updatedBy,
        },
        {
          merge: true,
        },
      );
    },
  );
}

export async function listDistributedIpRules(
  db: Firestore,
): Promise<{
  blacklistedIPs: string[];
  whitelistedIPs: string[];
}> {
  const snapshot =
    await db
      .collection(
        SECURITY_COLLECTION,
      )
      .where(
        'list',
        'in',
        [
          'blacklist',
          'whitelist',
        ],
      )
      .get();

  const blacklistedIPs:
    string[] = [];

  const whitelistedIPs:
    string[] = [];

  for (
    const document of
    snapshot.docs
  ) {
    const data =
      document.data();

    const ip =
      typeof data.ip ===
      'string'
        ? data.ip
        : '';

    if (!ip) {
      continue;
    }

    if (
      data.list ===
      'blacklist'
    ) {
      blacklistedIPs.push(
        ip,
      );
    }

    if (
      data.list ===
      'whitelist'
    ) {
      whitelistedIPs.push(
        ip,
      );
    }
  }

  return {
    blacklistedIPs,
    whitelistedIPs,
  };
}