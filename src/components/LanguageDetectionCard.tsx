import React from 'react';
import { LanguageDetection, TargetLanguage } from '../types';
import { 
  Globe2, 
  CheckCircle2, 
  Layers, 
  Search
} from 'lucide-react';

interface LanguageDetectionCardProps {
  detection: LanguageDetection | null;
  detectedDialect?: string;
  isOriginalEnglish?: boolean;
  isLoading: boolean;
  targetLanguage?: TargetLanguage;
}

export const LanguageDetectionCard: React.FC<LanguageDetectionCardProps> = ({
  detection,
  detectedDialect,
  isLoading,
  targetLanguage,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 flex items-center justify-between shadow-xs animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-spin">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Detecting language & analyzing formatting structure...
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Scanning scripts, character tokens, code syntax, and indentation
            </p>
          </div>
        </div>
        <div className="h-1.5 w-20 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!detection) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 dark:text-slate-200">Auto-Detect Language:</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Type, paste, or upload any file in any global language
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
          Target: <strong className="text-slate-800 dark:text-slate-200">{targetLanguage?.name || 'English'}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-3.5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Main Detected Language Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Detected
              </span>

              <span className="text-base font-bold text-slate-900 dark:text-white">
                {detection.name}
              </span>

              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {detection.nativeName}
              </span>

              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {detection.code.toUpperCase()}
              </span>

              {detectedDialect && (
                <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                  ({detectedDialect})
                </span>
              )}
            </div>

            {/* Meta details */}
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-0.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                Family: <strong className="text-slate-700 dark:text-slate-300 font-medium">{detection.family}</strong>
              </span>
              <span>•</span>
              <span>Script: <strong className="text-slate-700 dark:text-slate-300 font-medium">{detection.script}</strong></span>
              <span>•</span>
              <span>Format: <strong className="text-slate-700 dark:text-slate-300 font-medium">{detection.formatDetected}</strong></span>
              <span>•</span>
              <span>Direction: <strong className="text-slate-700 dark:text-slate-300 font-medium uppercase">{detection.direction}</strong></span>
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {detection.confidence}% Match
          </div>
          <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.max(20, detection.confidence)}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
