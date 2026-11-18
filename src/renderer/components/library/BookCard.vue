<template>
    <v-hover v-slot="{ isHovering, props: hoverProps }">
        <v-card
            v-bind="hoverProps"
            :id="props.book"
            class="book-card"
            variant="text"
            :height="cardHeight"
            @click="emit('click', $event)"
            @contextmenu="emit('contextmenu', $event)"
        >
            <vue-reader
                v-if="shouldLoadWithVueReader"
                v-show="false"
                :url="`./epubs/${book}`"
                :get-rendition="getRendition"
            ></vue-reader>
            <div
                class="cover-wrapper relative w-100"
                style="height: 250px; overflow: hidden; background-color: rgba(255, 255, 255, 0.03)"
            >
                <v-skeleton-loader
                    v-if="isLoading"
                    type="image"
                    height="250"
                    class="w-100 fill-height"
                />
                <v-img
                    v-else-if="coverSrc"
                    :src="coverSrc"
                    :alt="information?.title || props.book"
                    height="250"
                    cover
                    style="width: 100%; object-fit: cover"
                />
                <div
                    v-else
                    class="empty-cover d-flex align-center justify-center text-grey-darken-1 bg-grey-darken-4 fill-height"
                    style="height: 250px"
                >
                    <v-icon size="48">mdi-book-open-blank-variant</v-icon>
                </div>
            </div>

            <!-- Progress Bar & Reading Status directly under image -->
            <div class="px-3 pt-2 pb-1 bg-grey-darken-4">
                <div
                    class="d-flex align-center justify-space-between text-caption text-grey-lighten-1 mb-1 font-weight-medium"
                >
                    <span class="d-flex align-center font-weight-bold text-cyan-accent-2">
                        <v-icon size="12" color="cyan-accent-2" class="mr-1"
                            >mdi-book-open-page-variant</v-icon
                        >
                        {{ progressPercent }}%
                    </span>
                    <span
                        class="text-caption text-grey-lighten-1 font-weight-regular"
                        style="font-size: 0.75rem"
                    >
                        {{ pageProgressText }}
                    </span>
                </div>
                <v-progress-linear
                    :model-value="progressPercent"
                    color="cyan-accent-3"
                    bg-color="grey-darken-3"
                    height="5"
                    rounded
                ></v-progress-linear>
            </div>

            <v-card-title class="text-wrap">
                <h4 class="book-title">{{ book.replace(".epub", "").replace(/[-_]/g, " ") }}</h4>
            </v-card-title>

            <v-card-subtitle class="d-flex align-center justify-space-between pb-2">
                <span class="text-truncate mr-2">{{ information?.creator ?? "Author Name" }}</span>
                <v-rating
                    v-if="rating > 0"
                    :model-value="rating"
                    color="amber"
                    active-color="amber"
                    density="compact"
                    size="x-small"
                    readonly
                ></v-rating>
            </v-card-subtitle>
            <v-card-text>
                <slot name="content"></slot>
            </v-card-text>
            <v-card-actions>
                <slot name="actions"></slot>
                <book-tooltip
                    :information="information || bookStore.infoCache[props.book] || {}"
                    :book-filename="book"
                ></book-tooltip>
            </v-card-actions>
        </v-card>
        <book-tooltip
            :information="information ? information : {}"
            :model-value="isHovering"
            absolute
        ></book-tooltip>
    </v-hover>
</template>
<script setup lang="ts">
import { VueReader } from "vue-reader"
import { ref, computed, onMounted } from "vue"
import { Rendition } from "epubjs"
import { useTheme } from "vuetify"
import type { BookMetaData } from "@/main/types/Book"
import BookTooltip from "./BookTooltip.vue"
import { useBookStore } from "@/renderer/store/bookStore"

const theme = useTheme()
const cardHeight = computed(() => theme.current.value.variables["card-height"] || "350px")
const props = defineProps<{ book: string; bookPath: string }>()

const emit = defineEmits<{
    (e: "click", event: MouseEvent): void
    (e: "contextmenu", event: MouseEvent): void
}>()

const bookStore = useBookStore()
const information = ref<BookMetaData | undefined>(bookStore.infoCache[props.book])
const isLoadedNoCover = ref(false)

const rating = computed(() => bookStore.metadata[props.book]?.rating || 0)
const coverSrc = computed(() => bookStore.covers[props.book] || information.value?.cover)
const shouldLoadWithVueReader = computed(() => !bookStore.infoCache[props.book]?.isMetadataLoaded)
const isLoading = computed(() => !coverSrc.value && !isLoadedNoCover.value)

const bookMeta = computed(() => bookStore.metadata[props.book])

const progressPercent = computed(() => {
    if (!bookMeta.value) return 0
    if (typeof bookMeta.value.progress === "number" && bookMeta.value.progress > 0) {
        return Math.min(100, bookMeta.value.progress)
    }
    if (bookMeta.value.currentPage && bookMeta.value.totalPages && bookMeta.value.totalPages > 0) {
        return Math.min(
            100,
            Math.max(1, Math.round((bookMeta.value.currentPage / bookMeta.value.totalPages) * 100))
        )
    }
    if (bookMeta.value.bookmark) {
        return 1
    }
    return 0
})

const pageProgressText = computed(() => {
    if (!bookMeta.value) return "Unread"
    const current = bookMeta.value.currentPage
    const total = bookMeta.value.totalPages
    if (current !== undefined && total !== undefined && total > 0) {
        return `p. ${current} / ${total}`
    }
    if (total !== undefined && total > 0) {
        return `${total} pages`
    }
    if (progressPercent.value > 0) {
        return `${progressPercent.value}% read`
    }
    if (bookMeta.value.bookmark) {
        return "In Progress"
    }
    return "Unread"
})

onMounted(() => {
    if (bookStore.infoCache[props.book]) {
        information.value = bookStore.infoCache[props.book]
    }
})

const getRendition = (rendition: Rendition) => {
    const book = rendition.book
    book.ready
        .then(() => {
            book.loaded.metadata
                .then(async (metadata) => {
                    const rawMeta =
                        metadata ||
                        ((book as any).package ? (book as any).package.metadata : {}) ||
                        {}
                    let cover: string | undefined
                    try {
                        cover = (await book.coverUrl()) || undefined
                    } catch (e) {
                        isLoadedNoCover.value = true
                    }
                    information.value = { ...rawMeta, cover }
                    bookStore.setBookInfo(props.book, { ...rawMeta, cover, isMetadataLoaded: true })
                    if (cover) {
                        bookStore.setCover(props.book, cover)
                    } else {
                        isLoadedNoCover.value = true
                    }
                })
                .catch(() => {
                    isLoadedNoCover.value = true
                })
        })
        .catch(() => {
            isLoadedNoCover.value = true
        })
}
</script>

<style scoped>
.v-card-title h4 {
    font-size: 1.25rem !important;
    line-height: 1.25rem !important;
    margin-top: 8px !important;
    max-height: 3.5rem;
    line-clamp: 2;
    box-orient: vertical;
}
</style>
