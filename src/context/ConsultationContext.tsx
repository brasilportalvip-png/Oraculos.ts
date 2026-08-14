import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Consultant, ConsultationSession, ChatMessage, OracleType, FinancialTransaction } from '../types';
import { useAuth } from './AuthContext';
import { INITIAL_CONSULTANTS, INITIAL_TRANSACTIONS } from '../data/mockData';
import { auth } from '../firebase';

interface ConsultationContextType {
  activeSession: ConsultationSession | null;
  consultants: Consultant[];
  pastSessions: ConsultationSession[];
  transactions: FinancialTransaction[];
  isRechargeModalOpen: boolean;
  setIsRechargeModalOpen: (open: boolean) => void;
  startConsultation: (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => { success: boolean; message?: string };
  sendMessage: (text: string) => void;
  drawOracleCard: () => void;
  endConsultation: (rating?: number, reviewText?: string) => void;
  addTransaction: (tx: FinancialTransaction) => void;
  updateConsultantStatus: (consultantId: string, status: 'online' | 'busy' | 'offline') => void;
  updateConsultantPrice: (consultantId: string, newPrice: number) => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

// Sample Tarot Cards for live draws in chat
const TAROT_CARDS = [
  { name: 'O Sol', meaning: 'Alegria, clareza, sucesso e vitalidade iluminando seus caminhos.', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=200' },
  { name: 'A Estrela', meaning: 'Esperança, inspiração divina, cura espiritual e momentos de serenidade.', imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=200' },
  { name: 'O Imperador', meaning: 'Estrutura, liderança, solidez financeira e tomada de controle consciente.', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200' },
  { name: 'A Sacerdotisa', meaning: 'Intuição aguçada, mistérios revelados, reflexão e sabedoria interior.', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=200' },
  { name: 'A Roda da Fortuna', meaning: 'Mudanças benéficas, virada de ciclo, sorte e novos rumos inevitáveis.', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=200' },
  { name: 'Os Enamorados', meaning: 'Escolhas do coração, união harmônica, paixão e alinhamento de valores.', imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=200' },
];

export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
  user,
  deductMinutes,
} = useAuth();
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>(INITIAL_CONSULTANTS);
  const [pastSessions, setPastSessions] = useState<ConsultationSession[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);



/*
 * Impede múltiplas chamadas Gemini
 * durante a entrega gradual da resposta.
 */
const isAutoReplyInProgressRef =
  useRef(false);



  // Live Timer & Per-minute Credit Consumption
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;

    const timer = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev) return null;

        const newDuration = prev.durationSeconds + 1;
        // Every 60 seconds (or fraction), update cost
        const currentMinutes = Math.ceil(newDuration / 60);
        const accumulatedCost = currentMinutes * prev.pricePerMinute;

        // Check if user balance is running out
        if (
  user.minuteBalance < prev.pricePerMinute &&
  newDuration % 60 === 0
) {
  // O cliente está sem minutos suficientes para continuar
}

        return {
          ...prev,
          durationSeconds: newDuration,
          totalCost: accumulatedCost,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, user.minuteBalance]);

  // Simulated automated or Gemini AI responses from the Consultant during chat
  


const handleAutoReply = async (
  userMsg: string,
) => {
  if (!activeSession) {
    return;
  }

  if (
    isAutoReplyInProgressRef.current
  ) {
    console.warn(
      '[ORACULOS.TS] Mensagem ignorada: o especialista ainda está respondendo.',
    );

    return;
  }

  isAutoReplyInProgressRef.current =
    true;

  const isVirtualAttendant = activeSession.consultantId.startsWith('ai_') || activeSession.consultantId.startsWith('c_ai_');

    if (isVirtualAttendant) {
      try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
          throw new Error(
            'Sua sessão expirou. Saia da conta e entre novamente.',
          );
        }

        const idToken = await firebaseUser.getIdToken(true);

        const res = await fetch('/api/ai/virtual-attendant-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            attendantId: activeSession.consultantId,
            userMessage: userMsg,
            chatHistory: activeSession.messages,
            



userProfile: {
  name:
    user.name,

  birthFullName:
    user.birthFullName ||
    user.name,

  birthDate:
    user.birthDate ||
    null,

  birthTime:
    user.doesNotKnowBirthTime
      ? null
      : user.birthTime || null,

  doesNotKnowBirthTime:
    Boolean(
      user.doesNotKnowBirthTime,
    ),

  birthDataConsent:
    Boolean(
      user.birthDataConsent,
    ),
},






            oracleType: activeSession.oracleType,
          }),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            result.error?.message ||
              'Não foi possível consultar a assistente virtual.',
          );
        }










if (
  result.success &&
  result.data?.responseMessage
) {
  const sleep = (
    milliseconds: number,
  ) =>
    new Promise<void>((resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    });

  const receivedChunks =
    Array.isArray(
      result.data.responseChunks,
    )
      ? result.data.responseChunks
          .map(
            (
              chunk: {
                index?: number;
                text?: string;
              },
            ) => ({
              index:
                Number(
                  chunk.index,
                ) || 0,

              text:
                String(
                  chunk.text || '',
                ).trim(),
            }),
          )
          .filter(
            (
              chunk: {
                index: number;
                text: string;
              },
            ) =>
              Boolean(
                chunk.text,
              ),
          )
          .sort(
            (
              firstChunk: {
                index: number;
              },
              secondChunk: {
                index: number;
              },
            ) =>
              firstChunk.index -
              secondChunk.index,
          )
      : [];

  const responseChunks =
    receivedChunks.length > 0
      ? receivedChunks
      : [
          {
            index: 0,
            text: String(
              result.data
                .responseMessage,
            ).trim(),
          },
        ];

  const sessionConsultantId =
    activeSession.consultantId;

  const sessionConsultantName =
    activeSession.consultantName;

  for (
  let chunkIndex = 0;
  chunkIndex <
  responseChunks.length;
  chunkIndex += 1
) {

const chunk =
      responseChunks[
        chunkIndex
      ];

    const typingMessageId =
      `typing_${Date.now()}_${chunkIndex}`;

    const typingMessage:
  ChatMessage = {
  id:
    typingMessageId,

  senderId:
    sessionConsultantId,

  senderName:
    sessionConsultantName,

  text:
    'Digitando.',

  timestamp:
    new Date()
      .toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
};

    setActiveSession(
  (previousSession) => {
    if (
      !previousSession ||
      previousSession.status !==
        'active'
    ) {
      return previousSession;
    }

    return {
      ...previousSession,

      messages: [
        ...previousSession
          .messages,

        typingMessage,
      ],
    };
  },
);

/*
 * Alterna visualmente:
 * Digitando.
 * Digitando..
 * Digitando...
 */
let typingDotStep = 1;

const typingAnimationInterval =
  window.setInterval(() => {
    typingDotStep =
      typingDotStep >= 3
        ? 1
        : typingDotStep + 1;

    const animatedTypingText =
      `Digitando${'.'.repeat(
        typingDotStep,
      )}`;

    setActiveSession(
      (previousSession) => {
        if (
          !previousSession ||
          previousSession.status !==
            'active'
        ) {
          return previousSession;
        }

        return {
          ...previousSession,

          messages:
            previousSession.messages.map(
              (message) =>
                message.id ===
                typingMessageId
                  ? {
                      ...message,

                      text:
                        animatedTypingText,
                    }
                  : message,
            ),
        };
      },
    );
  }, 450);

/*
 * Tempo proporcional ao tamanho do
 * trecho, com pequena variação para
 * não parecer um relógio mecânico.
 */
const baseTypingTime =
  chunk.text.length * 32;

const randomVariation =
  Math.floor(
    Math.random() * 700,
  );

const typingDelay =
  Math.min(
    6500,
    Math.max(
      1800,
      baseTypingTime +
        randomVariation,
    ),
  );

await sleep(
  typingDelay,
);

window.clearInterval(
  typingAnimationInterval,
);
    const consultantReply:
      ChatMessage = {
      id:
        `msg_${Date.now()}_${chunkIndex}`,

      senderId:
        sessionConsultantId,

      senderName:
        sessionConsultantName,

      text:
        chunk.text,

      timestamp:
        new Date()
          .toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ),
    };

    setActiveSession(
      (previousSession) => {
        if (
          !previousSession
        ) {
          return null;
        }

        /*
         * Remove “Digitando...” e insere
         * o trecho real no mesmo momento.
         */
        const messagesWithoutTyping =
          previousSession.messages
            .filter(
              (message) =>
                message.id !==
                typingMessageId,
            );

        if (
          previousSession.status !==
          'active'
        ) {
          return {
            ...previousSession,

            messages:
              messagesWithoutTyping,
          };
        }

        return {
          ...previousSession,

          messages: [
            ...messagesWithoutTyping,

            consultantReply,
          ],
        };
      },
    );

    /*
     * Pequena pausa natural antes do
     * próximo “Digitando...”.
     */
    if (
  chunkIndex <
  responseChunks.length - 1
) {
  await sleep(
    500 +
      Math.floor(
        Math.random() * 500,
      ),
  );
}
}

isAutoReplyInProgressRef.current =
  false;

return;
}


    } catch (err) {
      isAutoReplyInProgressRef.current = false;
      console.warn('Erro na resposta do atendente virtual IA:', err);
    }
  } else {
    // For Human Specialists: Record user message and wait for human operator in real-time
    isAutoReplyInProgressRef.current = false;
  }
  };

  const startConsultation = (consultant: Consultant, oracle: OracleType, mode: 'chat' | 'video') => {
    if (user.minuteBalance < consultant.pricePerMinute) {
  setIsRechargeModalOpen(true);

  return {
    success: false,
    message: `Minutos insuficientes. É necessário ter ao menos ${consultant.pricePerMinute.toFixed(2)} min disponíveis para iniciar o atendimento.`,
  };
}

    const initialMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'ORACULOS.TS',
      text: `Conexão espiritual iniciada com ${consultant.name}. Atendimento por ${mode === 'chat' ? 'Chat ao Vivo' : 'Chamada de Vídeo'}. Consumo: ${consultant.pricePerMinute.toFixed(2)} min do saldo por minuto de atendimento.`,

timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };

    const welcomeConsultantMsg: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      senderId: consultant.id,
      senderName: consultant.name,
      text: `Olá ${user.name}, seja muito bem-vindo(a)! Estou concentrada(o) nas energias do ${oracle.toUpperCase()}. Como posso te guiar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newSession: ConsultationSession = {
      id: `sess_${Date.now()}`,
      clientId: user.id,
      clientName: user.name,
      consultantId: consultant.id,
      consultantName: consultant.name,
      consultantAvatar: consultant.avatar,
      oracleType: oracle,
      mode,
      status: 'active',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: 0,
      pricePerMinute: consultant.pricePerMinute,
      totalCost: 0,
      adminCommission: 0,
      consultantEarnings: 0,
      messages: [initialMessage, welcomeConsultantMsg],
    };

    setActiveSession(newSession);

    // Update consultant status to 'busy'
    setConsultants((prev) =>
      prev.map((c) => (c.id === consultant.id ? { ...c, status: 'busy' } : c))
    );

    return { success: true };
  };

  



const sendMessage = (text: string) => {
  const cleanText =
    text.trim();

  if (
    !activeSession ||
    !cleanText
  ) {
    return;
  }

  /*
   * Enquanto o especialista estiver
   * digitando, nenhuma nova mensagem
   * entra no histórico nem gera chamada.
   */
  if (
    isAutoReplyInProgressRef.current
  ) {
    console.warn(
      '[ORACULOS.TS] Aguarde o especialista concluir a resposta.',
    );

    return;
  }

  const userMessage:
    ChatMessage = {
    id:
      `msg_${Date.now()}`,

    senderId:
      user.id,

    senderName:
      user.name,

    text:
      cleanText,

    timestamp:
      new Date()
        .toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
  };

  setActiveSession(
    (previousSession) => {
      if (!previousSession) {
        return null;
      }

      return {
        ...previousSession,

        messages: [
          ...previousSession
            .messages,

          userMessage,
        ],
      };
    },
  );

  handleAutoReply(
    cleanText,
  );
};






  const drawOracleCard = () => {
    if (!activeSession) return;

    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];

    const systemMsg: ChatMessage = {
      id: `msg_card_${Date.now()}`,
      senderId: 'system',
      senderName: 'ORACULOS.TS',
      text: `Uma lâmina sagrada foi tirada do Oráculo para a consulta de ${user.name}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      cardDrawn: randomCard,
    };

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, systemMsg],
      };
    });
  };

  const endConsultation = (rating?: number, reviewText?: string) => {
    if (!activeSession) return;

    const durationMinutes = Math.max(1, Math.ceil(activeSession.durationSeconds / 60));
    const finalCost = durationMinutes * activeSession.pricePerMinute;
    const commissionRate = 0.30; // 30% for platform, 70% for consultant
    const adminCommission = Number((finalCost * commissionRate).toFixed(2));
    const consultantEarnings = Number((finalCost * (1 - commissionRate)).toFixed(2));

    // Desconta os minutos consumidos da carteira do cliente
deductMinutes(finalCost);

    const completedSession: ConsultationSession = {
      ...activeSession,
      status: 'completed',
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalCost: finalCost,
      adminCommission,
      consultantEarnings,
      ratingGiven: rating,
      reviewText,
    };

    // Record client debit transaction
    const debitTx: FinancialTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: 'consultation_debit',
      amount: finalCost,
      method: 'wallet_balance',
      status: 'completed',
      date: new Date().toLocaleString(),
      description: `Atendimento (${durationMinutes} min) com ${activeSession.consultantName}`,
    };

    // Record consultant credit transaction
    const creditTx: FinancialTransaction = {
      id: `tx_cred_${Date.now()}`,
      userId: activeSession.consultantId,
      userName: activeSession.consultantName,
      type: 'consultation_credit',
      amount: consultantEarnings,
      method: 'wallet_balance',
      status: 'completed',
      date: new Date().toLocaleString(),
      description: `Comissão (${(1 - commissionRate) * 100}%) consulta ${activeSession.clientName}`,
    };

    setTransactions((prev) => [debitTx, creditTx, ...prev]);
    setPastSessions((prev) => [completedSession, ...prev]);

    // Update consultant stats & rating if provided
    setConsultants((prev) =>
      prev.map((c) => {
        if (c.id === activeSession.consultantId) {
          const newTotalConsultations = c.totalConsultations + 1;
          const newReviews = rating && reviewText ? [
            {
              id: `rev_${Date.now()}`,
              clientName: user.name,
              rating,
              comment: reviewText,
              date: new Date().toLocaleDateString('pt-BR'),
              oracleUsed: activeSession.oracleType,
            },
            ...c.reviews,
          ] : c.reviews;

          return {
            ...c,
            status: 'online',
            totalConsultations: newTotalConsultations,
            totalEarned: (c.totalEarned || 0) + consultantEarnings,
            reviews: newReviews,
          };
        }
        return c;
      })
    );

    setActiveSession(null);
  };

  const addTransaction = (
  tx: FinancialTransaction,
) => {
  setTransactions((prev) => [
    tx,
    ...prev,
  ]);
};

  const updateConsultantStatus = (consultantId: string, status: 'online' | 'busy' | 'offline') => {
    setConsultants((prev) =>
      prev.map((c) => (c.id === consultantId ? { ...c, status } : c))
    );
  };

  const updateConsultantPrice = (consultantId: string, newPrice: number) => {
    setConsultants((prev) =>
      prev.map((c) => (c.id === consultantId ? { ...c, pricePerMinute: newPrice } : c))
    );
  };

  return (
    <ConsultationContext.Provider
      value={{
        activeSession,
        consultants,
        pastSessions,
        transactions,
        isRechargeModalOpen,
        setIsRechargeModalOpen,
        startConsultation,
        sendMessage,
        drawOracleCard,
        endConsultation,
        addTransaction,
        updateConsultantStatus,
        updateConsultantPrice,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};