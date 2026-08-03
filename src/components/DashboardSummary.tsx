import React from 'react';
import { PaymentSummary, InvoiceItem } from '../types';
import { calculateInvoiceDatesAndUrgency } from '../utils/excelParser';
import { CURRENT_DATE } from '../data/initialInvoices';
import { LayoutDashboard, AlertCircle, Clock, CheckCircle2, DollarSign, Tag } from 'lucide-react';

interface DashboardSummaryProps {
  summary: PaymentSummary;
  invoices?: InvoiceItem[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ summary, invoices = [] }) => {
  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate Overdue, Due Soon, and Upcoming totals directly from active invoices
  let overdueTotal = 0;
  let overdueCount = 0;
  let dueSoonTotal = 0;
  let dueSoonCount = 0;
  let upcomingTotal = 0;
  let upcomingCount = 0;

  invoices.forEach(inv => {
    if (inv.paymentStatus !== 'Paid') {
      const meta = calculateInvoiceDatesAndUrgency(inv.invoiceDate, inv.paymentTerms, inv.amount, CURRENT_DATE);
      if (meta.urgencyStatus === 'OVERDUE') {
        overdueTotal += inv.amount;
        overdueCount++;
      } else if (meta.urgencyStatus === 'DUE SOON') {
        dueSoonTotal += inv.amount;
        dueSoonCount++;
      } else {
        upcomingTotal += inv.amount;
        upcomingCount++;
      }
    }
  });

  return (
    <section className="mb-8" id="dashboard-summary-section">
      
      {/* Step Header Title */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-100 text-blue-900 border border-blue-300">
          Step 2: Executive Dashboard
        </span>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Payment Dashboard &amp; Summary Breakdown
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Outstanding */}
        <div id="summary-total-card" className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs border-l-4 border-l-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{formatCurrency(summary.totalOutstanding)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{invoices.length} Active Records</p>
        </div>

        {/* 🚨 Overdue Breakdown */}
        <div id="summary-overdue-card" className="bg-white border border-rose-200 p-3.5 rounded-xl shadow-2xs border-l-4 border-l-rose-600 bg-rose-50/20">
          <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>🚨 Overdue Total</span>
          </p>
          <p className="text-lg font-bold text-rose-700 mt-1 font-mono">{formatCurrency(overdueTotal)}</p>
          <p className="text-[10px] text-rose-800 font-semibold mt-0.5">{overdueCount} Critical Item{overdueCount !== 1 ? 's' : ''}</p>
        </div>

        {/* ⚠️ Due Soon Breakdown */}
        <div id="summary-duesoon-card" className="bg-white border border-amber-200 p-3.5 rounded-xl shadow-2xs border-l-4 border-l-amber-500 bg-amber-50/20">
          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">⚠️ Due Soon (7 Days)</p>
          <p className="text-lg font-bold text-amber-700 mt-1 font-mono">{formatCurrency(dueSoonTotal)}</p>
          <p className="text-[10px] text-amber-900 font-semibold mt-0.5">{dueSoonCount} Invoice{dueSoonCount !== 1 ? 's' : ''}</p>
        </div>

        {/* 🟢 Upcoming Breakdown */}
        <div id="summary-upcoming-card" className="bg-white border border-emerald-200 p-3.5 rounded-xl shadow-2xs border-l-4 border-l-emerald-600 bg-emerald-50/20">
          <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">🟢 Upcoming Total</p>
          <p className="text-lg font-bold text-emerald-700 mt-1 font-mono">{formatCurrency(upcomingTotal)}</p>
          <p className="text-[10px] text-emerald-900 font-semibold mt-0.5">{upcomingCount} Standard Term{upcomingCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Ready for Payout */}
        <div id="summary-ready-card" className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs border-l-4 border-l-blue-600">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched &amp; Ready</p>
          <p className="text-lg font-bold text-blue-700 mt-1 font-mono">{formatCurrency(summary.totalReadyForPayment)}</p>
          <p className="text-[10px] text-blue-800 font-semibold mt-0.5">{summary.countReady} Ready for Batch 1/2</p>
        </div>

        {/* Early Discount Savings */}
        <div id="summary-discount-card" className="bg-white border border-indigo-200 p-3.5 rounded-xl shadow-2xs border-l-4 border-l-indigo-600 bg-indigo-50/20">
          <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Discount Savings</p>
          <p className="text-lg font-bold text-indigo-700 mt-1 font-mono">{formatCurrency(summary.potentialEarlyDiscountSavings)}</p>
          <p className="text-[10px] text-indigo-800 font-semibold mt-0.5">Early payout benefit</p>
        </div>

      </div>
    </section>
  );
};
