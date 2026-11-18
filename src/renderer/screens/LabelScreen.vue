<template>
    <v-container class="py-8 px-6 screen-container fill-height align-start">
        <v-row class="mb-6 w-100">
            <v-col cols="12">
                <v-card class="header-card rounded px-6 py-6 d-flex align-center">
                    <v-avatar size="64" color="teal-lighten-4" class="mr-4 elevation-2">
                        <v-icon size="36" color="teal-darken-2" aria-hidden="true">
                            mdi-tag-multiple
                        </v-icon>
                    </v-avatar>
                    <div>
                        <h1 class="text-h4 font-weight-black mb-1"> Categories &amp; Shelves </h1>
                        <p class="text-subtitle-1 text-medium-emphasis mb-0">
                            Browse and organize your books by tags and genres
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
                    placeholder="Search books by title, author, or tag..."
                    aria-label="Search books by title, author, or tag"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    data-testid="labeled-search-input"
                />
            </v-col>
            <v-col cols="6" sm="4" md="3">
                <v-select
                    v-model="selectedCategory"
                    :items="categoryFilterOptions"
                    item-title="title"
                    item-value="value"
                    label="Filter Category"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    data-testid="labeled-filter-select"
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
                    data-testid="labeled-sort-select"
                />
            </v-col>
            <v-col cols="12" sm="4" md="2" class="d-flex justify-end">
                <ViewModeToggle v-model="viewMode" />
            </v-col>
        </v-row>

        <v-row class="w-100 flex-grow-1">
            <v-col cols="12" class="px-0">
                <template v-if="books.length > 0">
                    <template v-if="filteredBooks.length > 0">
                        <!-- Gallery View -->
                        <v-row
                            v-if="viewMode === 'gallery'"
                            class="pt-2 w-100"
                            data-testid="labeled-gallery-view"
                        >
                            <v-col
                                v-for="book in filteredBooks"
                                :key="book.filename"
                                cols="6"
                                sm="4"
                                md="3"
                                lg="2"
                                xl="2"
                                class="d-flex justify-center mb-4"
                            >
                                <v-card
                                    class="labeled-card rounded overflow-hidden d-flex flex-column h-100"
                                    style="max-width: 220px; width: 100%"
                                    variant="outlined"
                                    :data-testid="`labeled-book-card-${book.filename}`"
                                    :data-book-filename="book.filename"
                                >
                                    <vue-reader
                                        v-if="!bookStore.infoCache[book.filename]?.isMetadataLoaded"
                                        v-show="false"
                                        :url="`./epubs/${book.filename}`"
                                        :get-rendition="(r) => handleRendition(book.filename, r)"
                                    />

                                    <div
                                        class="cover-container cover-clickable w-100"
                                        role="button"
                                        tabindex="0"
                                        :aria-label="`Open ${book.title}`"
                                        style="height: 220px; overflow: hidden"
                                        @click="handleOpenBook(book.filename)"
                                        @keydown.enter="handleOpenBook(book.filename)"
                                        @keydown.space.prevent="handleOpenBook(book.filename)"
                                    >
                                        <v-skeleton-loader
                                            v-if="
                                                !bookStore.covers[book.filename] &&
                                                !noCovers[book.filename]
                                            "
                                            type="image"
                                            height="220"
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
                                            <v-icon size="48"> mdi-book-open-blank-variant </v-icon>
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
                                                {{ book.progress }}%
                                            </span>
                                            <span class="text-caption text-medium-emphasis">
                                                {{ getPageProgressText(book.filename) }}
                                            </span>
                                        </div>
                                        <v-progress-linear
                                            :model-value="book.progress"
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
                                            @keydown.space.prevent="handleOpenBook(book.filename)"
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
                                            class="d-flex align-center justify-space-between mb-2"
                                            @click.stop
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
                                                    book.rating > 0 ? `${book.rating}.0` : "Unrated"
                                                }}
                                            </span>
                                        </div>

                                        <div
                                            class="category-capsules d-flex flex-wrap align-center ga-1 pt-1"
                                            @click.stop
                                        >
                                            <v-chip
                                                v-for="cat in book.categories"
                                                :key="cat"
                                                size="x-small"
                                                variant="tonal"
                                                color="primary"
                                                rounded
                                                closable
                                                :data-testid="`category-chip-${book.filename}-${cat}`"
                                                :aria-label="`Remove category ${cat} from ${book.title}`"
                                                @click:close.stop="
                                                    handleRemoveCategory(
                                                        book.filename,
                                                        cat,
                                                        book.title
                                                    )
                                                "
                                            >
                                                {{ cat }}
                                            </v-chip>

                                            <v-menu
                                                v-model="activeAddMenu[book.filename]"
                                                :close-on-content-click="false"
                                                location="bottom start"
                                            >
                                                <template #activator="{ props: menuProps }">
                                                    <v-chip
                                                        v-bind="menuProps"
                                                        size="x-small"
                                                        variant="outlined"
                                                        color="primary"
                                                        rounded
                                                        class="add-tag-chip font-weight-bold"
                                                        :data-testid="`add-category-chip-${book.filename}`"
                                                        :aria-label="`Add category to ${book.title}`"
                                                    >
                                                        <v-icon size="13" icon="mdi-plus" />
                                                    </v-chip>
                                                </template>
                                                <v-card
                                                    class="pa-3 rounded add-category-popover"
                                                    min-width="260"
                                                    max-width="320"
                                                    variant="elevated"
                                                >
                                                    <div
                                                        class="text-caption font-weight-bold mb-2 d-flex align-center justify-space-between"
                                                    >
                                                        <span>Add Category</span>
                                                        <v-btn
                                                            size="x-small"
                                                            variant="text"
                                                            icon="mdi-close"
                                                            aria-label="Close"
                                                            @click="
                                                                activeAddMenu[book.filename] = false
                                                            "
                                                        />
                                                    </div>
                                                    <v-text-field
                                                        v-model="newCategoryInputs[book.filename]"
                                                        placeholder="Type category..."
                                                        density="compact"
                                                        variant="outlined"
                                                        hide-details
                                                        autofocus
                                                        append-inner-icon="mdi-plus-circle"
                                                        :data-testid="`input-add-category-${book.filename}`"
                                                        @keydown.enter="
                                                            handleSaveTypedCategory(
                                                                book.filename,
                                                                book.title
                                                            )
                                                        "
                                                        @click:append-inner="
                                                            handleSaveTypedCategory(
                                                                book.filename,
                                                                book.title
                                                            )
                                                        "
                                                    />
                                                    <template
                                                        v-if="
                                                            getAvailableCategoriesForBook(
                                                                book.filename
                                                            ).length > 0
                                                        "
                                                    >
                                                        <div
                                                            class="text-caption text-medium-emphasis mt-3 mb-1"
                                                        >
                                                            Select existing:
                                                        </div>
                                                        <div
                                                            class="d-flex flex-wrap ga-1 existing-categories-scroll"
                                                        >
                                                            <v-chip
                                                                v-for="existingCat in getAvailableCategoriesForBook(
                                                                    book.filename
                                                                )"
                                                                :key="existingCat"
                                                                size="x-small"
                                                                variant="outlined"
                                                                color="primary"
                                                                rounded
                                                                class="clickable"
                                                                :data-testid="`select-category-option-${book.filename}-${existingCat}`"
                                                                @click="
                                                                    handleSelectExistingCategory(
                                                                        book.filename,
                                                                        existingCat,
                                                                        book.title
                                                                    )
                                                                "
                                                            >
                                                                {{ existingCat }}
                                                            </v-chip>
                                                        </div>
                                                    </template>
                                                </v-card>
                                            </v-menu>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>

                        <!-- List View -->
                        <div
                            v-else
                            class="d-flex flex-column ga-2 w-100"
                            data-testid="labeled-list-view"
                        >
                            <v-card
                                v-for="book in filteredBooks"
                                :key="book.filename"
                                variant="outlined"
                                rounded
                                class="labeled-list-item px-4 py-3 d-flex align-center ga-4 flex-wrap flex-md-nowrap"
                                :data-testid="`labeled-book-row-${book.filename}`"
                                :data-book-filename="book.filename"
                            >
                                <vue-reader
                                    v-if="!bookStore.infoCache[book.filename]?.isMetadataLoaded"
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
                                    style="min-width: 180px"
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
                                    class="category-capsules-list d-flex flex-wrap align-center ga-1 my-1 flex-grow-1"
                                    style="max-width: 380px"
                                    @click.stop
                                >
                                    <v-chip
                                        v-for="cat in book.categories"
                                        :key="cat"
                                        size="x-small"
                                        variant="tonal"
                                        color="primary"
                                        rounded
                                        closable
                                        :data-testid="`list-category-chip-${book.filename}-${cat}`"
                                        :aria-label="`Remove category ${cat} from ${book.title}`"
                                        @click:close.stop="
                                            handleRemoveCategory(book.filename, cat, book.title)
                                        "
                                    >
                                        {{ cat }}
                                    </v-chip>

                                    <v-menu
                                        v-model="activeAddMenuList[book.filename]"
                                        :close-on-content-click="false"
                                        location="bottom start"
                                    >
                                        <template #activator="{ props: menuProps }">
                                            <v-chip
                                                v-bind="menuProps"
                                                size="x-small"
                                                variant="outlined"
                                                color="primary"
                                                rounded
                                                class="add-tag-chip font-weight-bold"
                                                :data-testid="`list-add-category-chip-${book.filename}`"
                                                :aria-label="`Add category to ${book.title}`"
                                            >
                                                <v-icon size="13" icon="mdi-plus" />
                                            </v-chip>
                                        </template>
                                        <v-card
                                            class="pa-3 rounded add-category-popover"
                                            min-width="260"
                                            max-width="320"
                                            variant="elevated"
                                        >
                                            <div
                                                class="text-caption font-weight-bold mb-2 d-flex align-center justify-space-between"
                                            >
                                                <span>Add Category</span>
                                                <v-btn
                                                    size="x-small"
                                                    variant="text"
                                                    icon="mdi-close"
                                                    aria-label="Close"
                                                    @click="
                                                        activeAddMenuList[book.filename] = false
                                                    "
                                                />
                                            </div>
                                            <v-text-field
                                                v-model="newCategoryInputs[book.filename]"
                                                placeholder="Type category..."
                                                density="compact"
                                                variant="outlined"
                                                hide-details
                                                autofocus
                                                append-inner-icon="mdi-plus-circle"
                                                :data-testid="`list-input-add-category-${book.filename}`"
                                                @keydown.enter="
                                                    handleSaveTypedCategory(
                                                        book.filename,
                                                        book.title,
                                                        true
                                                    )
                                                "
                                                @click:append-inner="
                                                    handleSaveTypedCategory(
                                                        book.filename,
                                                        book.title,
                                                        true
                                                    )
                                                "
                                            />
                                            <template
                                                v-if="
                                                    getAvailableCategoriesForBook(book.filename)
                                                        .length > 0
                                                "
                                            >
                                                <div
                                                    class="text-caption text-medium-emphasis mt-3 mb-1"
                                                >
                                                    Select existing:
                                                </div>
                                                <div
                                                    class="d-flex flex-wrap ga-1 existing-categories-scroll"
                                                >
                                                    <v-chip
                                                        v-for="existingCat in getAvailableCategoriesForBook(
                                                            book.filename
                                                        )"
                                                        :key="existingCat"
                                                        size="x-small"
                                                        variant="outlined"
                                                        color="primary"
                                                        rounded
                                                        class="clickable"
                                                        :data-testid="`list-select-category-option-${book.filename}-${existingCat}`"
                                                        @click="
                                                            handleSelectExistingCategory(
                                                                book.filename,
                                                                existingCat,
                                                                book.title,
                                                                true
                                                            )
                                                        "
                                                    >
                                                        {{ existingCat }}
                                                    </v-chip>
                                                </div>
                                            </template>
                                        </v-card>
                                    </v-menu>
                                </div>

                                <div
                                    class="d-none d-md-flex align-center ga-2"
                                    style="min-width: 140px"
                                >
                                    <v-progress-linear
                                        :model-value="book.progress"
                                        color="primary"
                                        height="5"
                                        rounded
                                        style="width: 72px"
                                    />
                                    <span class="text-caption text-medium-emphasis">
                                        {{ book.progress }}%
                                    </span>
                                </div>

                                <div
                                    class="d-none d-sm-flex align-center ga-2 flex-shrink-0"
                                    @click.stop
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
                                        :data-testid="`list-inline-rating-${book.filename}`"
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
                                            book.rating > 0 ? 'text-amber' : 'text-medium-emphasis'
                                        "
                                    >
                                        {{ book.rating > 0 ? `${book.rating}.0` : "Unrated" }}
                                    </span>
                                </div>

                                <div class="d-flex align-center ga-1 flex-shrink-0">
                                    <v-btn
                                        size="small"
                                        variant="text"
                                        color="primary"
                                        prepend-icon="mdi-book-open-page-variant"
                                        @click="handleOpenBook(book.filename)"
                                    >
                                        Read
                                    </v-btn>
                                </div>
                            </v-card>
                        </div>
                    </template>

                    <div v-else class="text-center py-12 w-100">
                        <v-icon size="64" color="medium-emphasis" class="mb-3">
                            mdi-magnify-remove-outline
                        </v-icon>
                        <h3 class="text-h6 font-weight-bold">No Matching Books</h3>
                        <p class="text-body-2 text-medium-emphasis mb-4">
                            No books found matching your search or category filter.
                        </p>
                        <v-btn variant="outlined" color="primary" rounded @click="resetFilters">
                            Clear Filters
                        </v-btn>
                    </div>
                </template>

                <div v-else class="text-center py-12 w-100">
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
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
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

const bookStore = useBookStore()
const appStore = useAppStore()
const router = useRouter()

const books = ref<string[]>([])
const noCovers = ref<Record<string, boolean>>({})
const search = ref("")
const selectedCategory = ref("all")
const sortBy = ref("title-asc")

const activeAddMenu = ref<Record<string, boolean>>({})
const activeAddMenuList = ref<Record<string, boolean>>({})
const newCategoryInputs = ref<Record<string, string>>({})

const viewMode = computed<ListingViewMode>({
    get: () => appStore.getSettings.listingViews.labeled,
    set: (mode) => appStore.setListingView("labeled", mode)
})

const sortOptions = [
    { title: "Title: A-Z", value: "title-asc" },
    { title: "Title: Z-A", value: "title-desc" },
    { title: "Progress: High to Low", value: "progress-desc" },
    { title: "Rating: High to Low", value: "rating-desc" }
]

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

const allExistingCategories = computed<string[]>(() => {
    const set = new Set<string>()
    books.value.forEach((filename) => {
        const meta = bookStore.metadata[filename]
        if (meta?.categories) {
            meta.categories.forEach((cat) => {
                const trimmed = cat.trim()
                if (trimmed) set.add(trimmed)
            })
        }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const categoryFilterOptions = computed(() => {
    const options = [
        { title: "All Categories", value: "all" },
        { title: "Uncategorized", value: "__uncategorized__" }
    ]
    allExistingCategories.value.forEach((cat) => {
        const count = books.value.filter((b) => {
            const meta = bookStore.metadata[b]
            return meta?.categories?.some((c) => c.trim().toLowerCase() === cat.toLowerCase())
        }).length
        options.push({
            title: `${cat} (${count})`,
            value: cat
        })
    })
    return options
})

const getAvailableCategoriesForBook = (filename: string): string[] => {
    const meta = bookStore.metadata[filename]
    const bookCats = new Set((meta?.categories || []).map((c) => c.toLowerCase()))
    return allExistingCategories.value.filter((cat) => !bookCats.has(cat.toLowerCase()))
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
            categories: meta.categories ? [...meta.categories] : [],
            progress: getProgressPercent(filename)
        }
    })
})

const filteredBooks = computed<EnrichedBook[]>(() => {
    const query = search.value ? search.value.trim().toLowerCase() : ""
    const categoryFilter = selectedCategory.value

    return enrichedBooks.value
        .filter((book) => {
            if (categoryFilter && categoryFilter !== "all") {
                if (categoryFilter === "__uncategorized__") {
                    if (book.categories && book.categories.length > 0) return false
                } else {
                    const hasCat = book.categories.some(
                        (c) => c.trim().toLowerCase() === categoryFilter.toLowerCase()
                    )
                    if (!hasCat) return false
                }
            }

            if (query) {
                const titleMatch = book.title.toLowerCase().includes(query)
                const authorMatch = book.creator.toLowerCase().includes(query)
                const tagMatch = book.categories.some((c) => c.toLowerCase().includes(query))
                if (!titleMatch && !authorMatch && !tagMatch) {
                    return false
                }
            }

            return true
        })
        .sort((a, b) => {
            if (sortBy.value === "title-desc") return b.title.localeCompare(a.title)
            if (sortBy.value === "progress-desc") return b.progress - a.progress
            if (sortBy.value === "rating-desc") return b.rating - a.rating
            return a.title.localeCompare(b.title)
        })
})

const handleInlineRate = async (
    filename: string,
    title: string,
    newRating: number
): Promise<void> => {
    const currentCategories = bookStore.metadata[filename]?.categories || []
    await bookStore.saveMetadata(filename, newRating, currentCategories)
    appStore.announce(`Rated ${title} ${newRating > 0 ? `${newRating} stars` : "unrated"}`)
}

const handleRemoveCategory = async (
    filename: string,
    categoryToRemove: string,
    title: string
): Promise<void> => {
    const currentMeta = bookStore.metadata[filename] || {}
    const currentCategories = currentMeta.categories ? [...currentMeta.categories] : []
    const updated = currentCategories.filter((c) => c !== categoryToRemove)
    await bookStore.saveMetadata(filename, currentMeta.rating || 0, updated)
    appStore.announce(`Removed category ${categoryToRemove} from ${title}`)
}

const handleSaveTypedCategory = async (
    filename: string,
    title: string,
    isList = false
): Promise<void> => {
    const raw = (newCategoryInputs.value[filename] || "").trim()
    if (!raw) return
    const currentMeta = bookStore.metadata[filename] || {}
    const currentCategories = currentMeta.categories ? [...currentMeta.categories] : []
    if (!currentCategories.some((c) => c.toLowerCase() === raw.toLowerCase())) {
        const updated = [...currentCategories, raw]
        await bookStore.saveMetadata(filename, currentMeta.rating || 0, updated)
        appStore.announce(`Added category ${raw} to ${title}`)
    }
    newCategoryInputs.value[filename] = ""
    if (isList) {
        activeAddMenuList.value[filename] = false
    } else {
        activeAddMenu.value[filename] = false
    }
}

const handleSelectExistingCategory = async (
    filename: string,
    category: string,
    title: string,
    isList = false
): Promise<void> => {
    const currentMeta = bookStore.metadata[filename] || {}
    const currentCategories = currentMeta.categories ? [...currentMeta.categories] : []
    if (!currentCategories.some((c) => c.toLowerCase() === category.toLowerCase())) {
        const updated = [...currentCategories, category]
        await bookStore.saveMetadata(filename, currentMeta.rating || 0, updated)
        appStore.announce(`Added category ${category} to ${title}`)
    }
    if (isList) {
        activeAddMenuList.value[filename] = false
    } else {
        activeAddMenu.value[filename] = false
    }
}

const resetFilters = (): void => {
    search.value = ""
    selectedCategory.value = "all"
    sortBy.value = "title-asc"
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
}

const handleMetadataUpdated = (_event: unknown, newMeta: any): void => {
    bookStore.setMetadata(newMeta)
}

onMounted(async () => {
    await bookStore.loadMetadata()
    await getBooks()
    window.sevenCsApi.on("metadataUpdated", handleMetadataUpdated)
})

onUnmounted(() => {
    window.sevenCsApi.off("metadataUpdated", handleMetadataUpdated)
})
</script>

<style scoped>
.screen-container {
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
}

.header-card,
.labeled-card,
.labeled-list-item,
.add-category-popover {
    background-color: rgb(var(--v-theme-surface));
    border-color: rgba(var(--v-theme-on-surface), 0.12);
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

.cover-clickable,
.title-clickable,
.clickable {
    cursor: pointer;
}

.min-w-0 {
    min-width: 0;
}

.existing-categories-scroll {
    max-height: 120px;
    overflow-y: auto;
}
</style>
