import React, { useState } from 'react';
import { InvoiceItem } from '../types';
import { Wallet, TrendingDown, ShieldCheck, DollarSign, RefreshCw } from 'lucide-react';

interface CashFlowBufferWidgetProps {
  invoices: InvoiceItem[];
  selectedInvoiceIds: string[];
}

export const CashFlowBufferWidget: React.FC<CashFlowBufferWidgetProps> = ({
  invoices,
  selectedInvoiceIds,
}) => {
  const [startingCashBuffer, setStartingCashBuffer] = useState<number>(75000.00);

  // Batch 1 (High priority ready) payout
  const batch1Payout = invoices
    .filter(i => i.priority === 'High' && i.matchStatus === 'MATCHED' && i.paymentStatus !== 'Paid')
    .reduce((sum, curr) => {
      const net = curr.earlyDiscountAmount ? curr.amount - curr.earlyDiscountAmount : curr.amount;
      return sum + net;
    }, 0);

  // Selected invoices payout
  const selectedPayout = invoices
    .filter(i => selectedInvoiceIds.includes(i.id))
    .reduce((sum, curr) => {
      const net = curr.earlyDiscountAmount ? curr.amount - curr.earlyDiscountAmount : curr.amount;
      return sum + net;
    }, 0);

  const activePayout = selectedPayout > 0 ? selectedPayout : batch1Payout;
  const projectedBuffer = startingCashBuffer - activePayout;
  const bufferRatio = Math.max(0, Math.round((projectedBuffer / startingCashBuffer) * 100));

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md mb-8" id="cashflow-buffer-widget">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Boon Huat Working Capital &amp; Cash Buffer Impact
            </h3>
            <p className="text-xs text-slate-400">
              Live liquidity projection following Madam Lim batch disbursement execution
            </p>
          </div>
        </div>

        {/* Input starting buffer */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 pl-1 font-medium">Bank Cash Balance:</span>
          <div className="relative">
            <span className="absolute left-2 top-1 text-slate-500">$</span>
            <input
              type="number"
              value={startingCashBuffer}
              onChange={(e) => setStartingCashBuffer(parseFloat(e.target.value) || 0)}
              className="w-24 pl-5 pr-2 py-1 text-xs font-bold font-mono bg-slate-900 text-white border border-slate-700 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Opening Cash Reserve</span>
          <div className="text-xl font-extrabold font-mono text-white mt-0.5">
            ${startingCashBuffer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <span className="text-slate-400 font-semibold uppercase text-[10px]">
            {selectedPayout > 0 ? 'Selected Batch Outflow' : 'Recommended Batch 1 Outflow'}
          </span>
          <div className="text-xl font-extrabold font-mono text-rose-400 mt-0.5 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1 shrink-0" />
            -${activePayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <span className="text-slate-400 font-semibold uppercase text-[10px]">Projected Liquidity Buffer</span>
          <div className={`text-xl font-extrabold font-mono mt-0.5 ${
            projectedBuffer >= 30000 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            ${projectedBuffer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Progress Bar & Status */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex-1 mr-4">
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                projectedBuffer >= 30000 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${bufferRatio}%` }}
            ></div>
          </div>
        </div>
        <span className="text-xs text-slate-300 font-semibold shrink-0">
          {projectedBuffer >= 30000 ? (
            <span className="text-emerald-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Safe Reserve Level (&gt;$30k)
            </span>
          ) : (
            <span className="text-amber-400 flex items-center">
              Tight Liquidity Alert
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
