import {
  Router,
  type Response,
} from 'express';

import {
  requireAuth,
  requireRole,
} from '../../middleware/auth.js';

import type {
  AuthenticatedRequest,
} from '../../middleware/auth.js';

import {
  getActivePackages,
  getPackages,
  updatePackageStore,
} from './packages.js';

import {
  getTransactionsByUserId,
} from './walletService.js';

import type {
  MinutePackage,
} from '../../types/index.js';

export const minuteRoutes = Router();

/**
 * GET /api/packages
 * Retorna somente os pacotes ativos
 * armazenados no Firestore.
 */
minuteRoutes.get(
  '/api/packages',
  async (_req, res) => {
    try {
      const packages =
        await getActivePackages();

      return res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao carregar pacotes:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'PACKAGES_FETCH_ERROR',
          message:
            'Não foi possível carregar os pacotes.',
        },
      });
    }
  },
);

/**
 * GET /api/admin/packages
 * Retorna todos os pacotes,
 * inclusive os desativados.
 */
minuteRoutes.get(
  '/api/admin/packages',
  requireAuth,
  requireRole([
    'admin',
    'superadmin',
  ]),
  async (_req, res) => {
    try {
      const packages =
        await getPackages();

      return res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao carregar pacotes administrativos:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'ADMIN_PACKAGES_FETCH_ERROR',
          message:
            'Não foi possível carregar os pacotes.',
        },
      });
    }
  },
);

/**
 * POST /api/admin/packages
 * Cria ou atualiza um pacote
 * persistindo diretamente no Firestore.
 */
minuteRoutes.post(
  '/api/admin/packages',
  requireAuth,
  requireRole([
    'admin',
    'superadmin',
  ]),
  async (req, res) => {
    try {
      const {
        id,
        title,
        priceBrl,
        minutes,
        bonusMinutes,
        active,
        displayOrder,
      } = req.body;

      if (
        typeof priceBrl !== 'number' ||
        !Number.isFinite(priceBrl) ||
        priceBrl <= 0 ||
        typeof minutes !== 'number' ||
        !Number.isFinite(minutes) ||
        minutes <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message:
              'Valor BRL e quantidade de minutos devem ser números positivos.',
          },
        });
      }

      const packageId =
        typeof id === 'string' &&
        id.trim()
          ? id.trim()
          : `pkg-${Date.now()}`;

      const updatedPackage:
        MinutePackage = {
        id: packageId,

        title:
          typeof title === 'string' &&
          title.trim()
            ? title.trim()
            : `Pacote de ${minutes} minutos`,

        priceBrl:
          Number(priceBrl),

        minutes:
          Number(minutes),

        bonusMinutes:
          typeof bonusMinutes ===
            'number' &&
          Number.isFinite(
            bonusMinutes,
          )
            ? Math.max(
                0,
                bonusMinutes,
              )
            : 0,

        active:
          active !== undefined
            ? Boolean(active)
            : true,

        displayOrder:
          typeof displayOrder ===
            'number' &&
          Number.isFinite(
            displayOrder,
          )
            ? displayOrder
            : 10,
      };

      const savedPackage =
        await updatePackageStore(
          updatedPackage,
        );

      return res.json({
        success: true,
        data: savedPackage,
        message:
          'Pacote de minutos salvo no Firestore.',
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao salvar pacote:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code:
            'PACKAGE_SAVE_ERROR',
          message:
            'Não foi possível salvar o pacote.',
        },
      });
    }
  },
);

/**
 * GET /api/user/transactions
 * Histórico financeiro real do usuário.
 */
minuteRoutes.get(
  '/api/user/transactions',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId =
        req.user?.uid;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Não autorizado.',
          },
        });
      }

      const transactions =
        await getTransactionsByUserId(
          userId,
        );

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
          code:
            'TRANSACTIONS_FETCH_ERROR',
          message:
            'Não foi possível carregar o histórico de minutos.',
        },
      });
    }
  },
);