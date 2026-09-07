export type UserRole = 'user' | 'client' | 'employee' | 'consultant' | 'support' | 'admin' | 'superadmin';

export type AccountStatus = 'active' | 'blocked' | 'pending';

export interface UserProfile {
  id: string;
  name: string;
  birthFullName: string;
  email: string;
  birthDate: string;
  birthTime: string | null;
  doesNotKnowBirthTime: boolean;
  role: UserRole;
  status: AccountStatus;
  minuteBalance: number;
  balance?: number; // legacy alias for BRL / compat
  avatar?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  birthDataConsent: boolean;
  favorites?: string[];
  pixKey?: string;
  createdAt: string;
  updatedAt: string;
}

// Backward-compatible alias for existing frontend references
export type User = UserProfile;

export interface MinutePackage {
  id: string;
  title: string;
  priceBrl: number;
  minutes: number;
  bonusMinutes: number;
  active: boolean;
  displayOrder: number;
  expirationDays?: number;
  maxPerUser?: number;
  popular?: boolean;
}

export type TransactionType = 'purchase' | 'bonus' | 'consultation_debit' | 'refund' | 'admin_adjustment' | 'recharge';

export interface MinuteTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  minutes: number;
  balanceBefore: number;
  balanceAfter: number;
  consultationId?: string;
  paymentId?: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  amountBrl?: number;
}

export type OracleType =
  | 'tarot'
  | 'cigano'
  | 'astrologia'
  | 'numerologia'
  | 'buzios'
  | 'ifa'
  | 'runas'
  | 'iching'
  | 'cristais'
  | 'mesaradionica';

export type ConsultantStatus = 'online' | 'busy' | 'offline';

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  oracleUsed: OracleType;
}

export interface Consultant {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  specialties: OracleType[];
  rating: number;
  totalReviews: number;
  totalConsultations: number;
  // Minutos descontados da carteira do cliente
// por minuto de atendimento.
pricePerMinute: number;
  status: ConsultantStatus;
  experienceYears: number;
  avgResponseTime: string;
  reviews: Review[];
  schedule: string;
  totalEarned?: number;
  commissionRate?: number; // 0.30 platform fee, 0.70 consultant net
  isAI?: boolean;
  allowedOracles?: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  cardDrawn?: {
    name: string;
    meaning: string;
    imageUrl?: string;
  };
}

export interface ConsultationSession {
  id: string;
  clientId: string;
  clientName: string;
  consultantId: string;
  consultantName: string;
  consultantAvatar: string;
  oracleType: OracleType;
  mode: 'chat' | 'video';
  status: 'requested' | 'accepted' | 'waiting' | 'active' | 'reconnecting' | 'completed' | 'canceled' | 'interrupted' | 'refunded' | 'disputed';
  startTime: string;
  endTime?: string;
  durationSeconds: number;

// Consumo de minutos registrado quando a consulta começa.
pricePerMinute: number;

// Total de minutos da carteira consumidos pela consulta.
totalCost: number;

adminCommission: number;
consultantEarnings: number;
  ratingGiven?: number;
  reviewText?: string;
  messages: ChatMessage[];
}

export interface ConsultationFinancialRecord {
  id: string;
  consultationId: string;
  userId: string;
  employeeId: string;
  minutesUsed: number;

// Minutos descontados da carteira do cliente
// por minuto de atendimento.
pricePerMinute: number;

grossAmount: number;
  platformFeePercentage: number; // Default 30%
  platformFeeAmount: number;
  employeeNetAmount: number; // 70%
  status: 'pending' | 'completed' | 'refunded' | 'disputed';
  createdAt: string;
}

export interface CandidateApplication {
  id: string;
  fullName: string;
  professionalName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  state: string;
  country: string;
  documentNumber?: string;
  profilePhoto?: string;
  bio: string;
  experienceYears: number;
  specialties: string[];
  oracles: string[];
  education?: string;
  languages: string[];
  modality: 'chat' | 'video' | 'both';
  status: 'submitted' | 'in_review' | 'documents_pending' | 'interview' | 'approved' | 'rejected' | 'suspended';
  termsAccepted: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
}

export type ConsultationIntent =
  | 'greeting'
  | 'general_conversation'
  | 'self'
  | 'love'
  | 'relationship'
  | 'third_person'
  | 'family'
  | 'work'
  | 'career'
  | 'finance'
  | 'spirituality'
  | 'future'
  | 'oracle_request'
  | 'clarification_needed'
  | 'sensitive_subject'
  | 'emergency';

export interface OracleResponseValidation {
  relevant: boolean;
  contextConsistent: boolean;
  culturallyRespectful: boolean;
  safe: boolean;
  withinCharacterLimit: boolean;
  requiresHumanReview: boolean;
  issues: string[];
}

export type BlogPostStatus =
  | 'idea'
  | 'draft'
  | 'review'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'archived';

export interface VirtualConsultantProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  gender: 'female' | 'male' | 'neutral';
  specialties: OracleType[];
  authorizedOracles: OracleType[];
  communicationStyle: string;
  personality: string;
vocabulary: string[];
greeting: string;

// Minutos descontados da carteira do cliente
// por minuto de atendimento.
pricePerMinute: number;

status: ConsultantStatus;
  languages: string[];
  preferredTopics: string[];
  safetyLimits: string[];
  modelConfig: {
    primaryModel: string;
    fallbackModel: string;
    temperature: number;
  };
  knowledgeBase: string[];
  healthStatus: 'healthy' | 'degraded' | 'maintenance';
  version: string;
  lastUpdated: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  reviewer?: string;
  date: string;
  publishedAt?: string;
  updatedAt?: string;
  readTime: string;
  coverImage: string;
  altText?: string;
  tags: string[];
  views: number;
  status?: BlogPostStatus;
  focusKeyword?: string;
  relatedKeywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  internalLinks?: string[];
}

export interface FinancialTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'recharge' | 'consultation_debit' | 'consultation_credit' | 'payout' | 'bonus' | 'refund' | 'admin_adjustment';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  target?: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface FinancialLedgerEntry {
  id: string;
  userId: string;
  userName: string;
  type: 'recharge' | 'consultation_debit' | 'consultation_credit' | 'payout' | 'bonus' | 'refund' | 'admin_adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId: string;
  reason?: string;
  createdAt: string;
  createdBy: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'bonus_fixed' | 'percent_discount';
  value: number;
  active: boolean;
  expiresAt: string | null;
  maxUses: number;
  currentUses: number;
  maxUsesPerUser: number;
  userUsesCount: Record<string, number>;
  eligibleProducts: string[];
  createdAt: string;
  createdBy: string;
}

export interface PlatformStats {
  totalRevenue: number;
  adminCommissionTotal: number;
  activeSessionsCount: number;
  totalConsultants: number;
  totalClients: number;
  completedSessionsTotal: number;
}

export type { PublicView, ParsedRoute, NavigationTarget } from './routing/routes.js';
