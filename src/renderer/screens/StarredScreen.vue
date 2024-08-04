<template>
    <v-container class="fill-height" align-content="center" justify="center">
        <v-row>
            <v-col cols="12" class="text-center fading">
                <h1>COMING SOON...</h1>
                <v-icon class="fading" size="64">mdi-star-shooting-outline</v-icon>
                <h5>Rate and categorize your books by most liked.</h5>
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
