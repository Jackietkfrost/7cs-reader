// SnackbarComponent.vue
<template>
    <v-snackbar :v-model="visible" text="test" :color="color">
        {{ text }}
    </v-snackbar>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useAppStore } from "../store/appStore"

const appStore = useAppStore()

const visible = ref(appStore.snackbar.visible)
const text = ref(appStore.snackbar.text)
const color = ref(appStore.snackbar.color)
// It's just.. I've just been running in my head for a while about this, and I really wanted to ask. Is there any reason you never sent me the invite/confirmation that I was going to the concert with you and everyone? I thought you told me you would do the confirmation and send it for my birthday and all..
</script>
