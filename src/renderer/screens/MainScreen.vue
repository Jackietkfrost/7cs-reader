<template>
    <v-container>
        <h1> {{ $t("title.main") }} {{ $t("ui-labels.nav-bar.library") }}</h1>
        <v-snackbar
            v-model="snackbar"
            variant="elevated"
            :color="snackbarColor"
            location="top"
            multi-line
        >
            {{ snackText }}</v-snackbar
        >
        <v-row no-gutters class="text-center">
            <v-row class="my-2">
                <v-col
                    v-for="book in books"
                    :key="
                        book
                            .replace(/,/g, '')
                            .replace(/ /g, '-')
                            .replace('.epub', '')
                            .replace(' ', '')
                            .replace(/\(/g, '')
                            .replace(/\)/g, '')
                    "
                    cols="2"
                >
                    <book-card
                        :book="book"
                        :book-path="bookPath"
                        @click="handleOpenBook(book, '/reader')"
                        @contextmenu="onContextMenu(book)"
                    >
                    </book-card>
                </v-col>

                <v-col align-self="center" cols="2">
                    <v-card
                        variant="outlined"
                        :height="cardHeight"
                        width="auto"
                        style="
                            border: dashed 2px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        "
                        color="primary"
                        @click="handleAddBook"
                    >
                        <v-avatar
                            size="64"
                            style="border: dashed 2px"
                            color="primary"
                            variant="outlined"
                        >
                            <v-icon size="32" icon="mdi-book-plus-multiple"></v-icon>
                        </v-avatar>
                        <v-tooltip activator="parent" location="center">
                            {{ $t("menu.add-book") }}
                        </v-tooltip>
                    </v-card>
                </v-col>
                <v-col cols="12">
                    <v-select
                        data-testid="select-language"
                        :model-value="locale"
                        density="compact"
                        :label="$t('menu.change-language')"
                        :items="languages"
                        @update:model-value="handleChangeLanguage"
                    >
                        {{ $t("menu.change-language") }}
                    </v-select>
                </v-col>
            </v-row>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { addBook } from "@/renderer/utils"
import { useBookStore } from "@/renderer/store/bookStore"
// import { storeToRefs } from "pinia"
import { onMounted, ref, watch } from "vue"
import BookCard from "@/renderer/components/library/BookCard.vue"
import { useRouter } from "vue-router"
import { useTheme } from "vuetify"
// import BookContextMenu from "../components/library/BookContextMenu.vue"

const { setBookName } = useBookStore()
const theme = useTheme()
const cardHeight = theme.current.value.variables["card-height"]
const { locale, availableLocales } = useI18n()
const languages = ref(["en"])
const books = ref<string[]>([])
const bookPath = ref<string>("")
const router = useRouter()
const snackbar = ref<boolean>(false)
const snackText = ref<string>("")
const snackbarColor = ref()

onMounted((): void => {
    languages.value = availableLocales
    getBooks()
    getBookPath()
    console.log(books)
})

watch(books, (newValue, oldValue) => {
    if (newValue.length > oldValue.length) {
        getBooks()
    }
})

async function getBooks(): Promise<void> {
    const bookList = await window.sevenCsApi.invoke("msgGetBooks")
    books.value = bookList
}

async function getBookPath(): Promise<void> {
    const booksPath = await window.sevenCsApi.invoke("msgGetBookPath")
    bookPath.value = booksPath
}

const handleChangeLanguage = (val: string): void => {
    locale.value = val
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
    router.push({ path })
    window.sevenCsApi.invoke("changeActiveButton", "currentBook")
}

const onContextMenu = async (book: string) => {
    window.sevenCsApi.invoke("openContextMenu", book).then((value) => {
        console.log(value)
    })
}

window.sevenCsApi.on("deleteConfirmed", (event, message) => {
    showSnackbar(message, "info")
    getBooks()
})

window.sevenCsApi.on("openBook", (event, message) => {
    handleOpenBook(message, "/reader")
})

window.sevenCsApi.on("editTags", (event, message) => {
    showSnackbar(message, "warning")
})

window.sevenCsApi.on("editMeta", (event, message) => {
    showSnackbar(message, "warning")
})

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
</script>
