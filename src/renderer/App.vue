<script setup lang="tsx">
import { DefaultLayout } from "@/renderer/components/layout"
</script>

<template>
    <DefaultLayout>
        <router-view />
    </DefaultLayout>
</template>

<style>
html {
    overflow: hidden !important;
    user-select: none;
}
html,
body {
    width: 100%;
    height: 100%;
}
.v-btn {
    text-transform: unset !important;
}

html.a11y-enhanced-focus *:focus-visible {
    outline: 3px solid rgb(var(--v-theme-primary)) !important;
    outline-offset: 2px !important;
}

html.a11y-enhanced-focus .v-field:has(:focus-visible) {
    outline: 3px solid rgb(var(--v-theme-primary)) !important;
    outline-offset: 2px !important;
}

html.a11y-enhanced-focus .v-field input:focus-visible,
html.a11y-enhanced-focus .v-field textarea:focus-visible {
    outline: none !important;
}

html.a11y-high-contrast .v-card,
html.a11y-high-contrast .v-navigation-drawer,
html.a11y-high-contrast .v-btn,
html.a11y-high-contrast .v-field {
    border: 1.5px solid currentColor !important;
}

html.a11y-reduced-motion *,
html.a11y-reduced-motion *::before,
html.a11y-reduced-motion *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>
