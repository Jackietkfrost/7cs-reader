import { createApp } from "vue"
import { createPinia } from "pinia"
import ePub from "epubjs"

import App from "@/renderer/App.vue"
import router from "@/renderer/router"
import vuetify from "@/renderer/plugins/vuetify"
import i18n from "@/renderer/plugins/i18n"

// Monkey-patch for epub.js to avoid uncaught TypeErrors when Book is destroyed while loading
//  @ts-expect-error ePub has book but requires some workaround for typescript. Not important error.
if (ePub && ePub.Book && ePub.Book.prototype) {
    //  @ts-expect-error same as above.
    const BookProto = ePub.Book.prototype

    // 1. Patch replacements() to check for resources existence
    const originalReplacements = BookProto.replacements
    if (originalReplacements) {
        BookProto.replacements = function (this: any) {
            if (!this.resources) {
                return Promise.resolve([])
            }
            this.spine.hooks.serialize.register((output: any, section: any) => {
                if (!this.resources || !this.resources.replacementUrls || !this.resources.settings)
                    return output
                try {
                    return this.resources.substitute(output, section.url)
                } catch (e) {
                    return output
                }
            })
            return this.resources
                .replacements()
                .then(() => {
                    if (!this.resources) {
                        return []
                    }
                    return this.resources.replaceCss()
                })
                .catch(() => [])
        }
    }

    // 2. Patch unpack() to intercept and patch resources when created
    const originalUnpack = BookProto.unpack
    if (originalUnpack) {
        BookProto.unpack = function (this: any, packaging: any) {
            const result = originalUnpack.call(this, packaging)
            if (this.resources) {
                const originalReplaceCss = this.resources.replaceCss
                if (originalReplaceCss) {
                    this.resources.replaceCss = function (this: any, ...args: any[]) {
                        if (!this.replacementUrls) {
                            return Promise.resolve([])
                        }
                        try {
                            return originalReplaceCss.apply(this, args)
                        } catch (e) {
                            return Promise.resolve([])
                        }
                    }
                }

                const originalSubstitute = this.resources.substitute
                if (originalSubstitute) {
                    this.resources.substitute = function (this: any, content: any, url: any) {
                        if (!this.replacementUrls || !this.settings || !this.urls) {
                            return content
                        }
                        try {
                            return originalSubstitute.call(this, content, url)
                        } catch (e) {
                            return content
                        }
                    }
                }
            }
            return result
        }
    }
}

// Add API key defined in contextBridge to window object type
declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        sevenCsApi?: any
    }
}

const app = createApp(App)

app.use(vuetify).use(i18n).use(router).use(createPinia())

app.mount("#app")
