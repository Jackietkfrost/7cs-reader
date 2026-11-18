import { ipcMain, IpcMainEvent, dialog, Menu, MenuItem, webContents, shell, app } from "electron"
import Constants from "./utils/Constants"
import * as fs from "fs"
import * as path from "path"
import { getFonts } from "font-list"
import { SETTINGS_FILE_NAME } from "./types/Settings"
import {
    exportSettingsToFile,
    importSettingsFromFile,
    readSettings,
    resetSettings,
    saveSettings
} from "./utils/SettingsStore"
import {
    SynthesizeRequest,
    getLocalTtsStatus,
    listLocalTtsVoices,
    synthesizeLocalSpeech
} from "./utils/LocalTtsEngine"

export default class IPCs {
    private static initialized = false

    static initialize(): void {
        if (IPCs.initialized) {
            return
        }
        IPCs.initialized = true

        ipcMain.handle("msgRequestGetVersion", () => {
            return Constants.APP_VERSION
        })

        ipcMain.handle("msgGetBooks", async () => {
            return getBooks()
        })

        ipcMain.handle("msgGetBookPath", async () => {
            return Constants.BOOK_FOLDER
        })

        ipcMain.handle("msgGetFonts", async () => {
            try {
                const fonts = await getFonts()
                return fonts
                    .map((font) => font.replace(/^"|"$/g, "").trim())
                    .filter((font, index, list) => font.length > 0 && list.indexOf(font) === index)
                    .sort((a, b) => a.localeCompare(b))
            } catch (error) {
                console.error("Failed to list system fonts:", error)
                return []
            }
        })

        ipcMain.handle("msgGetSettings", () => {
            return readSettings()
        })

        ipcMain.handle("msgSaveSettings", (event: IpcMainEvent, settings: unknown) => {
            const payload = saveSettings(settings)
            webContents.getAllWebContents().forEach((wc) => {
                if (wc.id === event.sender.id) {
                    return
                }
                try {
                    wc.send("settingsUpdated", payload)
                } catch {
                    // Closed webContents can be ignored
                }
            })
            return payload
        })

        ipcMain.handle("msgResetSettings", (event: IpcMainEvent) => {
            const payload = resetSettings()
            webContents.getAllWebContents().forEach((wc) => {
                if (wc.id === event.sender.id) {
                    return
                }
                try {
                    wc.send("settingsUpdated", payload)
                } catch {
                    // Closed webContents can be ignored
                }
            })
            return payload
        })

        ipcMain.handle("msgRevealSettingsFile", () => {
            const { configPath } = readSettings()
            shell.showItemInFolder(configPath)
            return configPath
        })

        ipcMain.handle("msgExportSettings", async (_event: IpcMainEvent, settings: unknown) => {
            const result = await dialog.showSaveDialog({
                title: "Export 7Cs-Reader Configuration",
                defaultPath: SETTINGS_FILE_NAME,
                filters: [{ name: "JSON Config", extensions: ["json"] }]
            })
            if (result.canceled || !result.filePath) {
                return { canceled: true }
            }
            exportSettingsToFile(result.filePath, settings)
            return { canceled: false, filePath: result.filePath }
        })

        ipcMain.handle("msgImportSettings", async () => {
            const result = await dialog.showOpenDialog({
                title: "Import 7Cs-Reader Configuration",
                properties: ["openFile"],
                filters: [{ name: "JSON Config", extensions: ["json"] }]
            })
            if (result.canceled || result.filePaths.length === 0) {
                return { canceled: true }
            }
            try {
                const payload = importSettingsFromFile(result.filePaths[0])
                webContents.getAllWebContents().forEach((wc) => {
                    try {
                        wc.send("settingsUpdated", payload)
                    } catch {
                        // Closed webContents can be ignored
                    }
                })
                return { canceled: false, ...payload }
            } catch (error) {
                return {
                    canceled: false,
                    error: error instanceof Error ? error.message : "Invalid configuration file"
                }
            }
        })

        ipcMain.handle("msgExitApp", () => {
            app.quit()
        })

        const openSafeExternalUrl = (url: string): boolean => {
            if (typeof url !== "string" || !/^https?:\/\//i.test(url.trim())) {
                return false
            }
            shell.openExternal(url.trim())
            return true
        }

        ipcMain.on("msgOpenExternalLink", (_event: IpcMainEvent, url: string) => {
            openSafeExternalUrl(url)
        })

        ipcMain.handle("msgOpenExternalLink", (_event: IpcMainEvent, url: string) => {
            return openSafeExternalUrl(url)
        })

        ipcMain.handle(
            "msgGetLocalTtsStatus",
            async (_event: IpcMainEvent, rhvoicePath?: string, preferredLocale?: string) => {
                return getLocalTtsStatus(rhvoicePath, preferredLocale)
            }
        )

        ipcMain.handle(
            "msgGetLocalTtsVoices",
            async (
                _event: IpcMainEvent,
                engine: "system-native" | "rhvoice",
                rhvoicePath?: string
            ) => {
                return listLocalTtsVoices(engine, rhvoicePath)
            }
        )

        ipcMain.handle(
            "msgSynthesizeLocalTts",
            async (_event: IpcMainEvent, request: SynthesizeRequest) => {
                return synthesizeLocalSpeech(request)
            }
        )

        ipcMain.handle("msgPickRhvoiceBinary", async () => {
            const filters =
                process.platform === "win32"
                    ? [{ name: "Executable", extensions: ["exe", "cmd", "bat"] }]
                    : [{ name: "Executable", extensions: ["*"] }]
            const result = await dialog.showOpenDialog({
                title: "Select RHVoice Executable (RHVoice-test)",
                properties: ["openFile"],
                filters
            })
            if (result.canceled || result.filePaths.length === 0) {
                return { canceled: true }
            }
            return { canceled: false, filePath: result.filePaths[0] }
        })

        ipcMain.handle("msgOpenFile", async (_event: IpcMainEvent, filter: string) => {
            const filters = []
            if (filter === "text") {
                filters.push({ name: "Text", extensions: ["txt", "json"] })
            } else if (filter === "zip") {
                filters.push({ name: "Zip", extensions: ["zip"] })
            }
            const dialogResult = await dialog.showOpenDialog({
                properties: ["openFile"],
                filters
            })
            return dialogResult
        })
        ipcMain.handle("msgAddBook", async (_event: IpcMainEvent, filter: string) => {
            const filters = []

            if (filter === "zip") {
                filters.push({ name: "Zip", extensions: ["zip"] })
            } else if (filter === "epub") {
                filters.push({ name: "Epub", extensions: ["epub", "zip"] })
            }

            const dialogResult = await dialog.showOpenDialog({
                properties: ["openFile"],
                filters
            })

            if (!dialogResult.canceled) {
                const source = dialogResult.filePaths[0]

                const destinationPath = path.join(Constants.BOOK_FOLDER, path.basename(source))
                if (!fs.existsSync(path.dirname(destinationPath))) {
                    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true })
                }
                await fs.promises.copyFile(source, destinationPath)
                return destinationPath
            }

            return dialogResult
        })
        ipcMain.handle("msgGetMetadata", async () => {
            return readMetadata()
        })

        ipcMain.handle("msgSaveMetadata", async (event: IpcMainEvent, metadata: any) => {
            writeMetadata(metadata)
            webContents.getAllWebContents().forEach((wc) => {
                try {
                    wc.send("metadataUpdated", metadata)
                } catch (e) {
                    // Ignore errors for closed contents
                }
            })
            return true
        })

        ipcMain.handle("openContextMenu", async (event: IpcMainEvent, bookFile: string) => {
            console.log(bookFile)
            const contextMenu = new Menu()

            contextMenu.append(
                new MenuItem({
                    label: "Open Book",
                    click: () => {
                        webContents.getFocusedWebContents().send("openBook", bookFile)
                    }
                })
            )

            contextMenu.append(
                new MenuItem({
                    label: "Reveal in Explorer",
                    click: () => {
                        const bookPath = path.join(Constants.BOOK_FOLDER, bookFile)
                        shell.showItemInFolder(bookPath)
                    }
                })
            )

            contextMenu.append(new MenuItem({ type: "separator" }))

            contextMenu.append(
                new MenuItem({
                    label: "Edit Tags...",
                    click: () => {
                        webContents.getFocusedWebContents().send("editTags", bookFile)
                    }
                })
            )

            contextMenu.append(new MenuItem({ type: "separator" }))

            const currentMetadata = readMetadata()
            const bookMeta = currentMetadata[bookFile] || {}
            const currentRating = bookMeta.rating || 0

            const rateSubmenu = new Menu()
            rateSubmenu.append(
                new MenuItem({
                    label: "No Rating",
                    type: "checkbox",
                    checked: currentRating === 0,
                    click: () => {
                        updateRating(bookFile, 0)
                    }
                })
            )

            for (let i = 1; i <= 5; i++) {
                rateSubmenu.append(
                    new MenuItem({
                        label: "★".repeat(i) + "☆".repeat(5 - i),
                        type: "checkbox",
                        checked: currentRating === i,
                        click: () => {
                            updateRating(bookFile, i)
                        }
                    })
                )
            }

            contextMenu.append(
                new MenuItem({
                    label: "Rate",
                    submenu: rateSubmenu
                })
            )

            contextMenu.append(new MenuItem({ type: "separator" }))

            contextMenu.append(
                new MenuItem({
                    label: "Delete",
                    click: () => {
                        const deleteConfirmed = dialog.showMessageBoxSync({
                            type: "question",
                            buttons: ["Yes", "No"],
                            title: "Confirm Deletion",
                            message: "Are you sure you want to delete this book?"
                        })
                        if (deleteConfirmed === 0) {
                            deleteBook(bookFile)
                        }
                    }
                })
            )
            contextMenu.popup()
        })

        function readMetadata(): any {
            const metadataPath = path.join(app.getPath("userData"), "books-metadata.json")
            try {
                if (fs.existsSync(metadataPath)) {
                    return JSON.parse(fs.readFileSync(metadataPath, "utf8"))
                }
            } catch (e) {
                console.error("Error reading book metadata:", e)
            }
            return {}
        }

        function writeMetadata(data: any): void {
            const metadataPath = path.join(app.getPath("userData"), "books-metadata.json")
            try {
                fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2), "utf8")
            } catch (e) {
                console.error("Error writing book metadata:", e)
            }
        }

        function updateRating(bookFile: string, stars: number) {
            const data = readMetadata()
            if (!data[bookFile]) {
                data[bookFile] = { rating: 0, categories: [] }
            }
            data[bookFile].rating = stars
            writeMetadata(data)
            webContents.getAllWebContents().forEach((wc) => {
                try {
                    wc.send("metadataUpdated", data)
                } catch (e) {
                    // Ignore errors for closed contents
                }
            })
        }
        async function deleteBook(book: string) {
            const bookPath = path.join(Constants.BOOK_FOLDER, book)
            try {
                await fs.promises.unlink(bookPath)
                webContents
                    .getFocusedWebContents()
                    .send("deleteConfirmed", "Book was successfully deleted!")
            } catch (error) {
                console.error(`Error deleting book: ${error}`)
            }
        }
        async function getBooks() {
            const bookPath = Constants.BOOK_FOLDER
            const files = await fs.promises.readdir(bookPath)
            const books = files.filter((file) => file.endsWith(".epub"))
            return books
        }
    }
}
