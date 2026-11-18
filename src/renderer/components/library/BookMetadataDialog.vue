<template>
    <v-dialog v-model="isOpen" max-width="500px" transition="dialog-transition">
        <v-card class="metadata-card rounded border border-opacity-10 border-white">
            <div class="card-header-gradient px-6 py-5 d-flex align-center justify-between">
                <div>
                    <h3 class="text-h5 font-weight-bold text-white d-flex align-center">
                        <v-icon color="amber-accent-3" class="mr-2">mdi-star-cog-outline</v-icon>
                        Book Organizer
                    </h3>
                    <p class="text-caption text-grey-lighten-1 mb-0 text-truncate max-w-350 mt-1">
                        {{ cleanTitle(bookName) }}
                    </p>
                </div>
                <v-spacer></v-spacer>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    color="grey-lighten-1"
                    aria-label="Close Book Organizer"
                    @click="isOpen = false"
                ></v-btn>
            </div>

            <v-card-text class="px-6 py-4">
                <div class="mb-5">
                    <label
                        class="text-subtitle-2 font-weight-bold text-grey-lighten-1 d-block mb-2"
                    >
                        Star Rating
                    </label>
                    <div
                        class="d-flex align-center justify-center py-2 rating-container bg-grey-darken-4 rounded"
                    >
                        <v-rating
                            v-model="rating"
                            color="amber"
                            active-color="amber"
                            :half-increments="false"
                            hover
                            size="x-large"
                        ></v-rating>
                    </div>
                </div>

                <div>
                    <div class="d-flex align-center justify-space-between mb-2">
                        <label
                            for="book-categories-input"
                            class="text-subtitle-2 font-weight-bold text-grey-lighten-1"
                        >
                            Categories & Tags
                        </label>
                        <v-btn
                            v-if="appStore.getSettings.speech.voiceToTextEnabled"
                            size="x-small"
                            :color="isDictatingTag ? 'error' : 'primary'"
                            variant="tonal"
                            :prepend-icon="isDictatingTag ? 'mdi-microphone-off' : 'mdi-microphone'"
                            aria-label="Dictate category tag with voice-to-text"
                            data-testid="btn-dictate-tag"
                            @click="toggleTagDictation"
                        >
                            {{ isDictatingTag ? "Listening..." : "Dictate Tag" }}
                        </v-btn>
                    </div>
                    <v-combobox
                        id="book-categories-input"
                        v-model="categories"
                        :items="allExistingCategories"
                        label="Add/select categories"
                        multiple
                        chips
                        clearable
                        variant="outlined"
                        closable-chips
                        placeholder="Type to add a new category"
                        class="mt-1"
                        color="primary"
                        hide-details
                    >
                        <template #chip="{ props: chipProps, item }">
                            <v-chip
                                v-bind="chipProps"
                                color="primary"
                                variant="flat"
                                size="small"
                                class="rounded px-3 font-weight-medium"
                            >
                                {{ item.title }}
                            </v-chip>
                        </template>
                    </v-combobox>
                </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-6 py-4 bg-grey-darken-4">
                <v-spacer></v-spacer>
                <v-btn
                    variant="text"
                    color="grey-lighten-1"
                    class="rounded px-4"
                    @click="isOpen = false"
                >
                    Cancel
                </v-btn>
                <v-btn
                    variant="flat"
                    color="primary"
                    class="rounded px-5 ml-2 font-weight-bold"
                    @click="handleSave"
                >
                    Save Changes
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { useBookStore } from "@/renderer/store/bookStore"
import { useAppStore } from "@/renderer/store/appStore"
import { VoiceRecognizerController, createVoiceRecognizer } from "@/renderer/utils/speech"

const props = defineProps<{
    modelValue: boolean
    bookName: string
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void
    (e: "saved"): void
}>()

const bookStore = useBookStore()
const appStore = useAppStore()

const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val)
})

const rating = ref(0)
const categories = ref<string[]>([])
const isDictatingTag = ref(false)
let tagRecognizer: VoiceRecognizerController | null = null

const stopTagDictation = (): void => {
    tagRecognizer?.stop()
    tagRecognizer = null
    isDictatingTag.value = false
}

const toggleTagDictation = (): void => {
    if (isDictatingTag.value) {
        stopTagDictation()
        return
    }
    tagRecognizer = createVoiceRecognizer({
        lang: appStore.getSettings.speech.voiceCommandLanguage,
        continuous: false,
        interimResults: false,
        onResult: (transcript, isFinal) => {
            if (isFinal && transcript.trim()) {
                const tag = transcript.trim()
                if (!categories.value.includes(tag)) {
                    categories.value = [...categories.value, tag]
                }
                appStore.announce(`Added tag ${tag}`)
            }
        },
        onError: (message) => {
            appStore.addSnackbar(message, "warning")
            isDictatingTag.value = false
        },
        onEnd: () => {
            isDictatingTag.value = false
        }
    })

    if (!tagRecognizer) {
        appStore.addSnackbar("Voice recognition is not available in this runtime.", "warning")
        return
    }
    if (tagRecognizer.start()) {
        isDictatingTag.value = true
    }
}

const cleanTitle = (filename: string): string => {
    if (!filename) return ""
    return filename.replace(".epub", "").replace(/[-_]/g, " ")
}

const allExistingCategories = computed(() => {
    const list = new Set<string>()
    const meta = bookStore.getMetadata
    Object.values(meta).forEach((item) => {
        if (item.categories) {
            item.categories.forEach((cat) => {
                if (cat.trim()) list.add(cat.trim())
            })
        }
    })
    return Array.from(list)
})

watch(
    () => props.modelValue,
    (val) => {
        if (val && props.bookName) {
            const meta = bookStore.getMetadata[props.bookName] || {}
            rating.value = meta.rating || 0
            categories.value = meta.categories ? [...meta.categories] : []
        } else {
            stopTagDictation()
        }
    },
    { immediate: true }
)

onUnmounted(() => {
    stopTagDictation()
})

const handleSave = async () => {
    stopTagDictation()
    const cleanCats = categories.value.map((c) => c.trim()).filter((c) => c.length > 0)
    await bookStore.saveMetadata(props.bookName, rating.value, cleanCats)
    isOpen.value = false
    emit("saved")
}
</script>

<style scoped>
.metadata-card {
    background-color: #1e1e1e !important;
    color: #e0e0e0 !important;
    overflow: hidden;
}

.card-header-gradient {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1e1e1e 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.max-w-350 {
    max-width: 350px;
}

.rating-container {
    border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
