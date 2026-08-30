import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { TranslationResult } from '../types';

/**
 * Generate output file name based on input file name
 */
export function getExportFilename(inputFileName?: string, ext: string = 'docx', targetLangCode?: string): string {
  if (inputFileName && inputFileName.trim()) {
    const trimmed = inputFileName.trim();
    const lastDotIndex = trimmed.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? trimmed.substring(0, lastDotIndex) : trimmed;
    return `${baseName}.${ext}`;
  }
  const lang = targetLangCode ? `_${targetLangCode}` : '';
  return `translation${lang}.${ext}`;
}

/**
 * Export translation result as a genuine Microsoft Word (.docx) file
 * Contains only the pure translated content with preserved structure and layout
 */
export async function exportToDocx(result: TranslationResult, customFilename?: string): Promise<void> {
  const text = result.translatedText || '';
  const lines = text.split('\n');
  const isRTL = result.targetLanguage?.direction === 'rtl';

  const paragraphs: Paragraph[] = [];

  // Process text line by line to preserve layout and indentation
  for (const line of lines) {
    if (line.trim() === '') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: { after: 100 },
        })
      );
      continue;
    }

    // Detect markdown heading
    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: line.replace(/^#\s+/, ''),
              bold: true,
              size: 28,
              color: '0F172A',
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: line.replace(/^##\s+/, ''),
              bold: true,
              size: 24,
              color: '1E293B',
            }),
          ],
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: line.replace(/^###\s+/, ''),
              bold: true,
              size: 22,
              color: '334155',
            }),
          ],
          spacing: { before: 120, after: 60 },
        })
      );
    } else {
      // Normal paragraph or code line
      const isCodeLike = line.startsWith('    ') || line.startsWith('\t') || /^(\{|\}|function|const|let|var|class|import|def|public)/.test(line);

      paragraphs.push(
        new Paragraph({
          alignment: isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: line,
              size: isCodeLike ? 20 : 22, // 10pt or 11pt
              font: isCodeLike ? 'Consolas' : isRTL ? 'Arial' : 'Calibri',
              color: isCodeLike ? '334155' : '1E293B',
            }),
          ],
          spacing: { after: isCodeLike ? 40 : 100, line: 276 }, // 1.15 line spacing
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const langCode = result.targetLanguage?.code || 'en';
  const filename = customFilename || `translation_${langCode}.docx`;
  saveAs(blob, filename);
}

/**
 * Export as rich HTML formatted Word Document (.doc) compatible with all versions of Word and Google Docs
 */
export function exportToWordDoc(result: TranslationResult, customFilename?: string): void {
  const text = result.translatedText || '';
  const targetLangName = result.targetLanguage?.name || 'Translated';
  const isRTL = result.targetLanguage?.direction === 'rtl';

  // Format paragraphs and line breaks cleanly for Microsoft Word HTML import
  const formattedHtml = text
    .split('\n')
    .map(line => {
      if (line.trim() === '') return '<p style="margin: 0; padding: 4px 0;">&nbsp;</p>';
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<p style="margin: 0 0 6px 0; line-height: 1.5; font-family: ${isRTL ? 'Arial, Tahoma, sans-serif' : 'Calibri, Segoe UI, sans-serif'}; font-size: 11pt; color: #1e293b;">${escaped}</p>`;
    })
    .join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${targetLangName} Translation</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { 
            font-family: ${isRTL ? 'Arial, Tahoma, sans-serif' : 'Calibri, Segoe UI, sans-serif'}; 
            padding: 24px; 
            direction: ${isRTL ? 'rtl' : 'ltr'}; 
            text-align: ${isRTL ? 'right' : 'left'};
          }
        </style>
      </head>
      <body>
        <div>${formattedHtml}</div>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const langCode = result.targetLanguage?.code || 'en';
  const filename = customFilename || `translation_${langCode}.doc`;
  saveAs(blob, filename);
}

/**
 * Export as Plain Text Document (.txt) - Pure translated content
 */
export function exportToTextDoc(result: TranslationResult, customFilename?: string): void {
  const text = result.translatedText || '';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const langCode = result.targetLanguage?.code || 'en';
  const filename = customFilename || `translation_${langCode}.txt`;
  saveAs(blob, filename);
}

/**
 * Export as Markdown Document (.md) - Pure translated content
 */
export function exportToMarkdownDoc(result: TranslationResult, customFilename?: string): void {
  const text = result.translatedText || '';
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const langCode = result.targetLanguage?.code || 'en';
  const filename = customFilename || `translation_${langCode}.md`;
  saveAs(blob, filename);
}
