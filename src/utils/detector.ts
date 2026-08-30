import { LanguageDetection } from '../types';

export function detectLanguageHeuristically(text: string): LanguageDetection {
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

  // Detect Format
  let formatDetected = 'Plain Text';
  if (/^(\s*[{[])[\s\S]*([}\]]\s*)$/.test(trimmed) || (trimmed.includes('":') && trimmed.includes('{'))) {
    formatDetected = 'JSON / Structured Data';
  } else if (
    trimmed.includes('def ') ||
    trimmed.includes('function ') ||
    trimmed.includes('import ') ||
    trimmed.includes('class ') ||
    trimmed.includes('const ') ||
    trimmed.includes('let ') ||
    trimmed.includes('public class ') ||
    trimmed.includes('#include') ||
    trimmed.includes('fn main()')
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
    trimmed.split('\n').every(line => line.trim().length < 60)
  ) {
    formatDetected = 'Poetry / Stanzas';
  }

  // Detect Script & Language by Character Ranges & Patterns
  // 1. Japanese (Hiragana / Katakana)
  const hiraganaKatakanaCount = (sample.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  const kanjiCount = (sample.match(/[\u4E00-\u9FAF]/g) || []).length;

  if (hiraganaKatakanaCount >= 2 || (hiraganaKatakanaCount > 0 && kanjiCount > 0)) {
    return {
      name: 'Japanese',
      nativeName: '日本語',
      code: 'ja',
      confidence: 98,
      family: 'Japonic',
      script: 'Kanji & Kana',
      direction: 'ltr',
      formatDetected,
      formatNotes: 'Identified Hiragana / Katakana / Kanji characters.',
    };
  }

  // 2. Korean (Hangul)
  const hangulCount = (sample.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length;
  if (hangulCount >= 2) {
    return {
      name: 'Korean',
      nativeName: '한국어',
      code: 'ko',
      confidence: 99,
      family: 'Koreanic',
      script: 'Hangul',
      direction: 'ltr',
      formatDetected,
      formatNotes: 'Identified Korean Hangul syllables.',
    };
  }

  // 3. Chinese (Hanzi without Kana)
  if (kanjiCount >= 3 && hiraganaKatakanaCount === 0) {
    // Check traditional vs simplified markers
    const hasTraditional = /[體國學時電門發華]/g.test(sample);
    return {
      name: hasTraditional ? 'Traditional Chinese' : 'Simplified Chinese',
      nativeName: hasTraditional ? '繁體中文' : '简体中文',
      code: 'zh',
      confidence: 96,
      family: 'Sino-Tibetan',
      script: 'Hanzi',
      direction: 'ltr',
      formatDetected,
      formatNotes: 'Identified Hanzi characters.',
    };
  }

  // 4. Arabic / Persian / Urdu (RTL)
  const arabicChars = (sample.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  if (arabicChars >= 3) {
    // Check specific Persian or Urdu letters
    const isUrdu = /[ٹڈڑںےہبھتھ]/g.test(sample) || sample.includes('ہے') || sample.includes('ہیں') || sample.includes('اور');
    const isPersian = /[پچژگ]/g.test(sample) || sample.includes('است') || sample.includes('این') || sample.includes('یک');

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
        formatNotes: 'Right-to-left layout preserved.',
      };
    }

    if (isPersian) {
      return {
        name: 'Persian (Farsi)',
        nativeName: 'فارسی',
        code: 'fa',
        confidence: 95,
        family: 'Iranian',
        script: 'Perso-Arabic',
        direction: 'rtl',
        formatDetected,
        formatNotes: 'Right-to-left layout preserved.',
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
      formatNotes: 'Right-to-left layout preserved.',
    };
  }

  // 5. Cyrillic (Russian, Ukrainian, etc.)
  const cyrillicCount = (sample.match(/[\u0400-\u04FF]/g) || []).length;
  if (cyrillicCount >= 3) {
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
      formatNotes: 'Identified Cyrillic script.',
    };
  }

  // 6. Devanagari (Hindi, Marathi, Sanskrit, Nepali)
  const devanagariCount = (sample.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount >= 3) {
    return {
      name: 'Hindi',
      nativeName: 'हिन्दी',
      code: 'hi',
      confidence: 98,
      family: 'Indo-Aryan',
      script: 'Devanagari',
      direction: 'ltr',
      formatDetected,
      formatNotes: 'Identified Devanagari script.',
    };
  }

  // 7. Hebrew
  const hebrewCount = (sample.match(/[\u0590-\u05FF]/g) || []).length;
  if (hebrewCount >= 3) {
    return {
      name: 'Hebrew',
      nativeName: 'עברית',
      code: 'he',
      confidence: 97,
      family: 'Afroasiatic (Semitic)',
      script: 'Hebrew',
      direction: 'rtl',
      formatDetected,
      formatNotes: 'Right-to-left layout preserved.',
    };
  }

  // 8. Thai
  const thaiCount = (sample.match(/[\u0E00-\u0E7F]/g) || []).length;
  if (thaiCount >= 3) {
    return {
      name: 'Thai',
      nativeName: 'ไทย',
      code: 'th',
      confidence: 98,
      family: 'Kra-Dai',
      script: 'Thai',
      direction: 'ltr',
      formatDetected,
      formatNotes: 'Identified Thai script.',
    };
  }

  // 9. Greek
  const greekCount = (sample.match(/[\u0370-\u03FF]/g) || []).length;
  if (greekCount >= 3) {
    return {
      name: 'Greek',
      nativeName: 'Ελληνικά',
      code: 'el',
      confidence: 98,
      family: 'Hellenic',
      script: 'Greek',
      direction: 'ltr',
      formatDetected,
      formatNotes: 'Identified Greek alphabet.',
    };
  }

  // 10. Latin-based languages (English, Spanish, French, German, Italian, Portuguese, Turkish, Vietnamese, etc.)
  const lower = sample.toLowerCase();
  
  // Vietnamese
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(sample)) {
    return {
      name: 'Vietnamese',
      nativeName: 'Tiếng Việt',
      code: 'vi',
      confidence: 95,
      family: 'Austroasiatic',
      script: 'Latin (Quốc ngữ)',
      direction: 'ltr',
      formatDetected,
    };
  }

  // German
  if (/[äöüß]/.test(lower) || /\b(und|der|die|das|nicht|ein|eine|einer|eines|mit|auf|für|ist|sind|wir|sie|sieht)\b/i.test(lower)) {
    return {
      name: 'German',
      nativeName: 'Deutsch',
      code: 'de',
      confidence: 92,
      family: 'Indo-European (Germanic)',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
  }

  // French
  if (/[éèêëàâùûçœ]/i.test(lower) || /\b(le|la|les|un|une|des|et|est|dans|pour|avec|que|qui|ce|cette|sont|nous|vous)\b/i.test(lower)) {
    return {
      name: 'French',
      nativeName: 'Français',
      code: 'fr',
      confidence: 92,
      family: 'Indo-European (Romance)',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Spanish
  if (/[ñáéíóúü¿¡]/i.test(lower) || /\b(el|la|los|las|un|una|unos|unas|y|en|por|para|con|que|es|son|como|del|al)\b/i.test(lower)) {
    return {
      name: 'Spanish',
      nativeName: 'Español',
      code: 'es',
      confidence: 92,
      family: 'Indo-European (Romance)',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Portuguese
  if (/[ãõçáéíóúâêô]/i.test(lower) || /\b(o|a|os|as|um|uma|e|em|por|para|com|que|é|são|não|do|da|dos|das)\b/i.test(lower)) {
    return {
      name: 'Portuguese',
      nativeName: 'Português',
      code: 'pt',
      confidence: 92,
      family: 'Indo-European (Romance)',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Italian
  if (/\b(il|lo|la|i|gli|le|un|uno|una|ed|in|per|con|che|è|sono|del|della|degli)\b/i.test(lower)) {
    return {
      name: 'Italian',
      nativeName: 'Italiano',
      code: 'it',
      confidence: 90,
      family: 'Indo-European (Romance)',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
  }

  // Turkish
  if (/[ğışçöüİ]/i.test(sample) || /\b(ve|bir|bu|da|de|için|ile|çok|daha|olarak|gibi)\b/i.test(lower)) {
    return {
      name: 'Turkish',
      nativeName: 'Türkçe',
      code: 'tr',
      confidence: 92,
      family: 'Turkic',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
  }

  // English (Default Latin check)
  if (/\b(the|and|is|in|it|you|that|he|was|for|on|are|as|with|his|they|at|be|this|from|have|or|by|one|had|not|but|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if)\b/i.test(lower)) {
    return {
      name: 'English',
      nativeName: 'English',
      code: 'en',
      confidence: 95,
      family: 'Indo-European (Germanic)',
      script: 'Latin',
      direction: 'ltr',
      formatDetected,
    };
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
