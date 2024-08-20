import { ipcMain, IpcMainEvent, dialog } from "electron"
import Constants from "./utils/Constants"
import { promises as fs } from "fs"
import * as path from "path"
/*
 * IPC Communications
 * */
export default class IPCs {
    static initialize(): void {
        // Get application version
        ipcMain.handle("msgRequestGetVersion", () => {
            return Constants.APP_VERSION
        })

        ipcMain.handle("msgGetBooks", async (event: IpcMainEvent) => {
            const bookPath = Constants.BOOK_FOLDER
            const files = await fs.readdir(bookPath)
            const books = files.filter((file) => file.endsWith(".epub"))

            return books
        })

        ipcMain.handle("msgGetBookPath", async (event: IpcMainEvent) => {
            return Constants.BOOK_FOLDER
        })

        // Open file
        ipcMain.handle("msgOpenFile", async (event: IpcMainEvent, filter: string) => {
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
        ipcMain.handle("msgAddBook", async (event: IpcMainEvent, filter: string) => {
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
                await fs.copyFile(source, destinationPath)
                return destinationPath
            }

            return dialogResult
        })
    }
}
