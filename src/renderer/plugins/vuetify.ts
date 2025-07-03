import { createVuetify } from "vuetify"
import { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl } from "vuetify/locale"
import { aliases, mdi } from "vuetify/iconsets/mdi"
import "vuetify/styles"
import "@mdi/font/css/materialdesignicons.min.css"

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
                    secondary: colors.blue.accent3,
                    success: colors.green.base
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
            }
        }
    }
})
