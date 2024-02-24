/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable func-names */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import handleLibraryLoad from './LibraryHandler';

// const isbn = require('node-isbn');

let libraryArr: any[] = []; // Create an empty array to store book objects
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

function LibraryLoad() {
  handleLibraryLoad(libraryArr, mainWindow, (bookArr) => {
    libraryArr = bookArr;
  });
}

// TODO: Create a toast call for when the user loads in a new book.
// On loading in a new book, Validate that we don't already have that file. if we have that ISBN,
// Send an error toast.

ipcMain.on('add-new-book', () => {
  // Create a file browser dialog that accepts only EPUB extension files
  if (mainWindow) {
    const newEpubPath = dialog.showOpenDialogSync(mainWindow, {
      filters: [
        {
          name: 'EPUB Files',
          extensions: ['epub'],
        },
      ],
    });

    if (newEpubPath && newEpubPath.length > 0) {
      const selectedEpubPath = newEpubPath[0];
      const targetDirectory = path.join(app.getAppPath(), 'assets', 'epubs');
      const targetFileName = path.basename(selectedEpubPath);
      const targetFilePath = path.join(targetDirectory, targetFileName);

      fs.copyFileSync(selectedEpubPath, targetFilePath);
      // console.log(`Added new EPUB: ${targetFilePath}`);
      if (mainWindow) {
        mainWindow.webContents.send('send-library', JSON.stringify(libraryArr));
      }
    }
  }
});

ipcMain.on('library-sort', (event, arg) => {
  if (arg === 'title') {
    libraryArr.sort((a, b) => {
      if (a.metadata.title && b.metadata.title) {
        return (a.metadata.title || '').localeCompare(b.metadata.title || '');
      }
      return 0; // Note: Metadata should always be defined, but we should add an alert if that were to change.
    });
    if (mainWindow) {
      mainWindow.webContents.send('update-library', JSON.stringify(libraryArr));
    }
  } else if (arg === 'author') {
    libraryArr.sort((a, b) => {
      if (a.metadata.creator && b.metadata.creator) {
        return (a.metadata.creator || '').localeCompare(
          b.metadata.creator || '',
        );
      }
      return 0; // Note: Metadata should always be defined, but we should add an alert if that were to change.
    });
    if (mainWindow) {
      mainWindow.webContents.send('update-library', JSON.stringify(libraryArr));
    }
  } else if (arg === 'recent') {
    // Sort libraryArr by author
    libraryArr.sort((a, b) => {
      if (a.metadata && b.metadata) {
        // Check the file added time, or Last modified time.
        // return (a.metadata.author || '').localeCompare(b.metadata.author || '');
        return 0;
      }
      if (mainWindow) {
        mainWindow.webContents.send('update-library');
      }
      return 0;
    });
  }
});

// TODO Create a function that will handle tags, and call on it with either IPC Add or Remove.
function handleTags(bAdding: boolean, tags: any[]) {
  // TODO: Database management calls depending on type of boolean we receive from the add and remove tag events.
  // eslint-disable-next-line no-unused-expressions
  bAdding ? console.log('Adding Tag!') : console.log('Not adding tag.');
}

// Turn this into a handle(Invoke?), send back JSON with all tags, and if adding the tag to the book was a success/failure.
ipcMain.on('add-tag', (_event, tagToAdd) => {
  console.log('WIP Add Tags pong!');
  handleTags(true, tagToAdd);
});

// Same as above, turn into a handle, send back JSON with all tags, and if removing it was a success/failure.
ipcMain.on('remove-tag', (_event, tagToRemove) => {
  console.log('WID Remove Tags pong!');
  handleTags(false, tagToRemove);
});

// Should be a handle. Send back a response letting user know we deleted the book,
// and update the library to reflect the changed state.
// NOTE: Should receive a boolean from frontend, if true, delete custom data json/database object.
ipcMain.on('delete-book', (event, { bookToBeDeleted, deleteCustom }) => {
  console.log(
    `Deleting book ${bookToBeDeleted}... \n Deleting Custom? ${deleteCustom}`,
  );
  try {
    // Delete book
  } catch (error) {
    console.error('Shit we fucked up, delete Sys32. Error:', error);
  }
});

// TODO: Open Directory Explorer directly on path to the object's location.
// We need to receive either a book index ID, or some sort of identification
// to know what book to open on within the file explorer.
ipcMain.on('find-in-explorer', (event, book) => {
  console.log(`Getting book path: ${book}`);
  // Open folder directory. Account for it being on a mac system,
  // and open their location for the epub. Needs to be tested in production.
});

// TODO: Set up the command to return the pages necessary for client to view from the Epub.
// And make sure it's sent correctly and not like some fucked up garbled mess. Maybe sanitize the
// html away, and get the text only. Account for pictures, or covers, or not. Just send the data to
// frontend.
ipcMain.on('get-book-content', (event, bookId) => {
  console.log(' WIP Get book Data');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
    LibraryLoad();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
