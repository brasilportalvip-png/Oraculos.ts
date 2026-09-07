import React, { useEffect, useState } from 'react';

import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const RegisterModal: React.FC<
  RegisterModalProps
> = ({
  isOpen,
  onClose,
  initialMode = 'register',
}) => {
  const {
  registerUser,
  login,
  resetPassword,
} = useAuth();

  const [mode, setMode] =
    useState<AuthMode>(initialMode);

  const [formData, setFormData] = useState({
    name: '',
    birthFullName: '',
    email: '',
    password: '',
    birthDate: '',
    birthTime: '12:00',
    doesNotKnowBirthTime: false,
    termsAccepted: false,
    privacyAccepted: false,
    birthDataConsent: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] =
  useState(false);

const [success, setSuccess] =
  useState(false);

const [showPassword, setShowPassword] =
  useState(false);

const [resetMessage, setResetMessage] =
  useState('');
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) {
    return null;
  }

  const changeMode = (
  nextMode: AuthMode,
) => {
  setMode(nextMode);
  setError('');
  setResetMessage('');
  setSuccess(false);
  setShowPassword(false);
};

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();
    setError('');

    if (
      !formData.email.trim() ||
      !formData.email.includes('@')
    ) {
      setError(
        'Por favor, informe um e-mail válido.',
      );
      return;
    }

    if (formData.password.length < 6) {
      setError(
        'A senha deve possuir pelo menos 6 caracteres.',
      );
      return;
    }

    if (mode === 'login') {
      setLoading(true);

      const result = await login(
        formData.email,
        formData.password,
      );

      setLoading(false);

      if (result.success) {
        setSuccess(true);

        window.setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setError(
          result.message ||
            'Não foi possível entrar.',
        );
      }

      return;
    }

    if (!formData.name.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }

    if (!formData.birthFullName.trim()) {
      setError(
        'Informe seu nome completo de solteiro(a).',
      );
      return;
    }

    if (!formData.birthDate) {
      setError(
        'Selecione sua data de nascimento.',
      );
      return;
    }

    if (
      !formData.doesNotKnowBirthTime &&
      !formData.birthTime
    ) {
      setError(
        'Informe o horário de nascimento ou marque “Não sei o horário”.',
      );
      return;
    }

    if (!formData.termsAccepted) {
      setError(
        'Você deve aceitar os Termos de Uso.',
      );
      return;
    }

    if (!formData.privacyAccepted) {
      setError(
        'Você deve aceitar a Política de Privacidade.',
      );
      return;
    }

    if (!formData.birthDataConsent) {
      setError(
        'Você deve autorizar o uso dos dados de nascimento.',
      );
      return;
    }

    setLoading(true);

    const result =
      await registerUser(formData);

    setLoading(false);

    if (result.success) {
      setSuccess(true);

      window.setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(
        result.message ||
          'Erro ao realizar cadastro.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-purple-500/30 p-6 text-white shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <img
              src="/brand/logo-oraculos.png?v=20260831"
              alt="ORACULOS.TS Logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://portalvipbrasil.com.br/wp-content/uploads/2026/07/logo-oraculos.png';
              }}
              className="w-14 h-14 object-contain rounded-xl border border-[#d4af37]/40 shadow-lg bg-[#06060c] p-1"
            />
          </div>

          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-amber-200 to-amber-400">
            {mode === 'login'
              ? 'Entrar no ORACULOS.TS'
              : 'Cadastro de Consulente'}
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login'
              ? 'Entre com seu e-mail e senha.'
              : 'Crie seu perfil para comprar minutos e realizar consultas.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() =>
              changeMode('login')
            }
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'login'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() =>
              changeMode('register')
            }
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'register'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />

            <h3 className="text-xl font-semibold text-emerald-300">
              {mode === 'login'
                ? 'Login realizado!'
                : 'Cadastro realizado!'}
            </h3>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-sm"
          >
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}



{resetMessage && (
  <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium">
    {resetMessage}
  </div>
)}





            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">
                    Nome Social / Exibição *
                  </label>

                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                    <input
                      type="text"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          name: event.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-purple-200 mb-1">
                    Nome Completo de Solteiro(a) *
                  </label>

                  <input
                    type="text"
                    value={formData.birthFullName}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        birthFullName:
                          event.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">
                  E-mail *
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                  <input
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        email: event.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-purple-200 mb-1">
                  Senha *
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                  

<input
  type={
    showPassword
      ? 'text'
      : 'password'
  }
  autoComplete={
    mode === 'login'
      ? 'current-password'
      : 'new-password'
  }
  value={formData.password}
  onChange={(event) =>
    setFormData({
      ...formData,
      password:
        event.target.value,
    })
  }
  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-11 py-2"
/>

<button
  type="button"
  onClick={() =>
    setShowPassword(
      (current) => !current,
    )
  }
  aria-label={
    showPassword
      ? 'Ocultar senha'
      : 'Mostrar senha'
  }
  title={
    showPassword
      ? 'Ocultar senha'
      : 'Mostrar senha'
  }
  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
>
  {showPassword ? (
    <EyeOff className="w-4 h-4" />
  ) : (
    <Eye className="w-4 h-4" />
  )}
</button>




                </div>
              </div>
            </div>




{mode === 'login' && (
  <div className="flex justify-end">
    <button
      type="button"
      onClick={async () => {
        setError('');
        setResetMessage('');

        const result =
          await resetPassword(
            formData.email,
          );

        if (result.success) {
          setResetMessage(
            result.message ||
              'Link de recuperação enviado.',
          );
        } else {
          setError(
            result.message ||
              'Não foi possível recuperar a senha.',
          );
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-amber-300 transition"
    >
      <KeyRound className="w-3.5 h-3.5" />
      Esqueci minha senha
    </button>
  </div>
)}






            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-purple-200 mb-1">
                      Data de Nascimento *
                    </label>

                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            birthDate:
                              event.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-200 mb-1">
                      Horário de Nascimento
                    </label>

                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                      <input
                        type="time"
                        disabled={
                          formData.doesNotKnowBirthTime
                        }
                        value={formData.birthTime}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            birthTime:
                              event.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={
                      formData.doesNotKnowBirthTime
                    }
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        doesNotKnowBirthTime:
                          event.target.checked,
                        birthTime:
                          event.target.checked
                            ? ''
                            : '12:00',
                      })
                    }
                  />

                  Não sei o horário do nascimento
                </label>

                <div className="pt-3 border-t border-slate-800 space-y-3 text-xs text-slate-300">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.termsAccepted
                      }
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          termsAccepted:
                            event.target.checked,
                        })
                      }
                    />

                    Aceito os Termos de Uso.
                  </label>

                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.privacyAccepted
                      }
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          privacyAccepted:
                            event.target.checked,
                        })
                      }
                    />

                    Aceito a Política de Privacidade.
                  </label>

                  <label className="flex items-start gap-2 text-amber-200">
                    <input
                      type="checkbox"
                      checked={
                        formData.birthDataConsent
                      }
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          birthDataConsent:
                            event.target.checked,
                        })
                      }
                    />

                    Autorizo o uso dos meus dados de nascimento nas consultas.
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white font-semibold shadow-lg hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}

              {loading
                ? 'Aguarde...'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Concluir Cadastro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
