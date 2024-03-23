/* eslint-disable no-plusplus */
import path from 'path';
import fs from 'fs';
import EPub from 'epub';

function handleLibraryLoad(
  libraryArr: any[],
  mainWindow: any,
  callback?: (bookArr: any) => void,
) {
  const epubsDirectory = path.join(__dirname, '..', '..', 'assets', 'epubs');
  let bookCount = 0;
  let bookCompleted = 0;
  const files = fs.readdirSync(epubsDirectory);
  const bookArr: any[] = [];
  files
    .filter((file) => path.extname(file).toLowerCase() === '.epub')
    .forEach((file) => {
      const epubPath = path.join(epubsDirectory, file);
      const book = new EPub(epubPath);
      book.on('end', () => {
        // Check if the book is already in libraryArr
        const isBookUnique = libraryArr.every(
          (existingBook) => existingBook.metadata.ISBN !== book.metadata.ISBN,
        );

        if (isBookUnique) {
          bookArr.push(book);
        }
        bookCompleted++;
        if (bookCount === bookCompleted) {
          const serializedLibraryArr = JSON.stringify(bookArr); // Serialize the array for electron
          mainWindow?.webContents.send('send-library', serializedLibraryArr); // Send the serialized library array
          if (callback) {
            callback(bookArr);
          }
        }
      });
      book.parse();
      bookCount++;
    });
}
export default handleLibraryLoad;
