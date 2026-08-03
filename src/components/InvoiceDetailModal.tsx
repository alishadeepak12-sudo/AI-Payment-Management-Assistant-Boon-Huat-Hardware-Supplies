import React from 'react';
import { InvoiceItem } from '../types';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, FileText, Calendar, DollarSign, Building2, Tag, Trash2 } from 'lucide-react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItem | null;
  onUpdateStatus: (id: string, status: 'Pending Approval' | 'Approved' | 'On Hold' | 'Paid') => void;
  onOpenCommunication: (invoice: InvoiceItem, purpose: any) => void;
  onRequestDelete?: (invoice: InvoiceItem) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onUpdateStatus,
  onOpenCommunication,
  onRequestDelete,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                3-Way Match Audit Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Invoice {invoice.invoiceNumber} &bull; {invoice.supplierName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Top Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Invoice Amount</span>
              <div className="text-base font-extrabold text-slate-900 font-mono">
                ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Due Date</span>
              <div className="text-sm font-bold text-slate-900">
                {invoice.dueDate}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">PO Number</span>
              <div className="text-sm font-semibold text-slate-800 font-mono">
                {invoice.poNumber}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">GRN Number</span>
              <div className="text-sm font-semibold text-slate-800 font-mono">
                {invoice.grnNumber}
              </div>
            </div>
          </div>

          {/* 3-Way Matching Findings Box */}
          <div className={`p-4 rounded-xl border ${
            invoice.matchStatus === 'MATCHED'
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/60 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center space-x-2 font-bold mb-1 text-sm">
              {invoice.matchStatus === 'MATCHED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>App 2 Report: 3-Way Match {invoice.matchStatus}</span>
            </div>
            <p className="text-xs leading-relaxed mt-1">
              {invoice.matchNotes}
            </p>
          </div>

          {/* Credit Terms & Discount Info */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Supplier Payment Terms &amp; Credit Risk
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Agreed Terms:</span>
                <span className="font-semibold text-slate-900">{invoice.paymentTerms}</span>
              </div>
              {invoice.earlyDiscountAmount ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Early Payment Discount:</span>
                  <span>Save ${invoice.earlyDiscountAmount.toFixed(2)} (if paid by {invoice.earlyDiscountDeadline})</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Credit Account Status:</span>
                <span className={`font-semibold ${
                  invoice.creditRiskStatus === 'Credit Suspension Risk'
                    ? 'text-rose-700 font-bold'
                    : 'text-slate-800'
                }`}>
                  {invoice.creditRiskStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 italic border-t border-slate-200 pt-1.5 mt-1.5">
                {invoice.creditRiskDetails}
              </p>
            </div>
          </div>

          {/* Plain Language Recommendation */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Recommended Action &amp; Explanation
            </h4>
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200">
              <p className="font-semibold text-blue-950">{invoice.recommendedAction}</p>
              <p className="text-slate-600 mt-1 leading-relaxed">{invoice.explanation}</p>
            </div>
          </div>

          {/* Status Override Controls */}
          <div>
            <label className="block font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Madam Lim Decision Override
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onUpdateStatus(invoice.id, 'Approved')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  invoice.paymentStatus === 'Approved'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                Approve Payment
              </button>
              <button
                onClick={() => onUpdateStatus(invoice.id, 'On Hold')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  invoice.paymentStatus === 'On Hold'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                }`}
              >
                Place On Hold
              </button>
              <button
                onClick={() => onUpdateStatus(invoice.id, 'Pending Approval')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  invoice.paymentStatus === 'Pending Approval'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => onUpdateStatus(invoice.id, 'Paid')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  invoice.paymentStatus === 'Paid'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-50'
                }`}
              >
                Mark as Paid
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenCommunication(invoice, invoice.matchStatus === 'DISCREPANCY DETECTED' ? 'discrepancy_hold_notice' : 'payment_remittance_advice')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center shadow-2xs"
            >
              Draft Supplier Communication &rarr;
            </button>
            {onRequestDelete && (
              <button
                onClick={() => {
                  onClose();
                  onRequestDelete(invoice);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition flex items-center"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
                Remove / Delete
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
