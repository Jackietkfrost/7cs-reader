import { defineStore } from "pinia"
import {
    AppSettings,
    BookTypographySettings,
    DEFAULT_APP_SETTINGS,
    ListingViewMode,
    ListingViewSettings,
    SettingsPayload,
    SpeechSettings,
    normalizeSettings
} from "@/main/types/Settings"
import vuetify from "@/renderer/plugins/vuetify"
import i18n from "@/renderer/plugins/i18n"

type SnackbarQueue = {
    text: string[]
    color: string
}

type AppState = {
    openedSettings: boolean
    settingsLoaded: boolean
    configPath: string
    settings: AppSettings
    fonts: string[]
    snackbar: SnackbarQueue
    announcement: string
}

export function resolveVuetifyThemeName(nightMode: boolean, highContrast: boolean): string {
    if (nightMode && highContrast) {
        return "highContrastDark"
    }
    if (!nightMode && highContrast) {
        return "highContrastLight"
    }
    return nightMode ? "dark" : "light"
}

function applySettingsToEnvironment(settings: AppSettings): void {
    vuetify.theme.global.name.value = resolveVuetifyThemeName(
        settings.nightMode,
        settings.highContrast
    )

    const availableLocales = i18n.global.availableLocales as string[]
    const targetLocale = availableLocales.includes(settings.language) ? settings.language : "en"
    ;(i18n.global.locale as { value: string }).value = targetLocale
    vuetify.locale.current.value = targetLocale

    if (typeof document !== "undefined") {
        const root = document.documentElement
        root.style.fontSize = `${settings.uiScale}%`
        root.classList.toggle("a11y-high-contrast", settings.highContrast)
        root.classList.toggle("a11y-reduced-motion", settings.reducedMotion)
        root.classList.toggle("a11y-enhanced-focus", settings.enhancedFocus)
    }
}

export const useAppStore = defineStore("appStore", {
    state: (): AppState => ({
        openedSettings: false,
        settingsLoaded: false,
        configPath: "",
        settings: normalizeSettings(DEFAULT_APP_SETTINGS),
        fonts: [],
        snackbar: {
            text: [],
            color: "info"
        },
        announcement: ""
    }),
    getters: {
        getOpenedSettings: (state): boolean => state.openedSettings,
        getSettings: (state): AppSettings => state.settings,
        getConfigPath: (state): string => state.configPath,
        getFonts: (state): string[] => state.fonts,
        tagsVisible: (state): boolean => state.settings.tagsVisible,
        ratingsVisible: (state): boolean => state.settings.ratingsVisible,
        archivesVisible: (state): boolean => state.settings.archivesVisible,
        activeThemeName: (state): string =>
            resolveVuetifyThemeName(state.settings.nightMode, state.settings.highContrast)
    },
    actions: {
        setOpenSettings(openedSettings: boolean): void {
            this.openedSettings = openedSettings
        },
        announce(message: string): void {
            if (!this.settings.screenReaderAnnouncements || !message.trim()) {
                return
            }
            this.announcement = ""
            setTimeout(() => {
                this.announcement = message
            }, 20)
        },
        applyPayload(payload?: SettingsPayload): void {
            if (!payload) {
                return
            }
            this.settings = normalizeSettings(payload.settings)
            if (payload.configPath) {
                this.configPath = payload.configPath
            }
            applySettingsToEnvironment(this.settings)
        },
        async loadSettings(): Promise<void> {
            try {
                const payload: SettingsPayload = await window.sevenCsApi.invoke("msgGetSettings")
                this.applyPayload(payload)
            } catch (error) {
                console.error("Failed to load settings:", error)
                applySettingsToEnvironment(this.settings)
            } finally {
                this.settingsLoaded = true
            }
        },
        async persistSettings(): Promise<void> {
            try {
                const plainSettings = JSON.parse(JSON.stringify(this.settings))
                const payload: SettingsPayload = await window.sevenCsApi.invoke(
                    "msgSaveSettings",
                    plainSettings
                )
                if (payload?.configPath) {
                    this.configPath = payload.configPath
                }
            } catch (error) {
                console.error("Failed to save settings:", error)
            }
        },
        async updateSettings(patch: Partial<AppSettings>): Promise<void> {
            this.settings = normalizeSettings({
                ...this.settings,
                ...patch,
                listingViews: {
                    ...this.settings.listingViews,
                    ...(patch.listingViews || {})
                },
                bookTypography: {
                    ...this.settings.bookTypography,
                    ...(patch.bookTypography || {})
                },
                speech: {
                    ...this.settings.speech,
                    ...(patch.speech || {})
                }
            })
            applySettingsToEnvironment(this.settings)
            await this.persistSettings()
        },
        async setListingView(
            screen: keyof ListingViewSettings,
            mode: ListingViewMode
        ): Promise<void> {
            await this.updateSettings({
                listingViews: {
                    ...this.settings.listingViews,
                    [screen]: mode
                }
            })
            this.announce(
                mode === "list" ? `Switched ${screen} to list view` : `Switched ${screen} to gallery view`
            )
        },
        async updateBookTypography(patch: Partial<BookTypographySettings>): Promise<void> {
            await this.updateSettings({
                bookTypography: {
                    ...this.settings.bookTypography,
                    ...patch
                }
            })
        },
        async updateSpeech(patch: Partial<SpeechSettings>): Promise<void> {
            await this.updateSettings({
                speech: {
                    ...this.settings.speech,
                    ...patch
                }
            })
        },
        async resetSettings(): Promise<void> {
            try {
                const payload: SettingsPayload = await window.sevenCsApi.invoke("msgResetSettings")
                this.applyPayload(payload)
                this.addSnackbar("Settings reset to defaults", "info")
                this.announce("Settings reset to defaults")
            } catch (error) {
                console.error("Failed to reset settings:", error)
            }
        },
        async revealSettingsFile(): Promise<void> {
            try {
                await window.sevenCsApi.invoke("msgRevealSettingsFile")
            } catch (error) {
                console.error("Failed to reveal settings file:", error)
            }
        },
        async exportSettings(): Promise<void> {
            try {
                const plainSettings = JSON.parse(JSON.stringify(this.settings))
                const result = await window.sevenCsApi.invoke("msgExportSettings", plainSettings)
                if (!result?.canceled) {
                    this.addSnackbar("Configuration exported", "success")
                    this.announce("Configuration exported")
                }
            } catch (error) {
                console.error("Failed to export settings:", error)
                this.addSnackbar("Could not export configuration", "error")
            }
        },
        async importSettings(): Promise<void> {
            try {
                const result = await window.sevenCsApi.invoke("msgImportSettings")
                if (result?.canceled) {
                    return
                }
                if (result?.error) {
                    this.addSnackbar(`Import failed: ${result.error}`, "error")
                    return
                }
                this.applyPayload(result)
                this.addSnackbar("Configuration imported", "success")
                this.announce("Configuration imported")
            } catch (error) {
                console.error("Failed to import settings:", error)
                this.addSnackbar("Could not import configuration", "error")
            }
        },
        async loadFonts(): Promise<void> {
            if (this.fonts.length > 0) {
                return
            }
            try {
                const systemFonts: string[] = await window.sevenCsApi.invoke("msgGetFonts")
                this.fonts = Array.isArray(systemFonts) ? systemFonts : []
            } catch (error) {
                console.error("Failed to load system fonts:", error)
                this.fonts = []
            }
        },
        setVisibleArchives(visible: boolean): void {
            this.updateSettings({ archivesVisible: visible })
        },
        addSnackbar(message: string, color: string): void {
            this.snackbar.text.push(message)
            this.snackbar.color = color
        }
    }
})
