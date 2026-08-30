/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { LanguageDetectionCard } from './components/LanguageDetectionCard';
import { SourceInputPanel } from './components/SourceInputPanel';
import { TranslationOutputPanel } from './components/TranslationOutputPanel';
import { SamplesModal } from './components/SamplesModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { FormatInfoModal } from './components/FormatInfoModal';
import { ShareModal } from './components/ShareModal';
import { TranslationResult, SamplePreset, LanguageDetection, UploadedFile, TargetLanguage } from './types';
import { SAMPLE_PRESETS } from './data/samples';
import { DEFAULT_TARGET_LANGUAGE, TARGET_LANGUAGES } from './data/languages';
import { detectLanguageHeuristically } from './utils/detector';
import { AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'abdul_translator_history_v1';
const THEME_STORAGE_KEY = 'abdul_translator_theme_v1';
const TARGET_LANG_KEY = 'abdul_translator_target_lang_v1';

export default function App() {
  const [sourceText, setSourceText] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [liveDetection, setLiveDetection] = useState<LanguageDetection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [isMonospace, setIsMonospace] = useState<boolean>(true);
  const [formattingGuidance, setFormattingGuidance] = useState<string>('');
  
  // Target language state: Defaults to English ('en')
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(() => {
    try {
      const savedCode = localStorage.getItem(TARGET_LANG_KEY);
      if (savedCode) {
        const found = TARGET_LANGUAGES.find(l => l.code.toLowerCase() === savedCode.toLowerCase());
        if (found) return found;
      }
    } catch (e) {
      console.warn('Could not load saved target language', e);
    }
    return DEFAULT_TARGET_LANGUAGE;
  });

  // Save selected target language
  const handleSelectTargetLanguage = (lang: TargetLanguage) => {
    setTargetLanguage(lang);
    try {
      localStorage.setItem(TARGET_LANG_KEY, lang.code);
    } catch (e) {
      console.warn('Could not save target language', e);
    }

    // If we have existing source text or a previous translation result, automatically re-translate to the new target!
    if (sourceText.trim()) {
      handleTranslateText(sourceText, formattingGuidance, attachedFile, lang);
    }
  };

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Modals & Drawers
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isFormatInfoOpen, setIsFormatInfoOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const hasInitializedFromUrl = useRef<boolean>(false);

  // Sync theme with HTML root class and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e);
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: TranslationResult[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  };

  // Instant client-side heuristic language detection on keystrokes
  useEffect(() => {
    if (!sourceText.trim()) {
      if (!attachedFile) {
        setLiveDetection(null);
      }
      return;
    }

    if (result && result.originalText === sourceText) {
      setLiveDetection(result.detectedLanguage);
      return;
    }

    // Instant local detection without burning API quota
    const local = detectLanguageHeuristically(sourceText);
    setLiveDetection(local);
  }, [sourceText, result, attachedFile]);

  // Perform Translation API Call (Handles both text and uploaded files with dynamic target language)
  const handleTranslateText = useCallback(async (
    textToTranslate: string, 
    extraGuidance?: string,
    fileToTranslate?: UploadedFile | null,
    targetLangParam?: TargetLanguage
  ) => {
    if (!textToTranslate.trim() && (!fileToTranslate || !fileToTranslate.base64Data)) {
      return;
    }

    const currentTarget = targetLangParam || targetLanguage;

    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        text: textToTranslate,
        formattingGuidance: extraGuidance?.trim() || undefined,
        targetLanguage: {
          code: currentTarget.code,
          name: currentTarget.name,
          nativeName: currentTarget.nativeName,
          direction: currentTarget.direction,
        },
      };

      if (fileToTranslate && fileToTranslate.base64Data) {
        payload.file = {
          name: fileToTranslate.name,
          mimeType: fileToTranslate.type,
          base64: fileToTranslate.base64Data,
        };
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let message = errData.error || `Server error (Status ${response.status})`;
        if (typeof message === 'string') {
          if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
            message = 'API rate limit reached. Please wait a few seconds and tap Retry.';
          } else if (message.includes('503') || message.includes('demand') || message.includes('UNAVAILABLE')) {
            message = 'AI model is experiencing high demand. Please tap Retry in a moment.';
          }
        }
        throw new Error(message);
      }

      const data: TranslationResult = await response.json();
      
      if (!textToTranslate.trim() && data.originalText) {
        setSourceText(data.originalText);
      }

      const completeResult: TranslationResult = {
        ...data,
        targetLanguage: currentTarget,
        uploadedFile: fileToTranslate || undefined,
      };

      setResult(completeResult);
      setLiveDetection(data.detectedLanguage);

      // Add to history
      setHistory(prevHistory => {
        const updated = [
          { ...completeResult, favorite: false },
          ...prevHistory.filter(h => !(h.originalText === data.originalText && h.targetLanguage?.code === currentTarget.code)),
        ].slice(0, 40);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Save history error', e);
        }
        return updated;
      });
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || 'Failed to translate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [targetLanguage]);

  // Handler for OCR extraction of uploaded PDF or Image
  const handleExtractFileText = async (file: UploadedFile) => {
    if (!file.base64Data) return;

    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/extract-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: {
            name: file.name,
            mimeType: file.type,
            base64: file.base64Data,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract text from file.');
      }

      const data = await response.json();
      if (data.extractedText) {
        setSourceText(data.extractedText);
      }
      if (data.detectedLanguage) {
        setLiveDetection(data.detectedLanguage);
      }
    } catch (err: any) {
      console.error('File extraction error:', err);
      setError(err.message || 'Could not extract text from document/image.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTranslate = useCallback(() => {
    handleTranslateText(sourceText, formattingGuidance, attachedFile, targetLanguage);
  }, [handleTranslateText, sourceText, formattingGuidance, attachedFile, targetLanguage]);

  // Swap source and target languages
  const handleSwapLanguages = () => {
    if (!result?.translatedText) return;

    const newSource = result.translatedText;
    const detected = result.detectedLanguage;

    // Find target matching detected source
    const newTarget = TARGET_LANGUAGES.find(
      l => l.code.toLowerCase() === detected.code.toLowerCase() ||
           l.name.toLowerCase() === detected.name.toLowerCase()
    ) || DEFAULT_TARGET_LANGUAGE;

    setSourceText(newSource);
    setAttachedFile(null);
    setTargetLanguage(newTarget);
    setResult(null);

    // Immediately trigger translation
    handleTranslateText(newSource, formattingGuidance, null, newTarget);
  };

  // Check URL query params on initial load for shareable deep links (e.g. ?text=...)
  useEffect(() => {
    if (hasInitializedFromUrl.current) return;
    hasInitializedFromUrl.current = true;

    try {
      const params = new URLSearchParams(window.location.search);
      const urlText = params.get('text');
      const urlTarget = params.get('target');
      
      let langToUse = targetLanguage;
      if (urlTarget) {
        const found = TARGET_LANGUAGES.find(l => l.code.toLowerCase() === urlTarget.toLowerCase());
        if (found) {
          langToUse = found;
          setTargetLanguage(found);
        }
      }

      if (urlText && urlText.trim()) {
        setSourceText(urlText);
        handleTranslateText(urlText, undefined, null, langToUse);
      }
    } catch (e) {
      console.warn('Could not read URL params', e);
    }
  }, [handleTranslateText, targetLanguage]);

  // Load a preset sample
  const handleSelectSample = (sample: SamplePreset | string) => {
    const targetSample = typeof sample === 'string'
      ? SAMPLE_PRESETS.find(s => s.id === sample)
      : sample;

    if (targetSample) {
      setSourceText(targetSample.text);
      setAttachedFile(null);
      setResult(null);
      setError(null);
    }
  };

  // Clear source input
  const handleClear = () => {
    setSourceText('');
    setAttachedFile(null);
    setResult(null);
    setLiveDetection(null);
    setError(null);
  };

  // History operations
  const handleSelectHistoryItem = (item: TranslationResult) => {
    setSourceText(item.originalText);
    setAttachedFile(item.uploadedFile || null);
    if (item.targetLanguage) {
      const matched = TARGET_LANGUAGES.find(l => l.code === item.targetLanguage?.code) || item.targetLanguage;
      setTargetLanguage(matched);
    }
    setResult(item);
    setLiveDetection(item.detectedLanguage);
    setError(null);
  };

  const handleToggleFavorite = (timestamp: number) => {
    const updated = history.map(item =>
      item.timestamp === timestamp ? { ...item, favorite: !item.favorite } : item
    );
    saveHistory(updated);
  };

  const handleDeleteHistoryItem = (timestamp: number) => {
    const updated = history.filter(item => item.timestamp !== timestamp);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const activeDetection = result?.detectedLanguage || liveDetection;
  const canSwap = Boolean(result?.translatedText && result?.detectedLanguage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 selection:text-indigo-950 dark:selection:text-indigo-200 transition-colors duration-150">
      
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onOpenFormatInfo={() => setIsFormatInfoOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        historyCount={history.length}
        isMonospace={isMonospace}
        onToggleMonospace={() => setIsMonospace(!isMonospace)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-3.5">
        
        {/* Language Detection Banner */}
        <LanguageDetectionCard
          detection={activeDetection}
          detectedDialect={result?.detectedDialect}
          isOriginalEnglish={result?.isOriginalEnglish}
          isLoading={isLoading || isExtracting}
          targetLanguage={targetLanguage}
        />

        {/* Error Alert if any */}
        {error && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleTranslate}
              className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Split Translator Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          
          {/* Source Input */}
          <SourceInputPanel
            text={sourceText}
            onChange={setSourceText}
            onTranslate={handleTranslate}
            onClear={handleClear}
            isLoading={isLoading}
            isMonospace={isMonospace}
            onSelectSample={handleSelectSample}
            formattingGuidance={formattingGuidance}
            setFormattingGuidance={setFormattingGuidance}
            attachedFile={attachedFile}
            onFileAttached={setAttachedFile}
            onExtractFileText={handleExtractFileText}
            isExtracting={isExtracting}
            detectedLanguage={activeDetection}
            detectedDialect={result?.detectedDialect}
          />

          {/* Target Output */}
          <TranslationOutputPanel
            result={result}
            isLoading={isLoading}
            isMonospace={isMonospace}
            originalText={sourceText}
            targetLanguage={targetLanguage}
            onSelectTargetLanguage={handleSelectTargetLanguage}
            onSwapLanguages={handleSwapLanguages}
            canSwap={canSwap}
            onOpenShare={() => setIsShareOpen(true)}
            inputFileName={attachedFile?.name}
          />

        </div>

        {/* Footer info bar */}
        <footer className="pt-2 pb-3 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] tracking-tight">
              AM
            </div>
            <span className="font-semibold text-slate-600 dark:text-slate-300">ABDUL Translator</span>
            <span>• Multi-Language Detection & 100% Format-Preserving Translation Engine</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setIsShareOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium"
            >
              Share App
            </button>
            <span>•</span>
            <button
              onClick={() => setIsFormatInfoOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Preservation Specs
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSamplesOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Sample Presets
            </button>
          </div>
        </footer>

      </main>

      {/* Modals and Drawers */}
      <SamplesModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectSample={handleSelectSample}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <FormatInfoModal
        isOpen={isFormatInfoOpen}
        onClose={() => setIsFormatInfoOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        currentText={sourceText}
      />

    </div>
  );
}
