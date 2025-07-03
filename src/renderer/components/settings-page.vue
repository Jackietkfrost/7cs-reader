<template>
    <v-dialog v-model="isSettingsOpened" transition="dialog-bottom-transition" scrim="secondary" cl>
        <v-card>
            <v-card-title class="mx-3">Settings</v-card-title>
            <v-card-text>
                <v-row class="justify-center align-center">
                    <v-col cols="6" sm="6">{{ $t("settings.dark-mode") }}</v-col>
                    <v-col cols="6" sm="6">
                        <v-switch
                            v-model="nightMode"
                            inset
                            density="compact"
                            hide-details
                            :ripple="false"
                            :prepend-icon="nightMode ? `mdi-weather-night` : `mdi-weather-sunny`"
                            @change="toggleNightMode"
                        />
                    </v-col>
                </v-row>
                <v-row class="justify-center align-center">
                    <v-col cols="6" sm="6">{{ $t("settings.fonts") }}</v-col>
                    <v-col cols="6" sm="6">
                        <v-select :items="appStore.getFonts" @change="changeFontFamily" />
                    </v-col>
                </v-row>
                <v-row class="justify-center align-center">
                    <v-col cols="6" sm="6">{{ $t("settings.font-size") }}</v-col>
                    <v-col cols="6" sm="6">
                        <v-slider
                            v-model="fontSize"
                            step="10"
                            min="50"
                            max="400"
                            :label="fontSize + `%`"
                            show-ticks
                            @change="changeFontSize"
                        />
                    </v-col>
                </v-row>
                <v-row class="justify-center align-center">
                    <v-col cols="6" sm="6">{{ $t("settings.language") }}</v-col>
                    <v-col cols="6" sm="6">
                        <v-select
                            v-model="locale"
                            :items="languages"
                            @change="handleChangeLanguage"
                        />
                    </v-col>
                </v-row>
                <v-row class="justify-center align-center">
                    <v-col cols="6" sm="6">{{ $t("settings.tags-page") }}</v-col>
                    <v-col cols="6" sm="6">
                        <v-switch
                            v-model="tagsVisible"
                            density="compact"
                            inset
                            hide-details
                            :ripple="false"
                            @change="toggleTags"
                        />
                    </v-col>
                </v-row>
                <v-row class="justify-center align-center">
                    <v-col cols="6" sm="6">{{ $t("settings.ratings-page") }}</v-col>
                    <v-col cols="6" sm="6">
                        <v-switch
                            v-model="ratingVisible"
                            density="compact"
                            inset
                            hide-details
                            :ripple="false"
                            @change="toggleRatings"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-btn color="primary" variant="outlined" @click="appStore.setOpenSettings(false)"
                >Close</v-btn
            >
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useTheme } from "vuetify"
import { useAppStore } from "../store/appStore"
import { useI18n } from "vue-i18n"

const { locale, availableLocales, t } = useI18n()

const theme = useTheme()
const appStore = useAppStore()
const isSettingsOpened = computed(() => appStore.getOpenedSettings)
const nightMode = ref(theme.global.name.value === "dark")
const fontFamily = computed(() => t("settings.default-font"))
const fontSize = ref(100)
const languages = ref(["en"])
const tagsVisible = ref(appStore.getTagsVisible)
const ratingVisible = ref(appStore.getRatingsVisible)

onMounted((): void => {
    languages.value = availableLocales
    appStore.setFonts()
    console.log(fontFamily.value)
})

const toggleNightMode = () => {
    theme.global.name.value = nightMode.value ? "dark" : "light"
}

const toggleTags = () => {
    appStore.setTagsVisible(!tagsVisible.value)
}

const toggleRatings = () => {
    appStore.setRatingsVisible(!ratingVisible.value)
}

const changeFontFamily = () => {
    // Update font family here
}

const changeFontSize = () => {
    // Update font size here
}

const handleChangeLanguage = (val: string): void => {
    locale.value = val
}
</script>
