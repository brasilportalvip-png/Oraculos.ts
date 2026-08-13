import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import type {
  UserProfile,
  UserRole,
} from '../types';

import { DEMO_USERS } from '../data/mockData';
import { auth } from '../firebase';

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  authLoading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;

logout: () => Promise<void>;

resetPassword: (
  email: string,
) => Promise<AuthResult>;

switchRole: (role: UserRole) => void;  


  addMinutes: (minutes: number) => void;
deductMinutes: (minutes: number) => boolean;
  toggleFavorite: (consultantId: string) => void;
  isFavorite: (consultantId: string) => boolean;
  updateUserPix: (pixKey: string) => void;

  registerUser: (
    data: Partial<UserProfile>,
  ) => Promise<AuthResult>;

  updateProfile: (
    data: Partial<UserProfile>,
  ) => Promise<AuthResult>;
}

const guestUser = {
  ...(DEMO_USERS.client as UserProfile),
  id: 'guest',
  name: 'Visitante',
  email: '',
  role: 'user' as UserRole,
  balance: 0,
  minuteBalance: 0,
  favorites: [],
};

function normalizeUserProfile(
  data: UserProfile,
): UserProfile {
  return {
    ...data,
    favorites: Array.isArray(data?.favorites)
      ? data.favorites
      : [],
    minuteBalance: Number(
      data?.minuteBalance ?? 0,
    ),
    balance: Number(data?.balance ?? 0),
  };
}

function getFirebaseErrorMessage(
  error: unknown,
): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error
      ? String(
          (error as { code?: unknown }).code || '',
        )
      : '';

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'E-mail ou senha incorretos.';
  }

  if (code === 'auth/invalid-email') {
    return 'O e-mail informado é inválido.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas. Aguarde alguns minutos.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Falha de conexão. Verifique sua internet.';
  }

  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a autenticação.';
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] =
    useState<UserProfile>(guestUser);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authLoading, setAuthLoading] =
    useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(
        'oraculos_user',
        JSON.stringify(user),
      );
    } else {
      localStorage.removeItem('oraculos_user');
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(guestUser);
          setIsAuthenticated(false);
          setAuthLoading(false);
          return;
        }

        try {
          const idToken =
            await firebaseUser.getIdToken();

          const response = await fetch(
            '/api/user/profile',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            },
          );

          const body = await response.json();

          if (response.ok && body.success) {
            setUser(
              normalizeUserProfile(body.data),
            );
            setIsAuthenticated(true);
            return;
          }

          if (
            response.status === 404 &&
            body.error?.code === 'USER_NOT_FOUND'
          ) {
            console.warn(
              'Conta encontrada no Authentication, mas sem perfil no Firestore.',
            );

            await signOut(auth);
            setUser(guestUser);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error(
            'Erro ao carregar perfil autenticado:',
            error,
          );

          setUser(guestUser);
          setIsAuthenticated(false);
        } finally {
          setAuthLoading(false);
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password,
        );

      const idToken =
        await credential.user.getIdToken(true);

      const response = await fetch(
        '/api/user/profile',
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        await signOut(auth);

        return {
          success: false,
          message:
            body.error?.message ||
            'Seu perfil não foi encontrado no Firestore.',
        };
      }

      setUser(normalizeUserProfile(body.data));
      setIsAuthenticated(true);

      return {
        success: true,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } finally {
      localStorage.removeItem('oraculos_user');
      sessionStorage.removeItem('oraculos_user');

      setUser(guestUser);
      setIsAuthenticated(false);
    }
  };








const resetPassword = async (
  email: string,
): Promise<AuthResult> => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  if (
    !normalizedEmail ||
    !normalizedEmail.includes('@')
  ) {
    return {
      success: false,
      message:
        'Informe um e-mail válido para recuperar sua senha.',
    };
  }

  try {
    await sendPasswordResetEmail(
      auth,
      normalizedEmail,
    );

    return {
      success: true,
      message:
        'Enviamos um link de recuperação para seu e-mail. Verifique também a caixa de spam.',
    };
  } catch (error: unknown) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error
        ? String(
            (error as { code?: unknown }).code ||
              '',
          )
        : '';

    if (code === 'auth/invalid-email') {
      return {
        success: false,
        message: 'O e-mail informado é inválido.',
      };
    }

    if (code === 'auth/too-many-requests') {
      return {
        success: false,
        message:
          'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
      };
    }

    if (code === 'auth/network-request-failed') {
      return {
        success: false,
        message:
          'Falha de conexão. Verifique sua internet.',
      };
    }

    return {
      success: false,
      message:
        'Não foi possível enviar a recuperação de senha.',
    };
  }
};











  const registerUser = async (
    data: Partial<UserProfile>,
  ): Promise<AuthResult> => {
    try {
      const response = await fetch(
        '/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        return {
          success: false,
          message:
            body.error?.message ||
            'Falha ao realizar o cadastro.',
        };
      }

      const registeredUser = body.data?.user;
      const customToken = body.data?.customToken;

      if (!registeredUser || !customToken) {
        return {
          success: false,
          message:
            'O servidor não retornou os dados completos do cadastro.',
        };
      }

      await signInWithCustomToken(
        auth,
        customToken,
      );

      setUser(
        normalizeUserProfile(registeredUser),
      );

      setIsAuthenticated(true);

      return {
        success: true,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
      };
    }
  };

  const updateProfile = async (
    data: Partial<UserProfile>,
  ): Promise<AuthResult> => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        return {
          success: false,
          message:
            'Sua sessão expirou. Entre novamente.',
        };
      }

      const idToken =
        await firebaseUser.getIdToken();

      const response = await fetch(
        '/api/user/profile',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(data),
        },
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        return {
          success: false,
          message:
            body.error?.message ||
            'Falha ao atualizar o perfil.',
        };
      }

      setUser(normalizeUserProfile(body.data));

      return {
        success: true,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Erro ao conectar ao servidor.',
      };
    }
  };

  const switchRole = (role: UserRole) => {
    const newUser = DEMO_USERS[role];

    if (newUser) {
      setUser(
        normalizeUserProfile(
          newUser as UserProfile,
        ),
      );
    }
  };

  

  const addMinutes = (minutes: number) => {
  setUser((previous) => ({
    ...previous,

    minuteBalance:
      Number(previous.minuteBalance || 0) +
      minutes,
  }));
};

  

  const deductMinutes = (
  minutes: number,
): boolean => {
  if (
    Number(user.minuteBalance || 0) < minutes
  ) {
    return false;
  }

  setUser((previous) => ({
    ...previous,

    minuteBalance: Math.max(
      0,
      Number(previous.minuteBalance || 0) -
        minutes,
    ),
  }));

  return true;
};

  const toggleFavorite = (
    consultantId: string,
  ) => {
    setUser((previous) => {
      const favorites = Array.isArray(
        previous.favorites,
      )
        ? previous.favorites
        : [];

      const exists =
        favorites.includes(consultantId);

      return {
        ...previous,
        favorites: exists
          ? favorites.filter(
              (id) => id !== consultantId,
            )
          : [...favorites, consultantId],
      };
    });
  };

  const isFavorite = (
    consultantId: string,
  ): boolean => {
    return Array.isArray(user.favorites)
      ? user.favorites.includes(consultantId)
      : false;
  };

  const updateUserPix = (pixKey: string) => {
    setUser((previous) => ({
      ...previous,
      pixKey,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
  user,
  isAuthenticated,
  authLoading,
  login,
  logout,
  resetPassword,
  switchRole,
        addMinutes,
deductMinutes,
        toggleFavorite,
        isFavorite,
        updateUserPix,
        registerUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }

  return context;
};