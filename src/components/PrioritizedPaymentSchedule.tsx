import React, { useState } from 'react';
import { InvoiceItem, PaymentPriority, MatchStatus } from '../types';
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, FileText, Search, 
  Filter, MessageSquare, ChevronRight, CheckSquare, Square, Check, Trash2
} from 'lucide-react';

interface PrioritizedPaymentScheduleProps {
  invoices: InvoiceItem[];
  selectedInvoiceIds: string[];
  onToggleSelectInvoice: (id: string) => void;
  onSelectAllInvoices: (ids: string[]) => void;
  onApproveSelectedInvoices: () => void;
  onMarkSelectedPaid: () => void;
  onRequestDeleteInvoice: (invoice: InvoiceItem) => void;
  onRequestDeleteBatch: (invoices: InvoiceItem[]) => void;
  onSelectInvoiceDetail: (invoice: InvoiceItem) => void;
  onOpenDraftCommunication: (invoice: InvoiceItem, purpose: any) => void;
}

export const PrioritizedPaymentSchedule: React.FC<PrioritizedPaymentScheduleProps> = ({
  invoices,
  selectedInvoiceIds,
  onToggleSelectInvoice,
  onSelectAllInvoices,
  onApproveSelectedInvoices,
  onMarkSelectedPaid,
  onRequestDeleteInvoice,
  onRequestDeleteBatch,
  onSelectInvoiceDetail,
  onOpenDraftCommunication,
}) => {
  const [activeBatchFilter, setActiveBatchFilter] = useState<'all' | 'batch1' | 'batch2' | 'batch3'>('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Priority sorting: High > Medium > Low
  const priorityWeight: Record<PaymentPriority, number> = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const filteredInvoices = invoices
    .filter(inv => {
      if (activeBatchFilter === 'batch1' && inv.batchNumber !== 1) return false;
      if (activeBatchFilter === 'batch2' && inv.batchNumber !== 2) return false;
      if (activeBatchFilter === 'batch3' && inv.batchNumber !== 3) return false;

      if (activePriorityFilter !== 'all' && inv.priority !== activePriorityFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          inv.supplierName.toLowerCase().includes(q) ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.poNumber.toLowerCase().includes(q) ||
          inv.category.toLowerCase().includes(q)
        );
      }

      return true;
    })
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  const allFilteredSelected = filteredInvoices.length > 0 && filteredInvoices.every(i => selectedInvoiceIds.includes(i.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      onSelectAllInvoices([]);
    } else {
      onSelectAllInvoices(filteredInvoices.map(i => i.id));
    }
  };

  const selectedTotal = invoices
    .filter(i => selectedInvoiceIds.includes(i.id))
    .reduce((sum, curr) => sum + curr.amount, 0);

  const getPriorityBadge = (priority: PaymentPriority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 mr-1" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Low
          </span>
        );
    }
  };

  const getMatchStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            MATCHED
          </span>
        );
      case 'DISCREPANCY DETECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            DISCREPANCY
          </span>
        );
      case 'DUPLICATE SUSPECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            DUPLICATE
          </span>
        );
    }
  };

  return (
    <section className="mb-6" id="prioritized-payment-schedule-section">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-t border border-slate-200 p-4 border-b-0 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-900 border border-purple-300">
                Step 3: Prioritized Payment Schedule
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Batch Recommendation: Priority 1 (Immediate Payout) &amp; Multi-Batch Schedule
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prioritized by credit suspension risk (e.g. Tan Brothers Metal Works), early discount deadlines, and overdue dates
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier, invoice #, PO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder-slate-400 bg-slate-50"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveBatchFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] transition font-bold ${
                activeBatchFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveBatchFilter('batch1')}
              className={`px-2.5 py-1 rounded text-[11px] transition font-bold ${
                activeBatchFilter === 'batch1'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Batch 1: High Priority
            </button>
            <button
              onClick={() => setActiveBatchFilter('batch2')}
              className={`px-2.5 py-1 rounded text-[11px] transition font-bold ${
                activeBatchFilter === 'batch2'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Batch 2: Normal Due
            </button>
            <button
              onClick={() => setActiveBatchFilter('batch3')}
              className={`px-2.5 py-1 rounded text-[11px] transition font-bold ${
                activeBatchFilter === 'batch3'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Batch 3: On Hold
            </button>
          </div>

          {/* Priority dropdown filter */}
          <div className="flex items-center space-x-2 text-[11px]">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={activePriorityFilter}
              onChange={(e) => setActivePriorityFilter(e.target.value)}
              className="text-[11px] bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-slate-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar for Madam Lim */}
      {selectedInvoiceIds.length > 0 && (
        <div className="bg-slate-800 text-white px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-x border-slate-800">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold bg-slate-700 px-2 py-0.5 rounded text-[11px]">
              {selectedInvoiceIds.length} Selected
            </span>
            <span>Total: <strong>${selectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="approve-selected-btn"
              onClick={onApproveSelectedInvoices}
              className="px-3 py-1 rounded text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center shadow-2xs"
            >
              <Check className="w-3.5 h-3.5 mr-1 stroke-[3]" />
              Madam Lim Approve Batch
            </button>
            <button
              id="mark-paid-selected-btn"
              onClick={onMarkSelectedPaid}
              className="px-3 py-1 rounded text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition"
            >
              Mark as Paid
            </button>
            <button
              id="delete-selected-btn"
              onClick={() => {
                const selectedObjs = invoices.filter((inv) => selectedInvoiceIds.includes(inv.id));
                onRequestDeleteBatch(selectedObjs);
              }}
              className="px-3 py-1 rounded text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white transition flex items-center shadow-2xs"
              title="Remove or cancel selected invoices"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Remove Selected ({selectedInvoiceIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Payment Schedule Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-b shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-8 text-center">
                <button
                  onClick={handleToggleSelectAll}
                  className="text-slate-500 hover:text-slate-700"
                  title="Select All Filtered"
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Supplier Name</th>
              <th className="px-4 py-2">Invoice #</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2 text-right">Amount ($)</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2 text-center">Audit</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                  No invoices matched the selected filters.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoiceIds.includes(inv.id);

                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-slate-50/80 transition ${
                      inv.priority === 'High' ? 'bg-rose-50/30' : ''
                    } ${
                      inv.matchStatus === 'DISCREPANCY DETECTED' ? 'bg-amber-50/50' : ''
                    } ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => onToggleSelectInvoice(inv.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-slate-800" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-2.5 font-bold text-xs uppercase whitespace-nowrap">
                      {inv.priority === 'High' && <span className="text-rose-600">HIGH</span>}
                      {inv.priority === 'Medium' && <span className="text-amber-600">MED</span>}
                      {inv.priority === 'Low' && <span className="text-slate-400">LOW</span>}
                    </td>

                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {inv.supplierName}
                      <div className="text-[10px] text-slate-400 font-normal">
                        PO: {inv.poNumber} &bull; {inv.category}
                      </div>
                    </td>

                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>

                    <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                      <span className={inv.priority === 'High' ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
                        {inv.dueDate}
                      </span>
                      {inv.earlyDiscountDeadline && (
                        <div className="text-[10px] text-emerald-700 font-medium">
                          Disc till {inv.earlyDiscountDeadline}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                      ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {inv.earlyDiscountAmount ? (
                        <div className="text-[10px] text-emerald-700 font-medium font-sans">
                          Save ${inv.earlyDiscountAmount.toFixed(2)}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-2.5 text-xs font-semibold whitespace-nowrap">
                      {inv.matchStatus === 'MATCHED' && <span className="text-emerald-600">MATCHED</span>}
                      {inv.matchStatus === 'DISCREPANCY DETECTED' && <span className="text-amber-600">DISCREPANCY</span>}
                      {inv.matchStatus === 'DUPLICATE SUSPECTED' && <span className="text-rose-600">DUPLICATE</span>}
                      {inv.paymentStatus === 'Approved' && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                          APPROVED
                        </span>
                      )}
                      {inv.paymentStatus === 'Paid' && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">
                          PAID
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {inv.priority === 'High' && inv.matchStatus === 'MATCHED' && inv.paymentStatus !== 'Approved' && inv.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => onApproveSelectedInvoices()}
                          className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase hover:bg-rose-500 transition"
                        >
                          PAY NOW
                        </button>
                      )}
                      {inv.priority === 'Medium' && inv.matchStatus === 'MATCHED' && inv.paymentStatus !== 'Approved' && inv.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => onApproveSelectedInvoices()}
                          className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase hover:bg-slate-700 transition"
                        >
                          APPROVE
                        </button>
                      )}
                      {inv.matchStatus === 'DISCREPANCY DETECTED' && (
                        <button
                          onClick={() => onOpenDraftCommunication(inv, 'discrepancy_hold_notice')}
                          className="border border-amber-400 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase hover:bg-amber-100 transition"
                        >
                          HOLD
                        </button>
                      )}
                      {inv.priority === 'Low' && inv.matchStatus === 'MATCHED' && (
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                          QUEUE
                        </span>
                      )}
                      {(inv.paymentStatus === 'Approved' || inv.paymentStatus === 'Paid') && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {inv.paymentStatus}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onSelectInvoiceDetail(inv)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center"
                          title="View 3-Way Audit Details"
                        >
                          <FileText className="w-3 h-3 mr-1 text-slate-500" />
                          Details
                        </button>
                        <button
                          onClick={() =>
                            onOpenDraftCommunication(
                              inv,
                              inv.matchStatus === 'DISCREPANCY DETECTED'
                                ? 'discrepancy_hold_notice'
                                : 'payment_remittance_advice'
                            )
                          }
                          className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center"
                          title="Draft Supplier Message"
                        >
                          <MessageSquare className="w-3 h-3 mr-1 text-blue-600" />
                          Draft
                        </button>
                        <button
                          onClick={() => onRequestDeleteInvoice(inv)}
                          className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center border border-rose-200"
                          title="Remove or Cancel Invoice"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table Footer Note */}
        <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 italic text-center">
          Final payment execution is subject to Madam Lim's physical verification and approval.
        </div>
      </div>
    </section>
  );
};
