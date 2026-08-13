import React, {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'motion/react';

import {
  Check,
  Clock,
  CreditCard,
  QrCode,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';

import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

import type {
  MinutePackage,
} from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MercadoPagoRechargeModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const {
    isAuthenticated,
  } = useAuth();

  const [packages, setPackages] =
    useState<MinutePackage[]>([]);

  const [selectedPkg, setSelectedPkg] =
    useState<MinutePackage | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<'pix' | 'card'>('pix');

  const [couponCode, setCouponCode] =
    useState('');

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError('');

    fetch('/api/packages')
      .then(async (response) => {
        const contentType =
          response.headers.get(
            'content-type',
          ) || '';

        const body =
          contentType.includes(
            'application/json',
          )
            ? await response.json()
            : {
                success: false,
                error:
                  await response.text(),
              };

        if (!response.ok) {
          throw new Error(
            body.error?.message ||
              body.error ||
              'Não foi possível carregar os pacotes.',
          );
        }

        return body;
      })
      .then((data) => {
        if (
          data.success &&
          Array.isArray(data.data)
        ) {
          setPackages(data.data);

          const defaultPackage =
            data.data.find(
              (
                packageItem:
                  MinutePackage,
              ) =>
                packageItem.priceBrl ===
                30,
            ) || data.data[0];

          setSelectedPkg(
            defaultPackage || null,
          );
        }
      })
      .catch((loadError: unknown) => {
        console.error(
          'Erro ao carregar pacotes:',
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar os pacotes.',
        );
      });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape' &&
        !isProcessing
      ) {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [
    isOpen,
    isProcessing,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  const currentPkg =
    selectedPkg || packages[0];

  const totalPrice =
    currentPkg?.priceBrl || 0;

  const totalMinutes =
    currentPkg
      ? currentPkg.minutes +
        currentPkg.bonusMinutes
      : 0;

  const handleConfirmPayment =
    async () => {
      if (!currentPkg) {
        setError(
          'Selecione um pacote de minutos.',
        );
        return;
      }

      if (
        !isAuthenticated ||
        !auth.currentUser
      ) {
        setError(
          'Sua sessão expirou. Entre novamente para realizar a compra.',
        );
        return;
      }

      setIsProcessing(true);
      setError('');

      try {
        const idToken =
          await auth.currentUser.getIdToken(
            true,
          );

        const response = await fetch(
  '/api/finance/create-preference',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              amount:
                currentPkg.priceBrl,
              packageId:
                currentPkg.id,
              paymentMethod,
              couponCode:
                couponCode.trim() ||
                undefined,
            }),
          },
        );

        const contentType =
          response.headers.get(
            'content-type',
          ) || '';

        const body =
          contentType.includes(
            'application/json',
          )
            ? await response.json()
            : {
                error:
                  await response.text(),
              };

        if (!response.ok) {
          throw new Error(
            body.error?.message ||
              body.error ||
              'Não foi possível iniciar o pagamento.',
          );
        }

        const checkoutUrl =
  body.data?.initPoint;

        if (
          typeof checkoutUrl !==
            'string' ||
          !checkoutUrl
        ) {
          throw new Error(
            'O servidor não retornou o endereço do Mercado Pago.',
          );
        }

        const checkout =
          new URL(checkoutUrl);

        const validHostname =
          checkout.hostname ===
            'mercadopago.com' ||
          checkout.hostname ===
            'mercadopago.com.br' ||
          checkout.hostname ===
            'www.mercadopago.com' ||
          checkout.hostname ===
            'www.mercadopago.com.br' ||
          checkout.hostname.endsWith(
            '.mercadopago.com',
          ) ||
          checkout.hostname.endsWith(
            '.mercadopago.com.br',
          );

        if (
          checkout.protocol !==
            'https:' ||
          !validHostname
        ) {
          throw new Error(
            'O endereço de pagamento retornado é inválido.',
          );
        }

        window.location.assign(
          checkout.toString(),
        );
      } catch (
        paymentError: unknown
      ) {
        const message =
          paymentError instanceof Error
            ? paymentError.message
            : 'Erro ao conectar ao Mercado Pago.';

        setError(message);
        setIsProcessing(false);
      }
    };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
        role="presentation"
        onMouseDown={(event) => {
          if (
            event.target ===
              event.currentTarget &&
            !isProcessing
          ) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mercado-pago-title"
          className="relative my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-500/30 bg-[#150F26] text-slate-100 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-[#150F26] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>

              <div>
                <h3
                  id="mercado-pago-title"
                  className="text-lg font-bold text-amber-200"
                >
                  Comprar Pacote de Minutos
                </h3>

                <p className="text-xs text-purple-300/80">
                  Pagamento seguro processado pelo Mercado Pago
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              aria-label="Fechar"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-purple-900/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/50 bg-rose-950/80 p-3 text-xs text-rose-300"
              >
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-purple-300">
                1. Selecione o pacote de minutos
              </label>

              {packages.length === 0 ? (
                <div className="rounded-xl border border-purple-900/60 bg-[#1F1638] p-5 text-center text-sm text-slate-400">
                  Carregando pacotes disponíveis...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {packages.map(
                    (packageItem) => {
                      const isSelected =
                        selectedPkg?.id ===
                        packageItem.id;

                      return (
                        <button
                          key={
                            packageItem.id
                          }
                          type="button"
                          onClick={() => {
                            setSelectedPkg(
                              packageItem,
                            );
                            setError('');
                          }}
                          className={`relative rounded-xl border p-3.5 text-left transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                              : 'border-purple-900/60 bg-[#1F1638] hover:border-purple-600'
                          }`}
                        >
                          {packageItem.bonusMinutes >
                            0 && (
                            <span className="absolute -right-1 -top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                              +
                              {
                                packageItem.bonusMinutes
                              }{' '}
                              min bônus
                            </span>
                          )}

                          <div className="text-xs font-medium text-purple-300">
                            {
                              packageItem.title
                            }
                          </div>

                          <div className="mt-1 text-lg font-bold text-amber-300">
                            R${' '}
                            {packageItem.priceBrl.toFixed(
                              2,
                            )}
                          </div>

                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />

                            <span>
                              {packageItem.minutes +
                                packageItem.bonusMinutes}{' '}
                              min totais
                            </span>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-300">
                  Cupom de bônus
                </label>

                <input
                  type="text"
                  placeholder="Ex: ORACULO10"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(
                      event.target.value,
                    );
                    setError('');
                  }}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-purple-900/60 bg-[#1F1638] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-300">
                  2. Método de pagamento
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setPaymentMethod(
                        'pix',
                      );
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                      paymentMethod ===
                      'pix'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-purple-900/60 bg-[#1F1638] text-slate-400'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    PIX
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      setPaymentMethod(
                        'card',
                      );
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                      paymentMethod ===
                      'card'
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-purple-900/60 bg-[#1F1638] text-slate-400'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Cartão
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-purple-800/40 bg-purple-950/40 p-4">
              <div className="flex justify-between gap-4 text-xs text-slate-300">
                <span>
                  Pacote escolhido:
                </span>

                <span className="text-right font-semibold text-white">
                  {currentPkg?.title ||
                    'Nenhum pacote selecionado'}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-300">
                <span>
                  Minutos do pacote:
                </span>

                <span className="font-semibold text-amber-300">
                  {currentPkg?.minutes ||
                    0}{' '}
                  minutos
                </span>
              </div>

              {currentPkg &&
                currentPkg.bonusMinutes >
                  0 && (
                  <div className="flex justify-between text-xs font-medium text-emerald-400">
                    <span>
                      Bônus especial:
                    </span>

                    <span>
                      +
                      {
                        currentPkg.bonusMinutes
                      }{' '}
                      minutos
                    </span>
                  </div>
                )}

              <div className="flex justify-between border-t border-purple-900/60 pt-2 text-sm font-bold">
                <span className="text-slate-200">
                  Total de minutos:
                </span>

                <span className="text-base text-amber-300">
                  {totalMinutes}{' '}
                  minutos
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-200">
                  Valor:
                </span>

                <span className="text-base text-amber-300">
                  R${' '}
                  {totalPrice.toFixed(
                    2,
                  )}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />

                <div className="space-y-1 text-xs text-slate-300">
                  <p className="font-bold text-emerald-300">
                    Checkout protegido
                  </p>

                  <p>
                    O pagamento será concluído no ambiente oficial do Mercado Pago. Os minutos serão liberados somente após a confirmação do pagamento.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  void handleConfirmPayment()
                }
                disabled={
                  isProcessing ||
                  !currentPkg
                }
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-4 py-3.5 font-bold text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:from-amber-400 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />

                    <span>
                      Abrindo Mercado Pago...
                    </span>
                  </div>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-slate-950" />

                    Confirmar Compra - R${' '}
                    {totalPrice.toFixed(
                      2,
                    )}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-center text-[11px] text-purple-300/60">
                <Check className="h-3.5 w-3.5 text-emerald-400" />

                Pagamento protegido pelo Mercado Pago
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};