import React from 'react';
import { 
  X, 
  Code2, 
  AlignLeft, 
  ListOrdered, 
  FileJson, 
  FileText, 
  Sparkles 
} from 'lucide-react';

interface FormatInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatInfoModal: React.FC<FormatInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      title: 'Exact Line Breaks & Spacing',
      description: 'Maintains identical line counts, carriage returns, and spacing so the original structure remains unchanged.',
      icon: AlignLeft,
    },
    {
      title: 'Indentation, Spaces & Tabs',
      description: 'Preserves leading indentation levels, columns, and nested alignments verbatim.',
      icon: Code2,
    },
    {
      title: 'Markdown & Rich Syntax',
      description: 'Keeps # headings, **bold**, *italics*, `code spans`, ```fences```, and tables valid.',
      icon: FileText,
    },
    {
      title: 'Lists & Bullets',
      description: 'Retains bullet markers (•, -, *, 1., 1.1, [x]) with exact sequencing.',
      icon: ListOrdered,
    },
    {
      title: 'JSON, XML & Code Keys',
      description: 'Leaves programming keys, tags, and object structures intact—only translating the string values.',
      icon: FileJson,
    },
    {
      title: 'Variables & Placeholders',
      description: 'Protects tokens like {user_id}, %s, $count, URLs, timestamps, and numbers untouched.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 flex items-center justify-center text-white shadow-xs font-extrabold text-xs tracking-tight select-none shrink-0">
              AM
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Format Preservation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How AM ABDUL Translator guarantees layout integrity
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

        {/* Rules Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50 dark:bg-slate-950/30">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-2xs"
              >
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{rule.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
