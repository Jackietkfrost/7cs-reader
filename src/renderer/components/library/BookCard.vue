<template>
    <v-card :id="book" class="book-card" variant="text" :height="cardHeight">
        <vue-reader
            v-show="false"
            :url="`../epubs/${book}`"
            :get-rendition="getRendition"
        ></vue-reader>
        <v-img
            v-if="information"
            :src="information.cover ?? 'https://via.placeholder.com/500x600'"
            :alt="information.title"
            style="width: 500px; height: 250px; object-fit: cover"
        />
        <v-card-title class="text-wrap">
            <h4>{{ book.replace(".epub", "") }}</h4>
        </v-card-title>
        <v-card-subtitle>{{ information?.creator ?? "Author Name" }}</v-card-subtitle>
        <v-card-text>
            <slot name="content"></slot>
        </v-card-text>
        <v-card-actions>
            <slot name="actions"></slot>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import { VueReader } from "vue-reader"
import { ref } from "vue"
import { Rendition } from "epubjs"
import { useTheme } from "vuetify"

const theme = useTheme()
const cardHeight = theme.current.value.variables["card-height"]
const information = ref()
const props = defineProps<{ book: string; bookPath: string }>()
const { book } = props

const getRendition = (rendition: Rendition) => {
    const book = rendition.book
    book.ready.then(() => {
        book.loaded.metadata.then(async (metadata) => {
            const cover = await book.coverUrl()
            information.value = { ...metadata, cover }
        })
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
