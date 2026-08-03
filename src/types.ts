export type MatchStatus = 'MATCHED' | 'DISCREPANCY DETECTED' | 'DUPLICATE SUSPECTED';
export type PaymentPriority = 'High' | 'Medium' | 'Low';
export type PaymentStatus = 'Pending Approval' | 'Approved' | 'Paid' | 'On Hold';
export type CreditRiskLevel = 'Normal' | 'Warning' | 'Credit Suspension Risk';

export interface SupplierContact {
  email?: string;
  whatsapp?: string;
  contactPerson?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierContact: SupplierContact;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  matchStatus: MatchStatus;
  matchNotes: string;
  poNumber: string;
  grnNumber: string;
  paymentTerms: string;
  earlyDiscountDays?: number;
  earlyDiscountPercent?: number;
  earlyDiscountAmount?: number;
  earlyDiscountDeadline?: string;
  creditRiskStatus: CreditRiskLevel;
  creditRiskDetails: string;
  priority: PaymentPriority;
  paymentStatus: PaymentStatus;
  recommendedAction: string;
  explanation: string;
  category: string;
  batchNumber?: 1 | 2 | 3; // Batch 1: Immediate/High, Batch 2: Normal Due, Batch 3: On Hold/Pending
}

export interface PaymentSummary {
  totalOutstanding: number;
  totalReadyForPayment: number;
  countReady: number;
  totalOnHold: number;
  countOnHold: number;
  totalUrgentOverdue: number;
  countUrgentOverdue: number;
  potentialEarlyDiscountSavings: number;
}

export interface ActionStep {
  id: string;
  text: string;
  type: 'approval' | 'discrepancy_contact' | 'discount_review' | 'cashflow';
  completed: boolean;
  relatedInvoiceId?: string;
}

export interface SupplierCommunicationDraft {
  id: string;
  invoiceId: string;
  supplierName: string;
  channel: 'email' | 'whatsapp';
  purpose: 'discrepancy_hold_notice' | 'payment_extension_request' | 'payment_remittance_advice' | 'discount_clarification';
  subject: string;
  body: string;
  contactDetail: string;
}

export type DeletionReason = 
  | 'Duplicate Invoice'
  | 'Order Canceled'
  | 'Issued in Error'
  | 'Returned Goods / Credit Note Issued'
  | 'Incorrect Supplier Details'
  | 'Other';

export interface DeletionLogRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  reason: DeletionReason;
  customNotes?: string;
  deletedAt: string;
  deletedBy: string; // "Madam Lim"
  impactAlerts?: string[];
  invoiceData: InvoiceItem; // Preserved for audit & potential restoration
}

export interface AnalysisResponse {
  summary: PaymentSummary;
  invoices: InvoiceItem[];
  actionSteps: ActionStep[];
  communicationDrafts: SupplierCommunicationDraft[];
  cashFlowAnalysis: {
    startingCashBuffer: number;
    recommendedBatch1Payout: number;
    projectedRemainingBuffer: number;
    adviceNote: string;
  };
}
