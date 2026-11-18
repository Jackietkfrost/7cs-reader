<template>
    <v-container class="py-6 px-6">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <h1 class="text-h4 font-weight-bold mb-0">
                {{ $t("title.main") }} {{ $t("ui-labels.nav-bar.library") }}
            </h1>
            <div class="d-flex align-center ga-3">
                <v-btn
                    v-if="viewMode === 'list'"
                    variant="outlined"
                    color="primary"
                    prepend-icon="mdi-book-plus-multiple"
                    rounded
                    data-testid="library-list-add-book"
                    @click="handleAddBook"
                >
                    {{ $t("menu.add-book") }}
                </v-btn>
                <ViewModeToggle v-model="viewMode" />
            </div>
        </div>

        <v-snackbar
            v-model="snackbar"
            variant="elevated"
            :color="snackbarColor"
            location="top"
            multi-line
        >
            {{ snackText }}
        </v-snackbar>

        <v-row
            v-if="viewMode === 'gallery'"
            no-gutters
            class="text-center"
            data-testid="library-gallery-view"
        >
            <v-row class="my-2 w-100">
                <v-col v-for="book in books" :key="sanitizeKey(book)" cols="6" sm="4" md="3" lg="2">
                    <book-card
                        :book="book"
                        :book-path="bookPath"
                        @click="handleOpenBook(book, '/reader')"
                        @contextmenu="onContextMenu(book)"
                    />
                </v-col>

                <v-col align-self="center" cols="6" sm="4" md="3" lg="2">
                    <v-card
                        variant="outlined"
                        :height="cardHeight"
                        width="auto"
                        role="button"
                        tabindex="0"
                        :aria-label="$t('menu.add-book')"
                        style="
                            border: dashed 2px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        "
                        color="primary"
                        @click="handleAddBook"
                        @keydown.enter="handleAddBook"
                        @keydown.space.prevent="handleAddBook"
                    >
                        <v-avatar
                            size="64"
                            style="border: dashed 2px"
                            color="primary"
                            variant="outlined"
                        >
                            <v-icon size="32" icon="mdi-book-plus-multiple" />
                        </v-avatar>
                        <v-tooltip activator="parent" location="center">
                            {{ $t("menu.add-book") }}
                        </v-tooltip>
                    </v-card>
                </v-col>
            </v-row>
        </v-row>

        <div v-else class="d-flex flex-column ga-2 my-2" data-testid="library-list-view">
            <v-card
                v-for="book in books"
                :key="sanitizeKey(book)"
                variant="outlined"
                rounded
                class="library-list-item px-4 py-3 d-flex align-center ga-4"
                role="button"
                tabindex="0"
                :aria-label="`Open ${getBookTitle(book)}`"
                @click="handleOpenBook(book, '/reader')"
                @contextmenu="onContextMenu(book)"
                @keydown.enter="handleOpenBook(book, '/reader')"
                @keydown.space.prevent="handleOpenBook(book, '/reader')"
            >
                <div class="list-thumb rounded overflow-hidden flex-shrink-0">
                    <v-img
                        v-if="bookStore.covers[book]"
                        :src="bookStore.covers[book]"
                        :alt="getBookTitle(book)"
                        width="44"
                        height="64"
                        cover
                    />
                    <div
                        v-else
                        class="d-flex align-center justify-center fill-height list-thumb-fallback"
                    >
                        <v-icon size="24" icon="mdi-book-open-blank-variant" />
                    </div>
                </div>

                <div class="flex-grow-1 min-w-0">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">
                        {{ getBookTitle(book) }}
                    </div>
                    <div class="text-caption text-medium-emphasis text-truncate">
                        {{ getBookAuthor(book) }}
                    </div>
                </div>

                <div class="d-none d-sm-flex align-center ga-2" style="min-width: 140px">
                    <v-progress-linear
                        :model-value="getProgressPercent(book)"
                        color="primary"
                        height="5"
                        rounded
                        style="width: 72px"
                    />
                    <span class="text-caption text-medium-emphasis">
                        {{ getProgressPercent(book) }}%
                    </span>
                </div>

                <div v-if="getBookRating(book) > 0" class="d-none d-md-flex align-center">
                    <v-rating
                        :model-value="getBookRating(book)"
                        color="amber"
                        active-color="amber"
                        density="compact"
                        size="x-small"
                        readonly
                    />
                </div>

                <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    :aria-label="`More options for ${getBookTitle(book)}`"
                    @click.stop="onContextMenu(book)"
                />
            </v-card>
        </div>

        <v-row class="mt-4">
            <v-col cols="12">
                <v-select
                    data-testid="select-language"
                    :model-value="locale"
                    density="compact"
                    variant="outlined"
                    :label="$t('menu.change-language')"
                    :items="languages"
                    @update:model-value="handleChangeLanguage"
                />
            </v-col>
        </v-row>

        <book-metadata-dialog
            v-model="showEditDialog"
            :book-name="editingBook"
            @saved="onMetadataSaved"
        />
    </v-container>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { addBook } from "@/renderer/utils"
import { useBookStore } from "@/renderer/store/bookStore"
import { useAppStore } from "@/renderer/store/appStore"
import { computed, onMounted, onUnmounted, ref } from "vue"
import BookCard from "@/renderer/components/library/BookCard.vue"
import ViewModeToggle from "@/renderer/components/library/ViewModeToggle.vue"
import { useRouter } from "vue-router"
import { useTheme } from "vuetify"
import BookMetadataDialog from "@/renderer/components/library/BookMetadataDialog.vue"
import type { ListingViewMode } from "@/main/types/Settings"

const bookStore = useBookStore()
const appStore = useAppStore()
const { setBookName } = bookStore
const theme = useTheme()
const cardHeight = computed(() => theme.current.value.variables["card-height"] || "350px")
const { locale, availableLocales } = useI18n()
const languages = ref(["en"])
const books = ref<string[]>([])
const bookPath = ref<string>("")
const router = useRouter()
const snackbar = ref<boolean>(false)
const snackText = ref<string>("")
const snackbarColor = ref()

const showEditDialog = ref(false)
const editingBook = ref("")

const viewMode = computed<ListingViewMode>({
    get: () => appStore.getSettings.listingViews.library,
    set: (mode) => appStore.setListingView("library", mode)
})

const sanitizeKey = (book: string): string =>
    book
        .replace(/,/g, "")
        .replace(/ /g, "-")
        .replace(".epub", "")
        .replace(" ", "")
        .replace(/\(/g, "")
        .replace(/\)/g, "")

const getBookTitle = (filename: string): string =>
    bookStore.infoCache[filename]?.title || filename.replace(".epub", "").replace(/[-_]/g, " ")

const getBookAuthor = (filename: string): string =>
    bookStore.infoCache[filename]?.creator || "Unknown Author"

const getBookRating = (filename: string): number => bookStore.metadata[filename]?.rating || 0

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

async function getBooks(): Promise<void> {
    const bookList = await window.sevenCsApi.invoke("msgGetBooks")
    books.value = bookList
}

async function getBookPath(): Promise<void> {
    const booksPath = await window.sevenCsApi.invoke("msgGetBookPath")
    bookPath.value = booksPath
}

const handleChangeLanguage = (val: string): void => {
    if (!val) return
    appStore.updateSettings({ language: val })
}

const handleAddBook = async () => {
    const dialogResult = await addBook("epub")
    if (!dialogResult.canceled) {
        getBooks()
        showSnackbar("Added New Book!", "success")
    } else {
        showSnackbar("Operation canceled", "error")
    }
}

const handleOpenBook = (selectedFile: string, path: string): void => {
    setBookName(selectedFile)
    appStore.announce(`Opening ${selectedFile.replace(".epub", "")}`)
    router.push({ path })
}

const onContextMenu = async (book: string) => {
    await window.sevenCsApi.invoke("openContextMenu", book)
}

const handleDeleteConfirmed = (_event: unknown, message: string) => {
    showSnackbar(message, "info")
    getBooks()
}

const handleOpenBookEvent = (_event: unknown, message: string) => {
    handleOpenBook(message, "/reader")
}

const handleEditTagsEvent = (_event: unknown, bookFile: string) => {
    editingBook.value = bookFile
    showEditDialog.value = true
}

const handleMetadataUpdated = (_event: unknown, newMeta: any) => {
    bookStore.setMetadata(newMeta)
}

const onMetadataSaved = () => {
    bookStore.loadMetadata()
}

const showSnackbar = (message: string, type: string): void => {
    snackText.value = message
    snackbar.value = true
    const colorMap = {
        success: theme.current.value.colors.success,
        error: theme.current.value.colors.error,
        info: theme.current.value.colors.info,
        warning: theme.current.value.colors.warning
    }

    snackbarColor.value = colorMap[type]
}

onMounted((): void => {
    languages.value = availableLocales
    getBooks()
    getBookPath()
    bookStore.loadMetadata()
    window.sevenCsApi.on("deleteConfirmed", handleDeleteConfirmed)
    window.sevenCsApi.on("openBook", handleOpenBookEvent)
    window.sevenCsApi.on("editTags", handleEditTagsEvent)
    window.sevenCsApi.on("metadataUpdated", handleMetadataUpdated)
})

onUnmounted((): void => {
    window.sevenCsApi.off("deleteConfirmed", handleDeleteConfirmed)
    window.sevenCsApi.off("openBook", handleOpenBookEvent)
    window.sevenCsApi.off("editTags", handleEditTagsEvent)
    window.sevenCsApi.off("metadataUpdated", handleMetadataUpdated)
})
</script>

<style scoped>
.library-list-item {
    cursor: pointer;
    background-color: rgb(var(--v-theme-surface));
}

.list-thumb {
    width: 44px;
    height: 64px;
    background-color: rgb(var(--v-theme-backgroundAccent));
}

.list-thumb-fallback {
    color: rgb(var(--v-theme-on-surface));
    opacity: 0.6;
}

.min-w-0 {
    min-width: 0;
}
</style>
