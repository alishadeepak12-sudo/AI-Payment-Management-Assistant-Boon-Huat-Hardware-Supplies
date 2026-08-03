import React, { useState, useEffect } from 'react';
import { InvoiceItem, SupplierCommunicationDraft } from '../types';
import { generateSupplierCommunication } from '../utils/paymentCalculator';
import { Mail, MessageSquare, Copy, Check, Sparkles, X, ExternalLink, Send } from 'lucide-react';

interface SupplierCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItem | null;
  initialPurpose?: 'discrepancy_hold_notice' | 'payment_extension_request' | 'payment_remittance_advice' | 'discount_clarification';
  onGenerateCustomAiDraft?: (invoice: InvoiceItem, purpose: string, channel: string, instructions: string) => Promise<{ subject?: string; body: string }>;
}

export const SupplierCommunicationModal: React.FC<SupplierCommunicationModalProps> = ({
  isOpen,
  onClose,
  invoice,
  initialPurpose = 'discrepancy_hold_notice',
  onGenerateCustomAiDraft,
}) => {
  if (!isOpen || !invoice) return null;

  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [purpose, setPurpose] = useState<'discrepancy_hold_notice' | 'payment_extension_request' | 'payment_remittance_advice' | 'discount_clarification'>(initialPurpose);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update default draft when invoice, purpose, or channel changes
  useEffect(() => {
    if (invoice) {
      const draft = generateSupplierCommunication(invoice, purpose, channel);
      setSubject(draft.subject);
      setBody(draft.body);
    }
  }, [invoice, purpose, channel]);

  const handleCopy = () => {
    const textToCopy = channel === 'email' ? `Subject: ${subject}\n\n${body}` : body;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefineWithAi = async () => {
    if (!onGenerateCustomAiDraft || !invoice) return;
    setIsGeneratingAi(true);
    try {
      const res = await onGenerateCustomAiDraft(invoice, purpose, channel, customInstruction);
      if (res.subject) setSubject(res.subject);
      if (res.body) setBody(res.body);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const recipientContact = channel === 'email'
    ? (invoice.supplierContact.email || 'accounts@supplier.sg')
    : (invoice.supplierContact.whatsapp || '+65 9123 4567');

  const getWhatsAppLink = () => {
    const rawPhone = (invoice.supplierContact.whatsapp || '').replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(body);
    return `https://wa.me/${rawPhone}?text=${encodedText}`;
  };

  const getMailtoLink = () => {
    const email = invoice.supplierContact.email || '';
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/20">
              {channel === 'email' ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                5. Draft Supplier Communication
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {invoice.supplierName} &bull; {invoice.invoiceNumber} (${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Channel & Purpose Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Channel Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Communication Format
              </label>
              <div className="flex rounded-lg border border-slate-300 p-1 bg-slate-100/80">
                <button
                  onClick={() => setChannel('email')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center transition ${
                    channel === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Email Draft
                </button>
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center transition ${
                    channel === 'whatsapp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> WhatsApp
                </button>
              </div>
            </div>

            {/* Purpose Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Message Purpose
              </label>
              <select
                value={purpose}
                onChange={(e: any) => setPurpose(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="discrepancy_hold_notice">Notice of Hold (3-Way Discrepancy)</option>
                <option value="payment_extension_request">Request Payment Extension</option>
                <option value="payment_remittance_advice">Remittance Advice (Payment Sent)</option>
                <option value="discount_clarification">Verify Early Discount Terms</option>
              </select>
            </div>

          </div>

          {/* Contact Details Info Badge */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Recipient: <strong>{invoice.supplierContact.contactPerson || 'Accounts'}</strong> ({invoice.supplierName})</span>
            <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {recipientContact}
            </span>
          </div>

          {/* Email Subject Field if channel === email */}
          {channel === 'email' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Editable Body Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message Content (Madam Lim Signature)
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed bg-slate-50/50"
            />
          </div>

          {/* AI Refinement Prompt Box */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-900 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Customize Message with Gemini AI
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g. 'Add reference to FAST transfer #FT8819', 'Make tone warmer'..."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                className="flex-1 text-xs border border-blue-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleRefineWithAi}
                disabled={isGeneratingAi}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shrink-0 disabled:opacity-50 flex items-center"
              >
                {isGeneratingAi ? 'Refining...' : 'Refine Draft'}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs transition flex items-center justify-center"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5 text-slate-500" />
                  Copy Message
                </>
              )}
            </button>

            {channel === 'email' ? (
              <a
                href={getMailtoLink()}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Open Email Client
              </a>
            ) : (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Send via WhatsApp
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
