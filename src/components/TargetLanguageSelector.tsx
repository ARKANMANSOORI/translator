import React, { useState, useRef, useEffect } from 'react';
import { TargetLanguage, TARGET_LANGUAGES } from '../data/languages';
import { 
  ChevronDown, 
  Search, 
  Check, 
  X,
  ArrowLeftRight,
  Globe2,
  RotateCcw
} from 'lucide-react';

interface TargetLanguageSelectorProps {
  selectedLanguage: TargetLanguage;
  onSelectLanguage: (language: TargetLanguage) => void;
  onSwapLanguages?: () => void;
  canSwap?: boolean;
  disabled?: boolean;
}

export const TargetLanguageSelector: React.FC<TargetLanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onSwapLanguages,
  canSwap = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filtered languages by search query
  const filteredLanguages = TARGET_LANGUAGES.filter(lang => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q) ||
      (lang.region && lang.region.toLowerCase().includes(q))
    );
  });

  const englishLang = TARGET_LANGUAGES.find(l => l.code === 'en') || TARGET_LANGUAGES[0];

  return (
    <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
      
      {/* Dropdown Label */}
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shrink-0 select-none">
        <Globe2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Output Language:</span>
      </label>

      {/* Main Dropdown Select Button */}
      <div className="relative inline-block">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`min-w-[160px] sm:min-w-[200px] px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
            isOpen 
              ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm leading-none shrink-0">{selectedLanguage.flag || '🌐'}</span>
            <span className="font-semibold truncate">{selectedLanguage.name}</span>
            {selectedLanguage.code === 'en' && (
              <span className="text-[9px] font-bold px-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Default
              </span>
            )}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Popover Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-[280px] sm:w-[340px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden flex flex-col max-h-[380px] animate-in fade-in slide-in-from-top-1 duration-150">
            
            {/* Search Input Box */}
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Language ({TARGET_LANGUAGES.length})
                </span>
                {selectedLanguage.code !== 'en' && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLanguage(englishLang);
                      setIsOpen(false);
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset to English
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search language (e.g. Spanish, German, Arabic)..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Languages */}
            <div className="flex-1 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[290px]">
              {filteredLanguages.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No language found matching "{searchQuery}"
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = selectedLanguage.code.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onSelectLanguage(lang);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-100 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base leading-none shrink-0">{lang.flag || '🌐'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs truncate">{lang.name}</span>
                            {lang.code === 'en' && (
                              <span className="text-[9px] font-bold px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
                            <span>{lang.nativeName}</span>
                            <span>•</span>
                            <span>{lang.code.toUpperCase()}</span>
                            {lang.direction === 'rtl' && (
                              <span className="px-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[9px]">
                                RTL
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

          </div>
        )}
      </div>

      {/* Swap Button if translation exists */}
      {canSwap && onSwapLanguages && (
        <button
          type="button"
          onClick={onSwapLanguages}
          disabled={disabled}
          title="Swap source & output language"
          className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors disabled:opacity-50 cursor-pointer shadow-xs text-xs flex items-center gap-1 shrink-0 font-medium"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Swap</span>
        </button>
      )}

    </div>
  );
};
