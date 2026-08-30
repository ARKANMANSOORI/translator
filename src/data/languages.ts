export interface TargetLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  direction?: 'ltr' | 'rtl';
  region?: string;
}

export const LANGUAGE_REGIONS = [
  'All',
  'Popular',
  'European',
  'Asian',
  'Middle Eastern',
  'South Asian',
  'African',
  'Classical',
] as const;

export type LanguageRegion = typeof LANGUAGE_REGIONS[number];

export const TARGET_LANGUAGES: TargetLanguage[] = [
  // DEFAULT & POPULAR
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr', region: 'Popular' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', region: 'Popular' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', region: 'Popular' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', region: 'Popular' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', region: 'Popular' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr', region: 'Popular' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', direction: 'rtl', region: 'Popular' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', direction: 'ltr', region: 'Popular' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', region: 'Popular' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', region: 'Popular' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr', region: 'Popular' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', region: 'Popular' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr', region: 'Popular' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', direction: 'ltr', region: 'Popular' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', direction: 'ltr', region: 'Popular' },

  // EUROPEAN
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', direction: 'ltr', region: 'European' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', direction: 'ltr', region: 'European' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', direction: 'ltr', region: 'European' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', direction: 'ltr', region: 'European' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', direction: 'ltr', region: 'European' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', direction: 'ltr', region: 'European' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', direction: 'ltr', region: 'European' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', direction: 'ltr', region: 'European' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', direction: 'ltr', region: 'European' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', direction: 'ltr', region: 'European' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', direction: 'ltr', region: 'European' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', direction: 'ltr', region: 'European' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', direction: 'ltr', region: 'European' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', direction: 'ltr', region: 'European' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', direction: 'ltr', region: 'European' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', direction: 'ltr', region: 'European' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', direction: 'ltr', region: 'European' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', direction: 'ltr', region: 'European' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', direction: 'ltr', region: 'European' },
  { code: 'ga', name: 'Irish (Gaeilge)', nativeName: 'Gaeilge', flag: '🇮🇪', direction: 'ltr', region: 'European' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', direction: 'ltr', region: 'European' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸', direction: 'ltr', region: 'European' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸', direction: 'ltr', region: 'European' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸', direction: 'ltr', region: 'European' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹', direction: 'ltr', region: 'European' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', direction: 'ltr', region: 'European' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', direction: 'ltr', region: 'European' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦', direction: 'ltr', region: 'European' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾', direction: 'ltr', region: 'European' },

  // ASIAN & EAST ASIAN
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', direction: 'ltr', region: 'Asian' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr', region: 'Asian' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', direction: 'ltr', region: 'Asian' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', direction: 'ltr', region: 'Asian' },
  { code: 'tl', name: 'Filipino (Tagalog)', nativeName: 'Wikang Tagalog', flag: '🇵🇭', direction: 'ltr', region: 'Asian' },
  { code: 'my', name: 'Burmese (Myanmar)', nativeName: 'မြန်မာစာ', flag: '🇲🇲', direction: 'ltr', region: 'Asian' },
  { code: 'km', name: 'Khmer (Cambodian)', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭', direction: 'ltr', region: 'Asian' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flag: '🇱🇦', direction: 'ltr', region: 'Asian' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол хэл', flag: '🇲🇳', direction: 'ltr', region: 'Asian' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', direction: 'ltr', region: 'Asian' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', direction: 'ltr', region: 'Asian' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿', direction: 'ltr', region: 'Asian' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', flag: '🇰🇿', direction: 'ltr', region: 'Asian' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', flag: '🇺🇿', direction: 'ltr', region: 'Asian' },

  // MIDDLE EASTERN & SEMITIC
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', flag: '🇮🇷', direction: 'rtl', region: 'Middle Eastern' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', direction: 'rtl', region: 'Middle Eastern' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫', direction: 'rtl', region: 'Middle Eastern' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî / کوردی', flag: '🇮🇶', direction: 'ltr', region: 'Middle Eastern' },

  // SOUTH ASIAN / INDIC
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', direction: 'ltr', region: 'South Asian' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', direction: 'ltr', region: 'South Asian' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', direction: 'ltr', region: 'South Asian' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', direction: 'ltr', region: 'South Asian' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🕉️', direction: 'ltr', region: 'South Asian' },

  // AFRICAN
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', direction: 'ltr', region: 'African' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', direction: 'ltr', region: 'African' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬', direction: 'ltr', region: 'African' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬', direction: 'ltr', region: 'African' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬', direction: 'ltr', region: 'African' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', direction: 'ltr', region: 'African' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', direction: 'ltr', region: 'African' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaaliga', flag: '🇸🇴', direction: 'ltr', region: 'African' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', direction: 'ltr', region: 'African' },

  // CLASSICAL & HISTORICAL
  { code: 'la', name: 'Latin', nativeName: 'Lingua Latina', flag: '🏛️', direction: 'ltr', region: 'Classical' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', flag: '🌐', direction: 'ltr', region: 'Classical' },
];

export const DEFAULT_TARGET_LANGUAGE = TARGET_LANGUAGES[0]; // English is always the strict default
