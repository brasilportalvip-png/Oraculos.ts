import { getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type {
  MinuteTransaction,
  TransactionType,
  UserProfile,
} from '../../types/index.js';

interface TransactionExtra {
  consultationId?: string;
  paymentId?: string;
  amountBrl?: number;
}

function getDatabase() {
  if (getApps().length === 0) {
    throw new Error(
      'Firebase Admin ainda não foi inicializado no servidor.',
    );
  }

  return getFirestore(getApp());
}

function calculateNewBalance(
  currentBalance: number,
  type: TransactionType,
  minutes: number,
): number {
  const absoluteMinutes = Math.abs(minutes);

  if (
    type === 'purchase' ||
    type === 'bonus' ||
    type === 'refund' ||
    type === 'recharge'
  ) {
    return currentBalance + absoluteMinutes;
  }

  if (type === 'admin_adjustment') {
    const adjustedBalance = currentBalance + minutes;

    if (adjustedBalance < 0) {
      throw new Error('INSUFFICIENT_MINUTES');
    }

    return adjustedBalance;
  }

  if (type === 'consultation_debit') {
    if (currentBalance < absoluteMinutes) {
      throw new Error('INSUFFICIENT_MINUTES');
    }

    return currentBalance - absoluteMinutes;
  }

  throw new Error('INVALID_TRANSACTION_TYPE');
}

export async function getTransactionsByUserId(
  userId: string,
): Promise<MinuteTransaction[]> {
  const db = getDatabase();

  const snapshot = await db
    .collection('users')
    .doc(userId)
    .collection('minuteTransactions')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();

  return snapshot.docs.map((document) => ({
    ...(document.data() as MinuteTransaction),
    id: document.id,
  }));
}

export async function recordTransaction(
  user: UserProfile,
  type: TransactionType,
  minutes: number,
  reason: string,
  createdBy: string,
  extra?: TransactionExtra,
): Promise<{
  updatedUser: UserProfile;
  transaction: MinuteTransaction;
}> {
  if (!user.id) {
    throw new Error('USER_ID_REQUIRED');
  }

  if (!Number.isFinite(minutes) || minutes === 0) {
    throw new Error('INVALID_MINUTES');
  }

  const db = getDatabase();

  const userReference = db
    .collection('users')
    .doc(user.id);

  const transactionReference = userReference
    .collection('minuteTransactions')
    .doc();

  return db.runTransaction(async (firestoreTransaction) => {
    const userDocument =
      await firestoreTransaction.get(userReference);

    if (!userDocument.exists) {
      throw new Error('USER_NOT_FOUND');
    }

    const storedUser = {
      ...(userDocument.data() as UserProfile),
      id: userDocument.id,
    };

    if (storedUser.status === 'blocked') {
      throw new Error('USER_BLOCKED');
    }

    const currentBalance = Number(
      storedUser.minuteBalance ?? 0,
    );

    const newBalance = calculateNewBalance(
      currentBalance,
      type,
      minutes,
    );

    const now = new Date().toISOString();

    const minuteTransaction: MinuteTransaction = {
      id: transactionReference.id,
      userId: storedUser.id,
      type,
      minutes,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      reason,
      createdBy,
      createdAt: now,
      consultationId: extra?.consultationId,
      paymentId: extra?.paymentId,
      amountBrl: extra?.amountBrl,
    };

    firestoreTransaction.update(userReference, {
      minuteBalance: newBalance,
      balance: newBalance,
      updatedAt: now,
    });

    firestoreTransaction.create(
      transactionReference,
      minuteTransaction,
    );

    const updatedUser: UserProfile = {
      ...storedUser,
      minuteBalance: newBalance,
      balance: newBalance,
      updatedAt: now,
    };

    return {
      updatedUser,
      transaction: minuteTransaction,
    };
  });
}