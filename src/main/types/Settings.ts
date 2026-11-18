export type ReaderColorScheme =
    | "match-app"
    | "dark"
    | "light"
    | "sepia"
    | "high-contrast-dark"
    | "high-contrast-light"

export type ReaderTextAlign = "default" | "left" | "justify"

export type TtsEngineType = "system-native" | "rhvoice" | "browser"

export type ListingViewMode = "gallery" | "list"

export interface ListingViewSettings {
    library: ListingViewMode
    starred: ListingViewMode
    labeled: ListingViewMode
}

export interface BookTypographySettings {
    fontFamily: string
    fontSize: number
    lineHeight: number
    letterSpacing: number
    wordSpacing: number
    textAlign: ReaderTextAlign
    dyslexiaFriendly: boolean
    readerColorScheme: ReaderColorScheme
}

export interface SpeechSettings {
    ttsEnabled: boolean
    ttsEngine: TtsEngineType
    ttsRate: number
    ttsPitch: number
    ttsVolume: number
    ttsVoice: string
    rhvoicePath: string
    paragraphPauseMs: number
    cleanupFormatting: boolean
    highlightSpokenSentence: boolean
    autoPageTurn: boolean
    voiceToTextEnabled: boolean
    voiceCommandLanguage: string
}

export interface AppSettings {
    nightMode: boolean
    highContrast: boolean
    language: string
    uiScale: number
    reducedMotion: boolean
    enhancedFocus: boolean
    screenReaderAnnouncements: boolean
    keyboardNavigationHints: boolean
    tagsVisible: boolean
    ratingsVisible: boolean
    archivesVisible: boolean
    closedRatingGroups: number[]
    listingViews: ListingViewSettings
    bookTypography: BookTypographySettings
    speech: SpeechSettings
}

export interface SettingsPayload {
    settings: AppSettings
    configPath: string
}

export const SETTINGS_FILE_NAME = "7cs-reader.config.json"

const VALID_COLOR_SCHEMES: ReadonlySet<ReaderColorScheme> = new Set([
    "match-app",
    "dark",
    "light",
    "sepia",
    "high-contrast-dark",
    "high-contrast-light"
])

const VALID_TEXT_ALIGNS: ReadonlySet<ReaderTextAlign> = new Set(["default", "left", "justify"])

const VALID_TTS_ENGINES: ReadonlySet<TtsEngineType> = new Set([
    "system-native",
    "rhvoice",
    "browser"
])

const VALID_LISTING_MODES: ReadonlySet<ListingViewMode> = new Set(["gallery", "list"])

export const DEFAULT_APP_SETTINGS: AppSettings = {
    nightMode: true,
    highContrast: false,
    language: "en",
    uiScale: 100,
    reducedMotion: false,
    enhancedFocus: true,
    screenReaderAnnouncements: true,
    keyboardNavigationHints: true,
    tagsVisible: true,
    ratingsVisible: true,
    archivesVisible: false,
    closedRatingGroups: [],
    listingViews: {
        library: "gallery",
        starred: "gallery",
        labeled: "gallery"
    },
    bookTypography: {
        fontFamily: "Default",
        fontSize: 100,
        lineHeight: 1.6,
        letterSpacing: 0,
        wordSpacing: 0,
        textAlign: "default",
        dyslexiaFriendly: false,
        readerColorScheme: "match-app"
    },
    speech: {
        ttsEnabled: false,
        ttsEngine: "system-native",
        ttsRate: 1,
        ttsPitch: 1,
        ttsVolume: 1,
        ttsVoice: "",
        rhvoicePath: "",
        paragraphPauseMs: 450,
        cleanupFormatting: true,
        highlightSpokenSentence: true,
        autoPageTurn: true,
        voiceToTextEnabled: false,
        voiceCommandLanguage: "en-US"
    }
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return fallback
    }
    return Math.min(max, Math.max(min, value))
}

function asBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback
}

function asString(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback
}

function asClosedRatingGroups(value: unknown): number[] {
    if (!Array.isArray(value)) {
        return []
    }
    const valid = new Set<number>()
    for (const item of value) {
        if (typeof item === "number" && Number.isInteger(item) && item >= 0 && item <= 5) {
            valid.add(item)
        }
    }
    return Array.from(valid).sort((a, b) => b - a)
}

function asListingViewMode(value: unknown, fallback: ListingViewMode): ListingViewMode {
    return VALID_LISTING_MODES.has(value as ListingViewMode)
        ? (value as ListingViewMode)
        : fallback
}

export function normalizeSettings(input: unknown): AppSettings {
    const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>
    const rawListingViews = (
        raw.listingViews && typeof raw.listingViews === "object" ? raw.listingViews : {}
    ) as Record<string, unknown>
    const rawTypography = (
        raw.bookTypography && typeof raw.bookTypography === "object" ? raw.bookTypography : {}
    ) as Record<string, unknown>
    const rawSpeech = (raw.speech && typeof raw.speech === "object" ? raw.speech : {}) as Record<
        string,
        unknown
    >

    const colorScheme = VALID_COLOR_SCHEMES.has(
        rawTypography.readerColorScheme as ReaderColorScheme
    )
        ? (rawTypography.readerColorScheme as ReaderColorScheme)
        : DEFAULT_APP_SETTINGS.bookTypography.readerColorScheme

    const textAlign = VALID_TEXT_ALIGNS.has(rawTypography.textAlign as ReaderTextAlign)
        ? (rawTypography.textAlign as ReaderTextAlign)
        : DEFAULT_APP_SETTINGS.bookTypography.textAlign

    return {
        nightMode: asBoolean(raw.nightMode, DEFAULT_APP_SETTINGS.nightMode),
        highContrast: asBoolean(raw.highContrast, DEFAULT_APP_SETTINGS.highContrast),
        language: asString(raw.language, DEFAULT_APP_SETTINGS.language),
        uiScale: Math.round(clampNumber(raw.uiScale, DEFAULT_APP_SETTINGS.uiScale, 100, 150)),
        reducedMotion: asBoolean(raw.reducedMotion, DEFAULT_APP_SETTINGS.reducedMotion),
        enhancedFocus: asBoolean(raw.enhancedFocus, DEFAULT_APP_SETTINGS.enhancedFocus),
        screenReaderAnnouncements: asBoolean(
            raw.screenReaderAnnouncements,
            DEFAULT_APP_SETTINGS.screenReaderAnnouncements
        ),
        keyboardNavigationHints: asBoolean(
            raw.keyboardNavigationHints,
            DEFAULT_APP_SETTINGS.keyboardNavigationHints
        ),
        tagsVisible: asBoolean(raw.tagsVisible, DEFAULT_APP_SETTINGS.tagsVisible),
        ratingsVisible: asBoolean(raw.ratingsVisible, DEFAULT_APP_SETTINGS.ratingsVisible),
        archivesVisible: asBoolean(raw.archivesVisible, DEFAULT_APP_SETTINGS.archivesVisible),
        closedRatingGroups: asClosedRatingGroups(raw.closedRatingGroups),
        listingViews: {
            library: asListingViewMode(
                rawListingViews.library,
                DEFAULT_APP_SETTINGS.listingViews.library
            ),
            starred: asListingViewMode(
                rawListingViews.starred,
                DEFAULT_APP_SETTINGS.listingViews.starred
            ),
            labeled: asListingViewMode(
                rawListingViews.labeled,
                DEFAULT_APP_SETTINGS.listingViews.labeled
            )
        },
        bookTypography: {
            fontFamily: asString(
                rawTypography.fontFamily,
                DEFAULT_APP_SETTINGS.bookTypography.fontFamily
            ),
            fontSize: Math.round(
                clampNumber(
                    rawTypography.fontSize,
                    DEFAULT_APP_SETTINGS.bookTypography.fontSize,
                    50,
                    400
                )
            ),
            lineHeight: Number(
                clampNumber(
                    rawTypography.lineHeight,
                    DEFAULT_APP_SETTINGS.bookTypography.lineHeight,
                    1.2,
                    2.4
                ).toFixed(2)
            ),
            letterSpacing: Number(
                clampNumber(
                    rawTypography.letterSpacing,
                    DEFAULT_APP_SETTINGS.bookTypography.letterSpacing,
                    0,
                    0.25
                ).toFixed(2)
            ),
            wordSpacing: Number(
                clampNumber(
                    rawTypography.wordSpacing,
                    DEFAULT_APP_SETTINGS.bookTypography.wordSpacing,
                    0,
                    0.5
                ).toFixed(2)
            ),
            textAlign,
            dyslexiaFriendly: asBoolean(
                rawTypography.dyslexiaFriendly,
                DEFAULT_APP_SETTINGS.bookTypography.dyslexiaFriendly
            ),
            readerColorScheme: colorScheme
        },
        speech: {
            ttsEnabled: asBoolean(rawSpeech.ttsEnabled, DEFAULT_APP_SETTINGS.speech.ttsEnabled),
            ttsEngine: VALID_TTS_ENGINES.has(rawSpeech.ttsEngine as TtsEngineType)
                ? (rawSpeech.ttsEngine as TtsEngineType)
                : DEFAULT_APP_SETTINGS.speech.ttsEngine,
            ttsRate: Number(
                clampNumber(rawSpeech.ttsRate, DEFAULT_APP_SETTINGS.speech.ttsRate, 0.5, 2).toFixed(
                    2
                )
            ),
            ttsPitch: Number(
                clampNumber(
                    rawSpeech.ttsPitch,
                    DEFAULT_APP_SETTINGS.speech.ttsPitch,
                    0.5,
                    2
                ).toFixed(2)
            ),
            ttsVolume: Number(
                clampNumber(
                    rawSpeech.ttsVolume,
                    DEFAULT_APP_SETTINGS.speech.ttsVolume,
                    0,
                    1
                ).toFixed(2)
            ),
            ttsVoice: typeof rawSpeech.ttsVoice === "string" ? rawSpeech.ttsVoice : "",
            rhvoicePath:
                typeof rawSpeech.rhvoicePath === "string" ? rawSpeech.rhvoicePath.trim() : "",
            paragraphPauseMs: Math.round(
                clampNumber(
                    rawSpeech.paragraphPauseMs,
                    DEFAULT_APP_SETTINGS.speech.paragraphPauseMs,
                    0,
                    1500
                )
            ),
            cleanupFormatting: asBoolean(
                rawSpeech.cleanupFormatting,
                DEFAULT_APP_SETTINGS.speech.cleanupFormatting
            ),
            highlightSpokenSentence: asBoolean(
                rawSpeech.highlightSpokenSentence,
                DEFAULT_APP_SETTINGS.speech.highlightSpokenSentence
            ),
            autoPageTurn: asBoolean(
                rawSpeech.autoPageTurn,
                DEFAULT_APP_SETTINGS.speech.autoPageTurn
            ),
            voiceToTextEnabled: asBoolean(
                rawSpeech.voiceToTextEnabled,
                DEFAULT_APP_SETTINGS.speech.voiceToTextEnabled
            ),
            voiceCommandLanguage: asString(
                rawSpeech.voiceCommandLanguage,
                DEFAULT_APP_SETTINGS.speech.voiceCommandLanguage
            )
        }
    }
}
