import { Router, Response } from 'express';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import {
  AuthenticatedRequest,
  requireAuth,
} from '../../middleware/auth.js';

import {
  buildSafeRecoveredProfile,
  createUserProfile,
  updateUserProfile,
  validateRegistrationInput,
} from './authService.js';

import type {
  UserProfile,
} from '../../types/index.js';

export const userRoutes = Router();

/**
 * POST /api/auth/register
 * Cria o usuário no Firebase Authentication
 * e o perfil correspondente no Firestore.
 */
userRoutes.post(
  '/api/auth/register',
  async (req, res) => {
    const validation =
      validateRegistrationInput(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message:
            validation.message ||
            'Dados de cadastro inválidos.',
        },
      });
    }

    if (
      !req.body.password ||
      typeof req.body.password !== 'string' ||
      req.body.password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message:
            'A senha deve possuir pelo menos 6 caracteres.',
        },
      });
    }

    const adminAuth = getAuth(getApp());

    let createdUid: string | null = null;

    try {
      const firebaseUser =
        await adminAuth.createUser({
          email: req.body.email
            .trim()
            .toLowerCase(),
          password: req.body.password,
          displayName: req.body.name.trim(),
          emailVerified: false,
          disabled: false,
        });

      createdUid = firebaseUser.uid;

      const profile =
        await createUserProfile(
          firebaseUser.uid,
          req.body,
          'user',
        );

      const customToken =
        await adminAuth.createCustomToken(
          firebaseUser.uid,
          {
            role: profile.role,
          },
        );

      return res.status(201).json({
        success: true,
        data: {
          user: profile,
          customToken,
        },
        message:
          'Cadastro realizado com sucesso.',
      });
    } catch (error: unknown) {
      if (createdUid) {
        try {
          await adminAuth.deleteUser(createdUid);
        } catch (rollbackError) {
          console.error(
            '[ORACULOS.TS] Falha ao desfazer usuário:',
            rollbackError,
          );
        }
      }

      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error
          ? String(
              (error as { code?: unknown })
                .code || '',
            )
          : '';

      const message =
        error instanceof Error
          ? error.message
          : '';

      if (
        code === 'auth/email-already-exists' ||
        message === 'EMAIL_ALREADY_EXISTS'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message:
              'Este e-mail já está cadastrado.',
          },
        });
      }

      if (
        message === 'USER_ALREADY_EXISTS'
      ) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message:
              'Este usuário já possui perfil.',
          },
        });
      }

      console.error(
        '[ORACULOS.TS] Erro no cadastro:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'REGISTER_FAILED',
          message:
            'Não foi possível concluir o cadastro.',
        },
      });
    }
  },
);

/**
 * GET /api/user/profile
 * Busca o perfil no Firestore usando o UID
 * do token autenticado pelo Firebase.
 */







userRoutes.get(
  '/api/user/profile',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user?.uid;
      const userEmail = req.user?.email
        ?.trim()
        .toLowerCase();

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado.',
          },
        });
      }

      const db = getFirestore(getApp());

      const userReference = db
        .collection('users')
        .doc(userId);

      const userDocument =
        await userReference.get();

      if (userDocument.exists) {
        return res.status(200).json({
          success: true,
          data: {
            ...userDocument.data(),
            id: userDocument.id,
          },
        });
      }

      if (userEmail) {
        const emailSnapshot = await db
          .collection('users')
          .where('email', '==', userEmail)
          .limit(1)
          .get();

        if (!emailSnapshot.empty) {
          const oldDocument =
            emailSnapshot.docs[0];

          const oldProfile =
            oldDocument.data();

         const repairedProfile =
  buildSafeRecoveredProfile(
    userId,
    userEmail,
    oldProfile as UserProfile,
  );

          await userReference.set(
            repairedProfile,
            {
              merge: true,
            },
          );

          console.warn(
            '[ORACULOS.TS] Perfil recuperado pelo e-mail e vinculado ao UID atual.',
            {
              oldDocumentId: oldDocument.id,
              currentUid: userId,
              email: userEmail,
            },
          );

          return res.status(200).json({
            success: true,
            data: repairedProfile,
            repaired: true,
          });
        }
      }

      console.warn(
        '[ORACULOS.TS] Perfil não encontrado.',
        {
          uid: userId,
          email: userEmail || null,
        },
      );

      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message:
            'Perfil do usuário não encontrado.',
        },
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao buscar perfil:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_READ_FAILED',
          message:
            'Não foi possível carregar o perfil.',
        },
      });
    }
  },
);







/**
 * PATCH /api/user/profile
 * Atualiza somente os campos permitidos
 * no perfil salvo no Firestore.
 */
userRoutes.patch(
  '/api/user/profile',
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

      const updatedProfile =
        await updateUserProfile(
          userId,
          req.body,
        );

      if (!updatedProfile) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'Perfil do usuário não encontrado.',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedProfile,
        message:
          'Perfil atualizado com sucesso.',
      });
    } catch (error) {
      console.error(
        '[ORACULOS.TS] Erro ao atualizar perfil:',
        error,
      );

      return res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message:
            'Não foi possível atualizar o perfil.',
        },
      });
    }
  },
);