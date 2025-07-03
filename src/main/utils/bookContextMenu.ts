import { Menu, MenuItem } from "electron"
import { dialog, ipcMain, webContents } from "electron/main"
import * as path from "path"
import { promises as fs } from "fs"
import Constants from "./Constants"

const contextMenu = new Menu()

contextMenu.append(
    new MenuItem({
        label: "Open Book",
        click: () => console.log("Open clicked")
    })
)

contextMenu.append(
    new MenuItem({
        label: "Reveal in Explorer",
        click: () => console.log("Reveal clicked")
    })
)

contextMenu.append(new MenuItem({ type: "separator" }))

contextMenu.append(
    new MenuItem({
        label: "Edit Tags...",
        click: () => console.log("Edit clicked")
    })
)

contextMenu.append(
    new MenuItem({
        label: "Edit Custom Metadata...",
        click: () => console.log("Edit Custom Metadata clicked")
    })
)

contextMenu.append(new MenuItem({ type: "separator" }))

contextMenu.append(
    new MenuItem({
        label: "Rate",
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
        click: async () => {
            const deleteConfirmed = dialog.showMessageBoxSync({
                type: "question",
                buttons: ["Yes", "No"],
                title: "Confirm Deletion",
                message: "Are you sure you want to delete this book?"
            })
            if (deleteConfirmed === 0) {
                await deleteBook(bookFile)
                ipcMain.emit("deleteConfirmed")
            }
        }
    })
)

export function popupContextMenu() {
    contextMenu.popup()
}

async function deleteBook(book: string) {
    // assuming bookFile is defined somewhere
    const bookPath = path.join(Constants.BOOK_FOLDER + "\\" + book)
    console.log(`Path: ${bookPath}`)
    try {
        await fs.unlink(bookPath)
        console.log("Book deleted")
        webContents.getFocusedWebContents().send("deleteConfirmed")
    } catch (error) {
        console.error(`Error deleting book: ${error}`)
    }
}
