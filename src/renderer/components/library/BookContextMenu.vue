<template>
    <v-list>
        <v-list-item v-for="(item, i) in items" :key="i">
            <v-list-item-title @click="handleItemClick(item)">{{ item.title }}</v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">
const items = [
    { title: "Open Book" },
    { title: "Reveal in Explorer" },
    { title: "Edit Tags" },
    { title: "Edit MetaData" },
    { title: "Rate" },
    { title: "Delete Book" }
]

const handleItemClick = (item: { title: string }): void => {
    console.log(item.title)
}
</script>
