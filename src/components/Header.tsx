import React from 'react';
import { Building2, ShieldCheck, Calendar, RefreshCw, Sparkles, FileText, Upload, Printer, Trash2 } from 'lucide-react';

interface HeaderProps {
  currentPreset: string;
  onSelectPreset: (preset: 'preset1' | 'preset2' | 'preset3') => void;
  onOpenImportModal: () => void;
  onOpenRemittanceModal: () => void;
  onOpenDeletionLogModal: () => void;
  deletedCount: number;
  isAiAnalyzing: boolean;
  onTriggerAiAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onOpenImportModal,
  onOpenRemittanceModal,
  onOpenDeletionLogModal,
  deletedCount,
  isAiAnalyzing,
  onTriggerAiAnalysis,
}) => {
  return (
    <header className="bg-white border-b border-slate-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-white font-extrabold text-base tracking-wider shrink-0 shadow-xs">
              BH
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Boon Huat Hardware &amp; Supplies Pte Ltd
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mt-0.5">
                AI Payment Management Assistant
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  App 3 Active
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Status & Main Controls */}
          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            <div className="text-left md:text-right">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 md:justify-end">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Friday, 31 July 2026
              </div>
              <div className="text-[11px] text-slate-500 italic">
                Data synchronized with App 1 &amp; App 2
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="import-data-btn"
                onClick={onOpenImportModal}
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
                title="Import App 1 & App 2 3-Way Match Data"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Import JSON
              </button>

              <button
                id="remittance-voucher-btn"
                onClick={onOpenRemittanceModal}
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
                title="View & Print Payment Advice Vouchers"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                Voucher
              </button>

              <button
                id="deletion-log-btn"
                onClick={onOpenDeletionLogModal}
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-bold bg-white text-rose-700 border border-slate-300 hover:bg-rose-50 transition shadow-2xs relative"
                title="View Canceled & Removed Invoices Audit Log"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                Canceled Log
                {deletedCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono font-bold">
                    {deletedCount}
                  </span>
                )}
              </button>

              <button
                id="ai-reanalyze-btn"
                onClick={onTriggerAiAnalysis}
                disabled={isAiAnalyzing}
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition shadow-2xs disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 mr-1.5 text-blue-400 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                {isAiAnalyzing ? 'Analyzing...' : 'Re-Run AI'}
              </button>
            </div>
          </div>

        </div>

        {/* Sub-bar: Protocol Badge & Preset Buttons */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Human-in-the-Loop: Madam Lim Verification &amp; Approval Active
            </span>
          </div>

          {/* Scenario Preset Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">
              Scenarios:
            </span>
            <button
              id="preset-standard-btn"
              onClick={() => onSelectPreset('preset1')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                currentPreset === 'preset1'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Standard Weekly Run
            </button>
            <button
              id="preset-critical-btn"
              onClick={() => onSelectPreset('preset2')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                currentPreset === 'preset2'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Credit Risk Alert
            </button>
            <button
              id="preset-discounts-btn"
              onClick={() => onSelectPreset('preset3')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                currentPreset === 'preset3'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Early Discounts
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
