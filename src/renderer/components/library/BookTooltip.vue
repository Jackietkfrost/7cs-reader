<template>
    <v-tooltip activator="parent" width="300px">
        <h4>{{ information?.title ?? "Unknown Book" }}</h4>
        <h5 class="text-truncate">{{ information?.description.replace(/(<([^>]+)>)/gi, "") }}</h5>
    </v-tooltip>
</template>
