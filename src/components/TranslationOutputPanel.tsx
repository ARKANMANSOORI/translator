import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Download, 
  FileText,
  FileCode,
  FileCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { TranslationResult, TargetLanguage } from '../types';
import { TargetLanguageSelector } from './TargetLanguageSelector';
import { 
  exportToDocx, 
  exportToWordDoc, 
  exportToTextDoc, 
  exportToMarkdownDoc,
  getExportFilename
} from '../utils/documentExport';

interface TranslationOutputPanelProps {
  result: TranslationResult | null;
  isLoading: boolean;
  isMonospace: boolean;
  originalText: string;
  targetLanguage: TargetLanguage;
  onSelectTargetLanguage: (language: TargetLanguage) => void;
  onSwapLanguages?: () => void;
  canSwap?: boolean;
  onOpenShare?: () => void;
  inputFileName?: string;
}

export const TranslationOutputPanel: React.FC<TranslationOutputPanelProps> = ({
  result,
  isLoading,
  targetLanguage,
  onSelectTargetLanguage,
  onSwapLanguages,
  canSwap,
  inputFileName,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Active target language
  const activeTargetLang = result?.targetLanguage || targetLanguage;

  // Compute downloaded filename for display and download
  const currentDocxFilename = getExportFilename(inputFileName, 'docx', activeTargetLang.code);

  // Copy to clipboard
  const handleCopy = async () => {
    if (!result?.translatedText) return;
    try {
      await navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Download handlers
  const handleDownloadDocx = async () => {
    if (!result) return;
    const filename = getExportFilename(inputFileName, 'docx', activeTargetLang.code);
    try {
      setIsExportingDocx(true);
      await exportToDocx(result, filename);
      setDownloadSuccess(`Downloaded "${filename}" successfully`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Word .docx export error, falling back to .doc:', err);
      const docFilename = getExportFilename(inputFileName, 'doc', activeTargetLang.code);
      exportToWordDoc(result, docFilename);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadWordDoc = () => {
    if (!result) return;
    const filename = getExportFilename(inputFileName, 'doc', activeTargetLang.code);
    exportToWordDoc(result, filename);
    setDownloadSuccess(`Downloaded "${filename}" successfully`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadTextDoc = () => {
    if (!result) return;
    const filename = getExportFilename(inputFileName, 'txt', activeTargetLang.code);
    exportToTextDoc(result, filename);
    setDownloadSuccess(`Downloaded "${filename}" successfully`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadMarkdownDoc = () => {
    if (!result) return;
    const filename = getExportFilename(inputFileName, 'md', activeTargetLang.code);
    exportToMarkdownDoc(result, filename);
    setDownloadSuccess(`Downloaded "${filename}" successfully`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Text to Speech
  const handleTTS = () => {
    if (!result?.translatedText) return;

    if (isPlayingTTS) {
      window.speechSynthesis?.cancel();
      setIsPlayingTTS(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.translatedText);
    const targetCode = activeTargetLang.code.toLowerCase();
    
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      zh: 'zh-CN',
      'zh-tw': 'zh-TW',
      ar: 'ar-SA',
      hi: 'hi-IN',
      ur: 'ur-PK',
      pt: 'pt-BR',
      ru: 'ru-RU',
      ko: 'ko-KR',
      it: 'it-IT',
      tr: 'tr-TR',
      vi: 'vi-VN',
      nl: 'nl-NL',
      pl: 'pl-PL',
      id: 'id-ID',
      fa: 'fa-IR',
      bn: 'bn-BD',
      el: 'el-GR',
      he: 'he-IL',
      th: 'th-TH',
      sv: 'sv-SE',
      uk: 'uk-UA',
    };

    utterance.lang = localeMap[targetCode] || `${targetCode}-${targetCode.toUpperCase()}`;
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(targetCode) || 
      v.lang.toLowerCase().includes(targetCode)
    );
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    setIsPlayingTTS(true);
    window.speechSynthesis.speak(utterance);
  };

  const charCount = result?.translatedText ? result.translatedText.length : 0;
  const wordCount = result?.translatedText?.trim() ? result.translatedText.trim().split(/\s+/).length : 0;
  const lineCount = result?.translatedText ? result.translatedText.split('\n').length : 0;

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-colors">
      
      {/* Top Panel Bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-2.5 flex-wrap">
        
        {/* Target Language Dropdown Selector */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TargetLanguageSelector
            selectedLanguage={targetLanguage}
            onSelectLanguage={onSelectTargetLanguage}
            onSwapLanguages={onSwapLanguages}
            canSwap={canSwap}
            disabled={isLoading}
          />
        </div>

        {/* Status indicator */}
        {result && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Translated & Ready</span>
          </div>
        )}

      </div>

      {/* Main Output Content */}
      <div className="relative flex-1 min-h-[340px] sm:min-h-[380px] flex flex-col justify-center p-4 sm:p-6 overflow-y-auto bg-white dark:bg-slate-900">
        
        {/* Loading State */}
        {isLoading && (
          <div className="max-w-md mx-auto w-full text-center space-y-4 py-8 animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Translating into {targetLanguage.name}...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Preserving exact document structure, line indentation, syntax formatting, and script alignment.
              </p>
            </div>
            <div className="h-1.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && (
          <div className="max-w-md mx-auto w-full text-center space-y-3 py-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-xs">
              <Download className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
                ABDUL Translation
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                File Download & Document Center
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                Upload or paste your source content on the left, select target language, and tap Translate to download in Microsoft Word and Document formats.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Target: {targetLanguage.name}</span>
            </div>
          </div>
        )}

        {/* Result Ready -> Prominent Download Buttons to see output */}
        {!isLoading && result && (
          <div className="w-full max-w-lg mx-auto space-y-4 py-2">
            
            {/* Notification Toast if downloaded */}
            {downloadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {/* Translation Ready Header Card with ABDUL Translation on TOP */}
            <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 shadow-xs space-y-3 text-center sm:text-left">
              
              {/* TOP HEADER: ABDUL TRANSLATION */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-indigo-200/80 dark:border-indigo-800/60">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                    ABDUL TRANSLATION
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Document Ready
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Preserved</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Target Document
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeTargetLang.name} Translation
                    </h3>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                    {activeTargetLang.code.toUpperCase()}
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium font-mono">
                    {wordCount} words • {lineCount} lines
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                100% layout, indentation, and structure preserved. File will download as <strong className="font-mono text-slate-800 dark:text-slate-200">{currentDocxFilename}</strong>:
              </p>
            </div>

            {/* PRIMARY DOWNLOAD BUTTONS SECTION */}
            <div className="space-y-2.5">
              
              {/* Header Label on top of Download */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Download Translated Document</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {inputFileName ? inputFileName : '.docx • .doc • .txt • .md'}
                </span>
              </div>
              
              {/* Primary Word .docx Download Button */}
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={isExportingDocx}
                className="w-full p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm">Download in Microsoft Word (.docx)</div>
                    <div className="text-[11px] text-indigo-100 font-normal font-mono">{currentDocxFilename}</div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/20 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </div>
              </button>

              {/* Secondary Document Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* Word .doc */}
                <button
                  type="button"
                  onClick={handleDownloadWordDoc}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-center"
                >
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Word Document (.doc)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Universal Word</span>
                </button>

                {/* Text .txt */}
                <button
                  type="button"
                  onClick={handleDownloadTextDoc}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-center"
                >
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span>Text Document (.txt)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Plain text</span>
                </button>

                {/* Markdown .md */}
                <button
                  type="button"
                  onClick={handleDownloadMarkdownDoc}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-center"
                >
                  <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Markdown (.md)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Markdown format</span>
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Bottom Action Controls */}
      {result && (
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-2 flex-wrap">
          
          {/* TTS Audio Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTTS}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingTTS
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={`Listen to ${activeTargetLang.name} pronunciation`}
            >
              {isPlayingTTS ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* TTS Speed Selector */}
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none"
              title="Speech speed"
            >
              <option value="0.8">0.8x</option>
              <option value="1">1.0x</option>
              <option value="1.2">1.2x</option>
            </select>
          </div>

          {/* Quick Copy to Clipboard */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
