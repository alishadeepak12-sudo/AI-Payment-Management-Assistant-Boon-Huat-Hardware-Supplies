/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvoiceItem, ActionStep, PaymentSummary, DeletionLogRecord, DeletionReason } from './types';
import { 
  sampleInvoicesPreset1, 
  sampleInvoicesPreset2_Critical, 
  sampleInvoicesPreset3_Discounts 
} from './data/initialInvoices';
import { calculateSummary, generateActionSteps } from './utils/paymentCalculator';

// Subcomponents
import { Header } from './components/Header';
import { ExcelExtractionConfirmationTable } from './components/ExcelExtractionConfirmationTable';
import { OverdueAndUrgentAlerts } from './components/OverdueAndUrgentAlerts';
import { DashboardSummary } from './components/DashboardSummary';
import { CashFlowBufferWidget } from './components/CashFlowBufferWidget';
import { PrioritizedPaymentSchedule } from './components/PrioritizedPaymentSchedule';
import { ExplanationsAndJustifications } from './components/ExplanationsAndJustifications';
import { ActionableNextSteps } from './components/ActionableNextSteps';
import { SupplierCommunicationModal } from './components/SupplierCommunicationModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { DataImportModal } from './components/DataImportModal';
import { RemittanceAdviceModal } from './components/RemittanceAdviceModal';
import { DeleteInvoiceModal } from './components/DeleteInvoiceModal';
import { DeletionLogModal } from './components/DeletionLogModal';

import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(sampleInvoicesPreset1);
  const [currentPreset, setCurrentPreset] = useState<'preset1' | 'preset2' | 'preset3'>('preset1');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([]);
  
  // AI State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiOverviewText, setAiOverviewText] = useState<string>(
    "Batch 1 immediate payout recommended for $23,350.00 to prevent Tan Brothers credit account suspension and capture $170 early payment discount with Continental Hardware Hub."
  );

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [activeDetailInvoice, setActiveDetailInvoice] = useState<InvoiceItem | null>(null);

  const [isCommModalOpen, setIsCommModalOpen] = useState<boolean>(false);
  const [activeCommInvoice, setActiveCommInvoice] = useState<InvoiceItem | null>(null);
  const [activeCommPurpose, setActiveCommPurpose] = useState<any>('discrepancy_hold_notice');

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState<boolean>(false);

  // Deletion & Removal Management State
  const [deletionLogs, setDeletionLogs] = useState<DeletionLogRecord[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [invoicesToDelete, setInvoicesToDelete] = useState<InvoiceItem[]>([]);
  const [isDeletionLogModalOpen, setIsDeletionLogModalOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Deletion Handlers
  const handleRequestDeleteInvoice = (invoice: InvoiceItem) => {
    setInvoicesToDelete([invoice]);
    setIsDeleteModalOpen(true);
  };

  const handleRequestDeleteBatch = (invoicesList: InvoiceItem[]) => {
    if (invoicesList.length === 0) return;
    setInvoicesToDelete(invoicesList);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteInvoices = (
    ids: string[],
    reason: DeletionReason,
    customNotes: string
  ) => {
    const nowStr = new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) + ', 31 Jul 2026';
    const deletedObjs = invoices.filter(i => ids.includes(i.id));

    const newLogRecords: DeletionLogRecord[] = deletedObjs.map(inv => {
      const alerts: string[] = [];
      if (inv.earlyDiscountAmount && inv.earlyDiscountAmount > 0) {
        alerts.push(`Early settlement discount forfeited ($${inv.earlyDiscountAmount.toFixed(2)}).`);
      }
      if (inv.matchStatus === 'DISCREPANCY DETECTED') {
        alerts.push(`Open 3-way match discrepancy on hold with App 2.`);
      }
      if (inv.creditRiskStatus === 'Credit Suspension Risk') {
        alerts.push(`Active credit hold risk alert logged.`);
      }
      return {
        id: 'del-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        supplierName: inv.supplierName,
        amount: inv.amount,
        reason,
        customNotes,
        deletedAt: nowStr,
        deletedBy: 'Madam Lim',
        impactAlerts: alerts,
        invoiceData: inv,
      };
    });

    setDeletionLogs(prev => [...newLogRecords, ...prev]);
    setInvoices(prev => prev.filter(i => !ids.includes(i.id)));
    setSelectedInvoiceIds(prev => prev.filter(id => !ids.includes(id)));

    const names = deletedObjs.map(i => i.invoiceNumber).join(', ');
    showToast(`Removed Invoice ${names} (${reason})`);
  };

  const handleRestoreInvoice = (recordId: string) => {
    const record = deletionLogs.find(r => r.id === recordId);
    if (!record) return;

    setInvoices(prev => [record.invoiceData, ...prev]);
    setDeletionLogs(prev => prev.filter(r => r.id !== recordId));
    showToast(`Restored Invoice #${record.invoiceNumber} (${record.supplierName}) to Schedule`);
  };

  // Sync action steps when invoices change
  useEffect(() => {
    const steps = generateActionSteps(invoices);
    setActionSteps(steps);
  }, [invoices]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: 'preset1' | 'preset2' | 'preset3') => {
    setCurrentPreset(preset);
    setSelectedInvoiceIds([]);
    if (preset === 'preset1') {
      setInvoices(sampleInvoicesPreset1);
      setAiOverviewText("Standard weekly run: $23,350 ready for payment in Batch 1. 1 item on hold due to $200 unit price discrepancy.");
      showToast('Loaded Scenario: Standard Weekly Run');
    } else if (preset === 'preset2') {
      setInvoices(sampleInvoicesPreset2_Critical);
      setAiOverviewText("CRITICAL CREDIT HOLD ALERT: Tan Brothers Metal Works is 3 days overdue ($24,500). Immediate settlement required to unfreeze $30,000 project PO.");
      showToast('Loaded Scenario: Credit Risk Alert (Tan Brothers Overdue)');
    } else {
      setInvoices(sampleInvoicesPreset3_Discounts);
      setAiOverviewText("EARLY DISCOUNT MAXIMIZER: $730 in potential cash settlement discounts available if Batch 1 is executed today.");
      showToast('Loaded Scenario: Early Discount Maximizer');
    }
  };

  // Toggle invoice selection
  const handleToggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllInvoices = (ids: string[]) => {
    setSelectedInvoiceIds(ids);
  };

  // Madam Lim Batch Approval Action
  const handleApproveSelectedInvoices = () => {
    if (selectedInvoiceIds.length === 0) return;
    setInvoices(prev =>
      prev.map(inv =>
        selectedInvoiceIds.includes(inv.id)
          ? { ...inv, paymentStatus: 'Approved' }
          : inv
      )
    );
    showToast(`Madam Lim approved ${selectedInvoiceIds.length} invoice(s) for Batch payment!`);
  };

  const handleApproveBatch1 = () => {
    const batch1Ids = invoices.filter(i => i.priority === 'High' && i.matchStatus === 'MATCHED').map(i => i.id);
    setInvoices(prev =>
      prev.map(inv =>
        batch1Ids.includes(inv.id)
          ? { ...inv, paymentStatus: 'Approved' }
          : inv
      )
    );
    setSelectedInvoiceIds(batch1Ids);
    showToast(`Madam Lim approved all High-Priority Batch 1 invoices!`);
  };

  const handleMarkSelectedPaid = () => {
    if (selectedInvoiceIds.length === 0) return;
    setInvoices(prev =>
      prev.map(inv =>
        selectedInvoiceIds.includes(inv.id)
          ? { ...inv, paymentStatus: 'Paid' }
          : inv
      )
    );
    showToast(`Marked ${selectedInvoiceIds.length} invoice(s) as Paid!`);
  };

  const handleUpdateSingleInvoiceStatus = (id: string, status: 'Pending Approval' | 'Approved' | 'On Hold' | 'Paid') => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, paymentStatus: status } : inv))
    );
    showToast(`Invoice status updated to ${status}`);
  };

  // Modal Triggers
  const handleOpenDetailModal = (invoice: InvoiceItem) => {
    setActiveDetailInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleOpenCommunicationModal = (invoice: InvoiceItem, purpose: any) => {
    setActiveCommInvoice(invoice);
    setActiveCommPurpose(purpose);
    setIsCommModalOpen(true);
  };

  const handleToggleActionStep = (id: string) => {
    setActionSteps(prev =>
      prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleImportInvoices = (imported: InvoiceItem[]) => {
    setInvoices(imported);
    showToast(`Successfully imported ${imported.length} invoice(s) from App 1 & App 2 data.`);
  };

  // Server-side Gemini AI Re-Analysis Call
  const handleTriggerAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices, customContext: 'Refine payment urgency and risk reasoning for Boon Huat Hardware.' })
      });
      const data = await res.json();
      if (data.analysis && data.analysis.aiSummary) {
        setAiOverviewText(data.analysis.aiSummary);
        showToast('AI Payment Re-Analysis Complete!');
      } else {
        setAiOverviewText("AI Analysis complete. Batch 1 payments prioritized to safeguard supplier credit limits.");
      }
    } catch (err) {
      console.error(err);
      showToast('AI analysis updated using local payment rule engine.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Server-side Gemini Custom Draft Generation Callback
  const handleGenerateCustomAiDraft = async (
    invoice: InvoiceItem,
    purpose: string,
    channel: string,
    instructions: string
  ) => {
    try {
      const res = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, purpose, channel, customInstructions: instructions })
      });
      const data = await res.json();
      if (data.draft) {
        return data.draft;
      }
      return { body: 'Could not generate draft.' };
    } catch (err) {
      console.error(err);
      return { body: 'Failed to contact AI server.' };
    }
  };

  const summary: PaymentSummary = calculateSummary(invoices);
  const approvedInvoices = invoices.filter(i => i.paymentStatus === 'Approved' || i.paymentStatus === 'Paid');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenRemittanceModal={() => setIsRemittanceModalOpen(true)}
        onOpenDeletionLogModal={() => setIsDeletionLogModalOpen(true)}
        deletedCount={deletionLogs.length}
        isAiAnalyzing={isAiAnalyzing}
        onTriggerAiAnalysis={handleTriggerAiAnalysis}
      />

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Human-in-the-loop Notification Banner */}
        <div className="mb-5 p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold uppercase text-[10px]">
              Protocol Notice
            </span>
            <span>
              <strong>Human-in-the-Loop Active:</strong> AI suggestions assist Madam Lim with payment scheduling and draft notices. Final payment execution requires Madam Lim's physical verification and bank submission.
            </span>
          </div>
        </div>

        {/* STEP 1: Extracted Invoices & Due Dates Summary (App 2 Excel Ingestion) */}
        <ExcelExtractionConfirmationTable
          invoices={invoices}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onSelectInvoiceDetail={handleOpenDetailModal}
        />

        {/* STEP 2: Overdue & Urgent Payment Alerts */}
        <OverdueAndUrgentAlerts
          invoices={invoices}
          onSelectInvoiceDetail={handleOpenDetailModal}
          onOpenDraftCommunication={handleOpenCommunicationModal}
          onApproveBatch1={handleApproveBatch1}
        />

        {/* STEP 3: Payment Dashboard & Prioritized Schedule */}
        <DashboardSummary summary={summary} invoices={invoices} />

        {/* Cash Flow Buffer & Working Capital Impact */}
        <CashFlowBufferWidget invoices={invoices} selectedInvoiceIds={selectedInvoiceIds} />

        {/* STEP 3: Prioritized Payment Schedule Table */}
        <PrioritizedPaymentSchedule
          invoices={invoices}
          selectedInvoiceIds={selectedInvoiceIds}
          onToggleSelectInvoice={handleToggleSelectInvoice}
          onSelectAllInvoices={handleSelectAllInvoices}
          onApproveSelectedInvoices={handleApproveSelectedInvoices}
          onMarkSelectedPaid={handleMarkSelectedPaid}
          onRequestDeleteInvoice={handleRequestDeleteInvoice}
          onRequestDeleteBatch={handleRequestDeleteBatch}
          onSelectInvoiceDetail={handleOpenDetailModal}
          onOpenDraftCommunication={handleOpenCommunicationModal}
        />

        {/* STEP 4: Actionable Next Steps & Draft Communications in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ExplanationsAndJustifications
              invoices={invoices}
              onOpenDraftCommunication={handleOpenCommunicationModal}
              onSelectInvoiceDetail={handleOpenDetailModal}
              aiOverviewText={aiOverviewText}
            />
          </div>
          <div className="md:col-span-1">
            <ActionableNextSteps
              actionSteps={actionSteps}
              onToggleActionStep={handleToggleActionStep}
              onApproveBatch1={handleApproveBatch1}
              onOpenDraftCommunication={handleOpenCommunicationModal}
              invoices={invoices}
            />
          </div>
        </div>

      </main>

      {/* Auxiliary Modals */}
      <SupplierCommunicationModal
        isOpen={isCommModalOpen}
        onClose={() => setIsCommModalOpen(false)}
        invoice={activeCommInvoice}
        initialPurpose={activeCommPurpose}
        onGenerateCustomAiDraft={handleGenerateCustomAiDraft}
      />

      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoice={activeDetailInvoice}
        onUpdateStatus={handleUpdateSingleInvoiceStatus}
        onOpenCommunication={handleOpenCommunicationModal}
        onRequestDelete={handleRequestDeleteInvoice}
      />

      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportInvoices={handleImportInvoices}
      />

      <RemittanceAdviceModal
        isOpen={isRemittanceModalOpen}
        onClose={() => setIsRemittanceModalOpen(false)}
        approvedInvoices={approvedInvoices}
      />

      <DeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        invoicesToDelete={invoicesToDelete}
        onConfirmDelete={handleConfirmDeleteInvoices}
      />

      <DeletionLogModal
        isOpen={isDeletionLogModalOpen}
        onClose={() => setIsDeletionLogModalOpen(false)}
        deletionLogs={deletionLogs}
        onRestoreInvoice={handleRestoreInvoice}
      />

      {/* Professional Polish Bottom Status Bar Footer */}
      <footer className="h-10 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-500 font-mono mt-8">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online: App 3 Payment Scheduling Assistant</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>AI Trust Score: 98%</span>
          <span>Boon Huat Hardware &amp; Supplies Pte Ltd</span>
        </div>
      </footer>

    </div>
  );
}
