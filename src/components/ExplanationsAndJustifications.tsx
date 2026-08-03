import React from 'react';
import { InvoiceItem } from '../types';
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

interface ExplanationsAndJustificationsProps {
  invoices: InvoiceItem[];
  onOpenDraftCommunication: (invoice: InvoiceItem, purpose: any) => void;
  onSelectInvoiceDetail: (invoice: InvoiceItem) => void;
  aiOverviewText?: string;
}

export const ExplanationsAndJustifications: React.FC<ExplanationsAndJustificationsProps> = ({
  invoices,
  onOpenDraftCommunication,
  onSelectInvoiceDetail,
  aiOverviewText,
}) => {
  const urgentItems = invoices.filter(i => i.priority === 'High' && i.paymentStatus !== 'Paid');
  const onHoldItems = invoices.filter(i => (i.matchStatus !== 'MATCHED' || i.paymentStatus === 'On Hold') && i.paymentStatus !== 'Paid');
  const discountItems = invoices.filter(i => i.earlyDiscountAmount && i.earlyDiscountAmount > 0 && i.paymentStatus !== 'Paid');

  return (
    <section className="mb-6 bg-white border border-slate-200 rounded p-4 shadow-xs" id="explanations-justifications-section">
      <div className="flex items-center space-x-2 mb-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-100 text-amber-900 border border-amber-300">
          Step 4: AI Recommendations &amp; Draft Communications
        </span>
      </div>
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Explanations &amp; Decision Rationales for Madam Lim
      </h2>

      {/* Optional AI Executive Summary */}
      {aiOverviewText && (
        <div className="mb-4 p-3 rounded bg-slate-900 text-white border border-slate-800 text-xs">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                AI Executive Insights
              </span>
              <p className="text-slate-200 mt-0.5 leading-relaxed text-xs">
                {aiOverviewText}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 text-xs">
        
        {/* High Priority / Credit Risk Items */}
        {urgentItems.map((inv) => (
          <div key={inv.id} className="border-l-2 border-rose-500 pl-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800">
                {inv.supplierName} ({inv.invoiceNumber})
              </p>
              <button
                onClick={() => onSelectInvoiceDetail(inv)}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Audit Details &rarr;
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight mt-1">
              {inv.explanation} ({inv.creditRiskDetails})
            </p>
          </div>
        ))}

        {/* On Hold / Discrepancy Items */}
        {onHoldItems.map((inv) => (
          <div key={inv.id} className="border-l-2 border-amber-500 pl-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800">
                {inv.supplierName} (On Hold)
              </p>
              <button
                onClick={() => onOpenDraftCommunication(inv, 'discrepancy_hold_notice')}
                className="text-[10px] bg-amber-50 border border-amber-300 text-amber-800 px-1.5 py-0.5 rounded font-bold hover:bg-amber-100"
              >
                Draft Notice
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight mt-1">
              Held due to price discrepancy identified by App 2. {inv.matchNotes}
            </p>
          </div>
        ))}

        {/* Early Settlement Opportunities */}
        {discountItems.map((inv) => (
          <div key={inv.id} className="border-l-2 border-blue-500 pl-3">
            <p className="text-xs font-bold text-slate-800">
              Early Settlement Opportunity: {inv.supplierName}
            </p>
            <p className="text-[11px] text-slate-600 leading-tight mt-1">
              Offers early payment discount (${inv.earlyDiscountAmount?.toFixed(2)}) if paid by {inv.earlyDiscountDeadline}. Recommended for cash flow optimization.
            </p>
          </div>
        ))}

        {urgentItems.length === 0 && onHoldItems.length === 0 && discountItems.length === 0 && (
          <div className="border-l-2 border-emerald-500 pl-3 text-slate-600 text-xs">
            All invoices pass 3-way matching and standard credit guidelines.
          </div>
        )}

      </div>
    </section>
  );
};
