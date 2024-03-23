/* eslint-disable no-console */
import { Button, Card, Drawer } from '@blueprintjs/core';
import { useState, useEffect } from 'react';
import BookLibrary from './Components/Sidebar/BookLibrary';
import LibrarySort from './Components/Sidebar/LibrarySort';
import LibraryPanel from './Components/Reader/Library/LibraryPanel';
import './App.css';
import ReaderPanel from './Components/Reader/ReaderPanel';
import ActivityBar from './Components/ActivityBar';

function NewBookButton() {
  const handleClick = () => {
    window.electron.ipcRenderer.sendMessage('add-new-book');
  };

  return (
    <Card className="AddBookButton" interactive onClick={handleClick}>
      <strong>+ Add New Book</strong>
    </Card>
  );
}

function Hello() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bookList, setBookList] = useState([]);
  const [sortedBooks, setSortedBooks] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasBookSelected, setBookSelected] = useState();
  const [selectedBook, setSelectedBook] = useState('BookName');

  // Only get the library and update the library once.. I think?
  useEffect(() => {
    window.electron.ipcRenderer.on('send-library', (receivedBookList: any) => {
      const parsedBookList = JSON.parse(receivedBookList);
      console.log(parsedBookList);
      setBookList(parsedBookList);
      setSortedBooks(parsedBookList); // Initialize sorted books with the received book list
    });
    //
    window.electron.ipcRenderer.on('update-library', (newLibrary: any) => {
      const newParsedBookList = JSON.parse(newLibrary);
      console.log(newParsedBookList);
      setBookList(newParsedBookList);
      setSortedBooks(newParsedBookList); // Update sorted books when the library is updated
      // run a loop through the array, and add the book titles to an array
    });
  }, []);

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
  };

  return (
    <div className="App">
      <div
        className="activity-bar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <ActivityBar />
      </div>
      <div className="reader-header">
        {hasBookSelected ? (
          <ReaderPanel
            clickedBookName={selectedBook.metadata.title}
            clickedBookContent="selectedBook"
          />
        ) : (
          <LibraryPanel
            bookLibrary={sortedBooks}
            onBookClick={handleBookClick}
          />
        )}
        <div className="ButtonContainer">
          <Button
            icon="menu"
            style={{ background: '#282c34' }}
            onClick={() => setIsDrawerOpen((prevState) => !prevState)}
          />
        </div>
      </div>
      {isDrawerOpen && (
        <Drawer
          className="Drawer"
          portalClassName="OverlayScrollContainer"
          isOpen={isDrawerOpen}
          position="left"
          size="360px"
          style={{ overflowY: 'auto' }}
          onClose={() => setIsDrawerOpen(false)}
        >
          <div className="drawerContent">
            <div className="drawerHeader">
              <h1>Library</h1>
              <LibrarySort books={sortedBooks} />
            </div>
            <div className="library-items">
              <BookLibrary bookList={bookList} />
            </div>
            <div className="add-book">
              <NewBookButton />
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export default function App() {
  window.electron.ipcRenderer.sendMessage('get-book-library');
  return <Hello />;
}
