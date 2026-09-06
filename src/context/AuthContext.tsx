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

interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
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
syncMinuteBalance: (minutes: number) => void;
  
  toggleFavorite: (
    consultantId: string,
  ) => Promise<AuthResult>;
  isFavorite: (consultantId: string) => boolean;
  updateUserPix: (
    pixKey: string,
  ) => Promise<AuthResult>;

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

async function readApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  const rawBody = await response.text();

  if (!rawBody) {
    return {
      success: false,
      error: {
        code: 'EMPTY_API_RESPONSE',
      },
    };
  }

  try {
    return JSON.parse(rawBody) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      error: {
        code: 'INVALID_API_RESPONSE',
      },
    };
  }
}

function getApiErrorMessage(
  response: Response,
  body: ApiResponse,
  fallback: string,
): string {
  if (body.error?.message) {
    return body.error.message;
  }

  if (response.status >= 500) {
    return 'O serviço de acesso está temporariamente indisponível. Tente novamente em alguns instantes.';
  }

  return fallback;
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
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('oraculos_user') || sessionStorage.getItem('oraculos_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== 'guest') {
          return normalizeUserProfile(parsed);
        }
      }
    } catch {}
    return guestUser;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('oraculos_user') || sessionStorage.getItem('oraculos_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed && parsed.id && parsed.id !== 'guest');
      }
    } catch {}
    return false;
  });

  const [authLoading, setAuthLoading] = useState(true);

  // Safety watchdog: prevent infinite loading spinners on mobile networks
  useEffect(() => {
    const watchdog = window.setTimeout(() => {
      setAuthLoading(false);
    }, 2500);
    return () => window.clearTimeout(watchdog);
  }, []);

  useEffect(() => {
    if (authLoading) return; // Do not wipe storage during initial authentication check
    if (isAuthenticated && user.id !== 'guest') {
      try {
        localStorage.setItem('oraculos_user', JSON.stringify(user));
        sessionStorage.setItem('oraculos_user', JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem('oraculos_user');
        sessionStorage.removeItem('oraculos_user');
      } catch {}
    }
  }, [user, isAuthenticated, authLoading]);

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

          const body =
            await readApiResponse<UserProfile>(
              response,
            );

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

      const body =
        await readApiResponse<UserProfile>(
          response,
        );

      if (!response.ok || !body.success) {
        await signOut(auth);

        return {
          success: false,
          message:
            getApiErrorMessage(
              response,
              body,
              'Seu perfil não foi encontrado.',
            ),
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

      const body =
        await readApiResponse<{
          user?: UserProfile;
          customToken?: string;
        }>(response);

      if (!response.ok || !body.success) {
        return {
          success: false,
          message:
            getApiErrorMessage(
              response,
              body,
              'Falha ao realizar o cadastro.',
            ),
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

      const body =
        await readApiResponse<UserProfile>(
          response,
        );

      if (!response.ok || !body.success) {
        return {
          success: false,
          message:
            getApiErrorMessage(
              response,
              body,
              'Falha ao atualizar o perfil.',
            ),
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
      const normalized = normalizeUserProfile(
        newUser as UserProfile,
      );
      setUser(normalized);
      setIsAuthenticated(true);
      setAuthLoading(false);
      try {
        localStorage.setItem('oraculos_user', JSON.stringify(normalized));
        sessionStorage.setItem('oraculos_user', JSON.stringify(normalized));
      } catch {}
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


const syncMinuteBalance = (
  minutes: number,
): void => {
  const normalizedBalance =
    Number(minutes);

  if (
    !Number.isFinite(normalizedBalance) ||
    normalizedBalance < 0
  ) {
    console.error(
      '[ORACULOS.TS] Saldo inválido recebido do servidor.',
      minutes,
    );

    return;
  }

  setUser((previous) => ({
    ...previous,

    minuteBalance:
      normalizedBalance,

    // Alias legado mantido sincronizado.
    balance:
      normalizedBalance,
  }));
};



  const toggleFavorite = async (
    consultantId: string,
  ): Promise<AuthResult> => {
    const favorites = Array.isArray(
      user.favorites,
    )
      ? user.favorites
      : [];

    const nextFavorites = favorites.includes(
      consultantId,
    )
      ? favorites.filter(
          (id) => id !== consultantId,
        )
      : [...favorites, consultantId];

    return updateProfile({
      favorites: nextFavorites,
    });
  };

  const isFavorite = (
    consultantId: string,
  ): boolean => {
    return Array.isArray(user.favorites)
      ? user.favorites.includes(consultantId)
      : false;
  };

  const updateUserPix = async (
    pixKey: string,
  ): Promise<AuthResult> => {
    return updateProfile({
      pixKey: pixKey.trim(),
    });
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
syncMinuteBalance,
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
