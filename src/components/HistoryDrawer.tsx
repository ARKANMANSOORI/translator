import React, { useState } from 'react';
import { TranslationResult } from '../types';
import { 
  X, 
  Trash2, 
  Download, 
  Search, 
  Star, 
  ArrowRight, 
  Copy, 
  Check,
  Globe2
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: TranslationResult[];
  onSelectHistoryItem: (item: TranslationResult) => void;
  onToggleFavorite: (timestamp: number) => void;
  onDeleteHistoryItem: (timestamp: number) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onToggleFavorite,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detectedLanguage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detectedLanguage.formatDetected.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = onlyFavorites ? item.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  const handleCopy = (timestamp: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(timestamp);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `translation_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Translation History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {history.length} saved translations (stored locally)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {history.length > 0 && (
                <button
                  onClick={handleExportHistory}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                  title="Export JSON history"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  onlyFavorites
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Star className={`w-3 h-3 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>Favorites Only</span>
              </button>

              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
            {filteredHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <Globe2 className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No translations found</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Translated text will automatically be saved here.
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.timestamp}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                        {item.detectedLanguage.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        → {item.targetLanguage?.name || 'English'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(item.timestamp)}
                        className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                      >
                        <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleCopy(item.timestamp, item.translatedText)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedId === item.timestamp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onDeleteHistoryItem(item.timestamp)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="cursor-pointer group"
                  >
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.translatedText}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-1 font-mono">
                      {item.originalText}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
