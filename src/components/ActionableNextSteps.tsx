import React from 'react';
import { ActionStep, InvoiceItem } from '../types';
import { CheckSquare, Square, ArrowRight, Check } from 'lucide-react';

interface ActionableNextStepsProps {
  actionSteps: ActionStep[];
  onToggleActionStep: (id: string) => void;
  onApproveBatch1: () => void;
  onOpenDraftCommunication: (invoice: InvoiceItem, purpose: any) => void;
  invoices: InvoiceItem[];
}

export const ActionableNextSteps: React.FC<ActionableNextStepsProps> = ({
  actionSteps,
  onToggleActionStep,
  onApproveBatch1,
  onOpenDraftCommunication,
  invoices,
}) => {
  const completedCount = actionSteps.filter(s => s.completed).length;
  const totalCount = actionSteps.length;

  return (
    <section className="bg-slate-800 text-white rounded p-4 shadow-md mb-6" id="actionable-next-steps-section">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-amber-900/80 text-amber-300 border border-amber-700 inline-block mb-1">
            Step 4 Checklist
          </span>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Actionable Next Steps for Madam Lim
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {completedCount}/{totalCount} Completed
        </span>
      </div>

      {/* Action Steps Checklist Items */}
      <div className="space-y-2.5">
        {actionSteps.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">
            No pending action steps. All payment workflows complete.
          </p>
        ) : (
          actionSteps.map((step) => {
            const relatedInvoice = step.relatedInvoiceId
              ? invoices.find((i) => i.id === step.relatedInvoiceId)
              : null;

            return (
              <div
                key={step.id}
                className="flex items-start justify-between gap-2.5 group cursor-pointer"
                onClick={() => onToggleActionStep(step.id)}
              >
                <div className="flex items-start space-x-2.5 min-w-0">
                  <div className="w-4 h-4 rounded border border-slate-500 mt-0.5 shrink-0 flex items-center justify-center bg-slate-900 group-hover:border-slate-300 transition">
                    {step.completed && (
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-2xs" />
                    )}
                  </div>
                  <div className="text-xs min-w-0">
                    <p className={`font-medium leading-tight ${step.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {step.text}
                    </p>
                  </div>
                </div>

                {/* Contextual Action Button */}
                {!step.completed && (
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {step.type === 'approval' && (
                      <button
                        onClick={onApproveBatch1}
                        className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition flex items-center shadow-2xs"
                      >
                        Approve <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}

                    {step.type === 'discrepancy_contact' && relatedInvoice && (
                      <button
                        onClick={() =>
                          onOpenDraftCommunication(
                            relatedInvoice,
                            relatedInvoice.matchStatus === 'DISCREPANCY DETECTED'
                              ? 'discrepancy_hold_notice'
                              : 'payment_extension_request'
                          )
                        }
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition flex items-center shadow-2xs"
                      >
                        Notice <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </section>
  );
};
