import { MainScreen } from "@/renderer/screens"
import { createRouter, createWebHashHistory } from "vue-router"

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            component: MainScreen,
            meta: {
                titleKey: "title.main"
            }
        },
        {
            path: "/reader",
            component: () => import("@/renderer/screens/ReaderScreen.vue"),
            meta: {
                titleKey: "title.reader"
            }
        },
        {
            path: "/labels",
            component: () => import("@/renderer/screens/LabelScreen.vue"),
            meta: {
                titleKey: "title.labels"
            }
        },
        {
            path: "/starred",
            component: () => import("@/renderer/screens/StarredScreen.vue"),
            meta: {
                titleKey: "title.starred"
            }
        },
        {
            path: "/archive",
            component: () => import("@/renderer/screens/ArchiveScreen.vue"),
            meta: {
                titleKey: "title.archive"
            }
        },
        {
            path: "/error",
            component: () => import("@/renderer/screens/ErrorScreen.vue"),
            meta: {
                titleKey: "title.error"
            }
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: "/"
        }
    ]
})
