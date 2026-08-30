import React, { useRef, useState } from 'react';
import { 
  Trash2, 
  Clipboard, 
  Upload, 
  Zap, 
  X, 
  Globe2,
  FileCheck,
  FileText,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Edit3,
  Check
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samples';
import { UploadedFile, LanguageDetection } from '../types';

interface SourceInputPanelProps {
  text: string;
  onChange: (value: string) => void;
  onTranslate: () => void;
  onClear: () => void;
  isLoading: boolean;
  isMonospace: boolean;
  onSelectSample: (sampleId: string) => void;
  formattingGuidance: string;
  setFormattingGuidance: (val: string) => void;
  attachedFile: UploadedFile | null;
  onFileAttached: (file: UploadedFile | null) => void;
  onExtractFileText?: (file: UploadedFile) => void;
  isExtracting?: boolean;
  detectedLanguage?: LanguageDetection | null;
  detectedDialect?: string;
}

export const SourceInputPanel: React.FC<SourceInputPanelProps> = ({
  text,
  onChange,
  onTranslate,
  onClear,
  isLoading,
  onSelectSample,
  formattingGuidance,
  setFormattingGuidance,
  attachedFile,
  onFileAttached,
  onExtractFileText,
  isExtracting = false,
  detectedLanguage,
  detectedDialect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isManualInputMode, setIsManualInputMode] = useState(false);
  const [showGuidanceInput, setShowGuidanceInput] = useState(false);
  const [copiedPasted, setCopiedPasted] = useState(false);

  const hasInput = Boolean(text.trim() || attachedFile);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string, filename: string) => {
    if (mimeType.includes('pdf') || /\.pdf$/i.test(filename)) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(filename)) {
      return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    }
    if (/\.(js|ts|tsx|jsx|py|html|css|json|cpp|c|java|sql|md)$/i.test(filename)) {
      return <FileCode className="w-5 h-5 text-emerald-500" />;
    }
    return <FileCheck className="w-5 h-5 text-blue-500" />;
  };

  const processUploadedFile = (file: globalThis.File) => {
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (isImage || isPdf) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          const base64Index = dataUrl.indexOf('base64,');
          const base64Data = base64Index !== -1 ? dataUrl.substring(base64Index + 7) : dataUrl;
          const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/png');

          const uploaded: UploadedFile = {
            name: file.name,
            size: file.size,
            type: mimeType,
            base64Data,
          };
          onFileAttached(uploaded);

          if (onExtractFileText) {
            onExtractFileText(uploaded);
          }
          setIsManualInputMode(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onChange(content);
          onFileAttached(null);
          setIsManualInputMode(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText);
        onFileAttached(null);
        setIsManualInputMode(false);
        setCopiedPasted(true);
        setTimeout(() => setCopiedPasted(false), 1500);
      }
    } catch (err) {
      console.warn('Clipboard paste failed:', err);
      setIsManualInputMode(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  return (
    <div className={`flex flex-col h-full rounded-xl border bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all ${
      isDragging ? 'border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/50' : 'border-slate-200 dark:border-slate-800'
    }`}>
      
      {/* Top Panel Bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-2 flex-wrap">
        
        {/* Source Language Header */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Source Input
          </span>
          {hasInput && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Input Received
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {!hasInput || isManualInputMode ? (
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              title="Paste text from clipboard"
            >
              {copiedPasted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pasted</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Paste Text</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsManualInputMode(true)}
              className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer font-medium"
              title="Edit or replace input"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit / Replace</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-md text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
            title="Upload PDF, Image, Code, or Text file"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Upload File</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.md,.json,.js,.ts,.py,.html,.xml,.csv,.yaml,.yml,.c,.cpp,.java,.rb,.doc,.docx"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {hasInput && (
            <button
              type="button"
              onClick={() => {
                onClear();
                onFileAttached(null);
                setIsManualInputMode(false);
              }}
              className="px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs flex items-center gap-1 cursor-pointer font-medium"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Body */}
      <div 
        className="relative flex-1 min-h-[340px] sm:min-h-[380px] flex flex-col justify-center p-4 overflow-y-auto"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >

        {/* Drag & drop overlay indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-50/95 dark:bg-indigo-950/95 backdrop-blur-xs border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-xl flex flex-col items-center justify-center p-6 text-center z-20">
            <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">Drop Document or Image File Here</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              PDF, Word, Images, Text, or Code will be analyzed and ready to translate.
            </p>
          </div>
        )}

        {/* STATE 1: Manual Input / Edit Mode */}
        {isManualInputMode && (
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Paste or type text below:</span>
              <button
                type="button"
                onClick={() => setIsManualInputMode(false)}
                className="text-indigo-600 hover:underline cursor-pointer font-medium"
              >
                Done
              </button>
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste or write your text in any language..."
              className="w-full flex-1 min-h-[220px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>
        )}

        {/* STATE 2: Input Received -> Only show which language of input is that + file/text metadata */}
        {hasInput && !isManualInputMode && (
          <div className="w-full max-w-lg mx-auto space-y-4 py-2">
            
            {/* Detected Language Notification Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/80 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Input Language Detected
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {detectedLanguage ? detectedLanguage.name : 'Detecting Language...'}
                    </h3>
                  </div>
                </div>

                {detectedLanguage && (
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                      {detectedLanguage.code.toUpperCase()}
                    </span>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {detectedLanguage.confidence}% Match
                    </div>
                  </div>
                )}
              </div>

              {/* Language Details */}
              {detectedLanguage && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-indigo-50 dark:border-indigo-900/40">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Native Name</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate font-mono">
                      {detectedLanguage.nativeName}
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-indigo-50 dark:border-indigo-900/40">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Family / Script</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {detectedLanguage.family} ({detectedLanguage.script})
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-indigo-50 dark:border-indigo-900/40 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Format Detected</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {detectedLanguage.formatDetected || 'Text Document'}
                    </div>
                  </div>
                </div>
              )}

              {detectedDialect && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Dialect / Region: {detectedDialect}
                </div>
              )}

            </div>

            {/* Input File / Text Source Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {attachedFile ? getFileIcon(attachedFile.type, attachedFile.name) : <FileText className="w-5 h-5 text-indigo-500" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[220px]">
                      {attachedFile ? attachedFile.name : 'Text Document Input'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {attachedFile ? (attachedFile.type.includes('pdf') ? 'PDF' : attachedFile.type.startsWith('image/') ? 'Image' : 'File') : 'Text Content'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {attachedFile 
                      ? `${formatFileSize(attachedFile.size)} • ${isExtracting ? 'Extracting text...' : 'Input loaded & ready'}`
                      : `${wordCount} words • ${lineCount} lines • ${charCount} characters`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsManualInputMode(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STATE 3: Empty State -> Upload Dropzone & Sample Links */}
        {!hasInput && !isManualInputMode && !isDragging && (
          <div className="max-w-md mx-auto w-full text-center space-y-4 py-4">
            
            {/* Upload Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all cursor-pointer flex flex-col items-center justify-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                Upload Document or Image
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-3">
                Drop your PDF, Word document, Image (PNG/JPG), Code, or Text file here to auto-detect its language.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors">
                  Browse Files
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsManualInputMode(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
                >
                  Write / Paste Text
                </button>
              </div>
            </div>

            {/* Test Samples */}
            <div className="pt-2">
              <div className="relative flex py-1 items-center mb-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Or Test with a Sample</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {SAMPLE_PRESETS.slice(0, 4).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      onSelectSample(sample.id);
                      setIsManualInputMode(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>{sample.languageName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({sample.category})</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Optional Formatting Guidance */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-2 px-4">
        {showGuidanceInput ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Custom Formatting Instructions (Optional):
              </span>
              <button
                type="button"
                onClick={() => setShowGuidanceInput(false)}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Hide
              </button>
            </div>
            <input
              type="text"
              value={formattingGuidance}
              onChange={(e) => setFormattingGuidance(e.target.value)}
              placeholder="e.g. 'Preserve HTML tags' or 'Keep table column widths'"
              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans shadow-2xs"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setShowGuidanceInput(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <span>+ Add custom formatting note</span>
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              100% layout & syntax preservation locked
            </span>
          </div>
        )}
      </div>

      {/* Bottom Status & Primary Translate Trigger */}
      <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Source info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>{hasInput ? (attachedFile ? attachedFile.name : `${wordCount} words`) : 'No input loaded'}</span>
        </div>

        {/* Primary Translate Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTranslate}
            disabled={isLoading || !hasInput}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
              isLoading || !hasInput
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white fill-white" />
                <span>Translate</span>
                <span className="hidden lg:inline text-[10px] opacity-75 font-mono px-1 py-0.5 bg-black/10 rounded">
                  ⌘↵
                </span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
