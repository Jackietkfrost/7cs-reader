export default class Utils {
    static getCurrentLocale(): string {
        return navigator?.language?.split("-")[0] || "en"
    }

    static async openExternal(url: string): Promise<void> {
        await window.sevenCsApi.send("msgOpenExternalLink", url)
    }

    static async addBook(type: string): Promise<any> {
        return window.sevenCsApi.invoke("msgAddBook", type)
    }
}

export const { getCurrentLocale, openExternal, addBook } = Utils
