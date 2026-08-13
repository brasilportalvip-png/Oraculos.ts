import { Router, type Response } from 'express';

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js';

import type {
  AuthenticatedRequest,
} from '../../middleware/auth.js';

import {
  getActivePackages,
  minutePackagesStore,
  updatePackageStore,
} from './packages.js';

import {
  getTransactionsByUserId,
} from './walletService.js';

import type {
  MinutePackage,
} from '../../types/index.js';

export const minuteRoutes = Router();

// GET /api/packages (public/clients)
minuteRoutes.get('/api/packages', (req, res) => {
  return res.json({
    success: true,
    data: getActivePackages(),
  });
});

// GET /api/admin/packages
minuteRoutes.get('/api/admin/packages', requireAuth, requireRole(['admin', 'superadmin']), (req, res) => {
  return res.json({
    success: true,
    data: minutePackagesStore,
  });
});

// POST /api/admin/packages (create or update package configuration)
minuteRoutes.post('/api/admin/packages', requireAuth, requireRole(['admin', 'superadmin']), (req, res) => {
  const { id, title, priceBrl, minutes, bonusMinutes, active, displayOrder } = req.body;

  if (typeof priceBrl !== 'number' || priceBrl <= 0 || typeof minutes !== 'number' || minutes <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PACKAGE', message: 'Valor BRL e quantidade de minutos devem ser números positivos.' },
    });
  }

  const pkgId = id || `pkg-${Date.now()}`;
  const existingIdx = minutePackagesStore.findIndex((p) => p.id === pkgId);

  const updatedPkg: MinutePackage = {
    id: pkgId,
    title: title || `Pacote de ${minutes} minutos`,
    priceBrl,
    minutes,
    bonusMinutes: typeof bonusMinutes === 'number' ? bonusMinutes : 0,
    active: active !== undefined ? Boolean(active) : true,
    displayOrder: typeof displayOrder === 'number' ? displayOrder : 10,
  };

  if (existingIdx >= 0) {
    minutePackagesStore[existingIdx] = updatedPkg;
  } else {
    minutePackagesStore.push(updatedPkg);
  }

  updatePackageStore(minutePackagesStore);

  return res.json({
    success: true,
    data: updatedPkg,
    message: 'Pacote de minutos atualizado pelo administrador.',
  });
});

// GET /api/user/transactions
minuteRoutes.get(
  '/api/user/transactions',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Não autorizado.',
          },
        });
      }

      const transactions =
        await getTransactionsByUserId(userId);

      return res.json({
        success: true,
        data: transactions,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido';

      console.error(
        '[ORACULOS.TS] Erro ao buscar transações:',
        message,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'TRANSACTIONS_FETCH_ERROR',
          message:
            'Não foi possível carregar o histórico de minutos.',
        },
      });
    }
  },
);
