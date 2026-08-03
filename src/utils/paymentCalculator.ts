import { InvoiceItem, PaymentSummary, ActionStep, SupplierCommunicationDraft } from '../types';

export function calculateSummary(invoices: InvoiceItem[]): PaymentSummary {
  let totalOutstanding = 0;
  let totalReadyForPayment = 0;
  let countReady = 0;
  let totalOnHold = 0;
  let countOnHold = 0;
  let totalUrgentOverdue = 0;
  let countUrgentOverdue = 0;
  let potentialEarlyDiscountSavings = 0;

  for (const inv of invoices) {
    if (inv.paymentStatus !== 'Paid') {
      totalOutstanding += inv.amount;

      if (inv.matchStatus === 'MATCHED' && inv.paymentStatus !== 'On Hold') {
        totalReadyForPayment += inv.amount;
        countReady++;
      }

      if (inv.matchStatus !== 'MATCHED' || inv.paymentStatus === 'On Hold') {
        totalOnHold += inv.amount;
        countOnHold++;
      }

      if (inv.priority === 'High' || inv.creditRiskStatus === 'Credit Suspension Risk') {
        totalUrgentOverdue += inv.amount;
        countUrgentOverdue++;
      }

      if (inv.earlyDiscountAmount && inv.earlyDiscountAmount > 0) {
        potentialEarlyDiscountSavings += inv.earlyDiscountAmount;
      }
    }
  }

  return {
    totalOutstanding,
    totalReadyForPayment,
    countReady,
    totalOnHold,
    countOnHold,
    totalUrgentOverdue,
    countUrgentOverdue,
    potentialEarlyDiscountSavings
  };
}

export function generateActionSteps(invoices: InvoiceItem[]): ActionStep[] {
  const steps: ActionStep[] = [];
  
  const highPriorityReady = invoices.filter(i => i.priority === 'High' && i.matchStatus === 'MATCHED' && i.paymentStatus !== 'Paid');
  if (highPriorityReady.length > 0) {
    const totalHigh = highPriorityReady.reduce((acc, curr) => acc + curr.amount, 0);
    steps.push({
      id: 'step-batch1',
      text: `Approve Batch 1 High-Priority Payments (${highPriorityReady.length} invoices totaling $${totalHigh.toLocaleString('en-US', { minimumFractionDigits: 2 })}) to prevent credit hold & lock in early discounts.`,
      type: 'approval',
      completed: false
    });
  }

  const discrepancies = invoices.filter(i => i.matchStatus === 'DISCREPANCY DETECTED' && i.paymentStatus !== 'Paid');
  discrepancies.forEach(inv => {
    steps.push({
      id: `step-disc-${inv.id}`,
      text: `Contact ${inv.supplierName} (${inv.supplierContact.contactPerson || 'Accounts'}) regarding ${inv.invoiceNumber} discrepancy: ${inv.matchNotes}`,
      type: 'discrepancy_contact',
      completed: false,
      relatedInvoiceId: inv.id
    });
  });

  const duplicates = invoices.filter(i => i.matchStatus === 'DUPLICATE SUSPECTED' && i.paymentStatus !== 'Paid');
  duplicates.forEach(inv => {
    steps.push({
      id: `step-dup-${inv.id}`,
      text: `Review receiving records for suspected duplicate invoice ${inv.invoiceNumber} from ${inv.supplierName} before releasing payment.`,
      type: 'discrepancy_contact',
      completed: false,
      relatedInvoiceId: inv.id
    });
  });

  const discounts = invoices.filter(i => (i.earlyDiscountAmount ?? 0) > 0 && i.matchStatus === 'MATCHED' && i.paymentStatus !== 'Paid');
  if (discounts.length > 0) {
    const totalSavings = discounts.reduce((acc, curr) => acc + (curr.earlyDiscountAmount || 0), 0);
    steps.push({
      id: 'step-discounts',
      text: `Review early payment discount opportunity to save $${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })} across ${discounts.length} invoices.`,
      type: 'discount_review',
      completed: false
    });
  }

  steps.push({
    id: 'step-cashflow',
    text: `Confirm overall cash balance maintains minimum $30,000 liquidity buffer after Batch 1 payout.`,
    type: 'cashflow',
    completed: false
  });

  return steps;
}

export function generateSupplierCommunication(
  invoice: InvoiceItem,
  purpose: 'discrepancy_hold_notice' | 'payment_extension_request' | 'payment_remittance_advice' | 'discount_clarification',
  channel: 'email' | 'whatsapp' = 'email'
): SupplierCommunicationDraft {
  const contactName = invoice.supplierContact.contactPerson || 'Accounts Team';
  const supplierName = invoice.supplierName;
  const invNo = invoice.invoiceNumber;
  const poNo = invoice.poNumber;
  const amountStr = `$${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  let subject = '';
  let body = '';

  if (purpose === 'discrepancy_hold_notice') {
    if (channel === 'email') {
      subject = `Payment Advice Update - Invoice ${invNo} / PO ${poNo} (Discrepancy Review) - Boon Huat Hardware`;
      body = `Dear ${contactName},\n\n` +
        `I hope this email finds you well.\n\n` +
        `Regarding Invoice ${invNo} for ${amountStr} (PO ${poNo}), our automated 3-way matching system identified a discrepancy during audit:\n\n` +
        `• Audit Detail: ${invoice.matchNotes}\n\n` +
        `To maintain smooth accounting alignment, this payment has been temporarily placed on administrative hold pending verification. Could you kindly review and issue a revised invoice or Credit Note for the difference at your earliest convenience?\n\n` +
        `Thank you for your understanding and prompt assistance.\n\n` +
        `Warm regards,\n` +
        `Madam Lim\n` +
        `Finance & Accounts\n` +
        `Boon Huat Hardware & Supplies Pte Ltd\n` +
        `Tel: +65 6748 1234 | Email: accounts@boonhuathardware.com.sg`;
    } else {
      subject = `WhatsApp Notice: Invoice ${invNo}`;
      body = `Hi ${contactName} (${supplierName}), Madam Lim here from Boon Huat Hardware.\n\n` +
        `Regarding Invoice ${invNo} (${amountStr}, PO ${poNo}), our 3-way match system noted a slight discrepancy:\n` +
        `"${invoice.matchNotes}"\n\n` +
        `We've put this invoice on hold temporarily. Could you please send us a Credit Note or revised invoice so we can release payment quickly? Thanks!`;
    }
  } else if (purpose === 'payment_extension_request') {
    if (channel === 'email') {
      subject = `Payment Scheduling Request - Invoice ${invNo} - Boon Huat Hardware & Supplies`;
      body = `Dear ${contactName},\n\n` +
        `Thank you for your ongoing partnership with Boon Huat Hardware & Supplies Pte Ltd.\n\n` +
        `We are writing regarding Invoice ${invNo} (${amountStr}), due on ${invoice.dueDate}. Due to scheduled project billing collection cycles this month, we would like to request a brief extension to settle this invoice in two installments or by next week.\n\n` +
        `We value our relationship with ${supplierName} and want to ensure clear communication. Please let us know if this arrangement is acceptable.\n\n` +
        `Thank you for your flexibility.\n\n` +
        `Best regards,\n` +
        `Madam Lim\n` +
        `Boon Huat Hardware & Supplies Pte Ltd`;
    } else {
      subject = `WhatsApp Notice: Payment Extension ${invNo}`;
      body = `Dear ${contactName}, Madam Lim from Boon Huat Hardware. Regarding Invoice ${invNo} (${amountStr}), we are requesting a short extension until next week to align with our client payment collection run. Appreciate your kind understanding!`;
    }
  } else if (purpose === 'payment_remittance_advice') {
    const netAmount = invoice.earlyDiscountAmount ? invoice.amount - invoice.earlyDiscountAmount : invoice.amount;
    const netStr = `$${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (channel === 'email') {
      subject = `Remittance Advice - Payment Processed for Invoice ${invNo} - Boon Huat Hardware`;
      body = `Dear ${contactName},\n\n` +
        `Please be advised that payment for Invoice ${invNo} has been approved and processed by Madam Lim.\n\n` +
        `• Invoice Number: ${invNo}\n` +
        `• PO Ref: ${poNo}\n` +
        `• Original Amount: ${amountStr}\n` +
        `${invoice.earlyDiscountAmount ? `• Early Payment Discount (2%): -$${invoice.earlyDiscountAmount.toFixed(2)}\n` : ''}` +
        `• Net Payment Amount Transferred: ${netStr}\n\n` +
        `Payment has been initiated via FAST / GIRO bank transfer. Please confirm receipt upon crediting.\n\n` +
        `Thank you for your excellent service.\n\n` +
        `Sincerely,\n` +
        `Madam Lim\n` +
        `Boon Huat Hardware & Supplies Pte Ltd`;
    } else {
      subject = `WhatsApp Notice: Remittance ${invNo}`;
      body = `Hi ${contactName}, payment of ${netStr} for Invoice ${invNo} (PO ${poNo}) has been approved and transferred today via FAST transfer! Thanks for your great support to Boon Huat Hardware.`;
    }
  } else {
    subject = `Discount Verification - Invoice ${invNo} - Boon Huat Hardware`;
    body = `Dear ${contactName},\n\n` +
      `Regarding Invoice ${invNo} (${amountStr}), we are preparing to execute early payment under terms ${invoice.paymentTerms}.\n\n` +
      `Kindly confirm the net remittance figure of $${(invoice.amount - (invoice.earlyDiscountAmount || 0)).toFixed(2)} before we release the funds today.\n\n` +
      `Best regards,\n` +
      `Madam Lim, Boon Huat Hardware`;
  }

  const contactDetail = channel === 'email' 
    ? (invoice.supplierContact.email || 'accounts@supplier.sg')
    : (invoice.supplierContact.whatsapp || '+65 9123 4567');

  return {
    id: `draft-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    invoiceId: invoice.id,
    supplierName,
    channel,
    purpose,
    subject,
    body,
    contactDetail
  };
}
