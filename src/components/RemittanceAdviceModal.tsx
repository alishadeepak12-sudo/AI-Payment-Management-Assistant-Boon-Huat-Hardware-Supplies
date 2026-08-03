import React from 'react';
import { InvoiceItem } from '../types';
import { X, Printer, Building2, CheckCircle2, FileCheck } from 'lucide-react';

interface RemittanceAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvedInvoices: InvoiceItem[];
}

export const RemittanceAdviceModal: React.FC<RemittanceAdviceModalProps> = ({
  isOpen,
  onClose,
  approvedInvoices,
}) => {
  if (!isOpen) return null;

  const totalPayout = approvedInvoices.reduce((sum, curr) => {
    const net = curr.earlyDiscountAmount ? curr.amount - curr.earlyDiscountAmount : curr.amount;
    return sum + net;
  }, 0);

  const totalDiscountSaved = approvedInvoices.reduce((sum, curr) => sum + (curr.earlyDiscountAmount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 print:m-0 print:border-none print:shadow-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Madam Lim Payment Voucher &amp; Remittance Summary
              </h3>
              <p className="text-xs text-slate-400">
                Approved Batch Execution Voucher &bull; Boon Huat Hardware &amp; Supplies
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print Voucher
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="p-8 space-y-6 text-xs text-slate-800 bg-white" id="printable-voucher">
          
          {/* Company Branding Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-blue-900" />
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  BOON HUAT HARDWARE &amp; SUPPLIES PTE LTD
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                UEN: 198801234K &bull; 12 Kranji Loop, Singapore 739500
              </p>
              <p className="text-xs text-slate-600">
                Tel: +65 6748 1234 &bull; Email: accounts@boonhuathardware.com.sg
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-widest">
                PAYMENT VOUCHER
              </span>
              <div className="text-xs text-slate-500 mt-2 font-mono">
                Voucher Ref: <strong>PV-2026-0731</strong>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Execution Date: <strong>31 July 2026</strong>
              </div>
            </div>
          </div>

          {/* Approved Items Table */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
              Approved Batch Disbursement Items ({approvedInvoices.length} Invoices)
            </h3>

            {approvedInvoices.length === 0 ? (
              <p className="text-slate-400 italic py-4 text-center border border-dashed rounded-lg">
                No invoices currently marked as approved for this batch voucher.
              </p>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300">Supplier Name</th>
                    <th className="p-2.5 border-r border-slate-300">Invoice #</th>
                    <th className="p-2.5 border-r border-slate-300">PO Ref</th>
                    <th className="p-2.5 border-r border-slate-300 text-right">Inv Amount</th>
                    <th className="p-2.5 border-r border-slate-300 text-right">Discount</th>
                    <th className="p-2.5 text-right font-black">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-mono text-slate-800">
                  {approvedInvoices.map((inv) => {
                    const discount = inv.earlyDiscountAmount || 0;
                    const net = inv.amount - discount;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-300 font-sans font-semibold text-slate-900">
                          {inv.supplierName}
                        </td>
                        <td className="p-2.5 border-r border-slate-300">{inv.invoiceNumber}</td>
                        <td className="p-2.5 border-r border-slate-300">{inv.poNumber}</td>
                        <td className="p-2.5 border-r border-slate-300 text-right">
                          ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 text-right text-emerald-700 font-semibold">
                          {discount > 0 ? `-$${discount.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-slate-900">
                          ${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                    <td colSpan={3} className="p-2.5 text-right font-sans uppercase">
                      Total Disbursement:
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      ${approvedInvoices.reduce((s, c) => s + c.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-700">
                      -${totalDiscountSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono text-sm font-black text-slate-900">
                      ${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Signatures & Approvals */}
          <div className="pt-10 grid grid-cols-2 gap-8 border-t border-slate-200 text-xs">
            <div>
              <div className="border-b border-slate-400 h-12"></div>
              <p className="mt-2 font-bold text-slate-900">Prepared &amp; Verified By:</p>
              <p className="text-slate-600">AI Payment Management Assistant (App 3)</p>
            </div>

            <div>
              <div className="border-b border-slate-400 h-12 flex items-end pb-1 font-bold text-blue-900 font-serif italic text-base">
                Lim Bee Huat (Madam Lim)
              </div>
              <p className="mt-2 font-bold text-slate-900">Approved &amp; Executed By:</p>
              <p className="text-slate-600">Madam Lim &bull; Director &amp; Head of Finance</p>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100">
            Boon Huat Hardware &amp; Supplies Pte Ltd Internal Accounting Audit Copy &bull; Human-in-the-Loop Verified
          </div>

        </div>

      </div>
    </div>
  );
};
