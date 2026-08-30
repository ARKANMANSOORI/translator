import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Link as LinkIcon
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  currentText,
}) => {
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);

  if (!isOpen) return null;

  const appBaseUrl = window.location.origin;
  const deepLinkUrl = currentText && currentText.trim()
    ? `${appBaseUrl}?text=${encodeURIComponent(currentText.slice(0, 3000))}`
    : appBaseUrl;

  const handleCopyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(appBaseUrl);
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleCopyDeepLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLinkUrl);
      setCopiedDeepLink(true);
      setTimeout(() => setCopiedDeepLink(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    deepLinkUrl
  )}&bgcolor=ffffff&color=0f172a&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 flex items-center justify-center text-white shadow-xs font-extrabold text-xs tracking-tight select-none shrink-0">
              AM
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Share AM Translator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Open on your mobile phone or share with others
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* QR Code Section */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">Scan to Open on Mobile</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Scan with your phone camera to open and use the translator on your device.
              </p>
            </div>
          </div>

          {/* App URL Copy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>App Link:</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appBaseUrl}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyAppUrl}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
              >
                {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAppUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Direct Preloaded Text Link if text exists */}
          {currentText && currentText.trim() && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Pre-filled Translation Link:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={deepLinkUrl}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono select-all focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyDeepLink}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedDeepLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDeepLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
