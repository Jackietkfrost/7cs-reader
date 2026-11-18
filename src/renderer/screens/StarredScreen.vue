<template>
    <v-container class="py-8 px-6 screen-container fill-height align-start">
        <v-row class="mb-6 w-100">
            <v-col cols="12">
                <v-card class="header-card rounded px-6 py-6 d-flex align-center">
                    <v-avatar size="64" color="amber-lighten-4" class="mr-4 elevation-2">
                        <v-icon size="36" color="amber-darken-3" aria-hidden="true">mdi-star</v-icon>
                    </v-avatar>
                    <div>
                        <h1 class="text-h4 font-weight-black mb-1">
                            Favorites &amp; Rated Books
                        </h1>
                        <p class="text-subtitle-1 text-medium-emphasis mb-0">
                            Browse and rate your books directly by star rating
                        </p>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mb-6 w-100 align-center">
            <v-col cols="12" md="4">
                <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search books by title or author..."
                    aria-label="Search books by title or author"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    data-testid="rated-search-input"
                />
            </v-col>
            <v-col cols="6" sm="4" md="3">
                <v-select
                    v-model="selectedRating"
                    :items="ratingOptions"
                    item-title="title"
                    item-value="value"
                    label="Filter Rating"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    data-testid="rated-filter-select"
                />
            </v-col>
            <v-col cols="6" sm="4" md="3">
                <v-select
                    v-model="sortBy"
                    :items="sortOptions"
                    item-title="title"
                    item-value="value"
                    label="Sort Books"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    data-testid="rated-sort-select"
                />
            </v-col>
            <v-col cols="12" sm="4" md="2" class="d-flex justify-end">
                <ViewModeToggle v-model="viewMode" />
            </v-col>
        </v-row>

        <v-row class="w-100 flex-grow-1">
            <v-col cols="12">
                <v-expansion-panels
                    :model-value="openPanels"
                    multiple
                    variant="accordion"
                    class="rating-accordion"
                    data-testid="rating-accordion"
                    @update:model-value="handlePanelsChange"
                >
                    <v-expansion-panel
                        v-for="group in visibleRatingGroups"
                        :key="group.rating"
                        :value="group.rating"
                        :data-testid="`rating-panel-${group.rating}`"
                    >
                        <v-expansion-panel-title
                            :data-testid="`rating-panel-title-${group.rating}`"
                        >
                            <div class="d-flex align-center justify-space-between w-100 pr-3">
                                <div class="d-flex align-center ga-2">
                                    <span
                                        v-if="group.rating > 0"
                                        class="d-inline-flex align-center"
                                        aria-hidden="true"
                                    >
                                        <v-icon
                                            v-for="star in group.rating"
                                            :key="star"
                                            size="18"
                                            color="amber"
                                            icon="mdi-star"
                                        />
                                    </span>
                                    <v-icon
                                        v-else
                                        size="18"
                                        color="medium-emphasis"
                                        icon="mdi-star-outline"
                                        aria-hidden="true"
                                    />
                                    <span class="text-subtitle-1 font-weight-bold">
                                        {{ group.label }}
                                    </span>
                                </div>
                                <v-chip
                                    size="small"
                                    variant="tonal"
                                    rounded
                                    :data-testid="`rating-panel-count-${group.rating}`"
                                >
                                    {{ group.books.length }}
                                </v-chip>
                            </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text
                            :data-testid="`rating-panel-content-${group.rating}`"
                        >
                            <template v-if="group.books.length > 0">
                                <v-row
                                    v-if="viewMode === 'gallery'"
                                    class="pt-2"
                                    data-testid="starred-gallery-view"
                                >
                                    <v-col
                                        v-for="book in group.books"
                                        :key="book.filename"
                                        cols="6"
                                        sm="4"
                                        md="3"
                                        lg="2"
                                        xl="2"
                                        class="d-flex justify-center mb-4"
                                    >
                                        <v-card
                                            class="starred-card rounded overflow-hidden d-flex flex-column h-100"
                                            :class="{
                                                'card-fade-out': Boolean(fadingOut[book.filename]),
                                                'card-fade-in': Boolean(fadingIn[book.filename])
                                            }"
                                            style="max-width: 220px; width: 100%"
                                            variant="outlined"
                                            :data-testid="`rated-book-card-${book.filename}`"
                                            :data-book-filename="book.filename"
                                            :data-rating-group="group.rating"
                                            @mouseenter="handleCardMouseEnter(book.filename)"
                                            @mouseleave="handleCardMouseLeave(book.filename)"
                                        >
                                            <vue-reader
                                                v-if="
                                                    !bookStore.infoCache[book.filename]
                                                        ?.isMetadataLoaded
                                                "
                                                v-show="false"
                                                :url="`./epubs/${book.filename}`"
                                                :get-rendition="
                                                    (r) => handleRendition(book.filename, r)
                                                "
                                            />

                                            <div
                                                class="cover-container cover-clickable w-100"
                                                role="button"
                                                tabindex="0"
                                                :aria-label="`Open ${book.title}`"
                                                style="height: 230px; overflow: hidden"
                                                @click="handleOpenBook(book.filename)"
                                                @keydown.enter="handleOpenBook(book.filename)"
                                                @keydown.space.prevent="
                                                    handleOpenBook(book.filename)
                                                "
                                            >
                                                <v-skeleton-loader
                                                    v-if="
                                                        !bookStore.covers[book.filename] &&
                                                        !noCovers[book.filename]
                                                    "
                                                    type="image"
                                                    height="230"
                                                    class="w-100 fill-height"
                                                />
                                                <v-img
                                                    v-else-if="bookStore.covers[book.filename]"
                                                    :src="bookStore.covers[book.filename]"
                                                    :alt="book.title"
                                                    cover
                                                    class="align-end fill-height"
                                                    style="
                                                        aspect-ratio: 2 / 3;
                                                        object-fit: cover;
                                                        object-position: top center;
                                                    "
                                                />
                                                <div
                                                    v-else
                                                    class="empty-cover d-flex align-center justify-center fill-height"
                                                    style="aspect-ratio: 2 / 3"
                                                >
                                                    <v-icon size="48">
                                                        mdi-book-open-blank-variant
                                                    </v-icon>
                                                </div>
                                            </div>

                                            <div class="px-3 pt-2 pb-1 progress-strip">
                                                <div
                                                    class="d-flex align-center justify-space-between text-caption text-medium-emphasis mb-1 font-weight-medium"
                                                >
                                                    <span
                                                        class="d-flex align-center font-weight-bold text-primary"
                                                    >
                                                        <v-icon
                                                            size="12"
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
                                                    >
                                                        {{ getPageProgressText(book.filename) }}
                                                    </span>
                                                </div>
                                                <v-progress-linear
                                                    :model-value="getProgressPercent(book.filename)"
                                                    color="primary"
                                                    height="5"
                                                    rounded
                                                />
                                            </div>

                                            <v-card-text
                                                class="pt-3 pb-3 px-3 d-flex flex-column justify-space-between flex-grow-1"
                                            >
                                                <div
                                                    class="title-clickable mb-2"
                                                    role="button"
                                                    tabindex="0"
                                                    :aria-label="`Read ${book.title}`"
                                                    @click="handleOpenBook(book.filename)"
                                                    @keydown.enter="handleOpenBook(book.filename)"
                                                    @keydown.space.prevent="
                                                        handleOpenBook(book.filename)
                                                    "
                                                >
                                                    <h3
                                                        class="text-subtitle-2 font-weight-bold text-truncate mb-1"
                                                    >
                                                        {{ book.title }}
                                                    </h3>
                                                    <p
                                                        class="text-caption text-medium-emphasis text-truncate mb-0"
                                                    >
                                                        {{ book.creator }}
                                                    </p>
                                                </div>

                                                <div
                                                    class="d-flex align-center justify-space-between"
                                                    @click.stop
                                                    @focusout="
                                                        handleRatingFocusOut(book.filename, $event)
                                                    "
                                                >
                                                    <v-rating
                                                        :model-value="book.rating"
                                                        color="amber"
                                                        active-color="amber"
                                                        density="compact"
                                                        size="small"
                                                        hover
                                                        clearable
                                                        :item-aria-label="`Rate ${book.title} {0} out of {1} stars`"
                                                        :data-testid="`inline-rating-${book.filename}`"
                                                        @update:model-value="
                                                            (val) =>
                                                                handleInlineRate(
                                                                    book.filename,
                                                                    book.title,
                                                                    Number(val) || 0
                                                                )
                                                        "
                                                    />
                                                    <span
                                                        class="text-caption font-weight-bold"
                                                        :class="
                                                            book.rating > 0
                                                                ? 'text-amber'
                                                                : 'text-medium-emphasis'
                                                        "
                                                    >
                                                        {{
                                                            book.rating > 0
                                                                ? `${book.rating}.0`
                                                                : "Unrated"
                                                        }}
                                                    </span>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>

                                <div
                                    v-else
                                    class="d-flex flex-column ga-2 pt-2"
                                    data-testid="starred-list-view"
                                >
                                    <v-card
                                        v-for="book in group.books"
                                        :key="book.filename"
                                        variant="outlined"
                                        rounded
                                        class="starred-card px-4 py-3 d-flex align-center ga-4"
                                        :class="{
                                            'card-fade-out': Boolean(fadingOut[book.filename]),
                                            'card-fade-in': Boolean(fadingIn[book.filename])
                                        }"
                                        :data-testid="`rated-book-card-${book.filename}`"
                                        :data-book-filename="book.filename"
                                        :data-rating-group="group.rating"
                                        @mouseenter="handleCardMouseEnter(book.filename)"
                                        @mouseleave="handleCardMouseLeave(book.filename)"
                                    >
                                        <vue-reader
                                            v-if="
                                                !bookStore.infoCache[book.filename]
                                                    ?.isMetadataLoaded
                                            "
                                            v-show="false"
                                            :url="`./epubs/${book.filename}`"
                                            :get-rendition="(r) => handleRendition(book.filename, r)"
                                        />

                                        <div
                                            class="list-thumb rounded overflow-hidden flex-shrink-0 cover-clickable"
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
                                            class="flex-grow-1 min-w-0 title-clickable"
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
                                            class="d-flex align-center ga-2 flex-shrink-0"
                                            @click.stop
                                            @focusout="handleRatingFocusOut(book.filename, $event)"
                                        >
                                            <v-rating
                                                :model-value="book.rating"
                                                color="amber"
                                                active-color="amber"
                                                density="compact"
                                                size="small"
                                                hover
                                                clearable
                                                :item-aria-label="`Rate ${book.title} {0} out of {1} stars`"
                                                :data-testid="`inline-rating-${book.filename}`"
                                                @update:model-value="
                                                    (val) =>
                                                        handleInlineRate(
                                                            book.filename,
                                                            book.title,
                                                            Number(val) || 0
                                                        )
                                                "
                                            />
                                            <span
                                                class="text-caption font-weight-bold"
                                                style="min-width: 48px; text-align: right"
                                                :class="
                                                    book.rating > 0
                                                        ? 'text-amber'
                                                        : 'text-medium-emphasis'
                                                "
                                            >
                                                {{
                                                    book.rating > 0
                                                        ? `${book.rating}.0`
                                                        : "Unrated"
                                                }}
                                            </span>
                                        </div>
                                    </v-card>
                                </div>
                            </template>
                            <div v-else class="text-body-2 text-medium-emphasis py-3 px-2">
                                No books in this rating group.
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useBookStore } from "@/renderer/store/bookStore"
import { useAppStore } from "@/renderer/store/appStore"
import { useRouter } from "vue-router"
import { VueReader } from "vue-reader"
import { Rendition } from "epubjs"
import ViewModeToggle from "@/renderer/components/library/ViewModeToggle.vue"
import type { ListingViewMode } from "@/main/types/Settings"

interface EnrichedBook {
    filename: string
    title: string
    creator: string
    rating: number
    categories: string[]
    progress: number
}

const ALL_RATING_GROUPS = [5, 4, 3, 2, 1, 0] as const

const RATING_LABELS: Record<number, string> = {
    5: "5 Stars",
    4: "4 Stars",
    3: "3 Stars",
    2: "2 Stars",
    1: "1 Star",
    0: "Unrated"
}

const bookStore = useBookStore()
const appStore = useAppStore()
const router = useRouter()

const books = ref<string[]>([])
const noCovers = ref<Record<string, boolean>>({})
const search = ref("")
const selectedRating = ref<string>("all")
const sortBy = ref("title-asc")

const displayedGroup = ref<Record<string, number>>({})
const pendingMove = ref<Record<string, number>>({})
const fadingOut = ref<Record<string, boolean>>({})
const fadingIn = ref<Record<string, boolean>>({})
const hoveredBooks = new Set<string>()
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

const viewMode = computed<ListingViewMode>({
    get: () => appStore.getSettings.listingViews.starred,
    set: (mode) => appStore.setListingView("starred", mode)
})

const ratingOptions = [
    { title: "All Ratings", value: "all" },
    { title: "5 Stars", value: "5" },
    { title: "4 Stars", value: "4" },
    { title: "3 Stars", value: "3" },
    { title: "2 Stars", value: "2" },
    { title: "1 Star", value: "1" },
    { title: "Unrated", value: "0" }
]

const sortOptions = [
    { title: "Title: A-Z", value: "title-asc" },
    { title: "Title: Z-A", value: "title-desc" },
    { title: "Progress: High to Low", value: "progress-desc" }
]

const openPanels = computed<number[]>(() => {
    const closed = new Set(appStore.getSettings.closedRatingGroups)
    return ALL_RATING_GROUPS.filter((rating) => !closed.has(rating))
})

const handlePanelsChange = (nextOpen: unknown): void => {
    const openList = Array.isArray(nextOpen) ? nextOpen.map(Number) : []
    const openSet = new Set(openList)
    const closedRatingGroups = ALL_RATING_GROUPS.filter((rating) => !openSet.has(rating))
    appStore.updateSettings({ closedRatingGroups })
}

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

const syncDisplayedGroups = (): void => {
    const next = { ...displayedGroup.value }
    for (const filename of books.value) {
        if (next[filename] === undefined) {
            next[filename] = bookStore.metadata[filename]?.rating || 0
        } else if (
            !hoveredBooks.has(filename) &&
            pendingMove.value[filename] === undefined &&
            !fadingOut.value[filename]
        ) {
            next[filename] = bookStore.metadata[filename]?.rating || 0
        }
    }
    displayedGroup.value = next
}

const enrichedBooks = computed<EnrichedBook[]>(() => {
    return books.value.map((filename) => {
        const meta = bookStore.metadata[filename] || {}
        const info = bookStore.infoCache[filename] || {}
        return {
            filename,
            title: info.title || filename.replace(".epub", "").replace(/[-_]/g, " "),
            creator: info.creator || "Unknown Author",
            rating: meta.rating || 0,
            categories: meta.categories || [],
            progress: getProgressPercent(filename)
        }
    })
})

const filteredBooks = computed<EnrichedBook[]>(() => {
    const query = search.value ? search.value.trim().toLowerCase() : ""
    return enrichedBooks.value
        .filter((book) => {
            if (!query) return true
            return (
                book.title.toLowerCase().includes(query) ||
                book.creator.toLowerCase().includes(query)
            )
        })
        .sort((a, b) => {
            if (sortBy.value === "title-desc") return b.title.localeCompare(a.title)
            if (sortBy.value === "progress-desc") return b.progress - a.progress
            return a.title.localeCompare(b.title)
        })
})

const visibleRatingGroups = computed(() => {
    const ratingsToShow =
        selectedRating.value === "all"
            ? [...ALL_RATING_GROUPS]
            : [Number(selectedRating.value)]

    return ratingsToShow.map((rating) => ({
        rating,
        label: RATING_LABELS[rating],
        books: filteredBooks.value.filter((book) => {
            const groupRating =
                displayedGroup.value[book.filename] !== undefined
                    ? displayedGroup.value[book.filename]
                    : book.rating
            return groupRating === rating
        })
    }))
})

const clearBookTimer = (filename: string): void => {
    const existing = activeTimers.get(filename)
    if (existing !== undefined) {
        clearTimeout(existing)
        activeTimers.delete(filename)
    }
}

const animateBookMove = (filename: string, targetRating: number, title?: string): void => {
    const currentGroup = displayedGroup.value[filename] ?? bookStore.metadata[filename]?.rating ?? 0
    if (currentGroup === targetRating) {
        delete pendingMove.value[filename]
        return
    }

    clearBookTimer(filename)
    const durationMs = appStore.getSettings.reducedMotion ? 10 : 240
    fadingOut.value = { ...fadingOut.value, [filename]: true }

    const outTimer = setTimeout(() => {
        const nextOut = { ...fadingOut.value }
        delete nextOut[filename]
        fadingOut.value = nextOut

        const nextPending = { ...pendingMove.value }
        delete nextPending[filename]
        pendingMove.value = nextPending

        displayedGroup.value = { ...displayedGroup.value, [filename]: targetRating }
        fadingIn.value = { ...fadingIn.value, [filename]: true }

        if (title) {
            appStore.announce(`Moved ${title} to ${RATING_LABELS[targetRating]}`)
        }

        const inTimer = setTimeout(() => {
            const nextIn = { ...fadingIn.value }
            delete nextIn[filename]
            fadingIn.value = nextIn
            activeTimers.delete(filename)
        }, durationMs + 40)
        activeTimers.set(filename, inTimer)
    }, durationMs)

    activeTimers.set(filename, outTimer)
}

const handleCardMouseEnter = (filename: string): void => {
    hoveredBooks.add(filename)
}

const handleCardMouseLeave = (filename: string): void => {
    hoveredBooks.delete(filename)
    const target = pendingMove.value[filename]
    if (target !== undefined) {
        const book = enrichedBooks.value.find((b) => b.filename === filename)
        animateBookMove(filename, target, book?.title)
    }
}

const handleRatingFocusOut = (filename: string, event: any): void => {
    if (hoveredBooks.has(filename)) {
        return
    }
    const container = event.currentTarget
    const nextFocused = event.relatedTarget
    if (container && nextFocused && container.contains(nextFocused)) {
        return
    }
    const target = pendingMove.value[filename]
    if (target !== undefined) {
        const book = enrichedBooks.value.find((b) => b.filename === filename)
        animateBookMove(filename, target, book?.title)
    }
}

const handleInlineRate = async (
    filename: string,
    title: string,
    newRating: number
): Promise<void> => {
    const currentGroup = displayedGroup.value[filename] ?? bookStore.metadata[filename]?.rating ?? 0
    if (displayedGroup.value[filename] === undefined) {
        displayedGroup.value = { ...displayedGroup.value, [filename]: currentGroup }
    }

    if (newRating === currentGroup) {
        const nextPending = { ...pendingMove.value }
        delete nextPending[filename]
        pendingMove.value = nextPending
    } else {
        pendingMove.value = { ...pendingMove.value, [filename]: newRating }
    }

    const existingCategories = bookStore.metadata[filename]?.categories || []
    await bookStore.saveMetadata(filename, newRating, existingCategories)
    appStore.announce(`Rated ${title} ${RATING_LABELS[newRating]}`)
}

const handleOpenBook = (filename: string): void => {
    bookStore.setBookName(filename)
    router.push("/reader")
}

const handleRendition = (book: string, rendition: Rendition): void => {
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
                    const bookAny = rendition.book as any
                    const rawMeta =
                        metadata || (bookAny.package ? bookAny.package.metadata : {}) || {}
                    bookStore.setBookInfo(book, { ...rawMeta, cover, isMetadataLoaded: true })
                    if (cover) {
                        bookStore.setCover(book, cover)
                    } else {
                        noCovers.value[book] = true
                    }
                })
                .catch(() => {
                    noCovers.value[book] = true
                })
        })
        .catch(() => {
            noCovers.value[book] = true
        })
}

async function getBooks(): Promise<void> {
    const list = await window.sevenCsApi.invoke("msgGetBooks")
    books.value = list
    syncDisplayedGroups()
}

const handleMetadataUpdated = (_event: unknown, newMeta: any): void => {
    bookStore.setMetadata(newMeta)
    syncDisplayedGroups()
}

watch(
    () => bookStore.metadata,
    () => {
        syncDisplayedGroups()
    },
    { deep: true }
)

onMounted(async () => {
    await bookStore.loadMetadata()
    await getBooks()
    window.sevenCsApi.on("metadataUpdated", handleMetadataUpdated)
})

onUnmounted(() => {
    window.sevenCsApi.off("metadataUpdated", handleMetadataUpdated)
    for (const timer of activeTimers.values()) {
        clearTimeout(timer)
    }
    activeTimers.clear()
})
</script>

<style scoped>
.screen-container {
    max-width: 1400px;
    margin: 0 auto;
}

.header-card {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.starred-card {
    background-color: rgb(var(--v-theme-surface));
    opacity: 1;
    transition: opacity 0.24s ease;
}

.card-fade-out {
    opacity: 0;
}

.card-fade-in {
    animation: cardFadeIn 0.24s ease forwards;
}

@keyframes cardFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.cover-clickable,
.title-clickable {
    cursor: pointer;
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

.min-w-0 {
    min-width: 0;
}
</style>
