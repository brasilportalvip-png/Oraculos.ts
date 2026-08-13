import {
  getApp,
  getApps,
} from 'firebase-admin/app';

import {
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';

import type {
  UserProfile,
  UserRole,
} from '../../types/index.js';

export interface RegisterUserDTO {
  name: string;
  birthFullName: string;
  email: string;
  password?: string;
  birthDate: string;
  birthTime?: string | null;
  doesNotKnowBirthTime?: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  birthDataConsent: boolean;
}

let databaseInstance: Firestore | null = null;

export function validateRegistrationInput(
  data: RegisterUserDTO,
): {
  valid: boolean;
  message?: string;
} {
  if (
    !data.name ||
    data.name.trim().length < 2
  ) {
    return {
      valid: false,
      message: 'Nome é obrigatório.',
    };
  }

  if (
    !data.birthFullName ||
    data.birthFullName.trim().length < 2
  ) {
    return {
      valid: false,
      message:
        'Nome completo de solteiro é obrigatório.',
    };
  }

  if (
    !data.email ||
    !data.email.includes('@')
  ) {
    return {
      valid: false,
      message:
        'Email válido é obrigatório.',
    };
  }

  if (!data.birthDate) {
    return {
      valid: false,
      message:
        'Data de nascimento é obrigatória.',
    };
  }

  if (
    !data.doesNotKnowBirthTime &&
    !data.birthTime
  ) {
    return {
      valid: false,
      message:
        'Horário de nascimento é obrigatório ou marque a opção "Não sei o horário".',
    };
  }

  if (!data.termsAccepted) {
    return {
      valid: false,
      message:
        'Você deve aceitar os Termos de Uso.',
    };
  }

  if (!data.privacyAccepted) {
    return {
      valid: false,
      message:
        'Você deve aceitar a Política de Privacidade.',
    };
  }

  if (!data.birthDataConsent) {
    return {
      valid: false,
      message:
        'Autorização específica para uso dos dados de nascimento nas consultas é obrigatória.',
    };
  }

  return {
    valid: true,
  };
}

export function buildUserProfile(
  id: string,
  data: RegisterUserDTO,
  role: UserRole = 'user',
): UserProfile {
  const now = new Date().toISOString();

  return {
    id,
    name: data.name.trim(),
    birthFullName:
      data.birthFullName.trim(),
    email: data.email
      .trim()
      .toLowerCase(),
    birthDate: data.birthDate,
    birthTime:
      data.doesNotKnowBirthTime
        ? null
        : data.birthTime || null,
    doesNotKnowBirthTime: Boolean(
      data.doesNotKnowBirthTime,
    ),
    role,
    status: 'active',
    minuteBalance: 0,
    balance: 0,
    termsAccepted:
      data.termsAccepted,
    privacyAccepted:
      data.privacyAccepted,
    birthDataConsent:
      data.birthDataConsent,
    favorites: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function sanitizeProfileUpdate(
  existingUser: UserProfile,
  updates: Partial<UserProfile>,
): UserProfile {
  const forbiddenKeys = [
    'minuteBalance',
    'balance',
    'role',
    'status',
    'email',
    'createdAt',
    'id',
  ];

  const sanitized: Partial<UserProfile> =
    {};

  for (
    const [key, value] of Object.entries(
      updates,
    )
  ) {
    if (
      !forbiddenKeys.includes(key) &&
      value !== undefined
    ) {
      (
        sanitized as Record<
          string,
          unknown
        >
      )[key] = value;
    }
  }

  return {
    ...existingUser,
    ...sanitized,
    updatedAt:
      new Date().toISOString(),
  };
}

function getDatabase(): Firestore {
  if (databaseInstance) {
    return databaseInstance;
  }

  const apps = getApps();

  if (apps.length === 0) {
    throw new Error(
      'Firebase Admin ainda não foi inicializado no servidor.',
    );
  }

  /*
   * Usa explicitamente o primeiro aplicativo
   * Firebase Admin inicializado pelo server.ts.
   */
  const firebaseApp =
    apps[0] || getApp();

  databaseInstance =
    getFirestore(firebaseApp);

  return databaseInstance;
}

export async function findUserByEmail(
  email: string,
): Promise<UserProfile | null> {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const db = getDatabase();

  const snapshot = await db
    .collection('users')
    .where(
      'email',
      '==',
      normalizedEmail,
    )
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const document =
    snapshot.docs[0];

  return {
    ...(document.data() as UserProfile),
    id: document.id,
  };
}

/**
 * Procura primeiro pelo UID.
 *
 * Caso o documento não esteja salvo com o UID,
 * procura pelo e-mail e repara automaticamente
 * o perfil usando o UID atual do Authentication.
 */
export async function getUserProfile(
  userId: string,
  email?: string | null,
): Promise<UserProfile | null> {
  const normalizedUserId =
    userId.trim();

  const normalizedEmail = email
    ?.trim()
    .toLowerCase();

  if (!normalizedUserId) {
    return null;
  }

  const db = getDatabase();

  const correctReference = db
    .collection('users')
    .doc(normalizedUserId);

  const correctDocument =
    await correctReference.get();

  if (correctDocument.exists) {
    return {
      ...(
        correctDocument.data() as UserProfile
      ),
      id: correctDocument.id,
    };
  }

  if (!normalizedEmail) {
    console.warn(
      '[ORACULOS.TS] Perfil não encontrado pelo UID e token sem e-mail.',
      {
        uid: normalizedUserId,
      },
    );

    return null;
  }

  const emailSnapshot = await db
    .collection('users')
    .where(
      'email',
      '==',
      normalizedEmail,
    )
    .limit(1)
    .get();

  if (emailSnapshot.empty) {
    console.warn(
      '[ORACULOS.TS] Perfil não encontrado pelo UID nem pelo e-mail.',
      {
        uid: normalizedUserId,
        email: normalizedEmail,
      },
    );

    return null;
  }

  const oldDocument =
    emailSnapshot.docs[0];

  const oldData =
    oldDocument.data() as UserProfile;

  const now =
    new Date().toISOString();

  const repairedProfile: UserProfile = {
    ...oldData,
    id: normalizedUserId,
    email: normalizedEmail,
    favorites: Array.isArray(
      oldData.favorites,
    )
      ? oldData.favorites
      : [],
    minuteBalance:
      oldData.minuteBalance ?? 0,
    balance:
      oldData.balance ??
      oldData.minuteBalance ??
      0,
    updatedAt: now,
  };

  await db.runTransaction(
    async (transaction) => {
      const targetDocument =
        await transaction.get(
          correctReference,
        );

      if (!targetDocument.exists) {
        transaction.set(
          correctReference,
          repairedProfile,
        );
      }

      /*
       * Não apaga automaticamente o documento
       * antigo para evitar perda de dados.
       * Ele poderá ser removido depois de confirmar
       * que o login está funcionando.
       */
    },
  );

  console.warn(
    '[ORACULOS.TS] Perfil encontrado pelo e-mail e vinculado ao UID autenticado.',
    {
      oldDocumentId:
        oldDocument.id,
      currentUid:
        normalizedUserId,
      email:
        normalizedEmail,
    },
  );

  return repairedProfile;
}

export async function createUserProfile(
  userId: string,
  data: RegisterUserDTO,
  role: UserRole = 'user',
): Promise<UserProfile> {
  const validation =
    validateRegistrationInput(data);

  if (!validation.valid) {
    throw new Error(
      validation.message ||
        'Dados de cadastro inválidos.',
    );
  }

  const normalizedUserId =
    userId.trim();

  if (!normalizedUserId) {
    throw new Error(
      'INVALID_USER_ID',
    );
  }

  const db = getDatabase();

  const userReference = db
    .collection('users')
    .doc(normalizedUserId);

  const existingEmail =
    await findUserByEmail(
      data.email,
    );

  /*
   * Permite continuar quando o perfil encontrado
   * pelo e-mail já pertence ao mesmo UID.
   */
  if (
    existingEmail &&
    existingEmail.id !== normalizedUserId
  ) {
    throw new Error(
      'EMAIL_ALREADY_EXISTS',
    );
  }

  const userProfile =
    buildUserProfile(
      normalizedUserId,
      data,
      role,
    );

  await db.runTransaction(
    async (transaction) => {
      const existingDocument =
        await transaction.get(
          userReference,
        );

      if (existingDocument.exists) {
        throw new Error(
          'USER_ALREADY_EXISTS',
        );
      }

      transaction.create(
        userReference,
        userProfile,
      );

      const initialTransactionReference =
        userReference
          .collection(
            'minuteTransactions',
          )
          .doc(
            `initial-${normalizedUserId}`,
          );

      transaction.create(
        initialTransactionReference,
        {
          id: `initial-${normalizedUserId}`,
          userId:
            normalizedUserId,
          type:
            'admin_adjustment',
          minutes: 0,
          balanceBefore: 0,
          balanceAfter: 0,
          reason:
            'Carteira de minutos criada no cadastro.',
          createdBy: 'system',
          createdAt:
            userProfile.createdAt,
        },
      );
    },
  );

  console.log(
    '[ORACULOS.TS] Perfil criado no Firestore.',
    {
      uid: normalizedUserId,
      email: userProfile.email,
    },
  );

  return userProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const db = getDatabase();

  const userReference = db
    .collection('users')
    .doc(userId.trim());

  return db.runTransaction(
    async (transaction) => {
      const document =
        await transaction.get(
          userReference,
        );

      if (!document.exists) {
        return null;
      }

      const existingUser: UserProfile = {
        ...(
          document.data() as UserProfile
        ),
        id: document.id,
      };

      const updatedUser =
        sanitizeProfileUpdate(
          existingUser,
          updates,
        );

      transaction.update(
        userReference,
        {
          name:
            updatedUser.name,
          birthFullName:
            updatedUser.birthFullName,
          birthDate:
            updatedUser.birthDate,
          birthTime:
            updatedUser.birthTime,
          doesNotKnowBirthTime:
            updatedUser
              .doesNotKnowBirthTime,
          termsAccepted:
            updatedUser
              .termsAccepted,
          privacyAccepted:
            updatedUser
              .privacyAccepted,
          birthDataConsent:
            updatedUser
              .birthDataConsent,
          favorites:
            Array.isArray(
              updatedUser.favorites,
            )
              ? updatedUser.favorites
              : [],
          updatedAt:
            updatedUser.updatedAt,
        },
      );

      return updatedUser;
    },
  );
}