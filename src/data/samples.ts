import { SamplePreset } from '../types';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'jp-code',
    title: 'Japanese Code & Docstrings',
    category: 'code',
    languageName: 'Japanese',
    languageCode: 'ja',
    formatType: 'TypeScript / Code Syntax',
    description: 'Code comments and string literals with intact braces and types',
    text: `/**
 * ユーザー認証モジュール
 * @param {string} userId - 一意の識別子
 * @param {boolean} isAdmin - 管理者権限フラグ
 * @returns {Promise<AuthResult>} 認証結果オブジェクト
 */
export async function authenticateUser(userId: string, isAdmin: boolean) {
  // キャッシュからセッションを確認する
  const session = await checkSessionCache(userId);

  if (!session) {
    // セッションが見つからない場合はエラーをスロー
    throw new Error("有効なセッションが見つかりません。再ログインしてください。");
  }

  // 権限レベルの検証
  if (isAdmin && session.role !== 'SUPER_ADMIN') {
    return {
      status: "DENIED",
      message: "管理者権限が不足しています。"
    };
  }

  return {
    status: "SUCCESS",
    message: "認証が正常に完了しました。"
  };
}`,
  },
  {
    id: 'es-markdown',
    title: 'Spanish Markdown Document',
    category: 'markdown',
    languageName: 'Spanish',
    languageCode: 'es',
    formatType: 'Markdown with Tables & Checklist',
    description: 'Headers, formatting, links, and markdown table layout',
    text: `# Plan de Lanzamiento del Producto 🚀

Este documento detalla las **prioridades estratégicas** para el próximo trimestre.

### Objetivos Clave:
- [x] Completar las pruebas de integración en el servidor
- [ ] Optimizar la velocidad de carga en dispositivos móviles
- [ ] Traducir toda la documentación técnica al inglés

> **Nota importante:** Todos los cambios deben ser revisados por el equipo de seguridad antes del despliegue en producción.

### Comparativa de Rendimiento:
| Métrica | Antes | Meta Actual | Estado |
| :--- | :---: | :---: | :--- |
| Latencia API | 420ms | < 120ms | 🟡 En progreso |
| Tasa de Conversión | 3.2% | 5.0% | 🟢 Alcanzado |
| Satisfacción del Usuario | 84% | 95% | 🔵 Planificado |

Para más información, consulte [nuestra guía interna](https://example.com/guia).`,
  },
  {
    id: 'fr-json',
    title: 'French JSON Localization',
    category: 'json',
    languageName: 'French',
    languageCode: 'fr',
    formatType: 'JSON Key-Value Pairs',
    description: 'Valid JSON keys preserved with only string values translated',
    text: `{
  "app": {
    "title": "Plateforme de Traduction Universelle",
    "description": "Détection automatique et préservation stricte du format.",
    "version": "2.4.0",
    "navigation": {
      "home": "Accueil",
      "history": "Historique des traductions",
      "settings": "Paramètres du compte",
      "logout": "Se déconnecter"
    },
    "notifications": {
      "success": "Votre document a été traduit avec succès!",
      "error": "Une erreur inattendue est survenue lors du traitement.",
      "pending": "Traduction en cours, veuillez patienter..."
    },
    "features": [
      "Prise en charge de plus de 100 langues",
      "Conservation exacte des sauts de ligne et de l'indentation",
      "Synthèse vocale en anglais intégrée"
    ]
  }
}`,
  },
  {
    id: 'ar-poetry',
    title: 'Arabic Poetry & Indentations',
    category: 'poetry',
    languageName: 'Arabic',
    languageCode: 'ar',
    formatType: 'RTL Stanzas & Indented Verses',
    description: 'Classical verse with preserved stanza breaks and hemistichs',
    text: `على قدر أهل العزم تأتي العزائمُ
   وتأتي على قدر الكرام المكارمُ

وتعظم في عين الصغير صغارها
   وتصغر في عين العظيم العظائمُ

يُكلف سيف الدولة الجيش همه
   وقد عجزت عنه الجيوش الخضارمُ

هل الحدث الحمراء تعرف لونها
   وتعلم أي الساقيين الغمائمُ`,
  },
  {
    id: 'de-list',
    title: 'German Technical Checklist',
    category: 'list',
    languageName: 'German',
    languageCode: 'de',
    formatType: 'Deeply Nested Numbered Hierarchy',
    description: 'Complex nested bullet points and technical instructions',
    text: `1. Vorbereitung des Hochdrucksystems
   1.1. Überprüfung der Sicherheitsventile
        a) Druckanzeige kalibrieren (Sollwert: 12,5 Bar)
        b) Dichtungen auf Verschleiß oder Risse untersuchen
   1.2. Elektrische Anschlüsse überprüfen
        - Hauptstromschalter ausschalten und verriegeln
        - Erdungskabel auf korrekten Widerstand (< 0,5 Ohm) messen
2. Durchführung des Testlaufs
   2.1. Kühlmittelkreislauf aktivieren
        * Minimaler Durchfluss: 45 Liter pro Minute
        * Maximale Temperatur: 65 °C
   2.2. Protokollierung der Betriebsdaten
        [x] Durchflussrate im Systemprotokoll speichern
        [ ] Abweichungen unverzüglich an die Schichtleitung melden`,
  },
  {
    id: 'hi-recipe',
    title: 'Hindi Structured Recipe',
    category: 'table',
    languageName: 'Hindi',
    languageCode: 'hi',
    formatType: 'Numbered Steps with Time Stamps',
    description: 'Devanagari script with ingredient tables and timing markers',
    text: `शाही पनीर बनाने की प्रामाणिक विधि 🍲

आवश्यक सामग्री की सूची:
• पनीर (पनीर के टुकड़े): 250 ग्राम
• ताज़ा मक्खन / घी: 2 बड़े चम्मच
• काजू का पेस्ट: 1/4 कप
• कस्तूरी मेथी: 1 छोटा चम्मच

बनाने की चरणबद्ध प्रक्रिया:
1. [00:00 - 05:00] एक कड़ाही में मक्खन गरम करें और उसमें दालचीनी और इलायची डालें।
2. [05:00 - 12:00] पिसे हुए प्याज और टमाटर का पेस्ट डालकर मध्यम आंच पर 7 मिनट तक भूनें।
3. [12:00 - 18:00] काजू का पेस्ट और ताज़ा क्रीम डालें, जब तक कि ग्रेवी से तेल अलग न होने लगे।
4. [18:00 - 22:00] पनीर के टुकड़े डालें और धीमी आंच पर 4 मिनट तक पकने दें।
5. [22:00 - 25:00] ऊपर से कस्तूरी मेथी और गरम मसाला छिड़क कर गरमा-गरम परोसें।`,
  },
  {
    id: 'ru-dialogue',
    title: 'Russian Chat & Dialogue Log',
    category: 'dialogue',
    languageName: 'Russian',
    languageCode: 'ru',
    formatType: 'Timestamped Chat Log & Markup',
    description: 'Timestamped conversational transcript with user handles',
    text: `[14:02:15] Анна (Руководитель проекта):
  Всем привет! Пожалуйста, обновите статусы ваших задач в трекере к концу дня.

[14:03:40] Дмитрий (Ведущий разработчик):
  Привет, Анна. Бэкенд для модуля авторизации уже готов и задеплоен на тестовый сервер.
  - API эндпоинты протестированы на 98% покрытия
  - Документация в Swagger обновлена

[14:05:10] Елена (UI/UX дизайнер):
  Макеты для мобильной версии готовы в Figma. Ссылка прикреплена в задаче #1429.
  Жду обратной связи от команды маркетинга!

[14:07:00] Анна (Руководитель проекта):
  Отличная работа, коллеги! Встречаемся завтра в 10:00 на общем стендапе.`,
  },
];
