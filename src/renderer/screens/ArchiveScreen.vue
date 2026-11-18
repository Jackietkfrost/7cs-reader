<template>
    <div class="grid-container">
        <div
            v-for="(item, index) in squares"
            :key="index"
            class="grid-square"
            title="click me"
            @click="handleClick(index)"
        >
            <!-- Empty content for placeholder -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const squares = ref(Array(16).fill(null)) // 4x4 grid

const handleClick = (index: number) => {
    console.log(`Square ${index} clicked`)
}
</script>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 36px);
    gap: 8px;
    padding: 16px;
}

.grid-square {
    width: 36px;
    height: 36px;
    background-color: white;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: all 0.2s ease;
}

.grid-square:hover {
    background-color: #f0f0f0;
    border-color: #999;
}
</style>
