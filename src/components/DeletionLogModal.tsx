import React from 'react';
import { DeletionLogRecord } from '../types';
import { FileText, X, RotateCcw, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';

interface DeletionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletionLogs: DeletionLogRecord[];
  onRestoreInvoice: (recordId: string) => void;
}

export const DeletionLogModal: React.FC<DeletionLogModalProps> = ({
  isOpen,
  onClose,
  deletionLogs,
  onRestoreInvoice,
}) => {
  if (!isOpen) return null;

  const totalRemovedAmount = deletionLogs.reduce((sum, log) => sum + log.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Deletion &amp; Cancelation Audit Trail
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-900/60 text-rose-300 border border-rose-700">
                  {deletionLogs.length} Canceled Items
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Log of all invoices removed by Madam Lim with reason tracking &amp; audit records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          {/* Summary Metric Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Removed Volume</span>
              <div className="text-lg font-bold text-slate-900 font-mono">
                ${totalRemovedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Audit Status</span>
              <div className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Logged under Madam Lim Verification Protocol
              </div>
            </div>
          </div>

          {/* Log Table / List */}
          {deletionLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded">
              <p className="text-xs font-medium">No invoices have been deleted or removed.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">All incoming invoice records remain active in the payment schedule.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {deletionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{log.supplierName}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">Inv #{log.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        ${log.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => onRestoreInvoice(log.id)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition flex items-center"
                        title="Restore invoice back to active payment schedule"
                      >
                        <RotateCcw className="w-3 h-3 mr-1 text-slate-600" />
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">Reason for Removal</span>
                      <span className="font-bold text-rose-700 inline-block bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {log.reason}
                      </span>
                      {log.customNotes && (
                        <p className="text-slate-600 italic mt-1">"{log.customNotes}"</p>
                      )}
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">Action Timestamp</span>
                      <span className="text-slate-600 font-medium">
                        {log.deletedBy} &bull; {log.deletedAt}
                      </span>
                    </div>
                  </div>

                  {log.impactAlerts && log.impactAlerts.length > 0 && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-800 space-y-0.5">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Impact Alert Logged:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {log.impactAlerts.map((alert, idx) => (
                          <li key={idx}>{alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Close Audit Trail
          </button>
        </div>

      </div>
    </div>
  );
};
