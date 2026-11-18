<template>
    <v-dialog
        v-model="isOpen"
        max-width="580"
        aria-labelledby="rhvoice-dialog-title"
        data-testid="rhvoice-install-dialog"
    >
        <v-card>
            <v-card-title
                id="rhvoice-dialog-title"
                class="d-flex align-center justify-space-between px-6 py-4"
            >
                <span class="d-flex align-center">
                    <v-icon
                        icon="mdi-download-circle-outline"
                        color="primary"
                        class="mr-2"
                        aria-hidden="true"
                    />
                    {{ $t("settings.tts-rhvoice-missing-title") }}
                </span>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    :aria-label="$t('ui-labels.close-button')"
                    data-testid="btn-close-rhvoice-dialog-icon"
                    @click="isOpen = false"
                />
            </v-card-title>

            <v-divider />

            <v-card-text class="px-6 py-5">
                <div
                    class="text-caption text-medium-emphasis mb-3"
                    data-testid="rhvoice-detected-env"
                >
                    {{ $t("settings.tts-rhvoice-detected-system") }}:
                    <strong>{{ status.platformLabel }}</strong>
                    ({{ status.systemLocale }})
                </div>

                <p class="text-body-1 mb-3">
                    {{
                        isWindows
                            ? $t("settings.tts-rhvoice-missing-body-windows")
                            : $t("settings.tts-rhvoice-missing-body-other")
                    }}
                </p>

                <div
                    class="text-caption text-medium-emphasis mb-4"
                    data-testid="rhvoice-recommended-url"
                >
                    {{ status.recommendedRhvoiceUrl }}
                </div>

                <div class="d-flex flex-wrap ga-2">
                    <v-btn
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-download"
                        data-testid="btn-download-rhvoice"
                        @click="openRecommendedPage"
                    >
                        {{ primaryDownloadLabel }}
                    </v-btn>
                    <v-btn
                        v-if="!isAllLanguagesUrl"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-translate"
                        data-testid="btn-rhvoice-all-languages"
                        @click="openAllLanguagesPage"
                    >
                        {{ $t("settings.tts-rhvoice-all-languages") }}
                    </v-btn>
                    <v-btn
                        v-if="!isWindows"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-open-in-new"
                        data-testid="btn-rhvoice-install-guide"
                        @click="openInstallationGuide"
                    >
                        {{ $t("settings.tts-rhvoice-install-guide") }}
                    </v-btn>
                    <v-btn
                        v-if="!isWindows"
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-folder-search-outline"
                        data-testid="btn-dialog-browse-rhvoice"
                        @click="emit('browse')"
                    >
                        {{ $t("settings.tts-rhvoice-browse") }}
                    </v-btn>
                    <v-btn
                        variant="outlined"
                        prepend-icon="mdi-refresh"
                        data-testid="btn-recheck-rhvoice"
                        @click="emit('recheck')"
                    >
                        {{ $t("settings.tts-rhvoice-recheck") }}
                    </v-btn>
                </div>
            </v-card-text>

            <v-divider />

            <v-card-actions class="px-6 py-3">
                <v-btn
                    color="primary"
                    variant="text"
                    prepend-icon="mdi-swap-horizontal"
                    data-testid="btn-fallback-system-tts"
                    @click="emit('fallback')"
                >
                    {{ $t("settings.tts-rhvoice-use-system") }}
                </v-btn>
                <v-spacer />
                <v-btn
                    color="primary"
                    variant="outlined"
                    data-testid="btn-close-rhvoice-dialog"
                    @click="isOpen = false"
                >
                    {{ $t("ui-labels.close-button") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { openExternal } from "@/renderer/utils"
import type { LocalTtsStatus } from "@/renderer/utils/speech"

const RHVOICE_ALL_LANGUAGES_URL = "https://rhvoice.org/languages/"
const RHVOICE_INSTALL_URL = "https://rhvoice.org/installation/"

const { t } = useI18n()

const props = defineProps<{
    modelValue: boolean
    status: LocalTtsStatus
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void
    (e: "browse"): void
    (e: "recheck"): void
    (e: "fallback"): void
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit("update:modelValue", val)
})

const isWindows = computed(() => props.status.platform === "win32")

const isAllLanguagesUrl = computed(
    () => props.status.recommendedRhvoiceUrl === RHVOICE_ALL_LANGUAGES_URL
)

const primaryDownloadLabel = computed(() => {
    if (isAllLanguagesUrl.value || !props.status.recommendedRhvoiceLanguageLabel) {
        return t("settings.tts-rhvoice-download")
    }
    return t("settings.tts-rhvoice-download-lang", {
        language: props.status.recommendedRhvoiceLanguageLabel
    })
})

const openRecommendedPage = (): void => {
    openExternal(props.status.recommendedRhvoiceUrl || RHVOICE_ALL_LANGUAGES_URL)
}

const openAllLanguagesPage = (): void => {
    openExternal(RHVOICE_ALL_LANGUAGES_URL)
}

const openInstallationGuide = (): void => {
    openExternal(RHVOICE_INSTALL_URL)
}
</script>
