<template>
    <div>
        <v-container style="height: 100vh">
            <vue-reader
                v-show="true"
                :url="`../epubs/${bookName}`"
                :class="theme.global.name.value + '-theme'"
                :get-rendition="getRendition"
                :epub-options="{
                    allowScriptedContent: true
                }"
            />
        </v-container>
    </div>
</template>
<script setup lang="ts">
import { Rendition } from "epubjs"
import { watch } from "vue"
import { VueReader } from "vue-reader"
import { useTheme } from "vuetify"
import { useBookStore } from "../store/bookStore"
import { storeToRefs } from "pinia"
const { getBookName } = storeToRefs(useBookStore())
const theme = useTheme()
// eslint-disable-next-line no-unused-vars
const bookName = getBookName.value
let rendition: Rendition

const updateTheme = (rendition) => {
    // const themes = rendition.themes
}

const getRendition = (_rendition: Rendition) => {
    rendition = _rendition
    updateTheme(_rendition)
    rendition.themes.register("dark", {
        "*": {
            "background-color": theme.global.current.value.colors.background
        },
        b: {
            color: "grey"
        },
        h1: {
            color: "grey"
        },
        h2: {
            color: "grey"
        },
        h3: {
            color: "grey"
        },
        h4: {
            color: "grey"
        },
        p: {
            // TODO: Change these out to use vuetify variable theming
            "font-family": "Helvetica, sans-serif",
            "font-weight": "400",
            "font-size": "20px",
            color: "grey"
        },
        main: {
            "background-color": "red",
            color: "red"
        },
        a: {
            color: theme.global.current.value.colors.primary + " !important"
        },
        blockquote: {
            "background-color": theme.global.current.value.colors.background + " !important"
        },
        ".readerArea": {
            "margin-left": "200px",
            "background-color": "red",
            color: "red"
        },
        "button.tocButton": {
            color: theme.global.current.value.colors.primary,
            "background-color": "red"
        }
    })
    rendition.themes.select(theme.global.name.value)
    console.log("Themes", rendition.themes)
}
watch(theme.current, () => {
    if (rendition) {
        updateTheme(rendition)
        console.log(rendition.getContents())
    }
})
</script>
<style>
.theme {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    z-index: 1;
    text-align: center;
}
.dark-theme .readerArea {
    background-color: rgb(var(--v-theme-background)) !important;
}

.container .titleArea {
    color: rgb(var(--v-theme-primary)) !important;
    left: 50px;
    overflow: hidden;
    position: absolute;
    right: 50px;
    text-align: center;
    text-overflow: ellipsis;
    top: 20px;
    white-space: nowrap;
}
.dark-theme .tocButtonExpanded {
    color: rgb(var(--v-theme-background));
}

.dark-theme .tocButtonBar {
    background-color: rgb(var(--v-theme-primary));
}

/* Colors the page when toc is open*/
.dark-theme .tocBackground {
    /* background: rgb(0, 0, 0, 0.5); */
}

.dark-theme .readerArea .tocButton {
    background-color: rgb(var(--v-theme-background));
    color: rgb(var(--v-theme-primary));
    border-radius: 3px;
}
.dark-theme .readerArea .tocButtonExpanded {
    background-color: rgb(var(--v-theme-backgroundAccent));
}
.dark-theme .tocArea .tocAreaButton {
    color: rgb(var(--v-theme-primary));
    border-bottom: 1px solid rgb(var(--v-theme-primary));
}

.dark-theme .tocArea {
    background: linear-gradient(
        to right,
        rgb(var(--v-theme-backgroundAccent)),
        rgb(var(--v-theme-background))
    );
    border-top-left-radius: 10px 10px;

    border-bottom-left-radius: 10px 10px;
    box-shadow: inset 0 0 20px rgb(var(--v-theme-background));
}

blockquote {
    background-color: rgb(var(--v-theme-backgroundAccent)) !important;
}

.dark-theme .readerArea .arrow {
    color: rgb(var(--v-theme-primary));
}

.dark-theme .readerArea .arrow:hover {
    color: rgb(var(--v-theme-accent));
}
</style>
