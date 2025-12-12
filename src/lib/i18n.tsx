import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Lang = "en" | "fr" | "es";

type Messages = Record<string, string>;

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18N_STORAGE_KEY = "alchemy_lang";

const messages: Record<Lang, Messages> = {
  en: {
    // App
    "app.title": "Alchemy",
    "app.subtitle": "The Universal Converter",
    "app.description": "Paste anything. Get the clean version.",

    // Hero
    "hero.title": "Paste anything. Get the clean version.",
    "hero.subtitle": "Auto-detects JSON, colors, timestamps, JWT, Base64, and more. Instant transformations.",
    "hero.tryExample": "Try:",
    "hero.orDrop": "or drop any file",

    // Input
    "input.placeholder": "Paste here... (Ctrl+V)",
    "input.dropHint": "Or drop a file",
    "input.processing": "Transmuting...",
    "input.clear": "Clear",

    // Results
    "result.copy": "COPY",
    "result.copied": "Copied!",
    "result.download": "Download",
    "result.share": "Share",
    "result.shareLink": "Link copied!",

    // JSON
    "json.title": "Pretty JSON",
    "json.typescript": "TypeScript Interface",
    "json.minified": "Minified",

    // Color
    "color.title": "Color Detected",
    "color.hex": "HEX",
    "color.rgb": "RGB",
    "color.hsl": "HSL",
    "color.tailwind": "Tailwind",
    "color.complementary": "Complementary",

    // Timestamp
    "timestamp.title": "Timestamp Detected",
    "timestamp.local": "Local Time",
    "timestamp.utc": "UTC",
    "timestamp.relative": "Relative",
    "timestamp.iso": "ISO 8601",

    // HTML
    "html.title": "HTML Detected",
    "html.plainText": "Plain Text",
    "html.markdown": "Markdown",

    // Image
    "image.title": "Image Detected",
    "image.toWebp": "Convert to WebP",
    "image.toPng": "Convert to PNG",
    "image.toJpeg": "Convert to JPEG",
    "image.export": "Export",
    "image.colors": "Colors",
    "image.resize": "Resize",
    "image.quality": "Quality",
    "image.colorsHint": "Click to copy HEX code",
    "image.resizeHint": "Select ratio, image will fit inside frame",
    "image.newSize": "New size",
    "image.framePreview": "Image will fit inside this frame",

    // Code
    "code.title": "Code Detected",
    "code.beautified": "Beautified",
    "code.minified": "Minified",

    // Text
    "text.title": "Text Analysis",
    "text.characters": "Characters",
    "text.words": "Words",
    "text.lines": "Lines",
    "text.uppercase": "UPPERCASE",
    "text.lowercase": "lowercase",
    "text.titlecase": "Title Case",
    "text.camelcase": "camelCase",
    "text.pascalcase": "PascalCase",
    "text.snakecase": "snake_case",
    "text.kebabcase": "kebab-case",
    "text.constantcase": "CONSTANT_CASE",

    // JWT
    "jwt.title": "JWT Token Detected",
    "jwt.header": "Header",
    "jwt.payload": "Payload",
    "jwt.signature": "Signature",
    "jwt.expired": "Expired",
    "jwt.valid": "Valid",
    "jwt.issuedAt": "Issued",
    "jwt.expiresAt": "Expires",

    // Base64
    "base64.title": "Base64 Detected",
    "base64.encoded": "Encoded",
    "base64.decoded": "Decoded",

    // URL
    "url.title": "URL Encoded Detected",
    "url.encoded": "Encoded",
    "url.decoded": "Decoded",

    // Number
    "number.title": "Number Detected",
    "number.decimal": "Decimal",
    "number.hex": "Hexadecimal",
    "number.binary": "Binary",
    "number.octal": "Octal",

    // UUID
    "uuid.title": "UUID Detected",
    "uuid.version": "Version",
    "uuid.variant": "Variant",

    // Quick Tools
    "tools.title": "Quick Tools",
    "tools.uuid": "Generate UUID",
    "tools.lorem": "Lorem Ipsum",
    "tools.timestamp": "Current Timestamp",

    // History
    "history.title": "Recent",
    "history.empty": "No recent conversions",
    "history.clear": "Clear history",

    // Footer
    "footer.tagline": "🔒 Privacy First: Your data never leaves this browser tab.",
    "footer.powered": "Powered by",
    "footer.feedback": "Feedback",

    // Language
    "lang.en": "English",
    "lang.fr": "Français",
    "lang.es": "Español",

    // 404
    "notfound.title": "Page not found",
    "notfound.text": "The page you're looking for doesn't exist or has been moved.",
    "notfound.back": "Go back",
    "notfound.home": "Back to Alchemy",

    // Errors
    "error.invalidInput": "Could not detect input type",
    "error.imageTooLarge": "Image is too large (max 10MB)",
  },
  fr: {
    // App
    "app.title": "Alchemy",
    "app.subtitle": "Le Convertisseur Universel",
    "app.description": "Colle n'importe quoi. Obtiens la version propre.",

    // Hero
    "hero.title": "Colle n'importe quoi. Obtiens la version propre.",
    "hero.subtitle": "Détecte automatiquement JSON, couleurs, timestamps, JWT, Base64, et plus. Transformations instantanées.",
    "hero.tryExample": "Essaie :",
    "hero.orDrop": "ou dépose un fichier",

    // Input
    "input.placeholder": "Colle ici... (Ctrl+V)",
    "input.dropHint": "Ou dépose un fichier",
    "input.processing": "Transmutation...",
    "input.clear": "Effacer",

    // Results
    "result.copy": "COPIER",
    "result.copied": "Copié !",
    "result.download": "Télécharger",
    "result.share": "Partager",
    "result.shareLink": "Lien copié !",

    // JSON
    "json.title": "JSON Formaté",
    "json.typescript": "Interface TypeScript",
    "json.minified": "Minifié",

    // Color
    "color.title": "Couleur Détectée",
    "color.hex": "HEX",
    "color.rgb": "RGB",
    "color.hsl": "HSL",
    "color.tailwind": "Tailwind",
    "color.complementary": "Complémentaire",

    // Timestamp
    "timestamp.title": "Timestamp Détecté",
    "timestamp.local": "Heure Locale",
    "timestamp.utc": "UTC",
    "timestamp.relative": "Relatif",
    "timestamp.iso": "ISO 8601",

    // HTML
    "html.title": "HTML Détecté",
    "html.plainText": "Texte Brut",
    "html.markdown": "Markdown",

    // Image
    "image.title": "Image Détectée",
    "image.toWebp": "Convertir en WebP",
    "image.toPng": "Convertir en PNG",
    "image.toJpeg": "Convertir en JPEG",
    "image.export": "Exporter",
    "image.colors": "Couleurs",
    "image.resize": "Redim.",
    "image.quality": "Qualité",
    "image.colorsHint": "Cliquez pour copier le code HEX",
    "image.resizeHint": "Sélectionnez le ratio, l'image s'adaptera au cadre",
    "image.newSize": "Nouvelle taille",
    "image.framePreview": "L'image s'adaptera à ce cadre",

    // Code
    "code.title": "Code Détecté",
    "code.beautified": "Formaté",
    "code.minified": "Minifié",

    // Text
    "text.title": "Analyse de Texte",
    "text.characters": "Caractères",
    "text.words": "Mots",
    "text.lines": "Lignes",
    "text.uppercase": "MAJUSCULES",
    "text.lowercase": "minuscules",
    "text.titlecase": "Casse Titre",

    // History
    "history.title": "Récent",
    "history.empty": "Aucune conversion récente",
    "history.clear": "Effacer l'historique",

    // Footer
    "footer.tagline": "🔒 Vie Privée d'Abord : Tes données ne quittent jamais cet onglet.",
    "footer.powered": "Propulsé par",
    "footer.feedback": "Retour",

    // Language
    "lang.en": "Anglais",
    "lang.fr": "Français",
    "lang.es": "Espagnol",

    // 404
    "notfound.title": "Page introuvable",
    "notfound.text": "La page que vous cherchez n'existe pas ou a été déplacée.",
    "notfound.back": "Retour",
    "notfound.home": "Retour à Alchemy",

    // Errors
    "error.invalidInput": "Type d'entrée non détecté",
    "error.imageTooLarge": "Image trop volumineuse (max 10Mo)",
  },
  es: {
    // App
    "app.title": "Alchemy",
    "app.subtitle": "El Convertidor Universal",
    "app.description": "Pega cualquier cosa. Obtén la versión limpia.",

    // Hero
    "hero.title": "Pega cualquier cosa. Obtén la versión limpia.",
    "hero.subtitle": "Detecta automáticamente JSON, colores, timestamps, JWT, Base64, y más. Transformaciones instantáneas.",
    "hero.tryExample": "Prueba:",
    "hero.orDrop": "o suelta un archivo",

    // Input
    "input.placeholder": "Pega aquí... (Ctrl+V)",
    "input.dropHint": "O suelta un archivo",
    "input.processing": "Transmutando...",
    "input.clear": "Limpiar",

    // Results
    "result.copy": "COPIAR",
    "result.copied": "¡Copiado!",
    "result.download": "Descargar",
    "result.share": "Compartir",
    "result.shareLink": "¡Enlace copiado!",

    // JSON
    "json.title": "JSON Formateado",
    "json.typescript": "Interfaz TypeScript",
    "json.minified": "Minificado",

    // Color
    "color.title": "Color Detectado",
    "color.hex": "HEX",
    "color.rgb": "RGB",
    "color.hsl": "HSL",
    "color.tailwind": "Tailwind",
    "color.complementary": "Complementario",

    // Timestamp
    "timestamp.title": "Timestamp Detectado",
    "timestamp.local": "Hora Local",
    "timestamp.utc": "UTC",
    "timestamp.relative": "Relativo",
    "timestamp.iso": "ISO 8601",

    // HTML
    "html.title": "HTML Detectado",
    "html.plainText": "Texto Plano",
    "html.markdown": "Markdown",

    // Image
    "image.title": "Imagen Detectada",
    "image.toWebp": "Convertir a WebP",
    "image.toPng": "Convertir a PNG",
    "image.toJpeg": "Convertir a JPEG",
    "image.export": "Exportar",
    "image.colors": "Colores",
    "image.resize": "Tamaño",
    "image.quality": "Calidad",
    "image.colorsHint": "Haz clic para copiar código HEX",
    "image.resizeHint": "Selecciona el ratio, la imagen se ajustará al marco",
    "image.newSize": "Nuevo tamaño",
    "image.framePreview": "La imagen se ajustará a este marco",

    // Code
    "code.title": "Código Detectado",
    "code.beautified": "Formateado",
    "code.minified": "Minificado",

    // Text
    "text.title": "Análisis de Texto",
    "text.characters": "Caracteres",
    "text.words": "Palabras",
    "text.lines": "Líneas",
    "text.uppercase": "MAYÚSCULAS",
    "text.lowercase": "minúsculas",
    "text.titlecase": "Tipo Título",

    // History
    "history.title": "Reciente",
    "history.empty": "Sin conversiones recientes",
    "history.clear": "Borrar historial",

    // Footer
    "footer.tagline": "🔒 Privacidad Primero: Tus datos nunca salen de esta pestaña.",
    "footer.powered": "Desarrollado por",
    "footer.feedback": "Comentarios",

    // Language
    "lang.en": "Inglés",
    "lang.fr": "Francés",
    "lang.es": "Español",

    // 404
    "notfound.title": "Página no encontrada",
    "notfound.text": "La página que buscas no existe o ha sido movida.",
    "notfound.back": "Volver",
    "notfound.home": "Volver a Alchemy",

    // Errors
    "error.invalidInput": "No se pudo detectar el tipo de entrada",
    "error.imageTooLarge": "Imagen demasiado grande (máx 10MB)",
  },
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(I18N_STORAGE_KEY) as Lang | null;
  if (stored && ["en", "fr", "es"].includes(stored)) return stored;

  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("fr")) return "fr";
  if (browser.startsWith("es")) return "es";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());

  useEffect(() => {
    window.localStorage.setItem(I18N_STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: string) => messages[lang][key] ?? key,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return ctx;
}
