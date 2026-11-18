import { defineStore } from "pinia"

export const useBookStore = defineStore("bookStore", {
    state: () => ({
        pageNumber: 0,
        bookName: "",
        lastOpenedBook: "",
        books: [] as string[],
        metadata: {} as Record<
            string,
            {
                rating?: number
                categories?: string[]
                bookmark?: string
                progress?: number
                currentPage?: number
                totalPages?: number
            }
        >,
        covers: {} as Record<string, string>,
        loadingCovers: {} as Record<string, boolean>,
        infoCache: {} as Record<string, any>
    }),
    getters: {
        getCounter: (state): number => state.pageNumber,
        getBookName: (state): string => state.bookName,
        getBooks: (state): string[] => state.books,
        getLastOpenedBook: (state): string => state.lastOpenedBook,
        getMetadata: (state) => state.metadata,
        getCover:
            (state) =>
            (bookFilename: string): string | undefined =>
                state.covers[bookFilename]
    },
    actions: {
        counterIncrease(amount: number) {
            this.pageNumber += amount
        },
        setBookName(name: string) {
            this.bookName = name
        },
        setLastOpenedBook(name: string) {
            this.lastOpenedBook = name
        },
        initCoverCache() {
            try {
                const cachedCoversStr = localStorage.getItem("7cs_covers_cache")
                if (cachedCoversStr) {
                    const parsed = JSON.parse(cachedCoversStr)
                    this.covers = { ...this.covers, ...parsed }
                }
                const cachedInfoStr = localStorage.getItem("7cs_info_cache")
                if (cachedInfoStr) {
                    const parsedInfo = JSON.parse(cachedInfoStr)
                    this.infoCache = { ...this.infoCache, ...parsedInfo }
                }
            } catch (e) {
                console.error("Failed to load covers or info from localStorage cache:", e)
            }
        },
        async setCover(bookFilename: string, coverUrl: string) {
            if (!bookFilename || !coverUrl) return
            this.covers[bookFilename] = coverUrl
            this.loadingCovers[bookFilename] = false

            // Persist as base64 to localStorage for instant loads on app restarts
            try {
                let dataUrl = coverUrl
                if (coverUrl.startsWith("blob:")) {
                    const response = await fetch(coverUrl)
                    const blob = await response.blob()
                    dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onloadend = () => resolve(reader.result as string)
                        reader.onerror = reject
                        reader.readAsDataURL(blob)
                    })
                    this.covers[bookFilename] = dataUrl
                }
                const cachedCoversStr = localStorage.getItem("7cs_covers_cache") || "{}"
                const cachedCovers = JSON.parse(cachedCoversStr)
                cachedCovers[bookFilename] = dataUrl
                localStorage.setItem("7cs_covers_cache", JSON.stringify(cachedCovers))
            } catch (e) {
                console.warn("Could not save cover to localStorage cache:", e)
            }
        },
        setLoadingCover(bookFilename: string, isLoading: boolean) {
            this.loadingCovers[bookFilename] = isLoading
        },
        setBookInfo(bookFilename: string, info: any) {
            if (!bookFilename || !info) return
            const extractString = (val: any): string => {
                if (!val) return ""
                if (typeof val === "string") return val
                if (Array.isArray(val)) return val.map(extractString).filter(Boolean).join(" ")
                if (typeof val === "object") {
                    if (val._) return extractString(val._)
                    if (val.text) return extractString(val.text)
                    if (val.content) return extractString(val.content)
                    if (val.value) return extractString(val.value)
                    return Object.values(val).map(extractString).filter(Boolean).join(" ")
                }
                return String(val)
            }

            const cleanInfo = {
                title: extractString(info.title),
                creator: extractString(info.creator),
                publisher: extractString(info.publisher),
                description: extractString(info.description),
                language: extractString(info.language),
                pubdate: extractString(info.pubdate),
                isMetadataLoaded: true
            }
            this.infoCache[bookFilename] = {
                ...cleanInfo,
                cover: info.cover || this.covers[bookFilename]
            }

            if (info?.cover) {
                this.setCover(bookFilename, info.cover)
            }

            try {
                const cachedInfoStr = localStorage.getItem("7cs_info_cache") || "{}"
                const cachedInfo = JSON.parse(cachedInfoStr)
                cachedInfo[bookFilename] = cleanInfo
                localStorage.setItem("7cs_info_cache", JSON.stringify(cachedInfo))
            } catch (e) {
                console.warn("Could not save book info to localStorage cache:", e)
            }
        },
        async loadMetadata() {
            this.initCoverCache()
            try {
                const meta = await window.sevenCsApi.invoke("msgGetMetadata")
                this.metadata = meta || {}
            } catch (e) {
                console.error("Failed to load book metadata:", e)
            }
        },
        async saveMetadata(bookName: string, rating: number, categories: string[]) {
            try {
                if (!this.metadata[bookName]) {
                    this.metadata[bookName] = {}
                }
                this.metadata[bookName].rating = rating
                this.metadata[bookName].categories = categories

                await window.sevenCsApi.invoke(
                    "msgSaveMetadata",
                    JSON.parse(JSON.stringify(this.metadata))
                )
            } catch (e) {
                console.error("Failed to save book metadata:", e)
            }
        },
        async saveBookmark(
            bookName: string,
            bookmark: string,
            progress?: number,
            currentPage?: number,
            totalPages?: number
        ) {
            try {
                if (!this.metadata[bookName]) {
                    this.metadata[bookName] = {}
                }
                this.metadata[bookName].bookmark = bookmark
                if (typeof progress === "number") {
                    this.metadata[bookName].progress = progress
                }
                if (typeof currentPage === "number") {
                    this.metadata[bookName].currentPage = currentPage
                }
                if (typeof totalPages === "number") {
                    this.metadata[bookName].totalPages = totalPages
                }

                await window.sevenCsApi.invoke(
                    "msgSaveMetadata",
                    JSON.parse(JSON.stringify(this.metadata))
                )
            } catch (e) {
                console.error("Failed to save book bookmark:", e)
            }
        },
        setMetadata(newMeta: any) {
            this.metadata = newMeta || {}
        }
    }
})
