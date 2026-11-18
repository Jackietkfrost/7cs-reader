<template>
    <v-app>
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {{ appStore.announcement }}
        </div>
        <v-layout style="height: 100vh">
            <v-navigation-drawer permanent expand-on-hover rail aria-label="Main navigation">
                <v-list density="compact" nav>
                    <v-list-item
                        prepend-icon="mdi-bookshelf"
                        :title="$t('ui-labels.nav-bar.library')"
                        value="library"
                        :active="isCurrentRoute('/')"
                        data-testid="nav-library"
                        @click="handleRoute('/')"
                    />
                    <v-list-item
                        :disabled="!isBookSelected"
                        prepend-icon="mdi-book-open-page-variant-outline"
                        :title="$t('ui-labels.nav-bar.current')"
                        value="current"
                        :active="isCurrentRoute('/reader')"
                        data-testid="nav-current"
                        @click="handleRoute('/reader')"
                    />
                    <v-list-item
                        v-if="appStore.tagsVisible"
                        prepend-icon="mdi-tag-outline"
                        :title="$t('ui-labels.nav-bar.labels')"
                        value="labels"
                        :active="isCurrentRoute('/labels')"
                        data-testid="nav-labels"
                        @click="handleRoute('/labels')"
                    />
                    <v-list-item
                        v-if="appStore.ratingsVisible"
                        prepend-icon="mdi-star-outline"
                        :title="$t('ui-labels.nav-bar.starred')"
                        value="starred"
                        :active="isCurrentRoute('/starred')"
                        data-testid="nav-starred"
                        @click="handleRoute('/starred')"
                    />
                    <v-list-item
                        v-if="appStore.archivesVisible"
                        prepend-icon="mdi-file-download"
                        :title="$t('ui-labels.nav-bar.archive')"
                        value="archive"
                        :active="isCurrentRoute('/archive')"
                        data-testid="nav-archive"
                        @click="handleRoute('/archive')"
                    />
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
                                data-testid="nav-settings"
                                @click="openSettings"
                            />
                            <v-divider />
                            <v-list-item
                                prepend-icon="mdi-door-open"
                                :title="$t('ui-labels.nav-bar.exit')"
                                density="compact"
                                class="exit-btn"
                                flat
                                value="exit"
                                data-testid="nav-exit"
                                @click="handleExit"
                            />
                        </v-list>
                    </div>
                </template>
            </v-navigation-drawer>
            <v-main style="height: 100vh; overflow-y: auto">
                <slot />
            </v-main>
        </v-layout>
        <SettingsPage />
        <v-snackbar-queue
            v-model="appStore.snackbar.text"
            :timeout="5000"
            :color="appStore.snackbar.color"
            closable
            location="top"
            :timer="appStore.snackbar.color"
            variant="tonal"
        />
    </v-app>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useBookStore } from "@/renderer/store/bookStore"
import { onMounted, onUnmounted, ref, watch } from "vue"
import { useAppStore } from "@/renderer/store/appStore"
import SettingsPage from "../settings-page.vue"
import type { SettingsPayload } from "@/main/types/Settings"

const bookStore = useBookStore()
const appStore = useAppStore()
const { bookName } = storeToRefs(bookStore)
const isBookSelected = ref(Boolean(bookStore.bookName))
const router = useRouter()
const route = useRoute()

watch(bookName, (newValue) => {
    isBookSelected.value = Boolean(newValue)
})

const handleRoute = (path: string): void => {
    router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
    return path === route.path
}

const openSettings = (): void => {
    appStore.setOpenSettings(true)
}

const handleExit = (): void => {
    window.sevenCsApi.invoke("msgExitApp")
}

const handleSettingsUpdated = (_event: unknown, payload: SettingsPayload): void => {
    appStore.applyPayload(payload)
}

const handleGlobalShortcut = (event: KeyboardEvent): void => {
    if (!appStore.getSettings.keyboardNavigationHints) {
        return
    }
    if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault()
        appStore.setOpenSettings(!appStore.getOpenedSettings)
    }
}

onMounted(async () => {
    await appStore.loadSettings()
    window.sevenCsApi.on("settingsUpdated", handleSettingsUpdated)
    window.addEventListener("keydown", handleGlobalShortcut)
})

onUnmounted(() => {
    window.sevenCsApi.off("settingsUpdated", handleSettingsUpdated)
    window.removeEventListener("keydown", handleGlobalShortcut)
})
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
