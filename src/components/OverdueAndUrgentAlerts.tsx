import React from 'react';
import { InvoiceItem } from '../types';
import { calculateInvoiceDatesAndUrgency } from '../utils/excelParser';
import { CURRENT_DATE } from '../data/initialInvoices';
import { 
  AlertTriangle, ShieldAlert, Clock, ArrowRight, CheckCircle2, 
  Building2, DollarSign, MessageSquare, AlertCircle, FileText
} from 'lucide-react';

interface OverdueAndUrgentAlertsProps {
  invoices: InvoiceItem[];
  onSelectInvoiceDetail: (invoice: InvoiceItem) => void;
  onOpenDraftCommunication: (invoice: InvoiceItem, purpose: any) => void;
  onApproveBatch1?: () => void;
}

export const OverdueAndUrgentAlerts: React.FC<OverdueAndUrgentAlertsProps> = ({
  invoices,
  onSelectInvoiceDetail,
  onOpenDraftCommunication,
  onApproveBatch1,
}) => {
  // Analyze all active invoices
  const urgentInvoices = invoices.map((inv) => {
    const meta = calculateInvoiceDatesAndUrgency(inv.invoiceDate, inv.paymentTerms, inv.amount, CURRENT_DATE);
    return {
      ...inv,
      calculatedMeta: meta,
    };
  }).filter(inv => 
    inv.calculatedMeta.urgencyStatus === 'OVERDUE' || 
    inv.calculatedMeta.urgencyStatus === 'DUE SOON' ||
    inv.supplierName.toLowerCase().includes('tan brothers') ||
    inv.creditRiskStatus === 'Credit Suspension Risk'
  );

  const overdueInvoices = urgentInvoices.filter(i => i.calculatedMeta.urgencyStatus === 'OVERDUE');
  const dueSoonInvoices = urgentInvoices.filter(i => i.calculatedMeta.urgencyStatus === 'DUE SOON');
  const tanBrothersInvoices = urgentInvoices.filter(i => i.supplierName.toLowerCase().includes('tan brothers'));

  const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalDueSoonAmount = dueSoonInvoices.reduce((sum, i) => sum + i.amount, 0);

  if (urgentInvoices.length === 0) {
    return (
      <section className="mb-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-950 block">Step 2: No Overdue or Urgent Payment Alerts</span>
            <span className="text-emerald-800">All parsed invoices are on schedule with comfortable payment buffers.</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 rounded-xl border border-rose-200 p-5 shadow-xs mb-8" id="step-2-urgent-alerts">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/80 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-600 text-white shadow-2xs">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-rose-700 text-white">
                Step 2: Urgent Alerts
              </span>
              <span className="text-xs font-bold text-rose-900">
                {urgentInvoices.length} High-Risk &amp; Time-Sensitive Items
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
              Overdue &amp; Urgent Payment Alerts Box
            </h2>
          </div>
        </div>

        {/* Quick Batch 1 Action */}
        {onApproveBatch1 && (
          <button
            onClick={onApproveBatch1}
            className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <span>Approve Batch 1 Payout (${(totalOverdueAmount + totalDueSoonAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        )}
      </div>

      {/* Critical Credit Risk Highlight Notice (Tan Brothers) */}
      {tanBrothersInvoices.length > 0 && (
        <div className="mt-3.5 p-3.5 bg-rose-900 text-white rounded-lg border border-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <div className="font-extrabold text-amber-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
                CRITICAL SUPPLIER CREDIT RISK ALERT: Tan Brothers Metal Works Pte Ltd
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-mono font-bold">
                  Credit Hold Danger
                </span>
              </div>
              <p className="text-slate-100 leading-snug">
                Tan Brothers Metal Works is our primary raw steel hardware supplier. Outstanding balance of{' '}
                <strong className="text-amber-200 font-mono">
                  ${tanBrothersInvoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>{' '}
                is overdue. Failure to settle today risks immediate credit line suspension and job-site delivery freezes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenDraftCommunication(tanBrothersInvoices[0], 'urgent_payment_promise')}
            className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shrink-0 self-start md:self-auto flex items-center font-mono"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-950" />
            Send Priority Notice to Tan Brothers
          </button>
        </div>
      )}

      {/* Urgent Invoice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {urgentInvoices.map((inv) => {
          const isOverdue = inv.calculatedMeta.urgencyStatus === 'OVERDUE';
          const isDueSoon = inv.calculatedMeta.urgencyStatus === 'DUE SOON';

          return (
            <div
              key={inv.id}
              className={`p-3.5 rounded-lg border bg-white shadow-2xs flex flex-col justify-between space-y-2 transition hover:shadow-xs ${
                isOverdue
                  ? 'border-rose-300 ring-1 ring-rose-300/50'
                  : 'border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-900 truncate" title={inv.supplierName}>
                    {inv.supplierName}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm shrink-0">
                    ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="mt-2 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Inv #: <strong className="font-mono">{inv.invoiceNumber}</strong></span>
                    <span>Term: <strong>{inv.paymentTerms}</strong></span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Due Date: <strong className="font-mono text-slate-800">{inv.calculatedMeta.calculatedDueDate}</strong></span>
                    <span className="text-[10px] text-slate-500">({inv.invoiceDate})</span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {isOverdue ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                    🚨 OVERDUE ({Math.abs(inv.calculatedMeta.daysFromToday)}d)
                  </span>
                ) : isDueSoon ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ⚠️ DUE SOON ({inv.calculatedMeta.daysFromToday}d)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                    🚨 CREDIT RISK
                  </span>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onSelectInvoiceDetail(inv)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onOpenDraftCommunication(inv, isOverdue ? 'urgent_payment_promise' : 'payment_remittance_advice')}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition flex items-center"
                  >
                    <MessageSquare className="w-3 h-3 mr-0.5 text-blue-600" />
                    Draft
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
