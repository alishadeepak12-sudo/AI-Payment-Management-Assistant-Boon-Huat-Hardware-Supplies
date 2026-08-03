import React, { useState, useEffect } from 'react';
import { InvoiceItem, DeletionReason } from '../types';
import { Trash2, AlertTriangle, ShieldAlert, X, Check, HelpCircle, Info } from 'lucide-react';

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoicesToDelete: InvoiceItem[];
  onConfirmDelete: (invoiceIds: string[], reason: DeletionReason, customNotes: string) => void;
}

export const DeleteInvoiceModal: React.FC<DeleteInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoicesToDelete,
  onConfirmDelete,
}) => {
  const [selectedReason, setSelectedReason] = useState<DeletionReason>('Duplicate Invoice');
  const [customNotes, setCustomNotes] = useState('');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason('Duplicate Invoice');
      setCustomNotes('');
      setConfirmedCheck(false);
    }
  }, [isOpen, invoicesToDelete]);

  if (!isOpen || invoicesToDelete.length === 0) return null;

  const totalAmount = invoicesToDelete.reduce((sum, inv) => sum + inv.amount, 0);
  const isBatch = invoicesToDelete.length > 1;
  const singleInvoice = invoicesToDelete[0];

  // Calculate Impact Alerts
  const impactAlerts: string[] = [];

  invoicesToDelete.forEach((inv) => {
    if (inv.earlyDiscountAmount && inv.earlyDiscountAmount > 0) {
      impactAlerts.push(
        `Forfeits early settlement discount of $${inv.earlyDiscountAmount.toFixed(2)} for Invoice ${inv.invoiceNumber} (${inv.supplierName}).`
      );
    }
    if (inv.matchStatus === 'DISCREPANCY DETECTED') {
      impactAlerts.push(
        `Invoice ${inv.invoiceNumber} currently has an open 3-way match discrepancy flagged with App 2 (${inv.matchNotes}).`
      );
    }
    if (inv.creditRiskStatus === 'Credit Suspension Risk') {
      impactAlerts.push(
        `Caution: ${inv.supplierName} has an active credit hold warning (${inv.creditRiskDetails}). Deleting without payment may trigger credit review.`
      );
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCheck) return;
    const ids = invoicesToDelete.map((i) => i.id);
    onConfirmDelete(ids, selectedReason, customNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-rose-800 text-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isBatch ? `Remove ${invoicesToDelete.length} Invoices` : `Remove Invoice ${singleInvoice.invoiceNumber}`}
              </h3>
              <p className="text-[11px] text-rose-100 font-medium">
                Madam Lim Authorization &amp; Reason Logging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-rose-200 hover:text-white hover:bg-rose-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          
          {/* Target Invoice Summary Card */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>{isBatch ? `${invoicesToDelete.length} Invoices Selected` : singleInvoice.supplierName}</span>
              <span className="font-mono text-slate-900 text-sm">
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {!isBatch ? (
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                <span>Inv #: <strong>{singleInvoice.invoiceNumber}</strong></span>
                <span>PO #: <strong>{singleInvoice.poNumber}</strong></span>
                <span>Due: <strong>{singleInvoice.dueDate}</strong></span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 max-h-20 overflow-y-auto space-y-0.5 mt-1">
                {invoicesToDelete.map((inv) => (
                  <div key={inv.id} className="flex justify-between font-mono text-[10px]">
                    <span>{inv.supplierName} ({inv.invoiceNumber})</span>
                    <span>${inv.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Impact Alert Section */}
          {impactAlerts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Impact Alerts &amp; Workflow Notifications</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-amber-800 pl-1">
                {impactAlerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Reason for Removal / Cancellation <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Duplicate Invoice',
                'Order Canceled',
                'Issued in Error',
                'Returned Goods / Credit Note Issued',
                'Incorrect Supplier Details',
                'Other',
              ].map((reasonOption) => (
                <label
                  key={reasonOption}
                  className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition text-xs ${
                    selectedReason === reasonOption
                      ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deletionReason"
                    value={reasonOption}
                    checked={selectedReason === reasonOption}
                    onChange={() => setSelectedReason(reasonOption as DeletionReason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reasonOption}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Audit Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Audit Trail Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., Verified cancellation with Tan Brothers sales manager via WhatsApp..."
              className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Madam Lim Explicit Safeguard Confirmation Checkbox */}
          <div className="p-3 bg-slate-100 rounded border border-slate-200 flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="madam-lim-confirm"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded border-slate-400 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="madam-lim-confirm" className="text-[11px] text-slate-800 font-semibold cursor-pointer select-none leading-snug">
              I, Madam Lim, explicitly confirm the permanent removal of {isBatch ? `${invoicesToDelete.length} invoices` : `Invoice #${singleInvoice.invoiceNumber}`} totaling ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} from the active payment schedule.
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition text-xs"
            >
              Cancel / Abort
            </button>
            <button
              type="submit"
              disabled={!confirmedCheck}
              className="px-4 py-1.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-bold transition text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs flex items-center"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Confirm Removal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
