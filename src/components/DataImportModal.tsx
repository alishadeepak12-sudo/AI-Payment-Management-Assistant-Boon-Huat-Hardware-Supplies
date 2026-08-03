import React, { useState } from 'react';
import { InvoiceItem } from '../types';
import { parseExcelFileToInvoices, parseTabularTextToInvoices } from '../utils/excelParser';
import { sampleInvoicesPreset1, sampleInvoicesPreset2_Critical, sampleInvoicesPreset3_Discounts, sampleInvoicesPresetApp2Single } from '../data/initialInvoices';
import { X, FileText, Check, Upload, AlertCircle, FileSpreadsheet, FileCode, Sparkles } from 'lucide-react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportInvoices: (imported: InvoiceItem[]) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportInvoices,
}) => {
  if (!isOpen) return null;

  const [importMode, setImportMode] = useState<'excel_file' | 'tsv_paste' | 'json_paste'>('excel_file');
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  const sampleCsvTemplate = `Invoice Number,Supplier Name,Invoice Date,Approved Payable Amount,Payment Terms,App 2 Verification Status,PO Number,GRN Number
INV-EXT-1000,Tan Brothers Metal Works Pte Ltd,2026-07-01,900.00,Net 30,MATCHED,PO-8812,GRN-4410
INV-ELF-9941,Eng Lee Fasteners & Bolt Co,2026-07-15,3200.00,Net 30,DISCREPANCY DETECTED,PO-8830,GRN-4422
INV-CHH-4501,Continental Hardware Hub,2026-07-22,8500.00,2%/10 Net 30,MATCHED,PO-8845,GRN-4430
INV-GHP-1082,Guan Hock Piping & Steel Supply,2026-07-05,6250.00,Net 30,MATCHED,PO-8820,GRN-4418
INV-SSE-7712,Singa Safety Equipment Ltd,2026-07-28,1950.00,Net 30,DUPLICATE SUSPECTED,PO-8850,GRN-4438`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const importedInvoices = parseExcelFileToInvoices(data);
        if (importedInvoices.length === 0) {
          setErrorMsg('No valid invoice records could be parsed from the selected file.');
          return;
        }
        onImportInvoices(importedInvoices);
        onClose();
      } catch (err: any) {
        setErrorMsg(`Failed to parse Excel file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleParseText = () => {
    setErrorMsg('');
    if (!rawText.trim()) {
      setErrorMsg('Please paste content before importing.');
      return;
    }

    try {
      if (importMode === 'json_paste') {
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed)) {
          setErrorMsg('Expected a JSON array of invoice objects.');
          return;
        }
        onImportInvoices(parsed);
      } else {
        const parsed = parseTabularTextToInvoices(rawText);
        if (parsed.length === 0) {
          setErrorMsg('Could not parse tabular CSV/TSV data. Please check column headers.');
          return;
        }
        onImportInvoices(parsed);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(`Parsing Error: ${err.message}`);
    }
  };

  const handleLoadSamplePreset = (presetType: 1 | 2 | 3 | 4) => {
    if (presetType === 1) onImportInvoices(sampleInvoicesPreset1);
    if (presetType === 2) onImportInvoices(sampleInvoicesPreset2_Critical);
    if (presetType === 3) onImportInvoices(sampleInvoicesPreset3_Discounts);
    if (presetType === 4) onImportInvoices(sampleInvoicesPresetApp2Single);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Ingest Excel Data from App 2
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 font-mono border border-emerald-700 px-1.5 py-0.5 rounded">
                  3-Way Match Output
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Upload `.xlsx`/`.csv` or paste tabular Excel exports to calculate due dates &amp; urgency
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

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => { setImportMode('excel_file'); setErrorMsg(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition ${
              importMode === 'excel_file'
                ? 'border-emerald-600 text-emerald-800 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Upload `.xlsx` / `.csv` File</span>
          </button>

          <button
            onClick={() => { setImportMode('tsv_paste'); setRawText(sampleCsvTemplate); setErrorMsg(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition ${
              importMode === 'tsv_paste'
                ? 'border-emerald-600 text-emerald-800 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Paste Tabular CSV/TSV</span>
          </button>

          <button
            onClick={() => { setImportMode('json_paste'); setErrorMsg(''); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition ${
              importMode === 'json_paste'
                ? 'border-emerald-600 text-emerald-800 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Paste App 1 &amp; 2 JSON</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode 1: File Upload */}
          {importMode === 'excel_file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center bg-emerald-50/20 hover:bg-emerald-50/50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  Click or drag your App 2 Excel file here
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports `.xlsx`, `.xls`, and `.csv` files containing Invoice Number, Supplier, Date, Amount, and Payment Terms.
                </p>
                {fileName && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded bg-emerald-100 text-emerald-900 font-bold font-mono border border-emerald-300">
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    Selected: {fileName}
                  </div>
                )}
              </div>

              {/* Sample Preset Shortcut Bar */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Or Quick-Load Pre-parsed App 2 Excel Datasets:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleLoadSamplePreset(4)}
                    className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left transition"
                  >
                    <div className="font-bold text-emerald-950 text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      INV-EXT-1000
                    </div>
                    <div className="text-[10px] text-emerald-800 font-bold">$900.00 Approved</div>
                  </button>

                  <button
                    onClick={() => handleLoadSamplePreset(1)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition"
                  >
                    <div className="font-bold text-slate-800 text-xs">Standard Run</div>
                    <div className="text-[10px] text-slate-500">5-Invoice Batch</div>
                  </button>

                  <button
                    onClick={() => handleLoadSamplePreset(2)}
                    className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-100 text-left transition"
                  >
                    <div className="font-bold text-rose-900 text-xs">Critical Overdue</div>
                    <div className="text-[10px] text-rose-700">3-Day Overdue &amp; Penalties</div>
                  </button>

                  <button
                    onClick={() => handleLoadSamplePreset(3)}
                    className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100 text-left transition"
                  >
                    <div className="font-bold text-indigo-900 text-xs">Discount Focus</div>
                    <div className="text-[10px] text-indigo-700">3% Early Settlement</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: CSV / TSV Text Paste */}
          {importMode === 'tsv_paste' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 text-xs">
                  Paste Tabular Text (Copy directly from Excel / Sheet)
                </label>
                <button
                  onClick={() => setRawText(sampleCsvTemplate)}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Reset Sample CSV
                </button>
              </div>

              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste tab-separated or comma-separated rows..."
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />

              <p className="text-[10px] text-slate-500">
                Required Columns: <code>Invoice Number</code>, <code>Supplier Name</code>, <code>Invoice Date</code>, <code>Invoice Amount</code>, <code>Payment Terms</code>.
              </p>
            </div>
          )}

          {/* Mode 3: JSON Paste */}
          {importMode === 'json_paste' && (
            <div className="space-y-3">
              <label className="font-bold text-slate-800 text-xs">
                Paste JSON Array (App 1 Intake &amp; App 2 Output)
              </label>
              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='[ { "invoiceNumber": "INV-101", ... } ]'
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          
          {importMode !== 'excel_file' && (
            <button
              onClick={handleParseText}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-2xs flex items-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Ingest &amp; Calculate Due Dates
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
