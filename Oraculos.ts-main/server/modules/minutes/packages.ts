import type {
  MinutePackage,
} from '../../types/index.js';

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
    title: 'Pacote Rubia R$ 100',
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

export let minutePackagesStore: MinutePackage[] = [...DEFAULT_MINUTE_PACKAGES];

export function getActivePackages(): MinutePackage[] {
  return minutePackagesStore.filter((pkg) => pkg.active).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function findPackageByAmountOrId(amountBrl: number, packageId?: string): MinutePackage | undefined {
  if (packageId) {
    const found = minutePackagesStore.find((p) => p.id === packageId && p.active);
    if (found) return found;
  }
  return minutePackagesStore.find((p) => p.active && Math.abs(p.priceBrl - amountBrl) < 0.001);
}

export function updatePackageStore(updatedPackages: MinutePackage[]) {
  minutePackagesStore = [...updatedPackages];
}
