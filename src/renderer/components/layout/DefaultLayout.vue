<template>
    <v-app>
        <v-layout>
            <v-navigation-drawer absolute permanent expand-on-hover rail>
                <v-list density="compact" nav>
                    <v-list-item
                        prepend-icon="mdi-bookshelf"
                        :title="$t('ui-labels.nav-bar.library')"
                        value="library"
                        :class="{ active: isCurrentRoute('/') }"
                        @click="handleRoute('/')"
                    ></v-list-item>
                    <v-list-item
                        :disabled="!isBookSelected"
                        prepend-icon="mdi-book-open-page-variant-outline"
                        :title="$t('ui-labels.nav-bar.current')"
                        value="myfiles"
                        :class="{ active: isCurrentRoute('/reader') }"
                        @click="handleRoute('/reader')"
                    ></v-list-item>
                    <v-list-item
                        v-if="appStore.tagsVisible"
                        prepend-icon="mdi-tag-outline"
                        :title="$t('ui-labels.nav-bar.labels')"
                        value="shared"
                        :class="{ active: isCurrentRoute('/labels') }"
                        @click="handleRoute('/labels')"
                    ></v-list-item>
                    <v-list-item
                        v-if="appStore.ratingsVisible"
                        prepend-icon="mdi-star-outline"
                        :title="$t('ui-labels.nav-bar.starred')"
                        value="starred"
                        :class="{ active: isCurrentRoute('/starred') }"
                        @click="handleRoute('/starred')"
                    ></v-list-item>
                </v-list>
                <template #append>
                    <div class="pb-2">
                        <v-list>
                            <v-list-item
                                prepend-icon="mdi-cog-outline"
                                :title="$t('ui-labels.nav-bar.settings')"
                                density="comfortable"
                                flat
                                value="settings"
                                @click="openSettings()"
                            ></v-list-item>
                            <v-divider></v-divider>
                            <v-list-item
                                prepend-icon="mdi-door-open"
                                :title="$t('ui-labels.nav-bar.exit')"
                                density="compact"
                                class="exit-btn"
                                flat
                                value="library"
                            ></v-list-item>
                        </v-list>
                    </div>
                </template>
            </v-navigation-drawer>
            <v-main>
                <!-- <HeaderLayout /> -->
                <slot />
            </v-main>
        </v-layout>
        <SettingsPage />
    </v-app>
</template>

<script setup lang="ts">
// import HeaderLayout from "@/renderer/components/layout/HeaderLayout.vue"
import { useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useBookStore } from "@/renderer/store/bookStore"
import { ref, watch } from "vue"
import { useAppStore } from "@/renderer/store/appStore"
import SettingsPage from "../settings-page.vue"
// import { useTheme } from "vuetify"

// const theme = useTheme()
const bookStore = useBookStore()
const { bookName } = storeToRefs(bookStore)
const { setOpenSettings } = useAppStore()
const isBookSelected = ref(false)
const router = useRouter()
const route: any = useRoute()

watch(bookName, (newValue, oldValue) => {
    // TODO: Do something when the bookName changes
    isBookSelected.value = !!newValue && newValue !== null
    console.log(isBookSelected.value)
})
const handleRoute = (path: string): void => {
    router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
    return path === route.path
}

const openSettings = (): void => {
    setOpenSettings(true)
}

// const handleChangeTheme = (): void => {
//     theme.global.name.value = theme.global.current.value.dark ? "light" : "dark"
// }
</script>

<style scoped>
.v-list-item {
    color: rgb(var(--v-theme-primary));
}

.v-list-item:hover {
    color: rgb(var(--v-theme-secondary)) !important;
}
.exit-btn {
    color: rgb(var(--v-theme-error));
}
</style>
