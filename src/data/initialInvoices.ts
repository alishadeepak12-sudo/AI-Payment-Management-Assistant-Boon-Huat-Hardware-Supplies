import { InvoiceItem } from '../types';

export const CURRENT_DATE = '2026-07-31';

export const sampleInvoicesPresetApp2Single: InvoiceItem[] = [
  {
    id: 'inv-ext-1000',
    invoiceNumber: 'INV-EXT-1000',
    supplierName: 'Tan Brothers Metal Works Pte Ltd',
    supplierContact: {
      email: 'accounts@tanbrothersmetal.sg',
      whatsapp: '+65 9123 4567',
      contactPerson: 'Mr. David Tan'
    },
    invoiceDate: '2026-07-01',
    dueDate: '2026-07-31',
    amount: 900.00,
    matchStatus: 'MATCHED',
    matchNotes: '3-Way Match Verified by App 2. Approved Payable Amount: $900.00 (Subtotal SGD).',
    poNumber: 'PO-8812',
    grnNumber: 'GRN-4410',
    paymentTerms: 'Net 30',
    creditRiskStatus: 'Credit Suspension Risk',
    creditRiskDetails: 'Key supplier for hardware. Account active.',
    priority: 'High',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Approve & pay immediately in Batch 1 today.',
    explanation: 'Extracted from App 2 Excel dataset. Approved Payable Amount: $900.00 (Subtotal SGD). Calculated due date: 2026-07-31 (OVERDUE).',
    category: 'Hardware Supplies',
    batchNumber: 1
  }
];

export const sampleInvoicesPreset1: InvoiceItem[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-TB-2026-889',
    supplierName: 'Tan Brothers Metal Works Pte Ltd',
    supplierContact: {
      email: 'accounts@tanbrothersmetal.sg',
      whatsapp: '+65 9123 4567',
      contactPerson: 'Mr. David Tan'
    },
    invoiceDate: '2026-07-01',
    dueDate: '2026-07-31',
    amount: 14850.00,
    matchStatus: 'MATCHED',
    matchNotes: '3-Way Match Verified. PO-8812 and GRN-4410 quantities & unit prices match invoice 100%.',
    poNumber: 'PO-8812',
    grnNumber: 'GRN-4410',
    paymentTerms: 'Net 30',
    creditRiskStatus: 'Credit Suspension Risk',
    creditRiskDetails: 'Key supplier for structural steel. Strict 30-day terms. Automatic credit account suspension if unpaid by due date (today).',
    priority: 'High',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Approve & pay immediately in Batch 1 today.',
    explanation: 'Prevents credit account suspension with key steel supplier Tan Brothers Metal Works. Overdue risk is critical as account will be placed on credit hold tomorrow morning.',
    category: 'Structural Steel & Metal Sheets',
    batchNumber: 1
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-ELF-9941',
    supplierName: 'Eng Lee Fasteners & Bolt Co',
    supplierContact: {
      email: 'finance@engleefasteners.com.sg',
      whatsapp: '+65 9876 5432',
      contactPerson: 'Ms. Susan Lee'
    },
    invoiceDate: '2026-07-15',
    dueDate: '2026-08-14',
    amount: 3200.00,
    matchStatus: 'DISCREPANCY DETECTED',
    matchNotes: 'App 2 Price Mismatch: PO #8830 listed M12 Hex Bolts at $1.50/unit ($1,000 total), but Invoice billed $1.70/unit ($1,200 total). Discrepancy amount = $200.00.',
    poNumber: 'PO-8830',
    grnNumber: 'GRN-4422',
    paymentTerms: 'Net 30',
    creditRiskStatus: 'Normal',
    creditRiskDetails: 'Supplier account in good standing. Standard payment buffer available.',
    priority: 'Low',
    paymentStatus: 'On Hold',
    recommendedAction: 'Hold payment. Send discrepancy notice requesting a $200 Credit Note.',
    explanation: 'Held due to $200 unit price discrepancy identified by App 2 3-way match against PO-8830. Awaiting price adjustment credit note from Ms. Susan Lee.',
    category: 'Industrial Fasteners & Hardware',
    batchNumber: 3
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-CHH-4501',
    supplierName: 'Continental Hardware Hub',
    supplierContact: {
      email: 'billing@conthardware.com.sg',
      whatsapp: '+65 8234 5678',
      contactPerson: 'Mr. Kenneth Ang'
    },
    invoiceDate: '2026-07-22',
    dueDate: '2026-08-21',
    amount: 8500.00,
    matchStatus: 'MATCHED',
    matchNotes: '3-Way Match Verified. PO-8845 and GRN-4430 match perfectly.',
    poNumber: 'PO-8845',
    grnNumber: 'GRN-4430',
    paymentTerms: '2%/10 Net 30',
    earlyDiscountDays: 10,
    earlyDiscountPercent: 2.0,
    earlyDiscountAmount: 170.00,
    earlyDiscountDeadline: '2026-08-01',
    creditRiskStatus: 'Normal',
    creditRiskDetails: 'Offers 2% early settlement discount if settled by Aug 1, 2026 ($170 net savings).',
    priority: 'High',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Approve early payment today to capture $170 settlement discount.',
    explanation: 'High priority recommendation to capture $170 cash discount before early payment deadline tomorrow (Aug 1). Net cash outflow reduced to $8,330.00.',
    category: 'General Hardware & Tools',
    batchNumber: 1
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV-GHP-1082',
    supplierName: 'Guan Hock Piping & Steel Supply',
    supplierContact: {
      email: 'ar@guanhockpiping.sg',
      whatsapp: '+65 9112 3344',
      contactPerson: 'Mr. Guan Hock'
    },
    invoiceDate: '2026-07-05',
    dueDate: '2026-08-04',
    amount: 6250.00,
    matchStatus: 'MATCHED',
    matchNotes: '3-Way Match Verified. Fully matched against PO-8820 and GRN-4418.',
    poNumber: 'PO-8820',
    grnNumber: 'GRN-4418',
    paymentTerms: 'Net 30',
    creditRiskStatus: 'Normal',
    creditRiskDetails: 'Due in 4 days. Regular supplier terms.',
    priority: 'Medium',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Schedule for Batch 2 payout on Aug 3.',
    explanation: 'Invoice is matched and due in 4 days. Scheduled in Batch 2 to preserve Boon Huat cash buffer until closer to deadline.',
    category: 'Piping & Brass Valves',
    batchNumber: 2
  },
  {
    id: 'inv-105',
    invoiceNumber: 'INV-SSE-7712',
    supplierName: 'Singa Safety Equipment Ltd',
    supplierContact: {
      email: 'sales@singasafety.com.sg',
      whatsapp: '+65 9654 3210',
      contactPerson: 'Ms. Clara Wong'
    },
    invoiceDate: '2026-07-28',
    dueDate: '2026-08-27',
    amount: 1950.00,
    matchStatus: 'DUPLICATE SUSPECTED',
    matchNotes: 'App 2 Duplicate Risk: Flagged identical invoice amount $1,950.00 matching previously paid invoice INV-SSE-7690 dated July 10.',
    poNumber: 'PO-8850',
    grnNumber: 'GRN-4438',
    paymentTerms: 'Net 30',
    creditRiskStatus: 'Warning',
    creditRiskDetails: 'Suspected duplicate billing for safety helmets and boots order.',
    priority: 'Low',
    paymentStatus: 'On Hold',
    recommendedAction: 'Hold payment. Require Madam Lim to confirm with warehouse receiving log before release.',
    explanation: 'On hold due to duplicate billing suspicion flagged by App 2. Invoice INV-SSE-7690 for $1,950 was already settled on July 18.',
    category: 'PPE & Safety Supplies',
    batchNumber: 3
  }
];

export const sampleInvoicesPreset2_Critical: InvoiceItem[] = [
  ...sampleInvoicesPreset1.map(inv => {
    if (inv.id === 'inv-101') {
      return {
        ...inv,
        amount: 24500.00,
        dueDate: '2026-07-28',
        creditRiskStatus: 'Credit Suspension Risk' as const,
        creditRiskDetails: 'OVERDUE BY 3 DAYS. Supplier credit control manager warned that pending PO #8900 for $30,000 project will be frozen today if unpaid.',
        priority: 'High' as const,
        explanation: 'CRITICAL OVERDUE (3 days late). Credit account is on red flag alert. Paying this invoice immediately avoids project shutdown for Boon Huat clients.'
      };
    }
    return inv;
  }),
  {
    id: 'inv-106',
    invoiceNumber: 'INV-KPT-3309',
    supplierName: 'Kian Heng Power Tools Pte Ltd',
    supplierContact: {
      email: 'accounts@kianhengtools.sg',
      whatsapp: '+65 8901 2345',
      contactPerson: 'Mr. Alex Kian'
    },
    invoiceDate: '2026-06-25',
    dueDate: '2026-07-25',
    amount: 5400.00,
    matchStatus: 'MATCHED',
    matchNotes: '3-Way Match Verified. PO-8790 & GRN-4390 match.',
    poNumber: 'PO-8790',
    grnNumber: 'GRN-4390',
    paymentTerms: 'Net 30',
    creditRiskStatus: 'Credit Suspension Risk',
    creditRiskDetails: 'Overdue by 6 days. Late payment fee of 1.5% per month will be levied if not settled by end of month.',
    priority: 'High',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Include in Batch 1 immediate payment today to halt $81 late fee accumulation.',
    explanation: 'Overdue by 6 days. Subject to 1.5% late payment penalty starting tomorrow. Immediate settlement stops penalty accumulation.',
    category: 'Power Tools & Machinery',
    batchNumber: 1
  }
];

export const sampleInvoicesPreset3_Discounts: InvoiceItem[] = [
  {
    id: 'inv-201',
    invoiceNumber: 'INV-CHH-5100',
    supplierName: 'Continental Hardware Hub',
    supplierContact: { email: 'billing@conthardware.com.sg', whatsapp: '+65 8234 5678', contactPerson: 'Mr. Kenneth Ang' },
    invoiceDate: '2026-07-25',
    dueDate: '2026-08-24',
    amount: 12000.00,
    matchStatus: 'MATCHED',
    matchNotes: 'Fully matched with PO-8860 and GRN-4445.',
    poNumber: 'PO-8860',
    grnNumber: 'GRN-4445',
    paymentTerms: '3%/10 Net 30',
    earlyDiscountDays: 10,
    earlyDiscountPercent: 3.0,
    earlyDiscountAmount: 360.00,
    earlyDiscountDeadline: '2026-08-04',
    creditRiskStatus: 'Normal',
    creditRiskDetails: 'High early payment discount of 3% ($360.00 savings).',
    priority: 'High',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Approve for early payout to secure $360 cash discount.',
    explanation: 'Substantial 3% settlement discount ($360) available if paid before Aug 4. Recommending early execution.',
    category: 'General Hardware',
    batchNumber: 1
  },
  {
    id: 'inv-202',
    invoiceNumber: 'INV-TB-2026-912',
    supplierName: 'Tan Brothers Metal Works Pte Ltd',
    supplierContact: { email: 'accounts@tanbrothersmetal.sg', whatsapp: '+65 9123 4567', contactPerson: 'Mr. David Tan' },
    invoiceDate: '2026-07-22',
    dueDate: '2026-08-21',
    amount: 18500.00,
    matchStatus: 'MATCHED',
    matchNotes: '3-Way Match Verified against PO-8855.',
    poNumber: 'PO-8855',
    grnNumber: 'GRN-4440',
    paymentTerms: '2%/10 Net 30',
    earlyDiscountDays: 10,
    earlyDiscountPercent: 2.0,
    earlyDiscountAmount: 370.00,
    earlyDiscountDeadline: '2026-08-01',
    creditRiskStatus: 'Normal',
    creditRiskDetails: '2% early discount expires tomorrow (Aug 1).',
    priority: 'High',
    paymentStatus: 'Pending Approval',
    recommendedAction: 'Approve today to earn $370 discount.',
    explanation: 'Paying today captures $370 discount before deadline tomorrow. Net payment: $18,130.00.',
    category: 'Structural Steel',
    batchNumber: 1
  },
  ...sampleInvoicesPreset1.filter(inv => inv.id !== 'inv-101' && inv.id !== 'inv-103')
];
