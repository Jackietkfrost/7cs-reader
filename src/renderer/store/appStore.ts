import { defineStore } from "pinia"

type SnackbarQueue = {
    text: string[]
    color: string
}

type AppState = {
    openedSettings: boolean
    fontSize: number
    theme: string
    nightMode: boolean
    tagsVisible: boolean
    ratingsVisible: boolean
    archivesVisible: boolean
    snackbar: SnackbarQueue
    language: string
    isTTS: boolean
    fontFamily: string
    fonts: string[]
}

export const useAppStore = defineStore("appStore", {
    state: (): AppState => ({
        openedSettings: false,
        fontSize: 0,
        theme: "",
        nightMode: false,
        tagsVisible: true,
        ratingsVisible: true,
        archivesVisible: false,
        snackbar: {
            text: [""],
            color: "info"
        },
        language: "",
        isTTS: false,
        fontFamily: "",
        fonts: []
    }),
    getters: {
        getTheme: (state) => state.theme,
        getOpenedSettings: (state) => state.openedSettings,
        getFontSize: (state) => state.fontSize,
        getNightMode: (state) => state.nightMode,
        getLanguage: (state) => state.language,
        getIsTTS: (state) => state.isTTS,
        getFontFamily: (state) => state.fontFamily,
        getFonts: (state) => state.fonts,
        getTagsVisible: (state) => state.tagsVisible,
        getRatingsVisible: (state) => state.ratingsVisible
    },
    actions: {
        setOpenSettings(openedSettings: boolean) {
            this.openedSettings = openedSettings
        },
        setTheme(theme: string) {
            this.theme = theme
        },
        setFontSize(fontSize: number) {
            this.fontSize = fontSize
        },
        setNightMode(nightMode: boolean) {
            this.nightMode = nightMode
        },
        setTagsVisible(tagsVisible: boolean) {
            this.tagsVisible = tagsVisible
        },
        setRatingsVisible(ratingsVisible: boolean) {
            this.ratingsVisible = ratingsVisible
        },
        setLanguage(language: string) {
            this.language = language
        },
        setIsTTS(isTTS: boolean) {
            this.isTTS = isTTS
        },
        setFontFamily(fontFamily: string) {
            this.fontFamily = fontFamily
        },
        setFonts() {
            window.sevenCsApi.invoke("msgGetFonts").then((fonts) => {
                this.fonts = fonts
            })
        },
        setVisibleArchives(visible: boolean) {
            this.archivesVisible = visible
        },
        addSnackbar(message: string, color: string) {
            this.snackbar.text.push(message)
            this.snackbar.color = color
        }
    }
})
