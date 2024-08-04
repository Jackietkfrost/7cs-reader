<template>
    <v-app-bar color="rgba(33, 33, 33, 1)" density="compact">
        <v-app-bar-title>{{ $t(titleKey) }}</v-app-bar-title>
        <template #append>
            <v-btn
                prepend-icon="mdi-brightness-6"
                variant="text"
                text="Theme"
                class="active"
                @click="handleChangeTheme"
            >
                <v-tooltip activator="parent" location="bottom">
                    {{ $t("title.change-theme") }}
                </v-tooltip>
                {{ $t("title.change-theme") }}
            </v-btn>
            <v-btn
                prepend-icon="mdi-home"
                variant="text"
                :class="{ active: isCurrentRoute('/') }"
                @click="handleRoute('/')"
            >
                {{ $t("title.main") }}
            </v-btn>
            <v-btn
                prepend-icon="mdi-fit-to-screen-outline"
                variant="text"
                :class="{ active: isCurrentRoute('/second') }"
                @click="handleRoute('/second')"
            >
                {{ $t("title.second") }}
            </v-btn>
        </template>
    </v-app-bar>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router"
import { useTheme } from "vuetify"

const router = useRouter()
const route: any = useRoute()
const theme = useTheme()
const titleKey: string = (route?.meta?.titleKey || "title.main") as string

const handleRoute = (path: string): void => {
    router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
    return path === route.path
}

const handleChangeTheme = (): void => {
    theme.global.name.value = theme.global.current.value.dark ? "light" : "dark"
}
</script>

<style scoped>
.v-btn {
    opacity: 0.4;
}
.active {
    opacity: 1 !important;
}
</style>
