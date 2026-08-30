import {
  getApp,
  getApps,
} from 'firebase-admin/app';

import {
  getFirestore,
} from 'firebase-admin/firestore';

import type {
  MinutePackage,
} from '../../types/index.js';

const PACKAGES_COLLECTION =
  'minutePackages';

export const DEFAULT_MINUTE_PACKAGES: MinutePackage[] = [
  {
    id: 'pkg-5',
    title: 'Pacote Essencial R$ 5',
    priceBrl: 5.0,
    minutes: 5,
    bonusMinutes: 0,
    active: true,
    displayOrder: 1,
  },
  {
    id: 'pkg-10',
    title: 'Pacote Bronze R$ 10',
    priceBrl: 10.0,
    minutes: 10,
    bonusMinutes: 1,
    active: true,
    displayOrder: 2,
  },
  {
    id: 'pkg-20',
    title: 'Pacote Prata R$ 20',
    priceBrl: 20.0,
    minutes: 20,
    bonusMinutes: 3,
    active: true,
    displayOrder: 3,
  },
  {
    id: 'pkg-30',
    title: 'Pacote Ouro R$ 30',
    priceBrl: 30.0,
    minutes: 30,
    bonusMinutes: 5,
    active: true,
    displayOrder: 4,
    popular: true,
  },
  {
    id: 'pkg-50',
    title: 'Pacote Safira R$ 50',
    priceBrl: 50.0,
    minutes: 50,
    bonusMinutes: 10,
    active: true,
    displayOrder: 5,
  },
  {
    id: 'pkg-100',
    title: 'Pacote Rubi R$ 100',
    priceBrl: 100.0,
    minutes: 100,
    bonusMinutes: 25,
    active: true,
    displayOrder: 6,
  },
  {
    id: 'pkg-150',
    title: 'Pacote Esmeralda R$ 150',
    priceBrl: 150.0,
    minutes: 150,
    bonusMinutes: 40,
    active: true,
    displayOrder: 7,
  },
  {
    id: 'pkg-200',
    title: 'Pacote Diamante R$ 200',
    priceBrl: 200.0,
    minutes: 200,
    bonusMinutes: 60,
    active: true,
    displayOrder: 8,
  },
  {
    id: 'pkg-300',
    title: 'Pacote Oráculo Master R$ 300',
    priceBrl: 300.0,
    minutes: 300,
    bonusMinutes: 100,
    active: true,
    displayOrder: 9,
  },
];

function getDatabase() {
  if (getApps().length === 0) {
    throw new Error(
      'Firebase Admin ainda não foi inicializado.',
    );
  }

  return getFirestore(getApp());
}

async function ensureDefaultPackages(): Promise<void> {
  const db = getDatabase();

  const collectionReference =
    db.collection(PACKAGES_COLLECTION);

  const snapshot =
    await collectionReference.limit(1).get();

  if (!snapshot.empty) {
    return;
  }

  const batch = db.batch();

  for (const pkg of DEFAULT_MINUTE_PACKAGES) {
    batch.set(
      collectionReference.doc(pkg.id),
      pkg,
    );
  }

  await batch.commit();

  console.log(
    '[ORACULOS.TS] Pacotes padrão gravados no Firestore.',
  );
}

export async function getPackages(): Promise<
  MinutePackage[]
> {
  /*
   * Testes e ambiente sem Firebase Admin:
   * usa somente os padrões em memória.
   *
   * Produção continua usando Firestore.
   */
  if (getApps().length === 0) {
    return [...DEFAULT_MINUTE_PACKAGES].sort(
      (a, b) =>
        a.displayOrder - b.displayOrder,
    );
  }

  await ensureDefaultPackages();

  const db = getDatabase();

  const snapshot = await db
    .collection(PACKAGES_COLLECTION)
    .get();

  return snapshot.docs
    .map((document) => ({
      ...(document.data() as MinutePackage),
      id: document.id,
    }))
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder,
    );
}

export async function getActivePackages(): Promise<
  MinutePackage[]
> {
  const packages =
    await getPackages();

  return packages.filter(
    (pkg) => pkg.active,
  );
}

export async function findPackageByAmountOrId(
  amountBrl: number,
  packageId?: string,
): Promise<MinutePackage | undefined> {
  const packages =
    await getActivePackages();

  if (packageId) {
    const byId = packages.find(
      (pkg) => pkg.id === packageId,
    );

    if (byId) {
      return byId;
    }
  }

  return packages.find(
    (pkg) =>
      Math.abs(
        pkg.priceBrl - amountBrl,
      ) < 0.001,
  );
}

export async function updatePackageStore(
  pkg: MinutePackage,
): Promise<MinutePackage> {
  if (!pkg.id) {
    throw new Error(
      'PACKAGE_ID_REQUIRED',
    );
  }

  if (
    !Number.isFinite(pkg.priceBrl) ||
    pkg.priceBrl <= 0 ||
    !Number.isFinite(pkg.minutes) ||
    pkg.minutes <= 0
  ) {
    throw new Error(
      'INVALID_PACKAGE',
    );
  }

  const normalizedPackage: MinutePackage = {
    ...pkg,
    priceBrl:
      Number(pkg.priceBrl),
    minutes:
      Number(pkg.minutes),
    bonusMinutes:
      Number(pkg.bonusMinutes || 0),
    active:
      pkg.active !== false,
    displayOrder:
      Number(pkg.displayOrder || 10),
  };

  const db = getDatabase();

  await db
    .collection(PACKAGES_COLLECTION)
    .doc(normalizedPackage.id)
    .set(
      normalizedPackage,
      {
        merge: true,
      },
    );

  return normalizedPackage;
}