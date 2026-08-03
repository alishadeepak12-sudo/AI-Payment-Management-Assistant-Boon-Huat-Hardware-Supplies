import React, { useState } from 'react';
import { InvoiceItem } from '../types';
import { calculateInvoiceDatesAndUrgency } from '../utils/excelParser';
import { CURRENT_DATE } from '../data/initialInvoices';
import { 
  FileSpreadsheet, CheckCircle2, AlertTriangle, Clock, 
  Sparkles, ShieldAlert, ArrowUpDown, Filter, Search, DollarSign, Download, Upload
} from 'lucide-react';

interface ExcelExtractionConfirmationTableProps {
  invoices: InvoiceItem[];
  onOpenImportModal: () => void;
  onSelectInvoiceDetail: (invoice: InvoiceItem) => void;
}

export const ExcelExtractionConfirmationTable: React.FC<ExcelExtractionConfirmationTableProps> = ({
  invoices,
  onOpenImportModal,
  onSelectInvoiceDetail,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate metrics across all ingested invoices
  const calculatedRows = invoices.map(inv => {
    const meta = calculateInvoiceDatesAndUrgency(inv.invoiceDate, inv.paymentTerms, inv.amount, CURRENT_DATE);
    return {
      ...inv,
      calculatedMeta: meta
    };
  });

  const filteredRows = calculatedRows.filter(row => {
    const matchesUrgency = filterUrgency === 'ALL' || row.calculatedMeta.urgencyStatus === filterUrgency;
    const matchesSearch = row.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  const totalOverdue = calculatedRows.filter(r => r.calculatedMeta.urgencyStatus === 'OVERDUE').length;
  const totalDueSoon = calculatedRows.filter(r => r.calculatedMeta.urgencyStatus === 'DUE SOON').length;
  const totalUpcoming = calculatedRows.filter(r => r.calculatedMeta.urgencyStatus === 'UPCOMING').length;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden mb-8">
      
      {/* Step Header Banner */}
      <div className="bg-slate-900 text-white p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                Step 1: Excel Data Ingestion
              </span>
              <span className="text-xs text-slate-400 font-mono">
                App 2 Verified Source Data
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Data Extraction &amp; Automated Date Calculation Confirmation
            </h2>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload / Ingest Excel &amp; CSV
          </button>
        </div>
      </div>

      {/* Summary Chips & Filters Bar */}
      <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Urgency Counter Chips */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="text-slate-500 font-bold uppercase text-[10px] mr-1">Urgency Breakdown:</span>
          
          <button
            onClick={() => setFilterUrgency('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center ${
              filterUrgency === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Parsed ({calculatedRows.length})
          </button>

          <button
            onClick={() => setFilterUrgency('OVERDUE')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center ${
              filterUrgency === 'OVERDUE'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            🚨 Overdue ({totalOverdue})
          </button>

          <button
            onClick={() => setFilterUrgency('DUE SOON')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center ${
              filterUrgency === 'DUE SOON'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            ⚠️ Due Soon ({totalDueSoon})
          </button>

          <button
            onClick={() => setFilterUrgency('UPCOMING')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center ${
              filterUrgency === 'UPCOMING'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            🟢 Upcoming ({totalUpcoming})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Supplier, Inv #..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

      </div>

      {/* Extraction Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Supplier Name</th>
              <th className="py-3 px-4">Invoice Date</th>
              <th className="py-3 px-4">Payment Terms</th>
              <th className="py-3 px-4">Calculated Due Date</th>
              <th className="py-3 px-4 text-right">Invoice Amount ($)</th>
              <th className="py-3 px-4 text-center">App 2 Status</th>
              <th className="py-3 px-4 text-center">Urgency Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                  No invoice data extracted matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const meta = row.calculatedMeta;
                const isOverdue = meta.urgencyStatus === 'OVERDUE';
                const isDueSoon = meta.urgencyStatus === 'DUE SOON';

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectInvoiceDetail(row)}
                    className="hover:bg-emerald-50/40 cursor-pointer transition"
                  >
                    {/* Invoice Number */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {row.invoiceNumber}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {row.poNumber}
                      </span>
                    </td>

                    {/* Supplier Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{row.supplierName}</div>
                      {row.creditRiskStatus === 'Credit Suspension Risk' && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-800 rounded border border-rose-300">
                          Credit Risk
                        </span>
                      )}
                    </td>

                    {/* Invoice Date */}
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {row.invoiceDate}
                    </td>

                    {/* Payment Terms */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {row.paymentTerms}
                      </span>
                      {meta.earlyDiscountAmount && (
                        <span className="block text-[10px] text-emerald-700 font-bold mt-1">
                          🎁 Save ${meta.earlyDiscountAmount.toFixed(2)} by {meta.earlyDiscountDeadline}
                        </span>
                      )}
                    </td>

                    {/* Calculated Due Date */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {meta.calculatedDueDate}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        ({meta.termDays} days term calculation)
                      </span>
                    </td>

                    {/* Invoice Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* App 2 Status */}
                    <td className="py-3 px-4 text-center">
                      {row.matchStatus === 'MATCHED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Matched
                        </span>
                      ) : row.matchStatus === 'DISCREPANCY DETECTED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                          Discrepancy
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                          <ShieldAlert className="w-3 h-3 mr-1 text-purple-600" />
                          Duplicate
                        </span>
                      )}
                    </td>

                    {/* Urgency Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isOverdue ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                          🚨 OVERDUE ({Math.abs(meta.daysFromToday)}d)
                        </span>
                      ) : isDueSoon ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ⚠️ DUE SOON ({meta.daysFromToday}d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          🟢 UPCOMING ({meta.daysFromToday}d)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Protocol Note */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          <strong>Automation Logic:</strong> Due Dates automatically calculated as <code>Invoice Date + Term Days</code>. Urgency evaluated dynamically against <code>{CURRENT_DATE}</code> reference.
        </span>
        <span className="font-mono text-slate-400">
          Total Processed Invoices: {invoices.length}
        </span>
      </div>

    </section>
  );
};
