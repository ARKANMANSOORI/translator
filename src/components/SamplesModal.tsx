import React, { useState } from 'react';
import { SAMPLE_PRESETS } from '../data/samples';
import { SamplePreset } from '../types';
import { 
  X, 
  Code2, 
  FileText, 
  Feather, 
  Braces, 
  ListTree, 
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SamplePreset) => void;
}

export const SamplesModal: React.FC<SamplesModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Samples' },
    { id: 'code', label: 'Code & Comments', icon: Code2 },
    { id: 'markdown', label: 'Markdown Docs', icon: FileText },
    { id: 'json', label: 'JSON Data', icon: Braces },
    { id: 'poetry', label: 'Poetry & RTL', icon: Feather },
    { id: 'list', label: 'Lists', icon: ListTree },
    { id: 'dialogue', label: 'Dialogue', icon: MessageSquare },
  ];

  const filteredSamples = selectedCategory === 'all'
    ? SAMPLE_PRESETS
    : SAMPLE_PRESETS.filter(s => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Test Samples</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select real-world examples across different languages and strict layouts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Samples List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50 dark:bg-slate-950/30">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sample.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                    {sample.languageName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {sample.formatType}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {sample.description}
              </p>

              <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-mono overflow-x-auto max-h-24 leading-snug">
                {sample.text.slice(0, 240)}...
              </pre>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
