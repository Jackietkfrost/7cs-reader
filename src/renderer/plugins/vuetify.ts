import { createVuetify } from "vuetify"
import { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl } from "vuetify/locale"
import { aliases, mdi } from "vuetify/iconsets/mdi"
import "vuetify/styles"
import "@mdi/font/css/materialdesignicons.min.css"
//  @ts-expect-error This is a valid import..
import colors from "vuetify/lib/util/colors.mjs"

export default createVuetify({
    locale: {
        messages: { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl },
        locale: "en",
        fallback: "en"
    },
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
            mdi
        }
    },
    theme: {
        defaultTheme: "dark",
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: colors.blue.darken4,
                    accent: colors.blue.accent4,
                    secondary: colors.blue.accent3,
                    success: colors.green.base,
                    readerLink: colors.blue.darken4,
                    backgroundAccent: colors.grey.lighten3
                },
                variables: {
                    "card-height": "350px",
                    "card-width": "225px"
                }
            },
            dark: {
                dark: true,
                colors: {
                    primary: colors.cyan.darken1,
                    accent: colors.cyan.accent3,
                    secondary: colors.cyan.darken2,
                    success: colors.green.darken3,
                    readerLink: colors.cyan.darken1,
                    backgroundAccent: colors.grey.darken4
                },
                variables: {
                    "card-height": "350px",
                    "card-width": "225px"
                }
            },
            highContrastLight: {
                dark: false,
                colors: {
                    background: "#FFFFFF",
                    surface: "#FFFFFF",
                    "on-background": "#000000",
                    "on-surface": "#000000",
                    primary: "#003B8E",
                    accent: "#002A66",
                    secondary: "#0052CC",
                    success: "#005A1F",
                    error: "#B00020",
                    warning: "#8A4B00",
                    info: "#003B8E",
                    readerLink: "#0000EE",
                    backgroundAccent: "#E8E8E8"
                },
                variables: {
                    "card-height": "350px",
                    "card-width": "225px",
                    "border-opacity": 0.9,
                    "high-emphasis-opacity": 1,
                    "medium-emphasis-opacity": 0.92
                }
            },
            highContrastDark: {
                dark: true,
                colors: {
                    background: "#000000",
                    surface: "#0A0A0A",
                    "on-background": "#FFFFFF",
                    "on-surface": "#FFFFFF",
                    primary: "#00E5FF",
                    accent: "#84FFFF",
                    secondary: "#40C4FF",
                    success: "#69F0AE",
                    error: "#FF5252",
                    warning: "#FFD740",
                    info: "#40C4FF",
                    readerLink: "#00E5FF",
                    backgroundAccent: "#1A1A1A"
                },
                variables: {
                    "card-height": "350px",
                    "card-width": "225px",
                    "border-opacity": 0.9,
                    "high-emphasis-opacity": 1,
                    "medium-emphasis-opacity": 0.92
                }
            }
        }
    }
})
