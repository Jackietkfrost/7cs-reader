<template>
    <v-btn-toggle
        :model-value="modelValue"
        mandatory
        variant="outlined"
        density="comfortable"
        rounded
        color="primary"
        aria-label="Listing view mode"
        data-testid="view-mode-toggle"
        @update:model-value="handleChange"
    >
        <v-btn
            value="gallery"
            prepend-icon="mdi-view-grid-outline"
            aria-label="Gallery view"
            data-testid="view-mode-gallery"
        >
            Gallery
        </v-btn>
        <v-btn
            value="list"
            prepend-icon="mdi-view-list-outline"
            aria-label="List view"
            data-testid="view-mode-list"
        >
            List
        </v-btn>
    </v-btn-toggle>
</template>

<script setup lang="ts">
import type { ListingViewMode } from "@/main/types/Settings"

defineProps<{
    modelValue: ListingViewMode
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: ListingViewMode): void
}>()

const handleChange = (val: unknown): void => {
    if (val === "gallery" || val === "list") {
        emit("update:modelValue", val)
    }
}
</script>
