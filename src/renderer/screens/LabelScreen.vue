<template>
    <v-container class="py-8 px-6 screen-container fill-height align-start">
        <v-row class="mb-6 w-100">
            <v-col cols="12">
                <v-card
                    class="header-card rounded px-6 py-6 d-flex flex-wrap align-center justify-space-between ga-4"
                >
                    <div class="d-flex align-center">
                        <v-avatar size="64" color="teal-lighten-4" class="mr-4 elevation-2">
                            <v-icon size="36" color="teal-darken-2" aria-hidden="true">
                                mdi-tag-multiple
                            </v-icon>
                        </v-avatar>
                        <div>
                            <h1 class="text-h4 font-weight-black mb-1">
                                Categories &amp; Shelves
                            </h1>
                            <p class="text-subtitle-1 text-medium-emphasis mb-0">
                                Browse your library grouped by tags and genres
                            </p>
                        </div>
                    </div>
                    <ViewModeToggle v-model="viewMode" />
                </v-card>
            </v-col>
        </v-row>

        <v-row class="w-100 flex-grow-1">
            <v-col cols="12" class="px-0">
                <template v-if="categorizedGroups.length > 0">
                    <div
                        v-for="group in categorizedGroups"
                        :key="group.name"
                        class="shelf-container mb-8 px-3"
                    >
                        <div class="d-flex align-center mb-3">
                            <v-icon color="primary" class="mr-2" size="20" aria-hidden="true">
                                {{
                                    group.name === "Uncategorized"
                                        ? "mdi-tag-off-outline"
                                        : "mdi-folder-open-outline"
                                }}
                            </v-icon>
                            <h2 class="text-h6 font-weight-bold mb-0">
                                {{ group.name }}
                            </h2>
                            <v-chip
                                size="x-small"
                                color="primary"
                                variant="tonal"
                                rounded
                                class="ml-3 px-2 font-weight-bold"
                            >
                                {{ group.books.length }}
                                {{ group.books.length === 1 ? "book" : "books" }}
                            </v-chip>
                        </div>

                        <div
                            v-if="viewMode === 'gallery'"
                            class="horizontal-scroll-row py-2 d-flex"
                            data-testid="labeled-gallery-view"
                        >
                            <v-card
                                v-for="book in group.books"
                                :key="book.filename"
                                variant="outlined"
                                class="shelf-book-card mr-4 rounded flex-shrink-0 relative overflow-hidden"
                                width="180"
                                height="290"
                            >
                                <v-hover v-slot="{ isHovering, props: hoverProps }">
                                    <div v-bind="hoverProps" class="fill-height d-flex flex-column">
                                        <div
                                            class="cover-container relative flex-grow-1"
                                            style="height: 180px; overflow: hidden"
                                        >
                                            <v-skeleton-loader
                                                v-if="
                                                    !bookStore.covers[book.filename] &&
                                                    !noCovers[book.filename]
                                                "
                                                type="image"
                                                height="180"
                                                class="w-100 fill-height"
                                            />
                                            <v-img
                                                v-else-if="bookStore.covers[book.filename]"
                                                :src="bookStore.covers[book.filename]"
                                                :alt="book.title"
                                                height="180"
                                                cover
                                            />
                                            <div
                                                v-else
                                                class="empty-cover d-flex align-center justify-center fill-height"
                                            >
                                                <v-icon size="40">
                                                    mdi-book-open-blank-variant
                                                </v-icon>
                                            </div>

                                            <v-fade-transition>
                                                <div
                                                    v-if="isHovering"
                                                    class="hover-overlay d-flex flex-column align-center justify-center"
                                                >
                                                    <v-btn
                                                        color="primary"
                                                        size="small"
                                                        prepend-icon="mdi-book-open-page-variant"
                                                        class="mb-2 rounded font-weight-bold"
                                                        width="110"
                                                        @click="handleOpenBook(book.filename)"
                                                    >
                                                        Read
                                                    </v-btn>
                                                    <v-btn
                                                        color="white"
                                                        variant="outlined"
                                                        size="small"
                                                        prepend-icon="mdi-pencil"
                                                        class="rounded font-weight-bold"
                                                        width="110"
                                                        @click="openEditDialog(book.filename)"
                                                    >
                                                        Edit
                                                    </v-btn>
                                                </div>
                                            </v-fade-transition>
                                        </div>

                                        <div class="px-2 pt-1 pb-1 progress-strip">
                                            <div
                                                class="d-flex align-center justify-space-between text-caption text-medium-emphasis mb-1 font-weight-medium"
                                            >
                                                <span
                                                    class="d-flex align-center font-weight-bold text-primary"
                                                    style="font-size: 0.7rem"
                                                >
                                                    <v-icon
                                                        size="11"
                                                        color="primary"
                                                        class="mr-1"
                                                        aria-hidden="true"
                                                    >
                                                        mdi-book-open-page-variant
                                                    </v-icon>
                                                    {{ getProgressPercent(book.filename) }}%
                                                </span>
                                                <span
                                                    class="text-caption text-medium-emphasis"
                                                    style="font-size: 0.68rem"
                                                >
                                                    {{ getPageProgressText(book.filename) }}
                                                </span>
                                            </div>
                                            <v-progress-linear
                                                :model-value="getProgressPercent(book.filename)"
                                                color="primary"
                                                height="4"
                                                rounded
                                            />
                                        </div>

                                        <v-card-text
                                            class="pt-2 pb-2 px-3 flex-shrink-0 d-flex flex-column justify-space-between"
                                            style="height: 110px"
                                        >
                                            <div>
                                                <h4
                                                    class="book-title text-caption font-weight-bold text-truncate-2 mb-1"
                                                >
                                                    {{ book.title }}
                                                </h4>
                                            </div>
                                            <div v-if="book.rating > 0" class="d-flex align-center">
                                                <v-rating
                                                    :model-value="book.rating"
                                                    color="amber"
                                                    active-color="amber"
                                                    density="compact"
                                                    size="x-small"
                                                    readonly
                                                />
                                                <span
                                                    class="text-caption text-amber ml-1 font-weight-bold"
                                                >
                                                    ({{ book.rating }})
                                                </span>
                                            </div>
                                            <div v-else class="text-caption text-medium-emphasis">
                                                Unrated
                                            </div>
                                        </v-card-text>
                                    </div>
                                </v-hover>
                            </v-card>
                        </div>

                        <div
                            v-else
                            class="d-flex flex-column ga-2 py-2"
                            data-testid="labeled-list-view"
                        >
                            <v-card
                                v-for="book in group.books"
                                :key="book.filename"
                                variant="outlined"
                                rounded
                                class="shelf-list-item px-4 py-3 d-flex align-center ga-4"
                            >
                                <div
                                    class="list-thumb rounded overflow-hidden flex-shrink-0 clickable"
                                    role="button"
                                    tabindex="0"
                                    :aria-label="`Open ${book.title}`"
                                    @click="handleOpenBook(book.filename)"
                                    @keydown.enter="handleOpenBook(book.filename)"
                                    @keydown.space.prevent="handleOpenBook(book.filename)"
                                >
                                    <v-img
                                        v-if="bookStore.covers[book.filename]"
                                        :src="bookStore.covers[book.filename]"
                                        :alt="book.title"
                                        width="44"
                                        height="64"
                                        cover
                                    />
                                    <div
                                        v-else
                                        class="d-flex align-center justify-center fill-height"
                                    >
                                        <v-icon size="24" icon="mdi-book-open-blank-variant" />
                                    </div>
                                </div>

                                <div
                                    class="flex-grow-1 min-w-0 clickable"
                                    role="button"
                                    tabindex="0"
                                    :aria-label="`Read ${book.title}`"
                                    @click="handleOpenBook(book.filename)"
                                    @keydown.enter="handleOpenBook(book.filename)"
                                    @keydown.space.prevent="handleOpenBook(book.filename)"
                                >
                                    <div class="text-subtitle-1 font-weight-bold text-truncate">
                                        {{ book.title }}
                                    </div>
                                    <div class="text-caption text-medium-emphasis text-truncate">
                                        {{ book.creator }}
                                    </div>
                                </div>

                                <div
                                    class="d-none d-md-flex align-center ga-2"
                                    style="min-width: 140px"
                                >
                                    <v-progress-linear
                                        :model-value="getProgressPercent(book.filename)"
                                        color="primary"
                                        height="5"
                                        rounded
                                        style="width: 72px"
                                    />
                                    <span class="text-caption text-medium-emphasis">
                                        {{ getProgressPercent(book.filename) }}%
                                    </span>
                                </div>

                                <div
                                    v-if="book.rating > 0"
                                    class="d-none d-sm-flex align-center"
                                >
                                    <v-rating
                                        :model-value="book.rating"
                                        color="amber"
                                        active-color="amber"
                                        density="compact"
                                        size="x-small"
                                        readonly
                                    />
                                </div>

                                <div class="d-flex align-center ga-1 flex-shrink-0">
                                    <v-btn
                                        size="small"
                                        variant="text"
                                        prepend-icon="mdi-book-open-page-variant"
                                        @click="handleOpenBook(book.filename)"
                                    >
                                        Read
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        variant="outlined"
                                        rounded
                                        prepend-icon="mdi-pencil"
                                        @click="openEditDialog(book.filename)"
                                    >
                                        Edit
                                    </v-btn>
                                </div>
                            </v-card>
                        </div>
                    </div>
                </template>

                <div v-else class="text-center py-12">
                    <v-icon size="80" color="medium-emphasis" class="mb-4">
                        mdi-tag-off-outline
                    </v-icon>
                    <h3 class="text-h5 font-weight-bold">No Books in Library</h3>
                    <p class="text-body-1 text-medium-emphasis">
                        Add epub books to your Library to get started.
                    </p>
                </div>
            </v-col>
        </v-row>

        <div v-show="false">
            <template v-for="book in books" :key="book">
                <vue-reader
                    v-if="!bookStore.infoCache[book]?.isMetadataLoaded"
                    :url="`./epubs/${book}`"
                    :get-rendition="(rendition) => handleRendition(book, rendition)"
                />
            </template>
        </div>

        <BookMetadataDialog
            v-model="showEditDialog"
            :book-name="editingBook"
            @saved="onMetadataSaved"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useBookStore } from "@/renderer/store/bookStore"
import { useAppStore } from "@/renderer/store/appStore"
import { useRouter } from "vue-router"
import { VueReader } from "vue-reader"
import { Rendition } from "epubjs"
import BookMetadataDialog from "@/renderer/components/library/BookMetadataDialog.vue"
import ViewModeToggle from "@/renderer/components/library/ViewModeToggle.vue"
import type { ListingViewMode } from "@/main/types/Settings"

const bookStore = useBookStore()
const appStore = useAppStore()
const router = useRouter()

const books = ref<string[]>([])
const noCovers = ref<Record<string, boolean>>({})
const showEditDialog = ref(false)
const editingBook = ref("")

const viewMode = computed<ListingViewMode>({
    get: () => appStore.getSettings.listingViews.labeled,
    set: (mode) => appStore.setListingView("labeled", mode)
})

const getProgressPercent = (filename: string): number => {
    const meta = bookStore.metadata[filename]
    if (!meta) return 0
    if (typeof meta.progress === "number" && meta.progress > 0) return Math.min(100, meta.progress)
    if (meta.currentPage && meta.totalPages && meta.totalPages > 0) {
        return Math.min(100, Math.max(1, Math.round((meta.currentPage / meta.totalPages) * 100)))
    }
    if (meta.bookmark) return 1
    return 0
}

const getPageProgressText = (filename: string): string => {
    const meta = bookStore.metadata[filename]
    if (!meta) return "Unread"
    const current = meta.currentPage
    const total = meta.totalPages
    if (current !== undefined && total !== undefined && total > 0) {
        return `p. ${current} / ${total}`
    }
    if (total !== undefined && total > 0) {
        return `${total} pages`
    }
    if (getProgressPercent(filename) > 0) {
        return `${getProgressPercent(filename)}% read`
    }
    if (meta.bookmark) return "In Progress"
    return "Unread"
}

const handleMetadataUpdated = (_event: unknown, newMeta: any) => {
    bookStore.setMetadata(newMeta)
}

const handleEditTags = (_event: unknown, bookFile: string) => {
    openEditDialog(bookFile)
}

onMounted(async () => {
    await bookStore.loadMetadata()
    await getBooks()
    window.sevenCsApi.on("metadataUpdated", handleMetadataUpdated)
    window.sevenCsApi.on("editTags", handleEditTags)
})

onUnmounted(() => {
    window.sevenCsApi.off("metadataUpdated", handleMetadataUpdated)
    window.sevenCsApi.off("editTags", handleEditTags)
})

async function getBooks() {
    const list = await window.sevenCsApi.invoke("msgGetBooks")
    books.value = list
}

const handleRendition = (book: string, rendition: Rendition) => {
    rendition.book.ready
        .then(() => {
            rendition.book.loaded.metadata
                .then(async (metadata) => {
                    let cover: string | undefined
                    try {
                        cover = (await rendition.book.coverUrl()) || undefined
                    } catch {
                        noCovers.value[book] = true
                    }
                    if (cover) {
                        bookStore.setCover(book, cover)
                    } else {
                        noCovers.value[book] = true
                    }
                    bookStore.setBookInfo(book, { ...metadata, cover })
                })
                .catch(() => {
                    noCovers.value[book] = true
                })
        })
        .catch(() => {
            noCovers.value[book] = true
        })
}

const categorizedGroups = computed(() => {
    if (books.value.length === 0) return []

    const groups: Record<string, any[]> = {}
    const uncategorized: any[] = []

    books.value.forEach((filename) => {
        const meta = bookStore.metadata[filename] || { rating: 0, categories: [] }
        const info = bookStore.infoCache[filename] || {}
        const bookObj = {
            filename,
            rating: meta.rating || 0,
            categories: meta.categories || [],
            title: info.title || filename.replace(".epub", "").replace(/[-_]/g, " "),
            creator: info.creator || "Unknown Author"
        }

        if (!bookObj.categories || bookObj.categories.length === 0) {
            uncategorized.push(bookObj)
        } else {
            bookObj.categories.forEach((cat) => {
                const cleanCat = cat.trim()
                if (cleanCat) {
                    if (!groups[cleanCat]) {
                        groups[cleanCat] = []
                    }
                    groups[cleanCat].push(bookObj)
                }
            })
        }
    })

    const list = Object.keys(groups)
        .sort()
        .map((name) => ({
            name,
            books: groups[name]
        }))

    if (uncategorized.length > 0) {
        list.push({
            name: "Uncategorized",
            books: uncategorized
        })
    }

    return list
})

const handleOpenBook = (filename: string) => {
    bookStore.setBookName(filename)
    router.push("/reader")
}

const openEditDialog = (filename: string) => {
    editingBook.value = filename
    showEditDialog.value = true
}

const onMetadataSaved = () => {
    bookStore.loadMetadata()
}
</script>

<style scoped>
.screen-container {
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
}

.header-card {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.horizontal-scroll-row {
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--v-theme-on-surface), 0.18) transparent;
}

.horizontal-scroll-row::-webkit-scrollbar {
    height: 6px;
}

.horizontal-scroll-row::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-on-surface), 0.2);
    border-radius: 3px;
}

.shelf-book-card,
.shelf-list-item {
    background-color: rgb(var(--v-theme-surface));
}

.cover-container,
.progress-strip,
.list-thumb {
    background-color: rgb(var(--v-theme-backgroundAccent));
}

.list-thumb {
    width: 44px;
    height: 64px;
}

.clickable {
    cursor: pointer;
}

.min-w-0 {
    min-width: 0;
}

.hover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(18, 18, 18, 0.85);
    backdrop-filter: blur(2px);
    z-index: 2;
}

.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.1rem;
    height: 2.2rem;
}
</style>
