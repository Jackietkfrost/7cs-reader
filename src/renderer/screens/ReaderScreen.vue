<template>
    <div class="reader-wrapper">
        <div
            v-if="isLoaded && showSpeechToolbar"
            class="speech-toolbar glass-footer d-flex align-center ga-1 flex-wrap"
            role="toolbar"
            aria-label="Reader accessibility controls"
            data-testid="reader-speech-toolbar"
        >
            <template v-if="settings.speech.ttsEnabled">
                <v-btn
                    v-if="isSpeaking"
                    size="small"
                    variant="text"
                    icon="mdi-skip-previous"
                    aria-label="Previous sentence"
                    data-testid="reader-tts-prev"
                    @click="previousSentence"
                />
                <v-btn
                    v-if="!isSpeaking"
                    size="small"
                    variant="text"
                    prepend-icon="mdi-volume-high"
                    aria-label="Read current page aloud"
                    data-testid="reader-tts-play"
                    @click="readCurrentPage()"
                >
                    Read Aloud
                </v-btn>
                <v-btn
                    v-else
                    size="small"
                    variant="text"
                    :prepend-icon="isPaused ? 'mdi-play' : 'mdi-pause'"
                    :aria-label="isPaused ? 'Resume reading' : 'Pause reading'"
                    data-testid="reader-tts-pause"
                    @click="togglePauseSpeech"
                >
                    {{ isPaused ? "Resume" : "Pause" }}
                </v-btn>
                <v-btn
                    v-if="isSpeaking"
                    size="small"
                    variant="text"
                    icon="mdi-skip-next"
                    aria-label="Next sentence"
                    data-testid="reader-tts-next"
                    @click="nextSentence"
                />
                <v-btn
                    v-if="isSpeaking"
                    size="small"
                    variant="text"
                    icon="mdi-stop"
                    aria-label="Stop reading aloud"
                    data-testid="reader-tts-stop"
                    @click="stopReaderSpeech"
                />
                <span
                    v-if="isSpeaking && totalSentenceCount > 0"
                    class="text-caption px-2"
                    role="status"
                    aria-live="polite"
                    data-testid="reader-tts-progress"
                >
                    {{ currentSentenceIndex + 1 }} / {{ totalSentenceCount }}
                </span>
            </template>

            <template v-if="settings.speech.voiceToTextEnabled">
                <v-btn
                    size="small"
                    :color="isListening ? 'error' : undefined"
                    variant="text"
                    :prepend-icon="isListening ? 'mdi-microphone-off' : 'mdi-microphone'"
                    :aria-label="isListening ? 'Stop voice commands' : 'Start voice commands'"
                    data-testid="reader-vtt-toggle"
                    @click="toggleVoiceCommands"
                >
                    {{ isListening ? "Listening..." : "Voice Commands" }}
                </v-btn>
                <span
                    v-if="voiceStatus"
                    class="text-caption px-2"
                    role="status"
                    aria-live="polite"
                    data-testid="reader-vtt-status"
                >
                    {{ voiceStatus }}
                </span>
            </template>
        </div>

        <v-container v-if="isLoaded" style="height: 100vh">
            <vue-reader
                v-show="true"
                :url="`./epubs/${bookName}`"
                :class="readerThemeClass"
                :location="location"
                :get-rendition="getRendition"
                :toc-changed="tocChanged"
                :epub-options="{
                    allowScriptedContent: true
                }"
                @update:location="locationChange"
            />
        </v-container>

        <div
            v-if="isLoaded && page"
            class="page-footer glass-footer"
            role="status"
            aria-live="polite"
            data-testid="reader-page-footer"
        >
            {{ page }}
        </div>

        <RhvoiceInstallDialog
            v-model="showRhvoicePrompt"
            :status="rhvoiceStatus"
            @browse="browseRhvoiceFromReader"
            @recheck="recheckRhvoiceFromReader"
            @fallback="fallbackToSystemTtsFromReader"
        />
    </div>
</template>

<script setup lang="ts">
import { Rendition } from "epubjs"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { VueReader } from "vue-reader"
import { useRouter } from "vue-router"
import { useBookStore } from "@/renderer/store/bookStore"
import { useAppStore } from "@/renderer/store/appStore"
import { storeToRefs } from "pinia"
import {
    ChunkedReaderController,
    LocalTtsStatus,
    VoiceRecognizerController,
    createChunkedReader,
    createVoiceRecognizer,
    getLocalTtsStatus
} from "@/renderer/utils/speech"
import RhvoiceInstallDialog from "@/renderer/components/RhvoiceInstallDialog.vue"
import {
    SpeechChunk,
    clearHighlightsInDocument,
    extractDocumentChunks,
    highlightChunkInDocument
} from "@/renderer/utils/textChunker"

const router = useRouter()
const bookStore = useBookStore()
const appStore = useAppStore()
const { bookName } = storeToRefs(bookStore)

let rendition: Rendition | null = null
let voiceRecognizer: VoiceRecognizerController | null = null
let chunkedReader: ChunkedReaderController | null = null
let clearActiveHighlight: (() => void) | null = null
let activeDocument: any = null
let isAutoTurningPage = false

const toc = ref<any[]>([])
const page = ref("")
const location = ref<string | number | null>(null)
const isLoaded = ref(false)
const isSpeaking = ref(false)
const isPaused = ref(false)
const currentSentenceIndex = ref(0)
const totalSentenceCount = ref(0)
const isListening = ref(false)
const voiceStatus = ref("")
const showRhvoicePrompt = ref(false)
const rhvoiceStatus = ref<LocalTtsStatus>({
    systemNativeAvailable: false,
    systemNativeLabel: "",
    rhvoiceAvailable: false,
    rhvoiceMode: "none",
    rhvoiceResolvedPath: "",
    platform: "",
    platformLabel: "Desktop",
    systemLocale: "en-US",
    recommendedRhvoiceUrl: "https://rhvoice.org/languages/",
    recommendedRhvoiceLanguageLabel: "All Languages"
})

const settings = computed(() => appStore.getSettings)

const showSpeechToolbar = computed(
    () => settings.value.speech.ttsEnabled || settings.value.speech.voiceToTextEnabled
)

const effectiveScheme = computed(() => {
    const scheme = settings.value.bookTypography.readerColorScheme
    if (scheme !== "match-app") {
        return scheme
    }
    if (settings.value.highContrast) {
        return settings.value.nightMode ? "high-contrast-dark" : "high-contrast-light"
    }
    return settings.value.nightMode ? "dark" : "light"
})

const readerThemeClass = computed(() => `${effectiveScheme.value}-theme`)

const READER_PALETTES: Record<
    string,
    {
        bg: string
        fg: string
        link: string
        quoteBg: string
        underlineLinks: boolean
        highlightBg: string
        highlightFg: string
        highlightOutline: string
    }
> = {
    dark: {
        bg: "#121212",
        fg: "#E0E0E0",
        link: "#00ACC1",
        quoteBg: "#1E1E1E",
        underlineLinks: false,
        highlightBg: "rgba(0, 172, 193, 0.35)",
        highlightFg: "#FFFFFF",
        highlightOutline: "#00ACC1"
    },
    light: {
        bg: "#FFFFFF",
        fg: "#1A1A1A",
        link: "#0D47A1",
        quoteBg: "#F5F5F5",
        underlineLinks: false,
        highlightBg: "rgba(21, 101, 192, 0.22)",
        highlightFg: "#000000",
        highlightOutline: "#0D47A1"
    },
    sepia: {
        bg: "#F4ECD8",
        fg: "#3B2F2F",
        link: "#0B5394",
        quoteBg: "#E9DEC5",
        underlineLinks: false,
        highlightBg: "rgba(180, 120, 40, 0.28)",
        highlightFg: "#1F1717",
        highlightOutline: "#8A5A12"
    },
    "high-contrast-dark": {
        bg: "#000000",
        fg: "#FFFFFF",
        link: "#00E5FF",
        quoteBg: "#1A1A1A",
        underlineLinks: true,
        highlightBg: "#00E5FF",
        highlightFg: "#000000",
        highlightOutline: "#FFFFFF"
    },
    "high-contrast-light": {
        bg: "#FFFFFF",
        fg: "#000000",
        link: "#0000EE",
        quoteBg: "#EDEDED",
        underlineLinks: true,
        highlightBg: "#FFEB3B",
        highlightFg: "#000000",
        highlightOutline: "#000000"
    }
}

const DYSLEXIA_FONT_STACK =
    '"OpenDyslexic", "Atkinson Hyperlegible", "Lexend", Verdana, Arial, sans-serif'

const applyReaderStyling = (target: Rendition | null): void => {
    if (!target) {
        return
    }
    const typo = settings.value.bookTypography
    const palette = READER_PALETTES[effectiveScheme.value] || READER_PALETTES.dark

    let fontFamily = 'system-ui, -apple-system, "Segoe UI", sans-serif'
    if (typo.dyslexiaFriendly) {
        fontFamily =
            typo.fontFamily && typo.fontFamily !== "Default"
                ? `"${typo.fontFamily}", ${DYSLEXIA_FONT_STACK}`
                : DYSLEXIA_FONT_STACK
    } else if (typo.fontFamily && typo.fontFamily !== "Default") {
        fontFamily = `"${typo.fontFamily}", sans-serif`
    }

    const lineHeight = typo.dyslexiaFriendly ? Math.max(typo.lineHeight, 1.7) : typo.lineHeight
    const letterSpacing = typo.dyslexiaFriendly
        ? Math.max(typo.letterSpacing, 0.06)
        : typo.letterSpacing
    const wordSpacing = typo.dyslexiaFriendly ? Math.max(typo.wordSpacing, 0.12) : typo.wordSpacing
    const textAlign = typo.dyslexiaFriendly ? "left" : typo.textAlign

    const bodyRules: Record<string, string> = {
        "background-color": `${palette.bg} !important`,
        color: `${palette.fg} !important`,
        "font-family": `${fontFamily} !important`,
        "line-height": `${lineHeight} !important`,
        "letter-spacing": `${letterSpacing}em !important`,
        "word-spacing": `${wordSpacing}em !important`
    }

    const paragraphRules: Record<string, string> = {
        color: `${palette.fg} !important`,
        "font-family": `${fontFamily} !important`,
        "line-height": `${lineHeight} !important`,
        "letter-spacing": `${letterSpacing}em !important`,
        "word-spacing": `${wordSpacing}em !important`
    }

    if (textAlign !== "default") {
        paragraphRules["text-align"] = `${textAlign} !important`
    }

    target.themes.register("7cs-reader", {
        html: {
            "background-color": `${palette.bg} !important`,
            color: `${palette.fg} !important`
        },
        body: bodyRules,
        "p, span, li, div, h1, h2, h3, h4, h5, h6, b, strong, em": paragraphRules,
        a: {
            color: `${palette.link} !important`,
            "text-decoration": palette.underlineLinks ? "underline !important" : "inherit"
        },
        blockquote: {
            "background-color": `${palette.quoteBg} !important`,
            color: `${palette.fg} !important`
        }
    })

    target.themes.select("7cs-reader")
    target.themes.fontSize(`${typo.fontSize}%`)
}

function getActiveIframeDocument(): any {
    if (!rendition) {
        return null
    }
    const rawContents = rendition.getContents() as any
    const contentList = Array.isArray(rawContents) ? rawContents : rawContents ? [rawContents] : []
    for (const item of contentList) {
        if (item?.document?.body) {
            return item.document
        }
    }
    return null
}

function clearSentenceHighlight(): void {
    clearActiveHighlight?.()
    clearActiveHighlight = null
    if (activeDocument) {
        clearHighlightsInDocument(activeDocument)
    }
}

function applySentenceHighlight(chunk: SpeechChunk): void {
    clearSentenceHighlight()
    if (!settings.value.speech.highlightSpokenSentence) {
        return
    }
    const doc = activeDocument || getActiveIframeDocument()
    if (!doc) {
        return
    }
    const palette = READER_PALETTES[effectiveScheme.value] || READER_PALETTES.dark
    clearActiveHighlight = highlightChunkInDocument(doc, chunk, {
        background: palette.highlightBg,
        color: palette.highlightFg,
        outline: palette.highlightOutline,
        reducedMotion: settings.value.reducedMotion
    })
}

function ensureChunkedReader(): ChunkedReaderController {
    if (!chunkedReader) {
        chunkedReader = createChunkedReader(
            () => ({
                engine: settings.value.speech.ttsEngine,
                rate: settings.value.speech.ttsRate,
                pitch: settings.value.speech.ttsPitch,
                volume: settings.value.speech.ttsVolume,
                voice: settings.value.speech.ttsVoice,
                lang: settings.value.speech.voiceCommandLanguage,
                rhvoicePath: settings.value.speech.rhvoicePath,
                paragraphPauseMs: settings.value.speech.paragraphPauseMs
            }),
            {
                onChunkStart: (chunk, index, total) => {
                    currentSentenceIndex.value = index
                    totalSentenceCount.value = total
                    applySentenceHighlight(chunk)
                },
                onStateChange: (state) => {
                    isSpeaking.value = state.isSpeaking
                    isPaused.value = state.isPaused
                    currentSentenceIndex.value = state.currentIndex
                    totalSentenceCount.value = state.totalChunks
                    if (!state.isSpeaking) {
                        clearSentenceHighlight()
                    }
                },
                onComplete: () => {
                    clearSentenceHighlight()
                    if (settings.value.speech.autoPageTurn) {
                        advanceAndContinueReading()
                    }
                },
                onNotice: (message) => {
                    appStore.addSnackbar(message, "info")
                },
                onError: (message) => {
                    clearSentenceHighlight()
                    appStore.addSnackbar(message, "warning")
                }
            }
        )
    }
    return chunkedReader
}

async function advanceAndContinueReading(): Promise<void> {
    if (!rendition) {
        return
    }
    const previousCfi = location.value
    isAutoTurningPage = true
    try {
        await rendition.next()
        await new Promise((resolve) => setTimeout(resolve, 350))
        if (location.value && location.value === previousCfi) {
            appStore.announce("Reached end of book")
            return
        }
        await readCurrentPage(3)
    } finally {
        isAutoTurningPage = false
    }
}

async function readCurrentPage(skipEmptyPagesRemaining = 3): Promise<void> {
    if (settings.value.speech.ttsEngine === "rhvoice") {
        const status = await getLocalTtsStatus(settings.value.speech.rhvoicePath)
        rhvoiceStatus.value = status
        if (!status.rhvoiceAvailable) {
            showRhvoicePrompt.value = true
            return
        }
    }

    const doc = getActiveIframeDocument()
    activeDocument = doc
    if (!doc) {
        appStore.addSnackbar("Book page is still loading.", "info")
        return
    }
    clearHighlightsInDocument(doc)
    const chunks = extractDocumentChunks(doc, {
        cleanupFormatting: settings.value.speech.cleanupFormatting
    })
    if (chunks.length === 0) {
        if (rendition && skipEmptyPagesRemaining > 0) {
            const previousCfi = location.value
            isAutoTurningPage = true
            try {
                await rendition.next()
                await new Promise((resolve) => setTimeout(resolve, 350))
                if (location.value !== previousCfi) {
                    await readCurrentPage(skipEmptyPagesRemaining - 1)
                    return
                }
            } finally {
                isAutoTurningPage = false
            }
        }
        appStore.addSnackbar("No readable text found on this page.", "info")
        return
    }
    ensureChunkedReader().start(chunks, 0)
}

function togglePauseSpeech(): void {
    const reader = ensureChunkedReader()
    if (isPaused.value) {
        reader.resume()
    } else {
        reader.pause()
    }
}

function nextSentence(): void {
    chunkedReader?.next()
}

function previousSentence(): void {
    chunkedReader?.previous()
}

function stopReaderSpeech(): void {
    chunkedReader?.stop()
    clearSentenceHighlight()
    isSpeaking.value = false
    isPaused.value = false
    totalSentenceCount.value = 0
}

async function browseRhvoiceFromReader(): Promise<void> {
    const result = await window.sevenCsApi.invoke("msgPickRhvoiceBinary")
    if (!result?.canceled && result?.filePath) {
        await appStore.updateSpeech({ rhvoicePath: result.filePath })
        const status = await getLocalTtsStatus(result.filePath)
        rhvoiceStatus.value = status
        if (status.rhvoiceAvailable) {
            showRhvoicePrompt.value = false
            appStore.addSnackbar("RHVoice executable configured!", "success")
            await readCurrentPage()
        }
    }
}

async function recheckRhvoiceFromReader(): Promise<void> {
    const status = await getLocalTtsStatus(settings.value.speech.rhvoicePath)
    rhvoiceStatus.value = status
    if (status.rhvoiceAvailable) {
        showRhvoicePrompt.value = false
        appStore.addSnackbar("RHVoice detected and ready!", "success")
        await readCurrentPage()
    } else {
        appStore.addSnackbar("RHVoice was still not detected on this device.", "warning")
    }
}

async function fallbackToSystemTtsFromReader(): Promise<void> {
    showRhvoicePrompt.value = false
    await appStore.updateSpeech({ ttsEngine: "system-native", ttsVoice: "" })
    await readCurrentPage()
}

const getRendition = (val: Rendition): void => {
    rendition = val
    applyReaderStyling(val)

    rendition.book.ready.then(() => {
        rendition?.book.locations
            .generate(1024)
            .then(() => {
                if (location.value && typeof location.value === "string" && rendition) {
                    const locations = rendition.book.locations as any
                    const pct = locations.percentageFromCfi(location.value)
                    const loc = locations.locationFromCfi(location.value)
                    const total = locations.total
                    const progress = typeof pct === "number" && pct > 0 ? Math.round(pct * 100) : 1
                    bookStore.saveBookmark(
                        bookName.value,
                        location.value,
                        progress,
                        typeof loc === "number" ? loc : undefined,
                        typeof total === "number" ? total : undefined
                    )
                }
            })
            .catch((err) => {
                console.warn("Locations generate error:", err)
            })
    })
}

const tocChanged = (val: any): void => {
    toc.value = val
}

const getLabel = (tocList: any[], href: string): string => {
    let label = "n/a"
    tocList.some((item) => {
        if (item.subitems && item.subitems.length > 0) {
            const subChapter = getLabel(item.subitems, href)
            if (subChapter !== "n/a") {
                label = subChapter
                return true
            }
        } else if (item.href && item.href.includes(href)) {
            label = item.label
            return true
        }
        return false
    })
    return label
}

const locationChange = (epubcifi: string): void => {
    if (epubcifi && isLoaded.value) {
        if (!isAutoTurningPage && isSpeaking.value) {
            stopReaderSpeech()
        }

        location.value = epubcifi
        let progress = 0
        let currentPage: number | undefined
        let totalPages: number | undefined

        const locations = rendition?.book?.locations as any
        if (locations && locations.total > 0) {
            const pct = locations.percentageFromCfi(epubcifi)
            const loc = locations.locationFromCfi(epubcifi)
            const total = locations.total

            if (typeof pct === "number" && pct > 0) {
                progress = Math.round(pct * 100)
            }
            if (typeof loc === "number" && loc > 0) {
                currentPage = loc
            }
            if (typeof total === "number" && total > 0) {
                totalPages = total
            }
        }

        if (progress === 0 && rendition && rendition.location && rendition.location.start) {
            const startLoc = rendition.location.start as any
            const { displayed, percentage } = startLoc
            if (typeof percentage === "number" && percentage > 0) {
                progress = Math.round(percentage * 100)
            } else if (displayed && displayed.total > 0 && displayed.page > 0) {
                progress = Math.round((displayed.page / displayed.total) * 100)
            }
            if (!currentPage && displayed) currentPage = displayed.page
            if (!totalPages && displayed) totalPages = displayed.total
        }

        if (progress === 0 && epubcifi) {
            progress = 1
        }

        if (rendition && rendition.location && rendition.location.start) {
            const { displayed, href } = rendition.location.start as any
            const label = getLabel(toc.value, href)
            const chapterLabel = label !== "n/a" ? ` - ${label}` : ""
            const cPage = currentPage || displayed.page
            const tPage = totalPages || displayed.total
            page.value = `Page ${cPage} of ${tPage}${chapterLabel}`
            appStore.announce(page.value)
        }

        bookStore.saveBookmark(bookName.value, epubcifi, progress, currentPage, totalPages)
    }
}

function handleVoiceCommand(transcript: string): void {
    const command = transcript.toLowerCase().trim()
    voiceStatus.value = `Heard: "${transcript}"`

    if (command.includes("next sentence")) {
        nextSentence()
    } else if (command.includes("previous sentence")) {
        previousSentence()
    } else if (command.includes("next")) {
        rendition?.next()
    } else if (command.includes("previous") || command.includes("back")) {
        rendition?.prev()
    } else if (command.includes("stop")) {
        stopReaderSpeech()
    } else if (command.includes("pause")) {
        chunkedReader?.pause()
    } else if (command.includes("resume")) {
        chunkedReader?.resume()
    } else if (command.includes("read") || command.includes("play")) {
        readCurrentPage()
    } else if (command.includes("settings")) {
        appStore.setOpenSettings(true)
    } else if (command.includes("library") || command.includes("home")) {
        router.push("/")
    }
}

function stopVoiceCommands(): void {
    voiceRecognizer?.stop()
    voiceRecognizer = null
    isListening.value = false
}

function toggleVoiceCommands(): void {
    if (isListening.value) {
        stopVoiceCommands()
        voiceStatus.value = "Voice commands stopped."
        return
    }

    voiceRecognizer = createVoiceRecognizer({
        lang: settings.value.speech.voiceCommandLanguage,
        continuous: true,
        interimResults: false,
        onResult: (transcript, isFinal) => {
            if (isFinal) {
                handleVoiceCommand(transcript)
            }
        },
        onError: (message) => {
            voiceStatus.value = message
            isListening.value = false
        },
        onEnd: () => {
            isListening.value = false
        }
    })

    if (!voiceRecognizer) {
        voiceStatus.value = "Voice recognition unavailable in this runtime."
        return
    }

    if (voiceRecognizer.start()) {
        isListening.value = true
        voiceStatus.value = 'Say "next", "previous", "read aloud", "stop", or "settings".'
    }
}

const handleReaderKeydown = (event: KeyboardEvent): void => {
    if (!settings.value.keyboardNavigationHints || appStore.getOpenedSettings) {
        return
    }
    if (event.key === "ArrowRight") {
        rendition?.next()
    } else if (event.key === "ArrowLeft") {
        rendition?.prev()
    }
}

watch(
    () => [
        settings.value.nightMode,
        settings.value.highContrast,
        settings.value.bookTypography.fontFamily,
        settings.value.bookTypography.fontSize,
        settings.value.bookTypography.lineHeight,
        settings.value.bookTypography.letterSpacing,
        settings.value.bookTypography.wordSpacing,
        settings.value.bookTypography.textAlign,
        settings.value.bookTypography.dyslexiaFriendly,
        settings.value.bookTypography.readerColorScheme
    ],
    () => {
        applyReaderStyling(rendition)
    }
)

watch(
    () => settings.value.speech.highlightSpokenSentence,
    (enabled) => {
        if (!enabled) {
            clearSentenceHighlight()
        }
    }
)

onMounted(async () => {
    await bookStore.loadMetadata()
    const savedCfi = bookStore.metadata[bookName.value]?.bookmark
    if (savedCfi) {
        location.value = savedCfi
    }
    isLoaded.value = true
    window.addEventListener("keydown", handleReaderKeydown)
})

onUnmounted(() => {
    stopReaderSpeech()
    stopVoiceCommands()
    window.removeEventListener("keydown", handleReaderKeydown)
})
</script>

<style>
.reader-wrapper {
    position: relative;
    height: 100vh;
}

.speech-toolbar {
    position: absolute;
    top: 0.75rem;
    right: 1.5rem;
    z-index: 20;
    padding: 6px 12px;
    border-radius: 4px;
}

.dark-theme .readerArea {
    background-color: #121212 !important;
}

.light-theme .readerArea {
    background-color: #ffffff !important;
}

.sepia-theme .readerArea {
    background-color: #f4ecd8 !important;
}

.high-contrast-dark-theme .readerArea {
    background-color: #000000 !important;
}

.high-contrast-light-theme .readerArea {
    background-color: #ffffff !important;
}

.container .titleArea {
    color: rgb(var(--v-theme-primary)) !important;
    left: 50px;
    overflow: hidden;
    position: absolute;
    right: 50px;
    text-align: center;
    text-overflow: ellipsis;
    top: 20px;
    white-space: nowrap;
}

.dark-theme .tocButtonExpanded,
.high-contrast-dark-theme .tocButtonExpanded {
    color: rgb(var(--v-theme-background));
}

.dark-theme .tocButtonBar,
.high-contrast-dark-theme .tocButtonBar {
    background-color: rgb(var(--v-theme-primary));
}

.dark-theme .readerArea .tocButton,
.high-contrast-dark-theme .readerArea .tocButton {
    background-color: rgb(var(--v-theme-background));
    color: rgb(var(--v-theme-primary));
    border-radius: 3px;
}

.dark-theme .readerArea .tocButtonExpanded,
.high-contrast-dark-theme .readerArea .tocButtonExpanded {
    background-color: rgb(var(--v-theme-backgroundAccent));
}

.dark-theme .tocArea .tocAreaButton,
.high-contrast-dark-theme .tocArea .tocAreaButton {
    color: rgb(var(--v-theme-primary));
    border-bottom: 1px solid rgb(var(--v-theme-primary));
}

.dark-theme .tocArea,
.high-contrast-dark-theme .tocArea {
    background: linear-gradient(
        to right,
        rgb(var(--v-theme-backgroundAccent)),
        rgb(var(--v-theme-background))
    );
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    box-shadow: inset 0 0 20px rgb(var(--v-theme-background));
}

.dark-theme .readerArea .arrow,
.high-contrast-dark-theme .readerArea .arrow {
    color: rgb(var(--v-theme-primary));
}

.dark-theme .readerArea .arrow:hover,
.high-contrast-dark-theme .readerArea .arrow:hover {
    color: rgb(var(--v-theme-accent));
}

.page-footer {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 6px 20px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
}

.glass-footer {
    background: rgba(var(--v-theme-surface), 0.88) !important;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}
</style>
