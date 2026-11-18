import type { TtsEngineType } from "@/main/types/Settings"
import type { SpeechChunk } from "./textChunker"

export interface SpeechVoiceOption {
    id: string
    name: string
    lang: string
}

export interface LocalTtsStatus {
    systemNativeAvailable: boolean
    systemNativeLabel: string
    rhvoiceAvailable: boolean
    rhvoiceMode: "sapi5" | "cli" | "none"
    rhvoiceResolvedPath: string
    platform: string
    platformLabel: string
    systemLocale: string
    recommendedRhvoiceUrl: string
    recommendedRhvoiceLanguageLabel: string
}

export interface SpeechPlaybackConfig {
    engine: TtsEngineType
    rate: number
    pitch: number
    volume: number
    voice: string
    lang: string
    rhvoicePath: string
    paragraphPauseMs: number
}

export interface ChunkedReaderCallbacks {
    onChunkStart?: (chunk: SpeechChunk, index: number, total: number) => void
    onStateChange?: (state: {
        isSpeaking: boolean
        isPaused: boolean
        currentIndex: number
        totalChunks: number
    }) => void
    onComplete?: () => void
    onError?: (message: string) => void
    onNotice?: (message: string) => void
}

export interface ChunkedReaderController {
    start: (chunks: SpeechChunk[], startIndex?: number) => void
    pause: () => void
    resume: () => void
    stop: () => void
    next: () => void
    previous: () => void
    isActive: () => boolean
}

export interface VoiceRecognitionOptions {
    lang?: string
    continuous?: boolean
    interimResults?: boolean
    onResult: (transcript: string, isFinal: boolean) => void
    onError?: (message: string) => void
    onEnd?: () => void
}

export interface VoiceRecognizerController {
    start: () => boolean
    stop: () => void
    abort: () => void
}

type SpeechRecognitionCtor = new () => {
    lang: string
    continuous: boolean
    interimResults: boolean
    onresult: ((event: any) => void) | null
    onerror: ((event: any) => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
    abort: () => void
}

function getSpeechRecognitionConstructor(): SpeechRecognitionCtor | null {
    if (typeof window === "undefined") {
        return null
    }
    const win = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor
        webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    return win.SpeechRecognition || win.webkitSpeechRecognition || null
}

export function isTtsSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window
}

export function isVoiceToTextSupported(): boolean {
    return getSpeechRecognitionConstructor() !== null
}

export function getBrowserVoices(): SpeechVoiceOption[] {
    if (!isTtsSupported()) {
        return []
    }
    return window.speechSynthesis.getVoices().map((voice) => ({
        id: voice.name,
        name: voice.name,
        lang: voice.lang
    }))
}

export async function getLocalTtsStatus(
    rhvoicePath?: string,
    preferredLocale?: string
): Promise<LocalTtsStatus> {
    try {
        return await window.sevenCsApi.invoke(
            "msgGetLocalTtsStatus",
            rhvoicePath || "",
            preferredLocale || ""
        )
    } catch {
        return {
            systemNativeAvailable: false,
            systemNativeLabel: "Unavailable",
            rhvoiceAvailable: false,
            rhvoiceMode: "none",
            rhvoiceResolvedPath: "",
            platform: "",
            platformLabel: "Desktop",
            systemLocale: "en-US",
            recommendedRhvoiceUrl: "https://rhvoice.org/languages/",
            recommendedRhvoiceLanguageLabel: "All Languages"
        }
    }
}

export async function getVoicesForEngine(
    engine: TtsEngineType,
    rhvoicePath?: string
): Promise<SpeechVoiceOption[]> {
    if (engine === "browser") {
        return getBrowserVoices()
    }
    try {
        const list = await window.sevenCsApi.invoke(
            "msgGetLocalTtsVoices",
            engine,
            rhvoicePath || ""
        )
        if (Array.isArray(list)) {
            return list.map((item: any) => ({
                id: String(item.id || item.name),
                name: String(item.name || item.id),
                lang: String(item.lang || "")
            }))
        }
        return []
    } catch {
        return []
    }
}

export function stopBrowserSpeaking(): void {
    if (isTtsSupported()) {
        window.speechSynthesis.cancel()
    }
}

interface SynthesizedAudio {
    audioBase64?: string
    mimeType?: string
    error?: string
}

export function createChunkedReader(
    getConfig: () => SpeechPlaybackConfig,
    callbacks: ChunkedReaderCallbacks = {}
): ChunkedReaderController {
    let chunks: SpeechChunk[] = []
    let currentIndex = 0
    let isSpeaking = false
    let isPaused = false
    let runToken = 0
    let activeAudio: any = null
    let pauseTimer: ReturnType<typeof setTimeout> | null = null
    let prefetchCache = new Map<number, Promise<SynthesizedAudio>>()

    function clearPendingTimer(): void {
        if (pauseTimer !== null) {
            clearTimeout(pauseTimer)
            pauseTimer = null
        }
    }

    function stopActiveAudio(): void {
        if (activeAudio) {
            activeAudio.onended = null
            activeAudio.onerror = null
            try {
                activeAudio.pause()
                activeAudio.src = ""
            } catch {
                // Already released
            }
            activeAudio = null
        }
    }

    function emitState(): void {
        callbacks.onStateChange?.({
            isSpeaking,
            isPaused,
            currentIndex,
            totalChunks: chunks.length
        })
    }

    function synthesizeChunkAudio(
        index: number,
        engine: "system-native" | "rhvoice",
        config: SpeechPlaybackConfig
    ): Promise<SynthesizedAudio> {
        const existing = prefetchCache.get(index)
        if (existing) {
            return existing
        }
        const chunk = chunks[index]
        if (!chunk) {
            return Promise.resolve({ error: "Invalid chunk index." })
        }
        const promise: Promise<SynthesizedAudio> = window.sevenCsApi.invoke(
            "msgSynthesizeLocalTts",
            {
                text: chunk.spokenText,
                engine,
                voice: config.voice,
                rate: config.rate,
                pitch: config.pitch,
                rhvoicePath: config.rhvoicePath
            }
        )
        prefetchCache.set(index, promise)
        return promise
    }

    function scheduleNextChunk(finishedChunk: SpeechChunk, token: number): void {
        if (token !== runToken) {
            return
        }
        const config = getConfig()
        let delayMs = 40
        if (finishedChunk.isHeading) {
            delayMs = Math.round(config.paragraphPauseMs * 1.4)
        } else if (finishedChunk.isParagraphEnd) {
            delayMs = config.paragraphPauseMs
        }

        const nextIndex = currentIndex + 1
        if (nextIndex >= chunks.length) {
            pauseTimer = setTimeout(() => {
                if (token !== runToken) return
                isSpeaking = false
                isPaused = false
                emitState()
                callbacks.onComplete?.()
            }, delayMs)
            return
        }

        pauseTimer = setTimeout(() => {
            if (token !== runToken) return
            currentIndex = nextIndex
            playCurrentChunk(token)
        }, delayMs)
    }

    function playWithBrowserSpeech(
        chunk: SpeechChunk,
        config: SpeechPlaybackConfig,
        token: number
    ): void {
        if (!isTtsSupported()) {
            isSpeaking = false
            isPaused = false
            emitState()
            callbacks.onError?.("Speech synthesis is not available in this environment.")
            return
        }

        window.speechSynthesis.cancel()
        const utterance = new window.SpeechSynthesisUtterance(chunk.spokenText)
        utterance.rate = config.rate
        utterance.pitch = config.pitch
        utterance.volume = config.volume
        if (config.lang) {
            utterance.lang = config.lang
        }
        if (config.voice) {
            const matched = window.speechSynthesis.getVoices().find((v) => v.name === config.voice)
            if (matched) {
                utterance.voice = matched
            }
        }

        utterance.onend = () => {
            if (token !== runToken) return
            scheduleNextChunk(chunk, token)
        }
        utterance.onerror = (event) => {
            if (token !== runToken) return
            if (event.error === "interrupted" || event.error === "canceled") {
                return
            }
            isSpeaking = false
            isPaused = false
            emitState()
            callbacks.onError?.(`Speech error: ${event.error}`)
        }

        window.speechSynthesis.speak(utterance)
    }

    async function playCurrentChunk(token: number): Promise<void> {
        if (token !== runToken) {
            return
        }
        const chunk = chunks[currentIndex]
        if (!chunk) {
            isSpeaking = false
            isPaused = false
            emitState()
            callbacks.onComplete?.()
            return
        }

        const config = getConfig()
        callbacks.onChunkStart?.(chunk, currentIndex, chunks.length)
        emitState()

        if (config.engine === "browser") {
            playWithBrowserSpeech(chunk, config, token)
            return
        }

        const localEngine: "system-native" | "rhvoice" = config.engine
        if (currentIndex + 1 < chunks.length) {
            synthesizeChunkAudio(currentIndex + 1, localEngine, config)
        }

        const result = await synthesizeChunkAudio(currentIndex, localEngine, config)
        prefetchCache.delete(currentIndex)

        if (token !== runToken) {
            return
        }

        if (!result?.audioBase64) {
            if (localEngine === "system-native" && isTtsSupported()) {
                callbacks.onNotice?.(
                    "System native speech unavailable; falling back to browser voice."
                )
                playWithBrowserSpeech(chunk, config, token)
                return
            }
            isSpeaking = false
            isPaused = false
            emitState()
            callbacks.onError?.(result?.error || "Offline speech synthesis failed.")
            return
        }

        stopActiveAudio()
        const mime = result.mimeType || "audio/wav"
        const audio = new window.Audio(`data:${mime};base64,${result.audioBase64}`)
        audio.volume = Math.min(1, Math.max(0, config.volume))
        activeAudio = audio

        audio.onended = () => {
            if (token !== runToken) return
            activeAudio = null
            scheduleNextChunk(chunk, token)
        }

        audio.onerror = () => {
            if (token !== runToken) return
            activeAudio = null
            isSpeaking = false
            isPaused = false
            emitState()
            callbacks.onError?.("Could not play synthesized offline audio.")
        }

        try {
            await audio.play()
        } catch (error) {
            if (token !== runToken) return
            activeAudio = null
            isSpeaking = false
            isPaused = false
            emitState()
            callbacks.onError?.(
                error instanceof Error ? error.message : "Audio playback was blocked."
            )
        }
    }

    function stop(): void {
        runToken++
        clearPendingTimer()
        stopActiveAudio()
        stopBrowserSpeaking()
        prefetchCache = new Map()
        isSpeaking = false
        isPaused = false
        emitState()
    }

    function start(newChunks: SpeechChunk[], startIndex = 0): void {
        stop()
        if (newChunks.length === 0) {
            callbacks.onError?.("No readable text found on this page.")
            return
        }
        chunks = newChunks
        currentIndex = Math.min(Math.max(0, startIndex), chunks.length - 1)
        isSpeaking = true
        isPaused = false
        const token = ++runToken
        playCurrentChunk(token)
    }

    function pause(): void {
        if (!isSpeaking || isPaused) {
            return
        }
        isPaused = true
        clearPendingTimer()
        if (activeAudio) {
            activeAudio.pause()
        } else if (isTtsSupported() && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause()
        }
        emitState()
    }

    function resume(): void {
        if (!isSpeaking || !isPaused) {
            return
        }
        isPaused = false
        if (activeAudio) {
            activeAudio.play()
        } else if (isTtsSupported() && window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
        } else {
            const token = ++runToken
            playCurrentChunk(token)
        }
        emitState()
    }

    function next(): void {
        if (!isSpeaking || chunks.length === 0) {
            return
        }
        if (currentIndex + 1 >= chunks.length) {
            stop()
            callbacks.onComplete?.()
            return
        }
        clearPendingTimer()
        stopActiveAudio()
        stopBrowserSpeaking()
        isPaused = false
        currentIndex++
        const token = ++runToken
        playCurrentChunk(token)
    }

    function previous(): void {
        if (!isSpeaking || chunks.length === 0) {
            return
        }
        clearPendingTimer()
        stopActiveAudio()
        stopBrowserSpeaking()
        isPaused = false
        currentIndex = Math.max(0, currentIndex - 1)
        const token = ++runToken
        playCurrentChunk(token)
    }

    return {
        start,
        pause,
        resume,
        stop,
        next,
        previous,
        isActive: () => isSpeaking
    }
}

export function createVoiceRecognizer(
    options: VoiceRecognitionOptions
): VoiceRecognizerController | null {
    const RecognitionCtor = getSpeechRecognitionConstructor()
    if (!RecognitionCtor) {
        return null
    }

    const recognition = new RecognitionCtor()
    recognition.lang = options.lang || "en-US"
    recognition.continuous = options.continuous ?? false
    recognition.interimResults = options.interimResults ?? true

    recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const chunk = result[0]?.transcript || ""
            if (result.isFinal) {
                finalTranscript += chunk
            } else {
                interimTranscript += chunk
            }
        }
        if (finalTranscript.trim()) {
            options.onResult(finalTranscript.trim(), true)
        } else if (interimTranscript.trim()) {
            options.onResult(interimTranscript.trim(), false)
        }
    }

    recognition.onerror = (event: any) => {
        const errorMap: Record<string, string> = {
            "not-allowed": "Microphone permission was denied.",
            "service-not-allowed": "Speech recognition service is unavailable.",
            "no-speech": "No speech was detected.",
            "audio-capture": "No microphone was detected.",
            network: "Voice recognition requires an online speech service in this runtime."
        }
        const message = errorMap[event.error] || `Voice recognition error: ${event.error}`
        options.onError?.(message)
    }

    recognition.onend = () => {
        options.onEnd?.()
    }

    return {
        start: () => {
            try {
                recognition.start()
                return true
            } catch (error) {
                options.onError?.(
                    error instanceof Error ? error.message : "Could not start voice recognition."
                )
                return false
            }
        },
        stop: () => {
            try {
                recognition.stop()
            } catch {
                // Already stopped
            }
        },
        abort: () => {
            try {
                recognition.abort()
            } catch {
                // Already aborted
            }
        }
    }
}
