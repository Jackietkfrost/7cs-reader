<template>
    <v-tooltip activator="parent" width="300px">
        <h3>{{ information?.title ?? "Unknown Book" }}</h3>
        <h4>{{ information?.creator ?? "Unknown Author" }}</h4>
        <h4>{{ information?.publisher ?? "Unknown Publisher" }}</h4>

        <h5 class="">{{
            information?.description?.replace(/(<([^>]+)>)/gi, "") ?? "No Description Provided"
        }}</h5>
    </v-tooltip>
</template>
<script setup lang="ts">
import { BookMetaData } from "@/main/types/book"

const { information } = defineProps<{ information: BookMetaData | {} }>()
</script>
