import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory cache for translations & detections to avoid redundant API calls & quota burn
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function getCached(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key: string, data: any) {
  if (cache.size > 300) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fast heuristic detector on the server to prevent wasting API quota
function detectLanguageLocally(text: string) {
  if (!text || !text.trim()) {
    return {
      name: 'Auto Detect',
      nativeName: 'Auto Detect',
      code: 'auto',
      confidence: 0,
      family: 'Unknown',
      script: 'Unknown',
      direction: 'ltr',
      formatDetected: 'Plain Text',
    };
  }

  const sample = text.slice(0, 3000);
  const trimmed = sample.trim();

  let formatDetected = 'Plain Text';
  if (/^(\s*[{[])[\s\S]*([}\]]\s*)$/.test(trimmed) || (trimmed.includes('":') && trimmed.includes('{'))) {
    formatDetected = 'JSON / Structured Data';
  } else if (
    trimmed.includes('def ') ||
    trimmed.includes('function ') ||
    trimmed.includes('import ') ||
    trimmed.includes('const ') ||
    trimmed.includes('class ') ||
    trimmed.includes('public class ') ||
    trimmed.includes('#include')
  ) {
    formatDetected = 'Source Code';
  } else if (
    trimmed.includes('```') ||
    /^#+\s/m.test(trimmed) ||
    /(\*\*|__).+(\*\*|__)/.test(trimmed) ||
    /\[.+\]\(.+\)/.test(trimmed)
  ) {
    formatDetected = 'Markdown Document';
  } else if (/^(\s*[-*•]|\s*\d+\.)\s+/m.test(trimmed)) {
    formatDetected = 'Hierarchical List';
  } else if (
    trimmed.split('\n').filter(Boolean).length >= 4 &&
    trimmed.split('\n').every(l => l.trim().length < 60)
  ) {
    formatDetected = 'Poetry / Stanzas';
  }

  // Japanese
  const hiraganaKatakana = (sample.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  const kanji = (sample.match(/[\u4E00-\u9FAF]/g) || []).length;
  if (hiraganaKatakana >= 2 || (hiraganaKatakana > 0 && kanji > 0)) {
    return {
      name: 'Japanese',
      nativeName: '日本語',
      code: 'ja',
      confidence: 98,
      family: 'Japonic',
      script: 'Kanji & Kana',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Korean
  const hangul = (sample.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length;
  if (hangul >= 2) {
    return {
      name: 'Korean',
      nativeName: '한국어',
      code: 'ko',
      confidence: 99,
      family: 'Koreanic',
      script: 'Hangul',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Chinese
  if (kanji >= 3 && hiraganaKatakana === 0) {
    const hasTrad = /[體國學時電門發華]/g.test(sample);
    return {
      name: hasTrad ? 'Traditional Chinese' : 'Simplified Chinese',
      nativeName: hasTrad ? '繁體中文' : '简体中文',
      code: 'zh',
      confidence: 96,
      family: 'Sino-Tibetan',
      script: 'Hanzi',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Arabic / Urdu / Persian
  const arabicChars = (sample.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  if (arabicChars >= 3) {
    const isUrdu = /[ٹڈڑںےہبھتھ]/g.test(sample) || sample.includes('ہے') || sample.includes('ہیں');
    const isPersian = /[پچژگ]/g.test(sample) || sample.includes('است') || sample.includes('این');
    if (isUrdu) {
      return {
        name: 'Urdu',
        nativeName: 'اردو',
        code: 'ur',
        confidence: 95,
        family: 'Indo-Aryan',
        script: 'Arabic (Nastaliq)',
        direction: 'rtl',
        formatDetected,
      };
    }
    if (isPersian) {
      return {
        name: 'Persian',
        nativeName: 'فارسی',
        code: 'fa',
        confidence: 95,
        family: 'Iranian',
        script: 'Perso-Arabic',
        direction: 'rtl',
        formatDetected,
      };
    }
    return {
      name: 'Arabic',
      nativeName: 'العربية',
      code: 'ar',
      confidence: 97,
      family: 'Afroasiatic',
      script: 'Arabic',
      direction: 'rtl',
      formatDetected,
    };
  }

  // Cyrillic (Russian / Ukrainian)
  const cyrillic = (sample.match(/[\u0400-\u04FF]/g) || []).length;
  if (cyrillic >= 3) {
    const isUkrainian = /[іїєґ]/i.test(sample);
    return {
      name: isUkrainian ? 'Ukrainian' : 'Russian',
      nativeName: isUkrainian ? 'Українська' : 'Русский',
      code: isUkrainian ? 'uk' : 'ru',
      confidence: 96,
      family: 'Indo-European (Slavic)',
      script: 'Cyrillic',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Devanagari (Hindi)
  const devanagari = (sample.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagari >= 3) {
    return {
      name: 'Hindi',
      nativeName: 'हिन्दी',
      code: 'hi',
      confidence: 98,
      family: 'Indo-Aryan',
      script: 'Devanagari',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Hebrew
  const hebrew = (sample.match(/[\u0590-\u05FF]/g) || []).length;
  if (hebrew >= 3) {
    return {
      name: 'Hebrew',
      nativeName: 'עברית',
      code: 'he',
      confidence: 97,
      family: 'Afroasiatic',
      script: 'Hebrew',
      direction: 'rtl',
      formatDetected,
    };
  }

  // Greek
  const greek = (sample.match(/[\u0370-\u03FF]/g) || []).length;
  if (greek >= 3) {
    return {
      name: 'Greek',
      nativeName: 'Ελληνικά',
      code: 'el',
      confidence: 98,
      family: 'Hellenic',
      script: 'Greek',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Thai
  const thai = (sample.match(/[\u0E00-\u0E7F]/g) || []).length;
  if (thai >= 3) {
    return {
      name: 'Thai',
      nativeName: 'ไทย',
      code: 'th',
      confidence: 98,
      family: 'Kra-Dai',
      script: 'Thai',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Common Latin
  const lower = sample.toLowerCase();
  if (/[äöüß]/.test(lower) || /\b(und|der|die|das|nicht|ein|eine|ist|mit)\b/i.test(lower)) {
    return { name: 'German', nativeName: 'Deutsch', code: 'de', confidence: 92, family: 'Germanic', script: 'Latin', direction: 'ltr', formatDetected };
  }
  if (/[éèêëàâùûçœ]/i.test(lower) || /\b(le|la|les|un|une|des|est|dans|pour|avec)\b/i.test(lower)) {
    return { name: 'French', nativeName: 'Français', code: 'fr', confidence: 92, family: 'Romance', script: 'Latin', direction: 'ltr', formatDetected };
  }
  if (/[ñáéíóúü¿¡]/i.test(lower) || /\b(el|la|los|las|un|una|en|por|para|con|que)\b/i.test(lower)) {
    return { name: 'Spanish', nativeName: 'Español', code: 'es', confidence: 92, family: 'Romance', script: 'Latin', direction: 'ltr', formatDetected };
  }
  if (/[ãõçáéíóú]/i.test(lower) || /\b(o|a|os|as|um|uma|em|por|para|com|não)\b/i.test(lower)) {
    return { name: 'Portuguese', nativeName: 'Português', code: 'pt', confidence: 92, family: 'Romance', script: 'Latin', direction: 'ltr', formatDetected };
  }
  if (/\b(the|and|is|in|it|you|that|was|for|on|are|as|with|this|have)\b/i.test(lower)) {
    return { name: 'English', nativeName: 'English', code: 'en', confidence: 95, family: 'Germanic', script: 'Latin', direction: 'ltr', formatDetected };
  }

  return {
    name: 'Auto Detect',
    nativeName: 'Auto Detect',
    code: 'auto',
    confidence: 60,
    family: 'Undetermined',
    script: 'Latin',
    direction: 'ltr',
    formatDetected,
  };
}

// Utility to clean markdown fences if Gemini outputs them
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

// Helper to call generateContent with retry and fallback across candidate models
// Uses gemini-3.1-flash-lite as primary high-throughput model, and gemini-3.7-flash as fallback
async function generateWithFallback(params: {
  contents: any;
  systemInstruction: string;
  responseSchema?: any;
  responseMimeType?: string;
  temperature?: number;
}) {
  const ai = getGeminiClient();
  // Primary: gemini-3.1-flash-lite (fast, light, high quota availability), Secondary: gemini-3.7-flash
  const models = ['gemini-3.1-flash-lite', 'gemini-3.7-flash'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.1,
            responseMimeType: params.responseMimeType,
            responseSchema: params.responseSchema,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Model ${model} attempt ${attempt} error:`, errMsg);

        // If rate limit 429 or 503, wait briefly before next attempt
        if (errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        } else {
          await new Promise((resolve) => setTimeout(resolve, attempt * 400));
        }
      }
    }
  }

  // Format clean error message if all fail
  let userMessage = 'Translation service encountered a temporary error. Please try again.';
  if (lastError) {
    const rawMsg = lastError.message || String(lastError);
    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
      userMessage = 'Gemini API quota rate limit reached. Please wait a few moments and click Retry.';
    } else if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
      userMessage = 'AI model is currently under high demand. Please click Retry in a few moments.';
    } else {
      userMessage = rawMsg;
    }
  }

  const errToThrow = new Error(userMessage);
  (errToThrow as any).originalError = lastError;
  throw errToThrow;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ABDUL Translator', timestamp: Date.now() });
});

// Fast real-time language detection endpoint (uses local heuristic first to preserve quota)
app.post('/api/detect', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    // Check cache
    const cacheKey = `detect:${text.slice(0, 500)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Use fast local detection first
    const localResult = detectLanguageLocally(text);
    if (localResult.confidence >= 90 || localResult.code !== 'auto') {
      setCache(cacheKey, localResult);
      return res.json(localResult);
    }

    // If ambiguous, call Gemini model
    const snippet = text.slice(0, 1000);
    const systemInstruction = `You are a fast language identification model.
Analyze the provided text and output a JSON object with:
1. "name": Language name in English (e.g., "Japanese", "Arabic", "Spanish", "Russian", "Hindi", "French", "German", "Urdu", "Korean", "Chinese", etc.)
2. "nativeName": Language name in its native script (e.g., "日本語", "العربية", "Español", "हिन्दी", "Русский", "اردو", "한국어")
3. "code": ISO 639-1 two-letter code (e.g., "ja", "ar", "es", "hi", "ru", "ur", "ko", "zh")
4. "confidence": Integer 0 to 100
5. "family": Language family (e.g., "Japonic", "Afroasiatic", "Indo-European", "Sino-Tibetan", "Dravidian")
6. "script": Script name (e.g., "Kanji & Kana", "Arabic", "Latin", "Devanagari", "Cyrillic", "Hangul")
7. "direction": "ltr" or "rtl"
8. "formatDetected": Content format (e.g., "Source Code", "Markdown", "Poetry / Lyrics", "JSON", "Plain Text", "List / Table")`;

    const responseText = await generateWithFallback({
      contents: `Detect language for:\n"""\n${snippet}\n"""`,
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          nativeName: { type: Type.STRING },
          code: { type: Type.STRING },
          confidence: { type: Type.INTEGER },
          family: { type: Type.STRING },
          script: { type: Type.STRING },
          direction: { type: Type.STRING },
          formatDetected: { type: Type.STRING },
        },
        required: ['name', 'nativeName', 'code', 'confidence', 'family', 'script', 'direction', 'formatDetected'],
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(responseText));
    setCache(cacheKey, parsed);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Detection fallback error:', error);
    // On any error, return local heuristic detection without failing the UI
    const fallbackResult = detectLanguageLocally(req.body?.text || '');
    return res.json(fallbackResult);
  }
});

// Extract text from uploaded document / image (OCR for PNG, JPG, PDF, etc.)
app.post('/api/extract-file', async (req, res) => {
  try {
    const { file } = req.body;
    if (!file || !file.base64 || !file.mimeType) {
      return res.status(400).json({ error: 'Valid file with base64 data and mimeType is required.' });
    }

    const systemInstruction = `You are ABDUL Document & Image OCR Extractor.
Extract all visible text from this document or image with high precision:
- Preserve original layout, blank lines, line breaks, paragraph breaks, table formatting, and indentation.
- Do not translate or change any words yet; extract the exact original text.
- Also detect the primary source language of the document.`;

    const prompt = `Extract all text exactly as formatted from this uploaded document/image (${file.name || 'file'}).`;

    const contents = [
      {
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64,
        },
      },
      { text: prompt },
    ];

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        extractedText: {
          type: Type.STRING,
          description: 'The exact extracted text from the document or image preserving line breaks, indentation, and structure.',
        },
        detectedLanguage: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            nativeName: { type: Type.STRING },
            code: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            family: { type: Type.STRING },
            script: { type: Type.STRING },
            direction: { type: Type.STRING },
            formatDetected: { type: Type.STRING },
            formatNotes: { type: Type.STRING },
          },
          required: ['name', 'nativeName', 'code', 'confidence', 'family', 'script', 'direction', 'formatDetected'],
        },
      },
      required: ['extractedText', 'detectedLanguage'],
    };

    const responseText = await generateWithFallback({
      contents,
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    });

    const parsedData = JSON.parse(cleanJsonOutput(responseText));
    return res.json(parsedData);
  } catch (error: any) {
    console.error('File extraction error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract text from document/image.',
    });
  }
});

// Translation & Language Detection API Endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, file, formattingGuidance, targetLanguage } = req.body;

    if ((!text || typeof text !== 'string' || !text.trim()) && (!file || !file.base64)) {
      return res.status(400).json({ error: 'Text or file is required for translation.' });
    }

    // Determine target language (English by default)
    const targetLangName = (typeof targetLanguage === 'object' && targetLanguage?.name)
      ? targetLanguage.name
      : (typeof targetLanguage === 'string' && targetLanguage.trim() ? targetLanguage.trim() : 'English');
    const targetLangCode = (typeof targetLanguage === 'object' && targetLanguage?.code)
      ? targetLanguage.code
      : (targetLangName.toLowerCase() === 'english' ? 'en' : 'auto');
    const targetLangNative = (typeof targetLanguage === 'object' && targetLanguage?.nativeName)
      ? targetLanguage.nativeName
      : targetLangName;
    const targetLangDir = (typeof targetLanguage === 'object' && targetLanguage?.direction)
      ? targetLanguage.direction
      : (['ar', 'he', 'fa', 'ur'].includes(targetLangCode) ? 'rtl' : 'ltr');

    // Check cache for text translations
    const cacheKey = file
      ? null
      : `translate:${text}:${targetLangCode}:${formattingGuidance || ''}`;

    if (cacheKey) {
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const systemInstruction = `You are ABDUL Translator: an expert polyglot translation engine.
Your task has TWO critical requirements:
1. DETECT THE SOURCE LANGUAGE:
   - Identify the source language accurately.
   - Provide the source language name in English (e.g., "Japanese", "Standard Arabic", "German", "Hindi", "Russian", "Brazilian Portuguese", "Urdu", "Korean", "Chinese", "French").
   - Provide the source language name in its native script (e.g., "日本語", "العربية", "Deutsch", "हिन्दी", "Русский", "Português", "اردو", "한국어").
   - Provide the ISO 639-1 code (e.g., "ja", "ar", "de", "hi", "ru", "pt", "ur", "ko", "zh").
   - Calculate confidence score 0 to 100.
   - Identify writing script (e.g., "Kanji & Kana", "Latin", "Cyrillic", "Devanagari", "Arabic", "Hangul", "Greek", "Thai").
   - Identify language family (e.g., "Japonic", "Indo-European", "Afroasiatic", "Sino-Tibetan", "Dravidian", "Turkic").
   - Identify direction: "ltr" or "rtl".
   - Detect format type (e.g., "Document / PDF Page", "Image / Screenshot OCR", "Poetry / Lyrics", "Source Code", "Markdown Document", "JSON / Structured Data", "Hierarchical List", "Plain Text").
   - Provide a brief note explaining preserved structure.

2. TRANSLATE TO ${targetLangName.toUpperCase()} (${targetLangCode}) WITH STRICT 100% FORMAT PRESERVATION:
   - The translated text MUST ALWAYS be strictly in ${targetLangName}.
   - If the input language is already ${targetLangName}, retain the original text and set isOriginalEnglish to ${targetLangCode === 'en' ? 'true' : 'false'}.
   - CRITICAL FORMAT PRESERVATION RULES:
     a) Exact Line Breaks & Blank Lines: Mirror exact newlines, blank lines, and verse breaks.
     b) Indentation & Alignment: Match exact leading spaces, tabs, and columns.
     c) Markdown & Code Syntax: Retain all markdown tags, code symbols, variable names, docstrings formatting, JSON keys, and markup intact.
     d) Punctuation & Quotes: Preserve punctuation rhythms, brackets, and quotes.`;

    let contents: any;

    if (file && file.base64 && file.mimeType) {
      const prompt = `Analyze this uploaded document/image (${file.name || 'file'}), extract its original text, detect its language, and translate it to ${targetLangName} with 100% format and layout preservation.
${formattingGuidance ? `Special Note: ${formattingGuidance}` : ''}`;

      contents = [
        {
          inlineData: {
            mimeType: file.mimeType,
            data: file.base64,
          },
        },
        { text: prompt },
      ];
    } else {
      const prompt = `Input Text to Analyze & Translate to ${targetLangName}:
"""
${text}
"""
${formattingGuidance ? `Special Note: ${formattingGuidance}` : ''}`;
      contents = prompt;
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        detectedLanguage: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            nativeName: { type: Type.STRING },
            code: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            family: { type: Type.STRING },
            script: { type: Type.STRING },
            direction: { type: Type.STRING },
            formatDetected: { type: Type.STRING },
            formatNotes: { type: Type.STRING },
          },
          required: ['name', 'nativeName', 'code', 'confidence', 'family', 'script', 'direction', 'formatDetected'],
        },
        detectedDialect: { type: Type.STRING },
        isOriginalEnglish: { type: Type.BOOLEAN },
        extractedSourceText: {
          type: Type.STRING,
          description: 'If a document or image was provided, the original extracted source text verbatim.',
        },
        translatedText: { type: Type.STRING },
      },
      required: ['detectedLanguage', 'isOriginalEnglish', 'translatedText'],
    };

    const responseText = await generateWithFallback({
      contents,
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    });

    const parsedData = JSON.parse(cleanJsonOutput(responseText));

    const finalSourceText = text || parsedData.extractedSourceText || '';
    const origLines = finalSourceText.split('\n').length;
    const transLines = (parsedData.translatedText || '').split('\n').length;
    const origWords = finalSourceText.trim() ? finalSourceText.trim().split(/\s+/).length : 0;
    const transWords = parsedData.translatedText?.trim() ? parsedData.translatedText.trim().split(/\s+/).length : 0;

    const result = {
      ...parsedData,
      targetLanguage: {
        code: targetLangCode,
        name: targetLangName,
        nativeName: targetLangNative,
        direction: targetLangDir,
      },
      originalText: finalSourceText,
      timestamp: Date.now(),
      stats: {
        originalLines: origLines,
        translatedLines: transLines,
        originalWords: origWords,
        translatedWords: transWords,
        originalChars: finalSourceText.length,
        translatedChars: (parsedData.translatedText || '').length,
      },
    };

    if (cacheKey) {
      setCache(cacheKey, result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Translation endpoint error:', error);
    
    let errorMessage = error?.message || 'Translation service encountered an error. Please try again.';
    return res.status(500).json({
      error: errorMessage,
    });
  }
});

// Vite middleware for dev / static build for production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ABDUL Translator Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
