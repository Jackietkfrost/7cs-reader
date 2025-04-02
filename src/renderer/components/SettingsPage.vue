<template>
    <v-dialog v-model="isSettingsOpened">
        <v-card>
            <v-card-title>Settings</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-switch
                            v-model="nightMode"
                            label="Night Mode"
                            @change="toggleNightMode"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-select
                            v-model="fontFamily"
                            :items="fontFamilies"
                            label="Font Family"
                            @change="changeFontFamily"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-slider
                            v-model="fontSize"
                            min="12"
                            max="24"
                            label="Font Size"
                            @change="changeFontSize"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useTheme } from "vuetify"
import { useAppStore } from "../store/appStore"

const theme = useTheme()
const appStore = useAppStore()
const isSettingsOpened = computed(() => appStore.getOpenedSettings)
const nightMode = ref(theme.global.name.value === "dark")
const fontFamily = ref("Arial")
const fontFamilies = ref(["Arial", "Calibri", "Times New Roman"])
const fontSize = ref(16)

const toggleNightMode = () => {
    theme.global.name.value = nightMode.value ? "dark" : "light"
}

const changeFontFamily = () => {
    // Update font family here
}

const changeFontSize = () => {
    // Update font size here
}
</script>
