<template>
    <v-dialog
        v-model="isSettingsOpened"
        max-width="780"
        scrollable
        aria-labelledby="settings-dialog-title"
        data-testid="settings-dialog"
    >
        <v-card>
            <v-card-title
                id="settings-dialog-title"
                class="d-flex align-center justify-space-between px-6 py-4"
            >
                <span class="d-flex align-center">
                    <v-icon
                        icon="mdi-cog-outline"
                        color="primary"
                        class="mr-2"
                        aria-hidden="true"
                    />
                    {{ $t("settings.title") }}
                </span>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    :aria-label="$t('ui-labels.close-button')"
                    data-testid="settings-close-icon"
                    @click="closeSettings"
                />
            </v-card-title>

            <v-divider />

            <v-tabs v-model="activeTab" color="primary" show-arrows aria-label="Settings sections">
                <v-tab value="general" prepend-icon="mdi-tune" data-testid="settings-tab-general">
                    {{ $t("settings.tabs.general") }}
                </v-tab>
                <v-tab
                    value="typography"
                    prepend-icon="mdi-format-font"
                    data-testid="settings-tab-typography"
                >
                    {{ $t("settings.tabs.typography") }}
                </v-tab>
                <v-tab
                    value="accessibility"
                    prepend-icon="mdi-human"
                    data-testid="settings-tab-accessibility"
                >
                    {{ $t("settings.tabs.accessibility") }}
                </v-tab>
                <v-tab
                    value="speech"
                    prepend-icon="mdi-account-voice"
                    data-testid="settings-tab-speech"
                >
                    {{ $t("settings.tabs.speech") }}
                </v-tab>
                <v-tab
                    value="config"
                    prepend-icon="mdi-file-cog-outline"
                    data-testid="settings-tab-config"
                >
                    {{ $t("settings.tabs.config") }}
                </v-tab>
                <v-tab
                    value="about"
                    prepend-icon="mdi-information-outline"
                    data-testid="settings-tab-about"
                >
                    {{ $t("settings.tabs.about") }}
                </v-tab>
            </v-tabs>

            <v-divider />

            <v-card-text class="px-6 py-5" style="max-height: 62vh">
                <v-tabs-window v-model="activeTab">
                    <v-tabs-window-item value="general">
                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="6">
                                <label for="setting-dark-mode" class="font-weight-medium">
                                    {{ $t("settings.dark-mode") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-dark-mode"
                                    :model-value="settings.nightMode"
                                    color="primary"
                                    inset
                                    density="compact"
                                    hide-details
                                    :aria-label="$t('settings.dark-mode')"
                                    :prepend-icon="
                                        settings.nightMode
                                            ? 'mdi-weather-night'
                                            : 'mdi-weather-sunny'
                                    "
                                    data-testid="setting-dark-mode"
                                    @update:model-value="onToggleNightMode"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="6">
                                <label
                                    for="setting-high-contrast-general"
                                    class="font-weight-medium"
                                >
                                    {{ $t("settings.high-contrast") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.high-contrast-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-high-contrast-general"
                                    :model-value="settings.highContrast"
                                    color="primary"
                                    inset
                                    density="compact"
                                    hide-details
                                    :aria-label="$t('settings.high-contrast')"
                                    prepend-icon="mdi-contrast-circle"
                                    data-testid="setting-high-contrast"
                                    @update:model-value="onToggleHighContrast"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="6">
                                <label for="setting-language" class="font-weight-medium">
                                    {{ $t("settings.language") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-select
                                    id="setting-language"
                                    :model-value="settings.language"
                                    :items="languages"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.language')"
                                    data-testid="setting-language"
                                    @update:model-value="onChangeLanguage"
                                />
                            </v-col>
                        </v-row>

                        <v-divider class="my-4" />

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="6">
                                <label for="setting-tags-page" class="font-weight-medium">
                                    {{ $t("settings.tags-page") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-tags-page"
                                    :model-value="settings.tagsVisible"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.tags-page')"
                                    data-testid="setting-tags-page"
                                    @update:model-value="onToggleTags"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center">
                            <v-col cols="12" sm="6">
                                <label for="setting-ratings-page" class="font-weight-medium">
                                    {{ $t("settings.ratings-page") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-ratings-page"
                                    :model-value="settings.ratingsVisible"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.ratings-page')"
                                    data-testid="setting-ratings-page"
                                    @update:model-value="onToggleRatings"
                                />
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="typography">
                        <div
                            class="typography-preview rounded pa-4 mb-5"
                            :style="previewBoxStyle"
                            role="region"
                            :aria-label="$t('settings.preview-heading')"
                            data-testid="typography-preview"
                        >
                            <div class="text-caption font-weight-bold mb-1">
                                {{ $t("settings.preview-heading") }}
                            </div>
                            <p class="mb-0" :style="previewTextStyle">
                                {{ $t("settings.preview-sample") }}
                            </p>
                        </div>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-reader-scheme" class="font-weight-medium">
                                    {{ $t("settings.reader-color-scheme") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-select
                                    id="setting-reader-scheme"
                                    :model-value="settings.bookTypography.readerColorScheme"
                                    :items="readerSchemeItems"
                                    item-title="title"
                                    item-value="value"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.reader-color-scheme')"
                                    data-testid="setting-reader-scheme"
                                    @update:model-value="onChangeReaderScheme"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-dyslexia-friendly" class="font-weight-medium">
                                    {{ $t("settings.dyslexia-friendly") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.dyslexia-friendly-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-switch
                                    id="setting-dyslexia-friendly"
                                    :model-value="settings.bookTypography.dyslexiaFriendly"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.dyslexia-friendly')"
                                    data-testid="setting-dyslexia-friendly"
                                    @update:model-value="onToggleDyslexiaFriendly"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-font-family" class="font-weight-medium">
                                    {{ $t("settings.fonts") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-autocomplete
                                    id="setting-font-family"
                                    :model-value="settings.bookTypography.fontFamily"
                                    :items="availableFontOptions"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.fonts')"
                                    data-testid="setting-font-family"
                                    @update:model-value="onChangeFontFamily"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-font-size" class="font-weight-medium">
                                    {{ $t("settings.font-size") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-font-size"
                                    :model-value="settings.bookTypography.fontSize"
                                    color="primary"
                                    :step="10"
                                    :min="50"
                                    :max="400"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.font-size')"
                                    data-testid="setting-font-size"
                                    @update:model-value="onChangeFontSize"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.bookTypography.fontSize }}%
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-line-height" class="font-weight-medium">
                                    {{ $t("settings.line-height") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-line-height"
                                    :model-value="settings.bookTypography.lineHeight"
                                    color="primary"
                                    :step="0.1"
                                    :min="1.2"
                                    :max="2.4"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.line-height')"
                                    data-testid="setting-line-height"
                                    @update:model-value="onChangeLineHeight"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.bookTypography.lineHeight.toFixed(1) }}
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-letter-spacing" class="font-weight-medium">
                                    {{ $t("settings.letter-spacing") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-letter-spacing"
                                    :model-value="settings.bookTypography.letterSpacing"
                                    color="primary"
                                    :step="0.02"
                                    :min="0"
                                    :max="0.24"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.letter-spacing')"
                                    data-testid="setting-letter-spacing"
                                    @update:model-value="onChangeLetterSpacing"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.bookTypography.letterSpacing.toFixed(2) }}em
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-word-spacing" class="font-weight-medium">
                                    {{ $t("settings.word-spacing") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-word-spacing"
                                    :model-value="settings.bookTypography.wordSpacing"
                                    color="primary"
                                    :step="0.05"
                                    :min="0"
                                    :max="0.5"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.word-spacing')"
                                    data-testid="setting-word-spacing"
                                    @update:model-value="onChangeWordSpacing"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.bookTypography.wordSpacing.toFixed(2) }}em
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center">
                            <v-col cols="12" sm="5">
                                <label for="setting-text-align" class="font-weight-medium">
                                    {{ $t("settings.text-align") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-select
                                    id="setting-text-align"
                                    :model-value="settings.bookTypography.textAlign"
                                    :items="textAlignItems"
                                    item-title="title"
                                    item-value="value"
                                    :disabled="settings.bookTypography.dyslexiaFriendly"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.text-align')"
                                    data-testid="setting-text-align"
                                    @update:model-value="onChangeTextAlign"
                                />
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="accessibility">
                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-high-contrast-a11y" class="font-weight-medium">
                                    {{ $t("settings.high-contrast") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.high-contrast-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-high-contrast-a11y"
                                    :model-value="settings.highContrast"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.high-contrast')"
                                    @update:model-value="onToggleHighContrast"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-ui-scale" class="font-weight-medium">
                                    {{ $t("settings.ui-scale") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-slider
                                    id="setting-ui-scale"
                                    :model-value="settings.uiScale"
                                    color="primary"
                                    :step="10"
                                    :min="100"
                                    :max="150"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.ui-scale')"
                                    data-testid="setting-ui-scale"
                                    @update:model-value="onChangeUiScale"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.uiScale }}%
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-reduced-motion" class="font-weight-medium">
                                    {{ $t("settings.reduced-motion") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.reduced-motion-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-reduced-motion"
                                    :model-value="settings.reducedMotion"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.reduced-motion')"
                                    data-testid="setting-reduced-motion"
                                    @update:model-value="onToggleReducedMotion"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-enhanced-focus" class="font-weight-medium">
                                    {{ $t("settings.enhanced-focus") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.enhanced-focus-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-enhanced-focus"
                                    :model-value="settings.enhancedFocus"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.enhanced-focus')"
                                    data-testid="setting-enhanced-focus"
                                    @update:model-value="onToggleEnhancedFocus"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-sr-announcements" class="font-weight-medium">
                                    {{ $t("settings.screen-reader-announcements") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.screen-reader-announcements-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-sr-announcements"
                                    :model-value="settings.screenReaderAnnouncements"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.screen-reader-announcements')"
                                    data-testid="setting-sr-announcements"
                                    @update:model-value="onToggleScreenReaderAnnouncements"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center">
                            <v-col cols="12" sm="6">
                                <label for="setting-keyboard-hints" class="font-weight-medium">
                                    {{ $t("settings.keyboard-hints") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.keyboard-hints-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-keyboard-hints"
                                    :model-value="settings.keyboardNavigationHints"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.keyboard-hints')"
                                    data-testid="setting-keyboard-hints"
                                    @update:model-value="onToggleKeyboardHints"
                                />
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="speech">
                        <h3 class="text-subtitle-1 font-weight-bold mb-2">
                            {{ $t("settings.tts-enabled") }}
                        </h3>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-tts-enabled" class="font-weight-medium">
                                    {{ $t("settings.tts-enabled") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.tts-enabled-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-tts-enabled"
                                    :model-value="settings.speech.ttsEnabled"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.tts-enabled')"
                                    data-testid="setting-tts-enabled"
                                    @update:model-value="onToggleTts"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-tts-engine" class="font-weight-medium">
                                    {{ $t("settings.tts-engine") }}
                                </label>
                                <div
                                    class="text-caption text-medium-emphasis"
                                    data-testid="tts-engine-status"
                                >
                                    {{ activeEngineStatusText }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-select
                                    id="setting-tts-engine"
                                    v-model="selectedTtsEngine"
                                    :items="ttsEngineItems"
                                    item-title="title"
                                    item-value="value"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.tts-engine')"
                                    data-testid="setting-tts-engine"
                                />
                            </v-col>
                        </v-row>

                        <v-row
                            v-if="
                                settings.speech.ttsEngine === 'rhvoice' &&
                                localTtsStatus.platform !== 'win32'
                            "
                            class="align-center mb-3"
                        >
                            <v-col cols="12" sm="5">
                                <label for="setting-rhvoice-path" class="font-weight-medium">
                                    {{ $t("settings.tts-rhvoice-path") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <div class="d-flex ga-2 align-center">
                                    <v-text-field
                                        id="setting-rhvoice-path"
                                        :model-value="settings.speech.rhvoicePath"
                                        :placeholder="$t('settings.tts-rhvoice-path-placeholder')"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        :aria-label="$t('settings.tts-rhvoice-path')"
                                        data-testid="setting-rhvoice-path"
                                        @update:model-value="onChangeRhvoicePath"
                                    />
                                    <v-btn
                                        size="small"
                                        variant="tonal"
                                        color="primary"
                                        data-testid="btn-browse-rhvoice"
                                        @click="browseRhvoiceBinary"
                                    >
                                        {{ $t("settings.tts-rhvoice-browse") }}
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>

                        <v-alert
                            v-if="
                                settings.speech.ttsEngine === 'rhvoice' &&
                                !localTtsStatus.rhvoiceAvailable
                            "
                            type="warning"
                            variant="tonal"
                            density="compact"
                            class="mb-3"
                            data-testid="rhvoice-missing-alert"
                        >
                            <div class="text-body-2 mb-2">
                                {{
                                    localTtsStatus.platform === "win32"
                                        ? $t("settings.tts-rhvoice-inline-alert-windows")
                                        : $t("settings.tts-rhvoice-inline-alert-other")
                                }}
                            </div>
                            <div class="d-flex flex-wrap ga-2">
                                <v-btn
                                    size="small"
                                    color="primary"
                                    variant="flat"
                                    prepend-icon="mdi-download"
                                    data-testid="btn-inline-download-rhvoice"
                                    @click="showRhvoicePrompt = true"
                                >
                                    {{ $t("settings.tts-rhvoice-download") }}
                                </v-btn>
                                <v-btn
                                    size="small"
                                    variant="outlined"
                                    prepend-icon="mdi-refresh"
                                    @click="recheckRhvoice"
                                >
                                    {{ $t("settings.tts-rhvoice-recheck") }}
                                </v-btn>
                            </div>
                        </v-alert>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-tts-voice" class="font-weight-medium">
                                    {{ $t("settings.tts-voice") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-select
                                    id="setting-tts-voice"
                                    v-model="selectedTtsVoice"
                                    :items="voiceOptions"
                                    item-title="title"
                                    item-value="value"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.tts-voice')"
                                    data-testid="setting-tts-voice"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="5">
                                <label for="setting-tts-rate" class="font-weight-medium">
                                    {{ $t("settings.tts-rate") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-tts-rate"
                                    :model-value="settings.speech.ttsRate"
                                    color="primary"
                                    :step="0.1"
                                    :min="0.5"
                                    :max="2"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.tts-rate')"
                                    data-testid="setting-tts-rate"
                                    @update:model-value="onChangeTtsRate"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.speech.ttsRate.toFixed(1) }}x
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="5">
                                <label for="setting-tts-pitch" class="font-weight-medium">
                                    {{ $t("settings.tts-pitch") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-tts-pitch"
                                    :model-value="settings.speech.ttsPitch"
                                    color="primary"
                                    :step="0.1"
                                    :min="0.5"
                                    :max="2"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.tts-pitch')"
                                    data-testid="setting-tts-pitch"
                                    @update:model-value="onChangeTtsPitch"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.speech.ttsPitch.toFixed(1) }}
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-tts-volume" class="font-weight-medium">
                                    {{ $t("settings.tts-volume") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-tts-volume"
                                    :model-value="settings.speech.ttsVolume"
                                    color="primary"
                                    :step="0.1"
                                    :min="0"
                                    :max="1"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.tts-volume')"
                                    data-testid="setting-tts-volume"
                                    @update:model-value="onChangeTtsVolume"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ Math.round(settings.speech.ttsVolume * 100) }}%
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-tts-pause" class="font-weight-medium">
                                    {{ $t("settings.tts-paragraph-pause") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-slider
                                    id="setting-tts-pause"
                                    :model-value="settings.speech.paragraphPauseMs"
                                    color="primary"
                                    :step="50"
                                    :min="0"
                                    :max="1500"
                                    thumb-label
                                    hide-details
                                    :aria-label="$t('settings.tts-paragraph-pause')"
                                    data-testid="setting-tts-pause"
                                    @update:model-value="onChangeParagraphPause"
                                >
                                    <template #append>
                                        <span class="text-body-2 slider-value">
                                            {{ settings.speech.paragraphPauseMs }}ms
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="6">
                                <label for="setting-tts-cleanup" class="font-weight-medium">
                                    {{ $t("settings.tts-cleanup-formatting") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.tts-cleanup-formatting-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-tts-cleanup"
                                    :model-value="settings.speech.cleanupFormatting"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.tts-cleanup-formatting')"
                                    data-testid="setting-tts-cleanup"
                                    @update:model-value="onToggleCleanupFormatting"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-2">
                            <v-col cols="12" sm="6">
                                <label for="setting-tts-highlight" class="font-weight-medium">
                                    {{ $t("settings.tts-highlight-sentence") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.tts-highlight-sentence-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-tts-highlight"
                                    :model-value="settings.speech.highlightSpokenSentence"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.tts-highlight-sentence')"
                                    data-testid="setting-tts-highlight"
                                    @update:model-value="onToggleHighlightSentence"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-tts-auto-turn" class="font-weight-medium">
                                    {{ $t("settings.tts-auto-page-turn") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.tts-auto-page-turn-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-tts-auto-turn"
                                    :model-value="settings.speech.autoPageTurn"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.tts-auto-page-turn')"
                                    data-testid="setting-tts-auto-turn"
                                    @update:model-value="onToggleAutoPageTurn"
                                />
                            </v-col>
                        </v-row>

                        <div class="d-flex ga-2 mb-5">
                            <v-btn
                                color="primary"
                                variant="tonal"
                                prepend-icon="mdi-volume-high"
                                data-testid="btn-test-tts"
                                @click="testSpeech"
                            >
                                {{ $t("settings.tts-test") }}
                            </v-btn>
                            <v-btn
                                variant="outlined"
                                prepend-icon="mdi-stop"
                                :disabled="!isSpeaking"
                                @click="stopTestSpeech"
                            >
                                {{ $t("settings.tts-stop") }}
                            </v-btn>
                        </div>

                        <v-divider class="my-4" />

                        <h3 class="text-subtitle-1 font-weight-bold mb-2">
                            {{ $t("settings.vtt-enabled") }}
                        </h3>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="6">
                                <label for="setting-vtt-enabled" class="font-weight-medium">
                                    {{ $t("settings.vtt-enabled") }}
                                </label>
                                <div class="text-caption text-medium-emphasis">
                                    {{ $t("settings.vtt-enabled-hint") }}
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-switch
                                    id="setting-vtt-enabled"
                                    :model-value="settings.speech.voiceToTextEnabled"
                                    color="primary"
                                    density="compact"
                                    inset
                                    hide-details
                                    :aria-label="$t('settings.vtt-enabled')"
                                    data-testid="setting-vtt-enabled"
                                    @update:model-value="onToggleVoiceToText"
                                />
                            </v-col>
                        </v-row>

                        <v-row class="align-center mb-3">
                            <v-col cols="12" sm="5">
                                <label for="setting-vtt-lang" class="font-weight-medium">
                                    {{ $t("settings.vtt-language") }}
                                </label>
                            </v-col>
                            <v-col cols="12" sm="7">
                                <v-select
                                    id="setting-vtt-lang"
                                    :model-value="settings.speech.voiceCommandLanguage"
                                    :items="voiceLanguageOptions"
                                    item-title="title"
                                    item-value="value"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    :aria-label="$t('settings.vtt-language')"
                                    data-testid="setting-vtt-lang"
                                    @update:model-value="onChangeVoiceLanguage"
                                />
                            </v-col>
                        </v-row>

                        <div class="d-flex align-center ga-2 mb-2">
                            <v-btn
                                :color="isDictating ? 'error' : 'primary'"
                                variant="tonal"
                                :prepend-icon="
                                    isDictating ? 'mdi-microphone-off' : 'mdi-microphone'
                                "
                                :disabled="!vttSupported"
                                data-testid="btn-test-vtt"
                                @click="toggleDictationTest"
                            >
                                {{
                                    isDictating ? $t("settings.vtt-stop") : $t("settings.vtt-test")
                                }}
                            </v-btn>
                            <span
                                v-if="!vttSupported"
                                class="text-caption text-medium-emphasis"
                                role="status"
                            >
                                {{ $t("settings.vtt-unsupported") }}
                            </span>
                            <span
                                v-else-if="dictationStatus"
                                class="text-caption text-medium-emphasis"
                                role="status"
                                aria-live="polite"
                            >
                                {{ dictationStatus }}
                            </span>
                        </div>

                        <v-textarea
                            v-model="dictationTranscript"
                            rows="2"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :placeholder="$t('settings.vtt-placeholder')"
                            aria-label="Voice-to-text dictation preview"
                            data-testid="vtt-transcript"
                        />
                    </v-tabs-window-item>

                    <v-tabs-window-item value="config">
                        <p class="text-body-2 mb-4">
                            {{ $t("settings.config-description") }}
                        </p>

                        <v-text-field
                            :model-value="appStore.getConfigPath"
                            :label="$t('settings.config-path-label')"
                            variant="outlined"
                            density="compact"
                            readonly
                            prepend-inner-icon="mdi-file-document-outline"
                            class="mb-4"
                            data-testid="config-path-field"
                        />

                        <div class="d-flex flex-wrap ga-3">
                            <v-btn
                                color="primary"
                                variant="tonal"
                                prepend-icon="mdi-folder-open-outline"
                                data-testid="btn-reveal-config"
                                @click="appStore.revealSettingsFile()"
                            >
                                {{ $t("settings.config-reveal") }}
                            </v-btn>
                            <v-btn
                                color="primary"
                                variant="outlined"
                                prepend-icon="mdi-export"
                                data-testid="btn-export-config"
                                @click="appStore.exportSettings()"
                            >
                                {{ $t("settings.config-export") }}
                            </v-btn>
                            <v-btn
                                color="primary"
                                variant="outlined"
                                prepend-icon="mdi-import"
                                data-testid="btn-import-config"
                                @click="appStore.importSettings()"
                            >
                                {{ $t("settings.config-import") }}
                            </v-btn>
                            <v-btn
                                color="error"
                                variant="outlined"
                                prepend-icon="mdi-restore"
                                data-testid="btn-reset-config"
                                @click="appStore.resetSettings()"
                            >
                                {{ $t("settings.config-reset") }}
                            </v-btn>
                        </div>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="about" data-testid="settings-window-about">
                        <div class="d-flex flex-column align-center text-center py-4 px-2">
                            <v-avatar color="primary" variant="tonal" size="76" class="mb-3">
                                <v-icon icon="mdi-bookshelf" size="44" color="primary" />
                            </v-avatar>
                            <h2 class="text-h5 font-weight-bold mb-1" data-testid="about-app-title">
                                7C's Reader
                            </h2>
                            <v-chip
                                color="primary"
                                size="small"
                                variant="flat"
                                class="mb-4 font-weight-bold"
                                prepend-icon="mdi-tag-outline"
                                data-testid="about-version-chip"
                            >
                                v{{ appVersion }}
                            </v-chip>

                            <p
                                class="text-body-1 text-medium-emphasis mb-6"
                                style="max-width: 600px; line-height: 1.65"
                                data-testid="about-descriptor"
                            >
                                {{ $t("settings.about-description") }}
                            </p>

                            <v-divider class="w-100 mb-6" />

                            <v-row class="w-100 ga-3 justify-center mb-6" no-gutters>
                                <v-col cols="12" sm="5">
                                    <v-card
                                        variant="outlined"
                                        class="pa-4 h-100 text-left link-card cursor-pointer"
                                        data-testid="about-github-link"
                                        data-url="https://github.com/Jackietkfrost/7cs-reader"
                                        tabindex="0"
                                        role="link"
                                        aria-label="GitHub Repository"
                                        @click="
                                            openExternalUrl(
                                                'https://github.com/Jackietkfrost/7cs-reader'
                                            )
                                        "
                                        @keydown.enter="
                                            openExternalUrl(
                                                'https://github.com/Jackietkfrost/7cs-reader'
                                            )
                                        "
                                        @keydown.space.prevent="
                                            openExternalUrl(
                                                'https://github.com/Jackietkfrost/7cs-reader'
                                            )
                                        "
                                    >
                                        <div class="d-flex align-center mb-2">
                                            <v-icon
                                                icon="mdi-github"
                                                size="28"
                                                class="mr-3"
                                                color="primary"
                                            />
                                            <div>
                                                <div class="font-weight-bold text-subtitle-1">
                                                    {{ $t("settings.about-github") }}
                                                </div>
                                                <div class="text-caption text-medium-emphasis">
                                                    github.com/Jackietkfrost/7cs-reader
                                                </div>
                                            </div>
                                        </div>
                                        <p class="text-caption text-medium-emphasis mb-0">
                                            {{ $t("settings.about-github-sub") }}
                                        </p>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" sm="5">
                                    <v-card
                                        variant="outlined"
                                        class="pa-4 h-100 text-left link-card cursor-pointer"
                                        data-testid="about-kofi-link"
                                        :data-url="kofiLink"
                                        tabindex="0"
                                        role="link"
                                        aria-label="Support on Ko-fi"
                                        @click="openExternalUrl(kofiLink)"
                                        @keydown.enter="openExternalUrl(kofiLink)"
                                        @keydown.space.prevent="openExternalUrl(kofiLink)"
                                    >
                                        <div class="d-flex align-center mb-2">
                                            <v-icon
                                                icon="mdi-coffee"
                                                size="28"
                                                class="mr-3"
                                                color="amber-darken-2"
                                            />
                                            <div>
                                                <div class="font-weight-bold text-subtitle-1">
                                                    {{ $t("settings.about-kofi") }}
                                                </div>
                                                <div class="text-caption text-medium-emphasis">
                                                    ko-fi.com/jackietkfrost
                                                </div>
                                            </div>
                                        </div>
                                        <p class="text-caption text-medium-emphasis mb-0">
                                            {{ $t("settings.about-kofi-sub") }}
                                        </p>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <div
                                class="text-caption text-medium-emphasis d-flex align-center"
                                data-testid="about-love-tagline"
                            >
                                <v-icon icon="mdi-heart" color="error" size="16" class="mr-1" />
                                <span>{{ $t("settings.about-made-with-love") }}</span>
                            </div>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>

            <v-divider />

            <v-card-actions class="px-6 py-3">
                <v-spacer />
                <v-btn
                    color="primary"
                    variant="outlined"
                    data-testid="settings-close-btn"
                    @click="closeSettings"
                >
                    {{ $t("ui-labels.close-button") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <RhvoiceInstallDialog
        v-model="showRhvoicePrompt"
        :status="localTtsStatus"
        @browse="browseRhvoiceBinary"
        @recheck="recheckRhvoice"
        @fallback="fallbackToSystemTts"
    />
</template>

<script setup lang="ts">
import { CSSProperties, computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useAppStore } from "../store/appStore"
import type { ReaderColorScheme, ReaderTextAlign, TtsEngineType } from "@/main/types/Settings"
import {
    ChunkedReaderController,
    LocalTtsStatus,
    SpeechVoiceOption,
    VoiceRecognizerController,
    createChunkedReader,
    createVoiceRecognizer,
    getLocalTtsStatus,
    getVoicesForEngine,
    isTtsSupported,
    isVoiceToTextSupported
} from "@/renderer/utils/speech"
import { cleanTextForSpeech, splitIntoSentences } from "@/renderer/utils/textChunker"
import { openExternal } from "@/renderer/utils"
import RhvoiceInstallDialog from "./RhvoiceInstallDialog.vue"

const { availableLocales, t } = useI18n()
const appStore = useAppStore()

const activeTab = ref(appStore.activeSettingsTab || "general")
const appVersion = ref("0.1.0")

const openExternalUrl = async (url: string): Promise<void> => {
    ;(window as any).__lastOpenedExternalUrl = url
    try {
        await openExternal(url)
    } catch (e) {
        console.error("Failed to open external URL:", url, e)
    }
}

watch(
    () => appStore.activeSettingsTab,
    (tab) => {
        if (tab) {
            activeTab.value = tab
        }
    }
)

watch(
    () => appStore.openedSettings,
    (opened) => {
        if (opened && appStore.activeSettingsTab) {
            activeTab.value = appStore.activeSettingsTab
        }
    }
)
const languages = ref<string[]>([])
const voices = ref<SpeechVoiceOption[]>([])
const showRhvoicePrompt = ref(false)
const localTtsStatus = ref<LocalTtsStatus>({
    systemNativeAvailable: false,
    systemNativeLabel: "",
    rhvoiceAvailable: false,
    rhvoiceMode: "none",
    rhvoiceResolvedPath: "",
    platform: "",
    platformLabel: "Desktop",
    systemLocale: "en-US",
    recommendedRhvoiceUrl: "https://rhvoice.org/languages/",
    recommendedRhvoiceLanguageLabel: "All Languages"
})
const isSpeaking = ref(false)
const isDictating = ref(false)
const dictationTranscript = ref("")
const dictationStatus = ref("")
let recognizer: VoiceRecognizerController | null = null
let testReader: ChunkedReaderController | null = null
const kofiLink = "https://ko-fi.com/jackietkfrost"
const ttsSupported = isTtsSupported()
const vttSupported = isVoiceToTextSupported()

const settings = computed(() => appStore.getSettings)

const isSettingsOpened = computed({
    get: () => appStore.getOpenedSettings,
    set: (val: boolean) => appStore.setOpenSettings(val)
})

const BUILTIN_ACCESSIBLE_FONTS = [
    "Default",
    "OpenDyslexic",
    "Atkinson Hyperlegible",
    "Lexend",
    "Verdana",
    "Arial",
    "Georgia",
    "Tahoma",
    "Trebuchet MS",
    "Courier New"
]

const availableFontOptions = computed(() => {
    const merged = new Set<string>(BUILTIN_ACCESSIBLE_FONTS)
    for (const font of appStore.getFonts) {
        if (font) {
            merged.add(font)
        }
    }
    return Array.from(merged)
})

const readerSchemeItems = computed(() => [
    { title: t("settings.reader-scheme-match"), value: "match-app" },
    { title: t("settings.reader-scheme-dark"), value: "dark" },
    { title: t("settings.reader-scheme-light"), value: "light" },
    { title: t("settings.reader-scheme-sepia"), value: "sepia" },
    { title: t("settings.reader-scheme-hc-dark"), value: "high-contrast-dark" },
    { title: t("settings.reader-scheme-hc-light"), value: "high-contrast-light" }
])

const textAlignItems = computed(() => [
    { title: t("settings.text-align-default"), value: "default" },
    { title: t("settings.text-align-left"), value: "left" },
    { title: t("settings.text-align-justify"), value: "justify" }
])

const ttsEngineItems = computed(() => [
    { title: t("settings.tts-engine-system"), value: "system-native" },
    { title: t("settings.tts-engine-rhvoice"), value: "rhvoice" },
    { title: t("settings.tts-engine-browser"), value: "browser" }
])

const activeEngineStatusText = computed(() => {
    const engine = settings.value.speech.ttsEngine
    if (engine === "system-native") {
        return localTtsStatus.value.systemNativeAvailable
            ? localTtsStatus.value.systemNativeLabel
            : "OS native speech unavailable — will fall back to browser speech."
    }
    if (engine === "rhvoice") {
        if (localTtsStatus.value.rhvoiceMode === "sapi5") {
            return "RHVoice SAPI 5 voices ready (Offline)"
        }
        if (localTtsStatus.value.rhvoiceMode === "cli") {
            return `RHVoice ready (${localTtsStatus.value.rhvoiceResolvedPath})`
        }
        return localTtsStatus.value.platform === "win32"
            ? "No RHVoice voices installed — install a voice from rhvoice.org."
            : "RHVoice not found — install RHVoice and a voice pack."
    }
    return ttsSupported ? "Built-in Chromium SpeechSynthesis (Offline)" : "Unavailable"
})

const voiceOptions = computed(() => {
    const list = [{ title: t("settings.tts-voice-default"), value: "" }]
    for (const voice of voices.value) {
        list.push({
            title: voice.lang ? `${voice.name} (${voice.lang})` : voice.name,
            value: voice.id
        })
    }
    const currentVoice = settings.value.speech.ttsVoice
    if (currentVoice && !list.some((item) => item.value === currentVoice)) {
        const readableLabel = currentVoice.includes("\\")
            ? currentVoice.split("\\").pop() || currentVoice
            : currentVoice
        list.push({ title: readableLabel, value: currentVoice })
    }
    return list
})

const selectedTtsEngine = computed<TtsEngineType>({
    get: () => settings.value.speech.ttsEngine || "system-native",
    set: (val: TtsEngineType) => {
        if (!val || val === settings.value.speech.ttsEngine) {
            return
        }
        onChangeTtsEngine(val)
    }
})

const selectedTtsVoice = computed<string>({
    get: () => settings.value.speech.ttsVoice || "",
    set: (val: string) => {
        onChangeTtsVoice(val || "")
    }
})

const voiceLanguageOptions = [
    { title: "English (US)", value: "en-US" },
    { title: "English (UK)", value: "en-GB" },
    { title: "Español (ES)", value: "es-ES" },
    { title: "Français (FR)", value: "fr-FR" },
    { title: "Deutsch (DE)", value: "de-DE" },
    { title: "日本語 (JP)", value: "ja-JP" },
    { title: "한국어 (KR)", value: "ko-KR" },
    { title: "中文 (CN)", value: "zh-CN" },
    { title: "Português (BR)", value: "pt-BR" },
    { title: "Nederlands (NL)", value: "nl-NL" },
    { title: "Русский (RU)", value: "ru-RU" }
]

const previewBoxStyle = computed(() => {
    const scheme = resolvePreviewScheme()
    const palette: Record<string, { background: string; color: string; border: string }> = {
        dark: { background: "#121212", color: "#E0E0E0", border: "1px solid #333333" },
        light: { background: "#FFFFFF", color: "#1A1A1A", border: "1px solid #CCCCCC" },
        sepia: { background: "#F4ECD8", color: "#3B2F2F", border: "1px solid #C8B89A" },
        "high-contrast-dark": {
            background: "#000000",
            color: "#FFFFFF",
            border: "2px solid #00E5FF"
        },
        "high-contrast-light": {
            background: "#FFFFFF",
            color: "#000000",
            border: "2px solid #003B8E"
        }
    }
    const colors = palette[scheme] || palette.dark
    return {
        backgroundColor: colors.background,
        color: colors.color,
        border: colors.border
    }
})

const previewTextStyle = computed((): CSSProperties => {
    const typo = settings.value.bookTypography
    const dyslexiaStack =
        '"OpenDyslexic", "Atkinson Hyperlegible", "Lexend", Verdana, Arial, sans-serif'
    let fontFamily = 'system-ui, -apple-system, "Segoe UI", sans-serif'
    if (typo.dyslexiaFriendly) {
        fontFamily =
            typo.fontFamily && typo.fontFamily !== "Default"
                ? `"${typo.fontFamily}", ${dyslexiaStack}`
                : dyslexiaStack
    } else if (typo.fontFamily && typo.fontFamily !== "Default") {
        fontFamily = `"${typo.fontFamily}", sans-serif`
    }

    const effectiveLetterSpacing = typo.dyslexiaFriendly
        ? Math.max(typo.letterSpacing, 0.06)
        : typo.letterSpacing
    const effectiveWordSpacing = typo.dyslexiaFriendly
        ? Math.max(typo.wordSpacing, 0.12)
        : typo.wordSpacing
    const effectiveLineHeight = typo.dyslexiaFriendly
        ? Math.max(typo.lineHeight, 1.7)
        : typo.lineHeight
    const effectiveAlign: CSSProperties["textAlign"] = typo.dyslexiaFriendly
        ? "left"
        : typo.textAlign === "default"
          ? "start"
          : typo.textAlign

    return {
        fontFamily,
        fontSize: `${Math.min(typo.fontSize, 180)}%`,
        lineHeight: String(effectiveLineHeight),
        letterSpacing: `${effectiveLetterSpacing}em`,
        wordSpacing: `${effectiveWordSpacing}em`,
        textAlign: effectiveAlign
    }
})

function resolvePreviewScheme(): string {
    const scheme = settings.value.bookTypography.readerColorScheme
    if (scheme !== "match-app") {
        return scheme
    }
    if (settings.value.highContrast) {
        return settings.value.nightMode ? "high-contrast-dark" : "high-contrast-light"
    }
    return settings.value.nightMode ? "dark" : "light"
}

let voicesRequestId = 0

async function refreshVoices(): Promise<void> {
    const requestId = ++voicesRequestId
    const speech = settings.value.speech
    const engine = speech.ttsEngine || "system-native"
    const [status, loadedVoices] = await Promise.all([
        getLocalTtsStatus(speech.rhvoicePath),
        getVoicesForEngine(engine, speech.rhvoicePath)
    ])
    if (requestId !== voicesRequestId) {
        return
    }
    localTtsStatus.value = status
    voices.value = loadedVoices
}

function closeSettings(): void {
    stopTestSpeech()
    stopDictation()
    appStore.setOpenSettings(false)
}

const onToggleNightMode = (val: boolean | null): void => {
    const enabled = Boolean(val)
    appStore.updateSettings({ nightMode: enabled })
    appStore.announce(enabled ? "Dark mode enabled" : "Light mode enabled")
}

const onToggleHighContrast = (val: boolean | null): void => {
    const enabled = Boolean(val)
    appStore.updateSettings({ highContrast: enabled })
    appStore.announce(enabled ? "High contrast mode enabled" : "High contrast mode disabled")
}

const onChangeLanguage = (val: string): void => {
    if (!val) return
    appStore.updateSettings({ language: val })
    appStore.announce(`Language changed to ${val}`)
}

const onToggleTags = (val: boolean | null): void => {
    appStore.updateSettings({ tagsVisible: Boolean(val) })
}

const onToggleRatings = (val: boolean | null): void => {
    appStore.updateSettings({ ratingsVisible: Boolean(val) })
}

const onChangeReaderScheme = (val: ReaderColorScheme): void => {
    appStore.updateBookTypography({ readerColorScheme: val })
}

const onToggleDyslexiaFriendly = (val: boolean | null): void => {
    const enabled = Boolean(val)
    appStore.updateBookTypography({ dyslexiaFriendly: enabled })
    appStore.announce(
        enabled ? "Dyslexia-friendly typography enabled" : "Dyslexia-friendly typography disabled"
    )
}

const onChangeFontFamily = (val: string | null): void => {
    appStore.updateBookTypography({ fontFamily: val || "Default" })
}

const onChangeFontSize = (val: number): void => {
    appStore.updateBookTypography({ fontSize: val })
}

const onChangeLineHeight = (val: number): void => {
    appStore.updateBookTypography({ lineHeight: val })
}

const onChangeLetterSpacing = (val: number): void => {
    appStore.updateBookTypography({ letterSpacing: val })
}

const onChangeWordSpacing = (val: number): void => {
    appStore.updateBookTypography({ wordSpacing: val })
}

const onChangeTextAlign = (val: ReaderTextAlign): void => {
    appStore.updateBookTypography({ textAlign: val })
}

const onChangeUiScale = (val: number): void => {
    appStore.updateSettings({ uiScale: val })
}

const onToggleReducedMotion = (val: boolean | null): void => {
    appStore.updateSettings({ reducedMotion: Boolean(val) })
}

const onToggleEnhancedFocus = (val: boolean | null): void => {
    appStore.updateSettings({ enhancedFocus: Boolean(val) })
}

const onToggleScreenReaderAnnouncements = (val: boolean | null): void => {
    appStore.updateSettings({ screenReaderAnnouncements: Boolean(val) })
}

const onToggleKeyboardHints = (val: boolean | null): void => {
    appStore.updateSettings({ keyboardNavigationHints: Boolean(val) })
}

const onToggleTts = (val: boolean | null): void => {
    appStore.updateSpeech({ ttsEnabled: Boolean(val) })
}

const onChangeTtsEngine = async (val: TtsEngineType): Promise<void> => {
    if (!val) return
    await appStore.updateSpeech({ ttsEngine: val, ttsVoice: "" })
    await refreshVoices()
    if (val === "rhvoice" && !localTtsStatus.value.rhvoiceAvailable) {
        showRhvoicePrompt.value = true
        appStore.announce(t("settings.tts-rhvoice-missing-title"))
    }
}

const onChangeRhvoicePath = async (val: string | null): Promise<void> => {
    await appStore.updateSpeech({ rhvoicePath: val || "" })
    await refreshVoices()
    if (localTtsStatus.value.rhvoiceAvailable) {
        showRhvoicePrompt.value = false
    }
}

const browseRhvoiceBinary = async (): Promise<void> => {
    const result = await window.sevenCsApi.invoke("msgPickRhvoiceBinary")
    if (!result?.canceled && result?.filePath) {
        await appStore.updateSpeech({ rhvoicePath: result.filePath })
        await refreshVoices()
        if (localTtsStatus.value.rhvoiceAvailable) {
            showRhvoicePrompt.value = false
            appStore.addSnackbar("RHVoice executable configured!", "success")
        }
    }
}

const recheckRhvoice = async (): Promise<void> => {
    await refreshVoices()
    if (localTtsStatus.value.rhvoiceAvailable) {
        showRhvoicePrompt.value = false
        appStore.addSnackbar("RHVoice detected and ready!", "success")
        appStore.announce("RHVoice detected and ready")
    } else {
        appStore.addSnackbar("RHVoice was still not detected on this device.", "warning")
    }
}

const fallbackToSystemTts = async (): Promise<void> => {
    showRhvoicePrompt.value = false
    await appStore.updateSpeech({ ttsEngine: "system-native", ttsVoice: "" })
    await refreshVoices()
    appStore.announce("Switched to System Native Voices")
}

const onChangeTtsVoice = (val: string | null): void => {
    appStore.updateSpeech({ ttsVoice: val || "" })
}

const onChangeTtsRate = (val: number): void => {
    appStore.updateSpeech({ ttsRate: val })
}

const onChangeTtsPitch = (val: number): void => {
    appStore.updateSpeech({ ttsPitch: val })
}

const onChangeTtsVolume = (val: number): void => {
    appStore.updateSpeech({ ttsVolume: val })
}

const onChangeParagraphPause = (val: number): void => {
    appStore.updateSpeech({ paragraphPauseMs: val })
}

const onToggleCleanupFormatting = (val: boolean | null): void => {
    appStore.updateSpeech({ cleanupFormatting: Boolean(val) })
}

const onToggleHighlightSentence = (val: boolean | null): void => {
    appStore.updateSpeech({ highlightSpokenSentence: Boolean(val) })
}

const onToggleAutoPageTurn = (val: boolean | null): void => {
    appStore.updateSpeech({ autoPageTurn: Boolean(val) })
}

const onToggleVoiceToText = (val: boolean | null): void => {
    appStore.updateSpeech({ voiceToTextEnabled: Boolean(val) })
}

const onChangeVoiceLanguage = (val: string): void => {
    if (!val) return
    appStore.updateSpeech({ voiceCommandLanguage: val })
}

async function testSpeech(): Promise<void> {
    const speech = settings.value.speech
    if (speech.ttsEngine === "rhvoice") {
        await refreshVoices()
        if (!localTtsStatus.value.rhvoiceAvailable) {
            showRhvoicePrompt.value = true
            return
        }
    }
    const sample = `Dr. Watson read Ch. 1: "${t("settings.preview-sample")}" [1]`
    const spans = splitIntoSentences(sample)
    const chunks = spans.map((span, idx) => ({
        id: idx,
        rawText: span.text,
        spokenText: speech.cleanupFormatting ? cleanTextForSpeech(span.text) : span.text,
        isHeading: false,
        isParagraphEnd: idx === spans.length - 1,
        blockElement: null,
        startOffset: span.start,
        endOffset: span.end
    }))

    testReader?.stop()
    testReader = createChunkedReader(
        () => ({
            engine: settings.value.speech.ttsEngine,
            rate: settings.value.speech.ttsRate,
            pitch: settings.value.speech.ttsPitch,
            volume: settings.value.speech.ttsVolume,
            voice: settings.value.speech.ttsVoice,
            lang: settings.value.speech.voiceCommandLanguage,
            rhvoicePath: settings.value.speech.rhvoicePath,
            paragraphPauseMs: settings.value.speech.paragraphPauseMs
        }),
        {
            onStateChange: (state) => {
                isSpeaking.value = state.isSpeaking
            },
            onNotice: (message) => {
                appStore.addSnackbar(message, "info")
            },
            onError: (message) => {
                isSpeaking.value = false
                appStore.addSnackbar(message, "warning")
            }
        }
    )
    testReader.start(chunks)
}

function stopTestSpeech(): void {
    testReader?.stop()
    isSpeaking.value = false
}

function stopDictation(): void {
    recognizer?.stop()
    recognizer = null
    isDictating.value = false
}

function toggleDictationTest(): void {
    if (isDictating.value) {
        stopDictation()
        dictationStatus.value = "Stopped listening."
        return
    }

    recognizer = createVoiceRecognizer({
        lang: settings.value.speech.voiceCommandLanguage,
        continuous: false,
        interimResults: true,
        onResult: (transcript, isFinal) => {
            dictationTranscript.value = transcript
            dictationStatus.value = isFinal ? "Dictation captured." : "Listening..."
        },
        onError: (message) => {
            dictationStatus.value = message
            isDictating.value = false
        },
        onEnd: () => {
            isDictating.value = false
        }
    })

    if (!recognizer) {
        dictationStatus.value = t("settings.vtt-unsupported")
        return
    }

    if (recognizer.start()) {
        isDictating.value = true
        dictationStatus.value = "Listening..."
    }
}

const archiveSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    ",",
    "."
]
const archiveSequenceIndex = ref(0)

const handleKeyDown = (event: KeyboardEvent): void => {
    if (!isSettingsOpened.value) return
    if (event.key === archiveSequence[archiveSequenceIndex.value]) {
        archiveSequenceIndex.value++
        if (archiveSequenceIndex.value === archiveSequence.length) {
            appStore.setVisibleArchives(!appStore.archivesVisible)
            appStore.addSnackbar("Archives toggled!", "success")
            archiveSequenceIndex.value = 0
        }
    } else {
        archiveSequenceIndex.value = 0
    }
}

watch(isSettingsOpened, (opened) => {
    if (opened) {
        appStore.loadFonts()
        refreshVoices()
    } else {
        stopTestSpeech()
        stopDictation()
    }
})

watch(
    () => [
        appStore.settingsLoaded,
        settings.value.speech.ttsEngine,
        settings.value.speech.rhvoicePath
    ],
    () => {
        refreshVoices()
    }
)

onMounted(async () => {
    languages.value = availableLocales
    refreshVoices()
    if (ttsSupported) {
        window.speechSynthesis.addEventListener("voiceschanged", refreshVoices)
    }
    document.addEventListener("keydown", handleKeyDown)
    try {
        const ver = await window.sevenCsApi.invoke("msgRequestGetVersion")
        if (ver) {
            appVersion.value = ver
        }
    } catch (e) {
        // Fallback
    }
})

onUnmounted(() => {
    stopTestSpeech()
    stopDictation()
    if (ttsSupported) {
        window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices)
    }
    document.removeEventListener("keydown", handleKeyDown)
})
</script>

<style scoped>
.slider-value {
    min-width: 48px;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.typography-preview {
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

.link-card {
    border-radius: 4px !important;
    transition:
        border-color 0.2s ease,
        transform 0.15s ease,
        box-shadow 0.2s ease;
}

.link-card:hover {
    border-color: rgb(var(--v-theme-primary)) !important;
    transform: translateY(-2px);
}

.link-card:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary)) !important;
    outline-offset: 2px;
}
</style>
