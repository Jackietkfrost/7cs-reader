<template>
    <v-container class="fill-height" align-content="center" justify="center">
        <v-row>
            <v-col cols="12" class="text-center">
                <h1 class="fading">COMING SOON...</h1>
                <v-icon ref="icon" class="fading" size="64">mdi-tag-outline</v-icon>
                <h5 class="fading"
                    >Add your labels and categorize your books with custom filters.</h5
                >
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts"></script>
<style scoped>
.fading {
    background: linear-gradient(
        to right,
        rgb(var(--v-theme-primary)),
        rgb(var(--v-theme-background)),
        rgb(var(--v-theme-primary))
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: rainbow_animation 10s linear infinite;
    background-size: 1000% 100%;
}

@keyframes rainbow_animation {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: 100% 0;
    }
}
</style>
