import { ipcMain, IpcMainEvent, dialog, Menu, MenuItem, webContents, shell, app } from "electron"
import Constants from "./utils/Constants"
import * as fs from "fs"
import * as path from "path"
import { getFonts } from "font-list"

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
            return getBooks()
        })

        ipcMain.handle("msgGetBookPath", async (event: IpcMainEvent) => {
            return Constants.BOOK_FOLDER
        })

        ipcMain.handle("msgGetFonts", async (event: IpcMainEvent) => {
            return getFonts()
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
                console.log()
            }

            const dialogResult = await dialog.showOpenDialog({
                properties: ["openFile"],
                filters
            })

            console.log(dialogResult)

            if (!dialogResult.canceled) {
                const source = dialogResult.filePaths[0]

                // const testPath = app.getPath
                const destinationPath = path.join(Constants.BOOK_FOLDER, path.basename(source))
                if (!fs.existsSync(path.dirname(destinationPath))) {
                    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true })
                }
                await fs.promises.copyFile(source, destinationPath)
                return destinationPath
            }

            return dialogResult
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
                        const bookPath = path.join(Constants.BOOK_FOLDER + "\\" + bookFile)
                        shell.showItemInFolder(bookPath)
                    }
                })
            )

            contextMenu.append(new MenuItem({ type: "separator" }))

            contextMenu.append(
                new MenuItem({
                    label: "Edit Tags...",
                    enabled: false,
                    click: () => {
                        webContents.getFocusedWebContents().send("editTags", "Work In Progress!")
                    }
                })
            )

            contextMenu.append(
                new MenuItem({
                    label: "Edit Custom Metadata...",
                    enabled: false,
                    click: () => {
                        webContents.getFocusedWebContents().send("editMeta", "Work In Progress!")
                    }
                })
            )

            contextMenu.append(new MenuItem({ type: "separator" }))

            contextMenu.append(
                new MenuItem({
                    label: "Rate",
                    enabled: false,
                    submenu: [
                        {
                            label: "1",
                            type: "radio",
                            click: () => console.log("Rated 1")
                        },
                        {
                            label: "2",
                            type: "radio",
                            click: () => console.log("Rated 2")
                        },
                        {
                            label: "3",
                            type: "radio",
                            click: () => console.log("Rated 3")
                        },
                        {
                            label: "4",
                            type: "radio",
                            click: () => console.log("Rated 4")
                        },
                        {
                            label: "5",
                            type: "radio",
                            click: () => console.log("Rated 5")
                        }
                    ]
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
        async function deleteBook(book: string) {
            const bookPath = path.join(Constants.BOOK_FOLDER + "\\" + book)
            console.log(`Path: ${bookPath}`)
            try {
                await fs.promises.unlink(bookPath)
                console.log("Book deleted")
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
